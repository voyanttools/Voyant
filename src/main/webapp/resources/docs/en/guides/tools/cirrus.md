# Cirrus

Cirrus is a word cloud that visualizes the top frequency words of a corpus or document.

Use it with a [Jane Austen corpus](../?view=Cirrus&corpus=austen) or with [your own corpus](../?view=Cirrus).

## Overview

The word cloud positions the words such that the terms that occur the most frequently are positioned centrally and are 
sized the largest. As the algorithm goes through the list and continues to attempt to draw words as close as possible 
to the center of the visualization it will also include small words within spaces left by larger words that do not fit 
together snugly. It's important to understand that the colour of words and their absolute position are not significant 
(if you resize the window or reload the page, words may appear in a different location).

Clicking on words in Cirrus will usually cause one or more other tools to react (if you're in a multi-tool 
{@tutorial skins}. Hovering over a word will cause a box to appear that displays the frequency count for that term.

<iframe src="../tool/Cirrus/?corpus=austen&subtitle=The+Works+of+Jane+Austen" style="width: 90%; height: 300px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Cirrus with the Works of Jane Austen. You can also <a href="../?view=Cirrus" target="_blank">use Cirrus with your own corpus</a>.</div>

## Options

Cirrus has a slider near the bottom (with the label "Terms") that allows you to adjust the number of words displayed. 
The default value is 50.

Clicking on the {@tutorial options} icon also allows produces a dialog box with additional settings that can be 
modified.

- **Stopwords**: you can define a set of stopwords to exclude – see the {@tutorial stopwords} for more information
- **White List**: you can define a set of allowed words (the opposite of a stopwords list), only terms in this list will be shown in Cirrus (note that the stopwords list is still active, so you may want to choose "None" from the stopwords menu to deactivate it)
- **Font Family**: you can determine which font is used by Cirrus, a set of web safe fonts is provided, as well as [Lato](http://www.latofonts.com/); you can also specify a font installed on your computer, but of course it may not be available on other computers (in which case a default font is used)
- **Palette**: you can change the {@tutorial palette}

## Flexible Scale

By default Cirrus shows the top frequency terms for the entire corpus. It's also possible to show top frequency terms for a single document. In the default skin, click on the [Documents]{@tutorial documents} tab in the lower left side and click on one of the documents – this should cause Cirrus to refresh with words from only the selected document. If you wish to return to the corpus view, click the reset button that appears in the lower right of the Cirrus pane.

![Segments](imgs/tools/cirrus/document-mode.png)

## Spyral

To use Cirrus in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```
let config = {
    visible: 50,
};

loadCorpus("austen").tool("cirrus", config);
```

Please see {@link Tools.Cirrus} for more information about configuration.

## Additional Information

The current implementation of Cirrus uses 
[Jason Davies' D3-based Word Cloud library](https://github.com/jasondavies/d3-cloud).

Word clouds can be effective at very quickly drawing attention to high frequency terms. They have also been harshly 
criticized as being highly reductive and even misleading, as 
[argued persuasively by Jacob Harris](http://www.niemanlab.org/2011/10/word-clouds-considered-harmful/) and others. 
However, the reduction of information can also be powerful (as in the example of 
[comparing stereotyped vocabulary from advertizing for toys](http://crystalsmith.ca/word-cloud-toy-ad-vocabulary-reinforces-gender-stereotypes/)), 
and Cirrus is perhaps best used in conjunction with other more exploratory and nuanced tools.

## See Also
- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial palette}
- {@tutorial skins}
- {@tutorial tools}
