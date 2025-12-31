# Corpus Collocates

Corpus Collocates is a table view of which terms appear more frequently in proximity to keywords across the entire corpus.

Use it with a [Jane Austen corpus](../?view=CorpusCollocates&corpus=austen) or with [your own corpus](../?view=CorpusCollocates).

## Overview

The table view shows the following three columns by default:

- *Term*: this is the keyword (or keywords) being searched
- *Collocate*: these are the words found in proximity of each keyword
- *Count (context)*: this is the frequency of the collocate occurring in proximity to the keyword

An additional column can be shown to display *Count* which is the frequency of the keyword term in the corpus – see the 
{@tutorial grids} guide for more information.

By default, the most frequent collocates are shown for the 10 most frequent keywords in the corpus.

<iframe src="../tool/CorpusCollocates/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Corpus Collocates with the Works of Jane Austen. You can also <a href="../?view=CorpusCollocates" target="_blank">use Corpus Collocates with your own corpus</a>.</div>

## Options

You can add specify which keyword to use by typing a query into the search box and hitting enter (see {@tutorial search} 
for more advanced searching capabilities).

There is also a slider that determines how much context to consider when looking for collocates. The value specifies 
the number of words to consider on _each_ side of the keyword (so the total window of words is double). By default the 
context is set to 5 words per side, and the slider can have a minimum of 1 and a maximum of 30.

Clicking on the {@tutorial options} icon also allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} for more information.

## Spyral

To use Catalogue in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```
let config = {
    context: 6,
    query: ["love"],
};

loadCorpus("austen").tool("CorpusCollocates", config);
```

Please see {@link Tools.CorpusCollocates} for more information about configuration.

## Additional Information

For a graphical view of corpus collocates, try the {@tutorial collocatesgraph} tool.

## See Also
- {@tutorial start}
- {@tutorial grids}
- {@tutorial stopwords}
- {@tutorial skins}
- {@tutorial tools}
- {@tutorial collocatesgraph}
