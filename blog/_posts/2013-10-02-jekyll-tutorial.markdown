---
layout: post
title:  "Huffman Encoding in Python &mdash; Optimisation Series Part IV"
tags:   java optimisation compression huffmann
---

In a previous post I wrote about moving from Wordpress to Jekyll where I was
ultimately hosting this site in GitHub Pages. While that setup was great, and
an easy way to get started, I wanted to have a little more freedom to play with
plugins and additional/custom functionality. To that end I migrated the system
into Octopress and reverted to hosting with the same server from which I was
running the previous Wordpress install. I had waited to cancel the hosting
service just in case I decided to do this.

Here I'm going to show you how to make an interactive Archives page with
categories in Jekyll without using plugins. Very simple and extensible through
JavaScript.

What I want to achieve...
-------------------------

My blog needed an overview page which contains every Blog post, ideally sorted
by date. That is fairly easy in pure Jekyll: Just loop over every post and add
title and date.

Now here's the catch: I'm using [tags](#) to sort my posts into different
categories and it would be nice if a user could select a specific tag and get a
listing of all blogs with this tag. Fairly basic stuff -- for a dynamic
blogging engine. Now, Jekyll supports tags out of the box, but has, at this
time, no function to generate a page for each tag. So, everytime we introduce a
new tag, we'd need to [create a archives page](#) for this tag to loop over the
posts. Which, in my opinion, makes Jekyll's tags feature pretty useless.

Plugins would of course solve this problem. But remember my self-imposed
constraint mentioned in Part 1? Pure vanilla [Jekyll](#) running on
[GitHub Pages](http://www.github.com/). So, let's try to find another way.

...and how to get there
-----------------------

So, if Jekyll can't generate tag pages out of the box, we'll elevate the
problem to the client browser. If our Archives page already contains every post
of the blog, we'll just have to hide the ones which do not match our tags. How?
With the HTML 5 multi-tool: *JavaScript!*

We are going to pass the selected category via Hashtag in the URL, for example
`/archives/#!webdev`. JavaScript then extracts the tag and toggles the posts
based on whether they match it or not.

Before we dive in, I want to note that you can see the results on my
[Archives](#) page.


### Step 1: The HTML

To make things easier, every post will store its tags in a data- attribute:


{% highlight c %}
/* Finds and returns the small sub-tree in the forest */

int findSmaller (Node *array[], int differentFrom){
    int smaller;
    int i = 0;

    while (array[i]->value == -1) i++;
    smaller = i;

    if (i == differentFrom) {
        i++;
        while (array[i] -> value == -1)
            i++;
        smaller = i;
    }

    for (i = 1; i < 27; i++) {
        if (array[i]->value == -1)
            continue;
        if (i == differentFrom)
            continue;
        if (array[i]->value<array[smaller]->value)
            smaller = i;
    }
    return smaller;
}
{% endhighlight %}


### Step 2: JavaScript Voodoo

Jep, I'm using jQuery here. But you should have no problem adapting it to
standard JavaScript. The updateTags function extracts the tag from the hash,
loops over `.post` elements, compares their data-tags-attribute against
the hash and fades them depending on the result. We also listen for
`onhashchange` to update the selection when a tag link on the same page
is clicked.

{% highlight javascript %}
$(function() {
function updateTags() {
    var hash = window.location.hash.substr(2);

    $('.post').each(function(i, post) {
        if ($(post).data('tags').indexOf(hash) == -1) {
            $(post).animate({
                opacity: 0.5,
                'font-size': '0.8em',
            }, 'fast');
        } else {
            $(post).animate({
                opacity: 1,
                'font-size': '1em',
            }, 'fast');
        }
    });
}

$(window).bind('hashchange', updateTags)
  updateTags();
})
{% endhighlight %}

<p class="caption">Listing 1 &mdash; updateTags() function in JavaScript</p>


### Bonus --- Group Posts by Year

Imagine you want to divide your post listing into different years to achieve
something like this. It's fairly easy with standard Liquid if you know how. We store the year of the
previous post, extract the year of the current one, compare both and output a
header if the two differ.

