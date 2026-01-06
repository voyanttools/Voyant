# WordTree

The Word Tree tool allows you to explore how keywords are used in different phrases in the corpus.

Use it with a [Jane Austen corpus](../?view=WordTree&corpus=austen) or with [your own corpus](../?view=WordTree).

## Overview

By default, the most common term is used as the first word tree root.

You can click on terms to expand or collapse further branches, when they're available. Double-clicking on a term should 
trigger a phrase search in other Voyant panels (if applicable).

<iframe src="../tool/WordTree/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">WordTree with the Works of Jane Austen. You can also <a href="../?view=WordTree" target="_blank">use WordTree with your own corpus</a>.</div>

At the moment the tree is constructed based on a limited number of concordances for the keyword (instances of the 
keyword with context on each side), the branches shown are not necessarily based on frequency.

## Options

You can set the root term in the tree by typing a query into the search box and hitting enter (see Term 
{@tutorial search} for more advanced searching capabilities).

Other options:

* *limit*: limit the number of concordance entries that are fetched (which determines in part how many repeating phrase forms can be found)
* *branches*: limit the number of branches that are shown on each side of the keyword
* *context*: limit the length of the context retrieved for branches

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} guide for more information.


## Spyral

To use the WordTree widget in Spyral you can use the following code as a starting point. Modify the config object to 
modify the visualization.

```
let config = {
    "context": 5,
    "limit": 500,
    "query": ["love", "hate"],
}; 

loadCorpus("austen").tool("wordtree", config);
```

Please see {@link Tools.WordTree} for more information about configuration.

## Additional Information

Word Tree is an adaptation of Chris Culy's [DoubleTreeJS](http://linguistics.chrisculy.net/lx/software/DoubleTreeJS/).

## See Also

- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial search}
- {@tutorial skins}
- {@tutorial tools}
