# Summary

The Summary provides a simple, textual overview of the current corpus, including (as applicable for multiple documents) number of words, number of unique words, longest and shortest documents, highest and lowest vocabulary density, average number of words per sentence, most frequent words, notable peaks in frequency, and distinctive words.

Use it with a [Jane Austen corpus](../?view=Summary&corpus=austen) or with [your own corpus](../?view=Summary).


## Overview

The Summary displays 7 categories of information formatted in a bulleted list.

1. The first bullet provides an overview of the corpus, including number of documents in the corpus, number of words in the corpus, and number of unique words in the corpus.
1. The second point provides the top longest documents (by number of words) in the corpus, and the shortest documents. Following each title the actual number of words is provided in brackets. As well the point illustrates the distribution of document length across the corpus through a small thumbnail pic just to the right of the point’s keyword. This line graph shows the documents in the order that they were added, and not for example in the order of longest to shortest text.
1. The third point provides the documents with the top vocabulary densities, and the documents with the lowest. Following each title the vocabulary density for the document is indicated in brackets. As well the point illustrates the distribution of vocabulary density across the corpus through a small thumbnail pic just to the right of the point’s keyword. This line graph shows the documents in the order that they were added, and not for example in the order of highest to lowest vocabulary density.
1. The fourth point indicates an approximation of the average number of words per sentence, both the highest and lowest values. The way that sentences are calculated should be considered very approximate, especially because of complications with abbreviations and other uses of punctuation (parsing of sentences is performed by [Java's BreakIterator](https://docs.oracle.com/javase/tutorial/i18n/text/about.html) class, and also depends on accurate language detection).
1. The fifth point provides an estimation of the readability of each of the documents, using the [Coleman-Liau formula](https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index).
1. The sixth point indicates the five most frequent words in the corpus, with their frequencies indicated to their right in brackets. <!-- 1. The seventh point indicates the five words with the most notable peaks in frequency. The word’s frequencies are indicated to their right alongside a small thumbnail pic depicting their relative frequencies across the corpus. -->
1. The seventh point indicates the top five most distinctive words of each of the documents. Distinctive words are determined using [tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf). While only the first five documents are visible clicking “Next # of # remaining” allows the user to navigate through the remaining undisplayed documents. To the right of each of the words is the word’s frequency displayed in brackets.

<iframe src="../tool/Summary/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Summary with the Works of Jane Austen. You can also <a href="../?view=Summary" target="_blank">use Summary with your own corpus</a>.</div>

## Options

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} guide for more information.

## Spyral

To use Streamgraph widget in Spyral you can use the following code as a starting point. Modify the config object to 
modify the visualization.

```
let config = {
    "limit": null,
    "numberOfDocumentsForDistinctiveWords": null,
    "start": null,
    "stopList": null,
}; 

loadCorpus("austen").tool("Summary", config);
```

Please see {@link Tools.Summary} for more information about configuration.

## See Also

- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial skins}
- {@tutorial tools}
