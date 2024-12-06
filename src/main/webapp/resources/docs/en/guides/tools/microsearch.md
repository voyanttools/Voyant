# Microsearch

Microsearch visualizes the frequency and distribution of terms in a corpus. 

Use it with a [Jane Austen corpus](../?view=Microsearch&corpus=austen) or with [your own corpus](../?view=Microsearch).

## Overview

Each document in the corpus is represented as a vertical block where the height of the block indicates the relative size 
of the document compared to others in the corpus. The location of occurrences of search terms is located as red blocks 
(the brightness of the red further indicates the relative frequency within the corpus). Multiple search terms are 
collapsed together.

<iframe src="../tool/MicroSearch/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 500px"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">MicroSearch with the Works of Jane Austen. You can also <a href="../?view=MicroSearch" target="_blank">use MicroSearch with your own corpus</a>.</div>

By default the top frequency word (after filtering for {@tutorial stopwords}) is shown.

## Options

You can add more terms by using the search box – simply type in a term and hit enter (see {@tutorial search} for 
more advanced searching capabilities).

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} for more information.

## Spyral

To use Microsearch widget in Spyral you can use the following code as a starting point. Modify the config object to 
modify the visualization.

```
let config = {}; 

loadCorpus("austen").tool("Microsearch", config);
```

## Additional Information

{@tutorial bubblelines} is another tool for visualizing distribution of terms within documents on the scale of the entire corpus.

## See Also

- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial search}
- {@tutorial skins}
- {@tutorial tools}
