# Document Terms

Document Terms is a table view of term frequencies for each document.

Use it with a [Jane Austen corpus](../?view=DocumentTerms&corpus=austen) or with [your own corpus](../?view=DocumentTerms).

## Overview

The table view shows the following five data columns by default:

- *#*: this is the document number (the position of the term's document in the corpus)
- *Term*: this is the document term
- *Count*: this is the raw frequency of the term in the document
- *Relative*: this is the relative frequency of the term in the document (calculated by dividing the raw frequency by the total number of terms in the document and multiplying by 1 million)
- *Trends*: this is a sparkline graph that shows the distribution of the term within the segments of the document; you can hover over the sparkline to see finer-grained results

Additional columns are available by clicking on the down arrow that appears in the right side of a column header:

- *Significance*: the significance is measured here as a [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) score, a common way of expressing how important a term is in a document relative to the rest of the corpus
- *Z-Score*: the Z-Score (or [standard score](https://en.wikipedia.org/wiki/Standard_deviation)) is a normalized value for the term's raw frequency compared to other term frequencies in the same document (it's the difference between the term's raw frequency and the mean or raw frequencies, divided by the standard deviation of raw frequencies)

By default, the terms with the highest per-document frequencies are shown.

<iframe src="../tool/DocumentTerms/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Document Terms with the Works of Jane Austen. You can also <a href="../?view=DocumentTerms" target="_blank">use Document Terms with your own corpus</a>.</div>

## Options

You can specify terms by typing a query into the search box and hitting enter (see {@tutorial search} for more advanced 
searching capabilities).

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} for more information.


## Spyral

To use Documents in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```

let config = {
    bins: null, // for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
    docIndex: null, // document index to restrict to (can be comma-separated list)
    expand: null, // the size of the extended context (when you expand a context occurrence), the number of words on each side of the keyword
    query: null, // a query for the keywords (can be comma-separated list)
    stopList: null, // a named stopword list or comma-separated list of words
};

loadCorpus("austen").tool("Documentterms", config);

```

## See Also
- {@tutorial start}
- {@tutorial grids}
- {@tutorial stopwords}
- {@tutorial skins}
- {@tutorial tools}
