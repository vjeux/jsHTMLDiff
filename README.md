jsHTMLDiff
==========

If you have two HTML trees that are nearly identical and you want to highlight differences, jsHTMLDiff is there for you. Check out my [blog article](http://blog.vjeux.com/2011/project/world-of-warcraft-html-tooltip-diff.html) for the explanation of the algorithm.


Installation
============

Just include the htmldiff.js file. No dependencies.

```html
<script src="https://raw.github.com/vjeux/jsHTMLDiff/master/lib/htmldiff.js"></script>
```


Example
=======

We have two tooltips of the same World of Warcraft items from two different patches.

<a href="http://fooo.fr/~vjeux/github/jsHTMLDiff/example/tooltip.html"><img src="http://fooo.fr/~vjeux/github/jsHTMLDiff/image/before.png"></a>

In order to highlight what changed, you just need to do the following:

```javascript
new HTMLDiff(
  document.getElementById('old-tooltip'),
  document.getElementById('new-tooltip')
).diff();
```

It will wrap ```<ins>``` tags around words that have changed.

<a href="http://fooo.fr/~vjeux/github/jsHTMLDiff/example/tooltip.html"><img src="http://fooo.fr/~vjeux/github/jsHTMLDiff/image/after.png"></a>

Caveats
=======

* jsHTMLDiff will only catch differences inside text nodes. If there are changes in the html attributes (image ```src``` for example), they will not be taken into account.
* Do not put litteral ```<ins>``` or ```</ins>``` inside a text node.
* The diff algorithm is applied on words. Words are obtained using ```split(' ')```. As a consequence, a punctuation change will not only highlight the punctuation but also the previous word.
