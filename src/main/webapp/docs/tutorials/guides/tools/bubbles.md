# Bubbles

Bubbles is a playful visualization of term frequencies by document.

Use it with a [Jane Austen corpus](../?view=Bubbles&corpus=austen&audio=true") or with [your own corpus](../?view=Bubbles&audio=true").

## Overview

High frequency terms are read in document order, and the current term is shown in the upper right-hand corner. The list 
of terms below shows a ranking of the cumulative frequencies to that point in the document. The first time a term is 
encountered a bubble is created and added to the main part of the canvas. The term flashes in yellow as it's being read. 
The relative size of the bubbles indicates the frequency compared to other terms to the current point in the document.

The total number of terms to be read is shown at the bottom, along with a progress bar. If the corpus is composed of 
multiple documents, the next document will automatically be fetched and read.

You can hover over a bubble term to see its frequency to that point. You can also drag the bubble to move it if you 
wish.

<iframe src="../tool/Bubbles/?corpus=austen&subtitle=The+Works+of+Jane+Austen&audio=true" style="width: 90%; height: 600px;"></iframe>
<div style="width: 90%; text-align: center; margin-bottom: 1em;">Bubbles with the Works of Jane Austen. You can also <a href="../?view=Bubbles" target="_blank">use Bubbles with your own corpus</a>.</div>

## Options

You can switch to a different document by selecting it in the Documents selectors.

You can adjust the speed of the visualization using the speed slider. This is essentially the frame rate of the 
visualization, from 1 to 60 frames per second.

You can toggle audio by using the sound checkbox. The higher the frequency of the term currently being read the higher the frequency of the sound.

Clicking on the {@tutorial options} icon allows you to define a set of stopwords to exclude – see the 
{@tutorial stopwords} for more information.

## Spyral

To use Bubbles in Spyral you can use the following code as a starting point. Modify the config object to modify 
the visualization.

```

let config = {
    audio: false, // whether or not to include audio
    docIndex: 1, // document index to restrict to (can be comma-separated list)
    speed: 10, // speed of the animation (0 to 60 lower is slower)
    stopList: null, // a named stopword list or comma-separated list of words
};

loadCorpus("austen").tool("Bubbles", config);

```

Please see {@link Tools.Bubbles} for more information about configuration.

## Additional Information

Bubbles is an adaptation of Martin Ignacio Bereciartua's excellent [Letter Pairs](https://www.m-i-b.com.ar/letters/en/). 
Changes include having it display words instead of letter pairs, adding sound, making it resizable, selective showing 
of term information, and performance tweaks.

## See Also
- {@tutorial start}
- {@tutorial stopwords}
- {@tutorial skins}
- {@tutorial tools}
