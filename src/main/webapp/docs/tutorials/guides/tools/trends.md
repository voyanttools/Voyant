# Trends

Trends shows a line graph depicting the distribution of a word’s occurrence across a corpus or document.

Use it with a [Jane Austen corpus](../?view=Trends&corpus=austen) or with [your own corpus](../?view=Trends).

## Overview

Trends is a visualization that represents the frequencies of terms across documents in a corpus or across segments in a 
document, depending on the mode. Each series in the graph is coloured according to the word it represents, at the top 
of the graph a legend displays which words are associated with which colours. You can click on words in the legend to 
toggle their visibility. Hovering over any point in the graph causes a callout box to appear with information about the 
point, including the word, the frequency (raw or relative depending on mode), the document or document segment.

<iframe src="../tool/Trends/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 400px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Trends with the Works of Jane Austen. You can also <a href="../?view=Trends" target="_blank">use Trends with your own corpus</a>.</div>

There are two modes for Trends:

* **corpus**: when the corpus contains multiple documents, this shows the frequency of the term in each document
* **document** when the corpus has one document or when the user has "drilled-down" (see section below) to the document level, this shows the frequency of the term for each segment in the document (segments are created automatically and are all of approximately the same length – see the Options for changing the number of segments to use)

### Drill-Down

When in corpus mode you can double-click on an item to drill-down to the document level. This can be done in two ways:

* **Terms** show the currently selected term for all documents
* **Document** for the current document, show all available terms (from the legend)

You can always click on the "Reset" button in the bottom toolbar to reinitialize.

![Drilldown](imgs/tools/trends/drilldown.png)

By default Trends shows a "Line + Stacked Bar" view, but that can be changed (see options below). The line graph is 
effective at showing trends in the values, though technically it's a bit misleading to have a continuous line for what 
are discreet categories on the bottom x-axis (each document or each document segment). The Stacked Bar, though faintly 
represented, tries to express the nature of the categoric data.

## Options

You can add more terms by using the search box – simply type in a term and hit enter (see {@tutorial search} terms 
for more advanced searching capabilities).

You can click the "Reset" button to return to the defaults for the tool (this is especially useful if you've 
drilled-down on a term or document by double-clicking on the graph).

The Display buttons has two components:

* **Show Labels**: determines if each item in the chart should be labeled (no by default)
* Chart Mode:
  * **Area**: an area chart (labels aren't available for this kind of chart)
  * **Columns**: each item is its own column in each category
  * **Line**: line chart across categories
  * **Stacked Bar**: stacked bar chart (values are shown in columns)
  * **Line & Stacked Bar** (default): superimposed line and stacked bar chart
  
<iframe src="../tool/Trends/?corpus=austen&subtitle=Line+And+Stacked+Bar" style="width: 150; height: 300px;"></iframe>
<iframe src="../tool/Trends/?corpus=austen&subtitle=Line&chartType=line" style="width: 150; height: 300px;"></iframe>
<iframe src="../tool/Trends/?corpus=austen&subtitle=Columns&chartType=bar" style="width: 150; height: 300px;"></iframe>
<iframe src="../tool/Trends/?corpus=austen&subtitle=Area&chartType=area" style="width: 150; height: 300px;"></iframe>
<iframe src="../tool/Trends/?corpus=austen&subtitle=Stacked&chartType=stacked" style="width: 150; height: 300px;"></iframe>

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} guide for more information.  The options also allow you to edit the colour {@tutorial palette}.

You can determine the number of segments to use when in Documents mode. The slider determines how many segments there 
will be in a document, so 10 (the default) means that each document is divided into 10 equal parts and then frequencies 
are determined for each part.

You can also select the frequency mode:

* **relative frequencies** (default): term frequency in document or document segment
* **raw frequencies**: the absolute count for each document or document segment


## Spyral

To use the Trends widget in Spyral you can use the following code as a starting point. Modify the config object to 
modify the visualization.

```
let config = {
    stopList: null, // a named stopword list or comma-separated list of words
    query: null, // a query for the keywords (can be comma-separated list)
    limit: null, // the number of terms to show
    withDistributions: null, // the type of distribution frequency to show ("raw" or "relative"), default is "relative"
    bins: null, // for the purposes of analyzing distribution the documents are split into a specified number of segments or bins
    docIndex: null, // document index to restrict to (can be comma-separated list)
    chartType: null, // the type of chart to show: "barline", "bar", "line", "area", "stacked"
};

loadCorpus("austen").tool("Trends", config);
```

## See Also

- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial palette}
- {@tutorial skins}
- {@tutorial tools}
