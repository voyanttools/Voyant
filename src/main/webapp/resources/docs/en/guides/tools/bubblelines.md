# Bubblelines

Bubblelines visualizes the frequency and distribution of terms in a corpus. 

Use it with a [Jane Austen corpus](../?view=Bubblelines&corpus=austen) or with [your own corpus](../?view=Bubblelines).

## Overview

Each document in the corpus is represented as a horizontal line and divided into segments of equal length (50 segments by default). Each selected word is represented as a bubble with the size of the bubble indicating the word’s frequency in the corresponding segment of text. The larger the bubble the more frequently the word occurs.

<iframe src="../tool/Bubblelines/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Bubblelines with the Works of Jane Austen. You can also <a href="../?view=Bubblelines" target="_blank">use Bubblelines with your own corpus</a>.</div>

Hovering over a location on the document line will cause a bubble to appear with term frequencies for that segment. At the end of the document line is a label that indicates the count of all terms selected for that document; hovering over the label shows a break-down of the term frequencies for that document.

![Bubblelines](imgs/tools/bubblelines/bubblelines-counts.png)

The colour-coded terms are shown under the grey Bubblelines header. You can remove a term by clicking on it and selecting "Remove Term".

## Options

You can add more terms by using the search box – simply type in a term and hit enter (see 
{@tutorial search} for more advanced searching capabilities). You can also clear all existing terms.

The "Segments" slider allows you to adjust how many segments are used for each document: if you use a value of 10, it 
means that the document will be divided into 10 equal parts (based on the number of terms in each part). The minimum 
value is 10 and the maximum value is 300, with incremental jumps of 10.

![Segments](imgs/tools/bubblelines/segments.png)

You also have the choice of viewing all the terms from a document on one line, or separating each term on its own line.

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} for more information. The options also allow you to 
{@tutorial palette}.

## Spyral

To use Bubblelines in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```

let config = {
    bins: 5, // number of bins to separate a document into
    docIndex: 1, //document index to restrict to (can be comma-separated list)
    maxDocs: 5, // maximum number of documents to show
    query: "love", // a query to search for in the corpus
    stopList: null, // a named stopword list or comma-separated list of words
};

loadCorpus("austen").tool("Bubblelines", config);

```

## Additional Information

Bubblelines currently doesn't work well with corpora that have many hundreds of documents or more.

Bubblelines was initially designed by Carlos Fiorentino as a student of Stan Ruecker.

## See Also
- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial search}
- {@tutorial palette}
- {@tutorial skins}
- {@tutorial tools}
