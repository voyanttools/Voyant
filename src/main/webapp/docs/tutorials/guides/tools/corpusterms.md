# Corpus Terms

Corpus Terms is a table view of term frequencies in the entire corpus.

Use it with a [Jane Austen corpus](../?view=CorpusTerms&corpus=austen) or with [your own corpus](../?view=CorpusTerms).

## Overview

The table view shows the following three data columns by default:

- *Term*: this is the term in the corpus
- *Count*: this is the frequency of the term in the corpus
- *Trends*: this is a sparkline graph that shows the distribution of relative frequencies across documents in the corpus (if the corpus contains more than one document); you can hover over the sparkline to see finer-grained results

Additional columns are available by clicking on the down arrow that appears in the right side of a column header:

- *Relative*: this is the relative frequency of the term in the corpus (calculated by dividing the raw frequency by the total number of terms in the corpus and multiplying by 1 million). Sorting by count and relative should produce the same results, the relative frequencies might be useful when comparing to another corpus.
- *Comparison*: this is the relative frequency of the term in the corpus compared to the relative frequency of the same term in a comparison corpus; to specify the comparison corpus, click the {@tutorial options} icon and specify the comparison corpus to use
- *Peakedness*: this is a [statistical measure](https://en.wikipedia.org/wiki/Kurtosis) of how much the relative frequencies of a term in a corpus are bunched up into peaks (regions with higher values where the rest are lower)
- *Skew*: this is a [statistical measure](https://en.wikipedia.org/wiki/Skewness) of the symmetry of the relative frequencies of a term across the corpus

By default, the most frequent terms in the corpus are shown.

<iframe src="../tool/CorpusTerms/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 350px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Corpus Terms with the Works of Jane Austen. You can also <a href="../?view=CorpusTerms" target="_blank">use Corpus Terms with your own corpus</a>.</div>

## Options

You can specify terms by typing a query into the search box and hitting enter (see {@tutorial search} for more advanced searching capabilities).

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the {@tutorial stopwords} 
for more information.

You can also specify a comparison corpus by copying and pasting a comparison corpus ID (or selecting one of the 
pre-defined ones). The comparison is used for relative frequencies. You also need to show the "Comparison" column in
the grid.

## Spyral

To use Corpus Terms in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```

let config = {
    columns: null, // 'term', 'rawFreq', 'relativeFreq', 'relativePeakedness', 'relativeSkewness', 'comparisonRelativeFreqDifference', 'distributions'
    comparisonCorpus: null, // An existing corpus to be used for comparison purposes. 
    SortDir: null, // The direction in which to sort the results: 'asc' or 'desc'
    maxBins: null, // The maximum number of bins to use for distributions in Trend.
    Query: null, // A query or array of queries (queries can be separated by a comma). For query syntax, see the search documentation.
    SortColumn: null, // The column to sort the results by
    StopList: null, // A comma-separated list of words, a named list or a URL to a plain text list, one word per line. By default this is set to 'auto' which auto-detects the document's language and loads an appropriate list (if available for that language). Set this to blank to not use the default stopList.
    TermColors: null, // Which term colors to show in the grid. By default this is set to 'categories' which shows the term color only if it's been assigned by a category. The other alternatives are 'terms' which shows all terms colors, and '' or undefined which shows no term colors.
};

loadCorpus("austen").tool("Corpusterms", config);

```

Please see {@link Tools.CorpusTerms} for more information about configuration.

## See Also
- {@tutorial start}
- {@tutorial grids}
- {@tutorial stopwords}
- {@tutorial skins}
- {@tutorial tools}
