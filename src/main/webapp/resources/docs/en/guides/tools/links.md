# Links
	
Links represents keywords and terms that occur in close proximity (i.e. collocated) as a force directed network graph.

Use it with a <a href="../?view=Links&corpus=austen" target="_blank">Jane Austen corpus</a> or with <a href="../?view=Links" target="_blank">your own corpus</a>.

## Overview

This represents a network graph where keywords in green are shown linked to collocates in maroon. You can hover over a term to see its frequency (for keywords it's the corpus frequency, for collocates it's the frequeny in the context of the linked keywords). 

You can drag and drop terms to move them. You can drag terms off the canvas to remove them.

<iframe src="../tool/Links/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Links with the Works of Jane Austen. You can also <a href="../?view=Links" target="_blank">use Links with your own corpus</a>.</div>


## Options

You can add keywords by typing a query into the search box and hitting enter (see [Term Searches]{@tutorial search} for more advanced searching capabilities).

You can use the _Clear_ button to clear all keywords in the graph (to start from scratch and add your own).

The _Context_ slider determines how many terms to include when looking for collocates. The value specifies the number of words to consider on _each_ side of the keyword (so the total window of words is double). By default the context is set to 5 words per side, and the slider can have a maximum of 30.

Clicking on the options icon also allows you to define a set of stopwords to exclude – see the [stopwords guide]{@tutorial stopwords} for more information.


## Spyral

To use Links in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```
let config = {
    centralize: "love", 
    context: 10, 
};

loadCorpus("austen").tool("links", config);
```

Please see {@link Tools.Links} for more information about configuration.



## See Also

- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial search}
- {@tutorial skins}
- {@tutorial tools}