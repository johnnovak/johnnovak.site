---
layout: post
title:  "Implementing a Worker pool in Nim &mdash; Part 1"
tags: [workerpool, nim]
published: false
---

## Introduction

As of version 0.14.2, the Nim language has support for both low-level
concurrency primitives (locks, mutexes, threads etc.) and higher-level
parallel programming constructs (e.g. channels,
[threadpool](http://nim-lang.org/docs/threadpool.html), parallel and spawn).
While Nim doesn't have built-in support for some of the more useful
parallelism abstractions yet, such as actors, it is not too hard to build
our own using the facilities already provided.

For my [ray tracer project](/tag/ray%20tracing/), I needed a flexible worker
pool (thread pool) implementation with the following properties:

{: .compact}
* Utilise all available CPU cores via native OS threads
* Support for pausing and cancelling the processing
* Support for changing the number of worker threads on the fly
* Some mechanism to provide an indication of progress to the user
* Easy integration with both retained and immediate mode UIs
* Cross-platform (ideally without having to write any platform-specific code)
* Reasonably fast

Let's see how can we meet all these requirements in a clean and elegant way
using stock Nim features!

## Design considerations

The basic idea of a worker pool is pretty simple: a number of workers get fed
with work items by a client on which they perform some kind of processing,
then return the results back to the client. While this appears to be quite
straightforward, we'll shortly realise that to make the worker pool really
usable for real-world applications, we'll need to add a few extra features
that will make the implementation more intricate.

A worker pool has at least two queues that are shared by all workers and the
client, the work item queue and the result queue. The client publishes
messages to the work item queue, which get in turn consumed by the workers.
The workers then publish the result messages to the result queue, which get
consumed by the client. All work items are self-contained units of work.

There is a one to one mapping between workers and native OS threads. For CPU
bound tasks, we often want to have as many workers as CPU cores, sometimes
maybe a few cores less because we don't want the UI or the whole OS to become
unresponsive. Furthermore, a user of a GUI application might want to reduce the
number of active workers in the middle of a long calculation, so he can work on
something else on the computer while the rendering is still in progress 
(albeit at a slower rate), and maybe later increase the number of workers back
to the number of CPU cores while he will be away from the machine for a while.
Similarly, the user might want to pause the calculation or cancel
it altogether. It should also be possible to save the state of calculation to
disk and resume it sometime in the future. For these features, the worker pool
must implement some kind of command mechanism so the client can ask the pool
to start, stop or cancel the processing, or change the number of active
workers.

Ideally, the client should publish messages at a sufficiently high rate so the
workers are never idle. But sometimes this is not possible and there's no
items to work on for a period of time. In this case, the workers should not
waste CPU resources by continuously polling the work item queue in a busy-wait
loop. Instead, the worker threads should be suspended and then notified when
new work items become available.

Ultimately, we'll use the worker pool in a program that the user can interact
with via some kind of UI. This means that we don't want to do any blocking
calls to the worker pool from the UI thread. Imagine we send a stop command to
the pool as a non-blocking function call. The workers won't stop immediately
because they still need to finish processing the work items that are already
in progress. So how will we know the exact instant when all the workers have
entered the stopped state? The answer depends on the UI paradigm we're using.
For traditional retained mode UIs that use events and a message loop,
a callback from the pool to the client is the best solution, while for
immediate mode UIs (IMGUI) simple polling is the most convenient. It's
actually quite easy to support both models, so that's what we'll do.

Based on the above, it's easy to image the worker pool as some kind of a state
machine having three distinct states: **stopped**, **running** and
**shutdown**. Figure 1 below illustrates the state diagram of the worker pool, along
with the allowed operations for each state.

{% include image.html name="workerpool-states.svg" caption="Figure 1 &mdash; The state diagram of the worker pool." captionAlign="center" captionWidth="70%" %}

To ask the pool to move into a different state, we'll need to send a command
to it (**start**, **stop** and **shutdown**). The operations **reset**,
**close** and **setNumWorkers** can also be viewed as commands. We call these
commands because they are basically non-blocking function calls; all they do
is ask the pool to do something. If a command is accepted, the corresponding
action will be performed asynchronously at some point in the future. To make
the implementation simpler, a command is only accepted if there's no other
command already in progress (in other words, the length of the imaginary
command queue is 1). If you think about real-world use cases (like a GUI with
"Start", "Stop" and "Cancel" buttons and a "Number of workers" dropdown),
there's little sense in queuing up multiple commands for execution, so we will
stick with this restriction as it will make the implementation simpler.


## Public interface

Alright, now we know enough to define the public interface of our worker
pool!

The worker pool is a parametrized object with two type parameters: `W` is the
type of the work items and `R` the type of the calculation results. Typically, these
types will be some user defined objects.

{% highlight nimrod %}
type WorkerPool*[W, R] = object
{% endhighlight %}

As mentioned previously, the worker pool can be in either **stopped**, **running** or
**shutdown** state.

{% highlight nimrod %}
type WorkerState* = enum
  wsStopped, wsRunning, wsShutdown
{% endhighlight %}

### Initialising the pool

First, we need to initialise our worker pool. For this, we need to specify the
worker procedure `workProc` that will receive work items and return the
corresponding results, the size of the pool (the maximum number of
workers[^poolsize]) and the initial number of active workers. If the pool size
is set to zero, it will automatically be set to the number of logical CPU
cores. If the number of active workers is set to zero, it will automatically
be set to the pool size. 

[^poolsize]: The pool size ...

{% highlight nimrod %}
proc initWorkerPool*[W, R](workProc: proc (msg: W): R,
                           poolSize: Natural = 0,
                           numActiveWorkers: Natural = 0): WorkerPool[W, R]
{% endhighlight %}

We can query these pool parameters later with the `poolSize` and
`numActiveWorkers` methods.

{% highlight nimrod %}
proc poolSize*        [W, R](wp: var WorkerPool[W, R]): Natural
proc numActiveWorkers*[W, R](wp: var WorkerPool[W, R]): Natural
{% endhighlight %}

### Queueing work items and receiving results

To queue a new work item for processing, we simply pass the work item to the
`queueWork` method. This method is non-blocking; it only places the work
item into the message queue and returns immediately.

{% highlight nimrod %}
proc queueWork*[W, R](wp: var WorkerPool[W, R], msg: W)
{% endhighlight %}

To receive results, we have to call `tryRecvResult`
which will return a tuple `(true, result)` if a result is available and
`(false, default(R))` if not. Similarly to `queueWork`, this method is
non-blocking and returns immediately.

{% highlight nimrod %}
proc tryRecvResult*[W, R](wp: var WorkerPool[W, R]): (bool, R)
{% endhighlight %}

### Changing state

All newly created worker pools are initially in the stopped state. The current
state of the pool can be queried with the `state` method.

{% highlight nimrod %}
proc state*[W, R](wp: var WorkerPool[W, R]): WorkerState
{% endhighlight %}

The workers can be requested to switch state by calling the `start`, `stop` or
`shutdown` methods. If there is no state change already in progress and the
state change request was valid (see the state diagram above), all these
methods will return `true`, otherwise `false`.

{% highlight nimrod %}
proc start*   [W, R](wp: var WorkerPool[W, R]): bool
proc stop*    [W, R](wp: var WorkerPool[W, R]): bool
proc shutdown*[W, R](wp: var WorkerPool[W, R]): bool
{% endhighlight %}

The `isReady` method can be used to check whether the pool is ready to accept
a state change request or not.

{% highlight nimrod %}
proc isReady*[W, R](wp: var WorkerPool[W, R]): bool
{% endhighlight %}

### Notifications

TODO

### Resetting the pool

Purging the work and result queues can be accomplished by calling the `reset`
method. This is only allowed in the stopped state. Similarly to the state
change methods, the method will return `true` if the reset request was
accepted and `false` otherwise.

{% highlight nimrod %}
proc reset*[W, R](wp: var WorkerPool[W, R]): bool
{% endhighlight %}

### Changing the number of active workers

The number of active workers can be changed with the `setNumWorkers` method.
The method can be called in any state except shutdown. The method will return
`true` if the request was accepted, `false` otherwise.

{% highlight nimrod %}
proc setNumWorkers*[W, R](wp: var WorkerPool[W, R],
                          newNumWorkers: Natural): bool
{% endhighlight %}

### Cleanup

To free all interal resources, the client must call the `close` method after
the pool has entered the shutdown state.  The method will return `true` if the
request was accepted, `false` otherwise.

{% highlight nimrod %}
proc close*[W, R](wp: var WorkerPool[W, R]): bool
{% endhighlight %}


## Implementation

{% include image.html name="workerpool-overview.svg" caption="Figure 2 &mdash; Overview of the worker pool's internals. The rectangles (workers) are OS threads and the pipelines Nim channels." captionAlign="center" captionWidth="70%" %}

### Shared channel

In Nim each thread has it's own garbage collected heap, thus sharing memory
between threads is restricted to global variables and the shared heap (see the
[Threads section](http://nim-lang.org/docs/threads.html) of the Nim manual for
further details). Because we're going to share the work and results queues
(which are regular Nim channels) between many threads, we'll need a channel
variant that uses the shared heap.

The below shared channel implementation is adapted from a code snippet
I found on the [Nim forums](http://forum.nim-lang.org/t/1572/2).

{% highlight nimrod %}
type SharedChannel[T] = ptr Channel[T]

proc newSharedChannel[T](): SharedChannel[T] =
  result = cast[SharedChannel[T]](allocShared0(sizeof(Channel[T])))
  open(result[])

proc close[T](ch: var SharedChannel[T]) =
  close(ch[])
  deallocShared(ch)
  ch = nil
{% endhighlight %}

### Type definitions

{% highlight nimrod %}
type
  WorkQueueChannel[W] = SharedChannel[W]
  ResultQueueChannel[R] = SharedChannel[R]
  CmdChannel = SharedChannel[WorkerCommand]
  AckChannel = SharedChannel[bool]
{% endhighlight %}

{% highlight nimrod %}
type WorkerArgs[W, R] = object
  workerId: Natural
  workProc: proc (msg: W): R
  workQueue: WorkQueueChannel[W]
  resultQueue: ResultQueueChannel[R]
  cmdChan: CmdChannel
  ackChan: AckChannel
{% endhighlight %}

{% highlight nimrod %}
type Worker[W, R] = Thread[WorkerArgs[W, R]]
{% endhighlight %}

{% highlight nimrod %}
type WorkerPool*[W, R] = object
  workers: seq[Worker[W, R]]
  workQueue: WorkQueueChannel[W]
  resultQueue: ResultQueueChannel[R]
  cmdChannels: seq[CmdChannel]
  ackChannels: seq[AckChannel]
  workProc: proc (msg: W): R
  numActiveWorkers: Natural
  ackCounter: Natural
  state: WorkerState
{% endhighlight %}

### Initialising the pool

During initialisation the first thing to do is to automatically determine the
pool size and the initial number of active workers if the caller hasn't
specified these parameters.

{% highlight nimrod %}
proc initWorkerPool*[W, R](workProc: proc (msg: W): R,
                           numActiveWorkers: Natural = 0,
                           poolSize: Natural = 0): WorkerPool[W, R] =

  var numProcessors = countProcessors()

  var    n = if numActiveWorkers == 0: numProcessors else: numActiveWorkers
  var nMax = if poolSize == 0: numProcessors else: poolSize
  if n > nMax: nMax = n
{% endhighlight %}

Then we store the user provided worker proc, set the initial number of active
workers and set the current state to stopped. Note that we also set the ack
counter to the size of the pool. This is a safety measure to rule out the
possibility of some weird race conditions during startup. As we'll see below,
the first thing the thread proc will do is to send an ack to signal that the
worker has been started. So by initialising `ackCounter` to the total number
of threads we'll guarantee not to accept any state change requests until all
threads have been properly stared.

{% highlight nimrod %}
result.workProc = workProc
result.numActiveWorkers = numActiveWorkers
result.ackCounter = nMax
result.state = wsStopped
{% endhighlight %}

After this we can create the work and result queues and allocate memory for
the workers and the command and ack channels.

{% highlight nimrod %}
result.workQueue = newSharedChannel[W]()
result.resultQueue = newSharedChannel[R]()
{% endhighlight %}

{% highlight nimrod %}
result.workers = newSeq[Worker[W, R]](nMax)
result.cmdChannels = newSeq[CmdChannel](nMax)
result.ackChannels = newSeq[AckChannel](nMax)
{% endhighlight %}

We can now create the command and ack channels and the worker threads, passing
in the necessary arguments for each thread.

{% highlight nimrod %}
for i in 0..<nMax:
  result.cmdChannels[i] = newSharedChannel[CmdChannel]()
  result.ackChannels[i] = newSharedChannel[AckChannel]()

  var args = WorkerArgs[W, R](
    workerId: i,
    workProc: workProc,
    workQueue: result.workQueue,
    resultQueue: result.resultQueue,
    cmdChan: result.cmdChannels[i],
    ackChan: result.ackChannels[i])

  createThread(result.workers[i], threadProc, args)
{% endhighlight %}


### Main thread proc

By marking the proc with the `{.thread.}` pragma we'll instruct the compiler
to check for the no heap sharing restrictions.

{% highlight nimrod %}
proc threadProc[W, R](args: WorkerArgs[W, R]) {.thread.} =
  proc sendAck() = args.ackChan[].send(true)

  sendAck()
  var state = wsStopped
  while true:
    case state
    of wsStopped:  ...
    of wsRunning:  ...
    of wsShutdown: ...
{% endhighlight %}


#### wsStopped

{% highlight nimrod %}
of wsStopped:
  let cmd = args.cmdChan[].recv()
  case cmd
  of wcStart:    state = wsRunning; sendAck()
  of wcShutdown: state = wsShutdown
  else: discard
{% endhighlight %}

#### wsRunning

{% highlight nimrod %}
of wsRunning:
  let (cmdAvailable, cmd) = args.cmdChan[].tryRecv()
  if cmdAvailable:
    case cmd
    of wcStop:     state = wsStopped; sendAck(); continue
    of wcShutdown: state = wsShutdown; continue
    else: discard

  let (msgAvailable, msg) = args.workQueue[].tryRecv()
  if msgAvailable:
    let response = args.workProc(msg)
    args.resultQueue[].send(response)
  else:
    cpuRelax()
{% endhighlight %}

#### wsShutdown

{% highlight nimrod %}
of wsShutdown:
sendAck()
return
{% endhighlight %}

### Queueing work items and receiving results

{% highlight nimrod %}
proc queueWork*[W, R](wp: var WorkerPool[W, R], msg: W) =
  wp.workQueue[].send(msg)
{% endhighlight %}


{% highlight nimrod %}
proc tryRecvResult*[W, R](wp: var WorkerPool[W, R]): (bool, R) =
  result = wp.resultQueue[].tryRecv()
{% endhighlight %}


### Changing state

{% highlight nimrod %}
proc sendCmd[W, R](wp: var WorkerPool[W, R], cmd: WorkerCommand,
                   lo, hi: Natural = 0) =
  for i in lo..hi:
    wp.cmdChannels[i][].send(cmd)
  wp.ackCounter = hi-lo+1
{% endhighlight %}


{% highlight nimrod %}
proc start*[W, R](wp: var WorkerPool[W, R]): bool =
  if not (wp.state == wsStopped and wp.isReady()):
    return false

  wp.sendCmd(wcStart, hi = wp.numActiveWorkers-1)
  wp.state = wsRunning
  result = true
{% endhighlight %}


{% highlight nimrod %}
proc stop*[W, R](wp: var WorkerPool[W, R]): bool =
  if not (wp.state == wsRunning and wp.isReady()):
    return false

  wp.sendCmd(wcStop, hi = wp.numActiveWorkers-1)
  wp.state = wsStopped
  result = true
{% endhighlight %}


{% highlight nimrod %}
proc drainChannel[T](ch: SharedChannel[T]) =
  var
    available = true
    msg: T
  while available:
    (available, msg) = ch[].tryRecv()
{% endhighlight %}


{% highlight nimrod %}
proc reset*[W, R](wp: var WorkerPool[W, R]): bool =
  if not (wp.state == wsStopped and wp.isReady()):
    return false

  drainChannel(wp.workQueue)
  drainChannel(wp.resultQueue)

  for i in 0..<wp.numWActiveorkers:
    drainChannel(wp.cmdChannels[i][])
    drainChannel(wp.ackChannels[i][])

  result = true
{% endhighlight %}


{% highlight nimrod %}
proc setNumWorkers*[W, R](wp: var WorkerPool[W, R],
                          newNumWorkers: Natural): bool =

  if newNumWorkers == wp.numActiveWorkers or
     wp.state == wsShutdown or not wp.isReady():
    return false

  if wp.state == wsRunning:
    if newNumWorkers > wp.numActiveWorkers:
      let
        lo = wp.numActiveWorkers
        hi = newNumWorkers-1
      wp.sendCmd(wcStart, lo, hi)

    else:
      let
        lo = newNumWorkers
        hi = wp.numActiveWorkers-1
      wp.sendCmd(wcStop, lo, hi)

  wp.numActiveWorkers = newNumWorkers
  result = true
{% endhighlight %}


{% highlight nimrod %}
proc shutdown*[W, R](wp: var WorkerPool[W, R]): bool =
  if not wp.isReady():
    return false

  wp.sendCmd(wcShutdown, hi = wp.poolSize-1)
  result = true
{% endhighlight %}


{% highlight nimrod %}
proc close*[W, R](wp: var WorkerPool[W, R]): bool =
  if not (wp.state == wsShutdown and wp.isReady()):
    return false

  wp.workQueue.close()
  wp.resultQueue.close()

  for i in 0..<wp.poolSize:
    wp.cmdChannels[i].close()
    wp.ackChannels[i].close()
{% endhighlight %}


### Helper methods

{% highlight nimrod %}
proc poolSize*[W, R](wp: var WorkerPool[W, R]): Natural =
  result = wp.workers.len()
{% endhighlight %}

{% highlight nimrod %}
proc numActiveWorkers*[W, R](wp: var WorkerPool[W, R]): Natural =
  result = wp.numActiveWorkers
{% endhighlight %}

{% highlight nimrod %}
proc state*[W, R](wp: var WorkerPool[W, R]): WorkerState =
  result = wp.state
{% endhighlight %}

{% highlight nimrod %}
proc isReady*[W, R](wp: var WorkerPool[W, R]): bool =
  if wp.ackCounter > 0:
    for i in 0..<wp.poolSize():
      let (available, _) = wp.ackChannels[i][].tryRecv()
      if available:
        dec wp.ackCounter

  result = wp.ackCounter == 0
{% endhighlight %}

{% highlight nimrod %}
proc waitForReady*[W, R](wp: var WorkerPool[W, R]) =
  while not wp.isReady():
    cpuRelax()
{% endhighlight %}

### Testing

