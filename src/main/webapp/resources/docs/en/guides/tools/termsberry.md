# TermsBerry

The TermsBerry tool provides a way of exploring high frequency terms and their collocates (words that occur in proximity).

Use it with a [Jane Austen corpus](../?view=TermsBerry&corpus=austen) or with [your own corpus](../?view=TermsBerry).

## Overview

The TermsBerry tool is intended to mix the power of visualizing high frequency terms with the utility of exploring how 
those same terms co-occur (that is, to what extend they appear in proximity with one another). In some ways it's like 
{@tutorial cirrus} (the word cloud) but even more useful with the added collocates and corpus coverage information.

The highest frequency terms (or most distinct terms if you change the options) appear in the middle and in larger 
bubbles, with terms spiralling outwards. The darkness of the terms represents the proportion of the documents where the 
term appears (darker means that it appears in more documents; there will be no differentiation if there's only one 
document in the corpus). 

When you hover over a term it becomes the keyword and then each of the other bubbles will indicate the collocate 
frequency for that term (within the specified context, by default two words the left and two words to the right). The 
darker the colour, the higher the collocate frequency. The hovering term also has a tooltip that appears and that 
provides the term frequency as well as the number of documents in which that term appears.

<iframe src="../tool/TermsBerry/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="min-width: 500px; max-width:90%; height: 500px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">TermsBerry with the Works of Jane Austen. You can also <a href="../?view=TermsBerry" target="_blank">use TermsBerry with your own corpus</a>.</div>

## Options

- **Strategy**: this includes two modes:
  - **Top Terms** (default): the highest frequency terms in the corpus
  - **Distinct Terms**: a collection of distinct terms in each document (as measured by TF-IDF)
- **Terms**: a slider that determines how many terms to show (default is 75)
- **Context**: a slider to show how many terms to consider in context on *each* side of each keyword for the collocates (default is 2)
- **Scaling**: a slider to determine how much scaling should happen for the size of the circle/bubble between the highest frequency terms and the lowest frequency terms (default is 3)

Clicking on the {@tutorial options} icon also allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} guide for more information.

## Spyral

To use TermsBerry widget in Spyral you can use the following code as a starting point. Modify the config object to 
modify the visualization.

```
let config = {
    categories: null, // a query for the keywords (can be comma-separated list)
    context: null, // a named stopword list or comma-separated list of words
    docId: null, // document index to restrict to (can be comma-separated list)
    docIndex: null, // the size of the context (the number of words on each side of the keyword)
    numInitialTerms: null, // the initial number of terms to display
    query: null, // the initial number of terms to display
    stopList: null, // the initial number of terms to display
}; 

loadCorpus("austen").tool("termsberry", config);
```

Please see {@link Tools.TermsBerry} for more information about configuration.

## See Also

- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial skins}
- {@tutorial tools}
