# Embedder

Embedder provides a way to embed a web page into your Voyant Tools experience.

## Overview

Embedder is a simple tool that combines a text box with an IFrame. To use it, enter a valid URL into the text box and click Go. The URL will then be loaded into the IFrame.

NB: modern security practices will prevent many URLs from being embedded.

## Spyral

To use Embedder in Spyral you can use the following code as a starting point.

```
let config = {
    url: "https://gutenberg.org/"
};
loadCorpus("austen").tool("embedder", config);
```

Please see {@link Tools.Embedder} for more information about configuration.

## See Also

- {@tutorial start}
- {@tutorial skins}
- {@tutorial tools}