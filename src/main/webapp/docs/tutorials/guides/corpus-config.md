## corpus

The ID of a previously created corpus.

A corpus ID can be used to try to retrieve a corpus that has been previously created.
Typically the corpus ID is used as a first string argument, with an optional second
argument for other parameters (especially those to recreate the corpus if needed).
 
 	loadCorpus("goldbug");

 	loadCorpus("goldbug", {
 		// if corpus ID "goldbug" isn't found, use the input
 		input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
 		inputRemoveUntil: 'THE GOLD-BUG',
 		inputRemoveFrom: 'FOUR BEASTS IN ONE'
 	});

## input

Input sources for the corpus.

The input sources can be either normal text or URLs (starting with `http`).

Typically input sources are specified as a string or an array in the first argument, with an optional second argument for other parameters.

		loadCorpus("Hello Voyant!"); // one document with this string

		loadCorpus(["Hello Voyant!", "How are you?"]); // two documents with these strings

		loadCorpus("http://hermeneuti.ca/"); // one document from URL

		loadCorpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs

		loadCorpus("Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL

		loadCorpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
			inputRemoveUntil: 'THE GOLD-BUG',
			inputRemoveFrom: 'FOUR BEASTS IN ONE'
		});

		// use a corpus ID but also specify an input source if the corpus can't be found
		loadCorpus("goldbug", {
			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
			inputRemoveUntil: 'THE GOLD-BUG',
			inputRemoveFrom: 'FOUR BEASTS IN ONE'
		});



## inputFormat 

The input format of the corpus (the default is to auto-detect).

The auto-detect format is usually reliable and inputFormat should only be used if the default
behaviour isn't desired. Most of the relevant values are used for XML documents:

- **DTOC**: Dynamic Table of Contexts XML format
- **HTML**: Hypertext Markup Language
- **RSS**: Really Simple Syndication XML format
- **TEI**: Text Encoding Initiative XML format
- **TEICORPUS**: Text Encoding Initiative Corpus XML format
- **TEXT**: plain text
- **XML**: treat the document as XML (sometimes overridding auto-detect of XML vocabularies like RSS and TEI)

Other formats include **PDF**, **MSWORD**, **XLSX**, **RTF**, **ODT**, and **ZIP** (but again, these rarely need to be specified).



## tableDocuments 

Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.

Possible values are:

- **undefined or blank** (default): the entire table is one document
- **rows**: each row of the table is a separate document
- **columns**: each column of the table is a separate document

{@tutorial corpuscreator link text (after the first space)}

[Creating a Corpus with Tables]{@tutorial corpuscreator}.


## tableContent 

Determine how to extract body content from the table; only used for table-based documents.

Columns are referred to by numbers, the first is column 1 (not 0).
You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.

Some examples:

- **1**: use column 1
- **1,2**: use columns 1 and 2 separately
- **1+2,3**: combine columns 1 and two and use column 3 separately

See also [Creating a Corpus with Tables]{@tutorial corpuscreator}.



## tableAuthor 

Determine how to extract the author from each document; only used for table-based documents.

Columns are referred to by numbers, the first is column 1 (not 0).
You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.

Some examples:

- **1**: use column 1
- **1,2**: use columns 1 and 2 separately
- **1+2,3**: combine columns 1 and two and use column 3 separately

See also [Creating a Corpus with Tables]{@tutorial corpuscreator}.



## tableTitle 

Determine how to extract the title from each document; only used for table-based documents.

Columns are referred to by numbers, the first is column 1 (not 0).
You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.

Some examples:

- **1**: use column 1
- **1,2**: use columns 1 and 2 separately
- **1+2,3**: combine columns 1 and two and use column 3 separately

See also [Creating a Corpus with Tables]{@tutorial corpuscreator}.



## tableGroupBy 

Specify a column (or columns) by which to group documents; only used for table-based documents, in rows mode.

Columns are referred to by numbers, the first is column 1 (not 0).
You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.

Some examples:

- **1**: use column 1
- **1,2**: use columns 1 and 2 separately
- **1+2,3**: combine columns 1 and two and use column 3 separately

See also [Creating a Corpus with Tables]{@tutorial corpuscreator}.



## tableNoHeadersRow 

Determine if the table has a first row of headers; only used for table-based documents.

Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).

See also [Creating a Corpus with Tables]{@tutorial corpuscreator}.



## tokenization 

The tokenization strategy to use

This should usually be undefined, unless specific behaviour is required. These are the valid values:

- **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
- **wordBoundaries**: use any Unicode character word boundaries for tokenization
- **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)

See also [Creating a Corpus Tokenization]{@tutorial corpuscreator}.



## xmlContentXpath 

The XPath expression that defines the location of document content (the body); only used for XML-based documents.

		loadCorpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
			 xmlContentXpath: "//body"
		}); // document would be: "This is Voyant!"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlTitleXpath 

The XPath expression that defines the location of each document's title; only used for XML-based documents.

		loadCorpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
			 xmlTitleXpath: "//title"
		}); // title would be: "Hello world!"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlAuthorXpath 

The XPath expression that defines the location of each document's author; only used for XML-based documents.

		loadCorpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
			 xmlAuthorXpath: "//author"
		}); // author would be: "Stéfan Sinclair"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlPubPlaceXpath 

The XPath expression that defines the location of each document's publication place; only used for XML-based documents.

		loadCorpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
			 xmlPubPlaceXpath: "//pubPlace"
		}); // publication place would be: "Montreal"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlPublisherXpath 

The XPath expression that defines the location of each document's publisher; only used for XML-based documents.

		loadCorpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
			 xmlPublisherXpath: "//publisher"
		}); // publisher would be: "The Owl"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlKeywordXpath 

The XPath expression that defines the location of each document's keywords; only used for XML-based documents.

		loadCorpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
			 xmlKeywordXpath: "//keyword"
		}); // publisher would be: "text analysis"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlCollectionXpath 

The XPath expression that defines the location of each document's collection name; only used for XML-based documents.

		loadCorpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
			 xmlCollectionXpath: "//collection"
		}); // publisher would be: "documentation"

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlDocumentsXpath 

The XPath expression that defines the location of each document; only used for XML-based documents.

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlGroupByXpath 

The XPath expression by which to group multiple documents; only used for XML-based documents.

		loadCorpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
			 xmlDocumentsXpath: '//sp',
          xmlGroupByXpath: "//@s"
		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlExtraMetadataXpath 

A value that defines the location of other metadata; only used for XML-based documents.

		loadCorpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
			 xmlExtraMetadataXpath: "tool=//tool\nphase=//phase"
		}); // tool would be "Voyant" and phase would be "1"

Note that `xmlExtraMetadataXpath` is a bit different from the other XPath expressions in that it's
possible to define multiple values (each on its own line) in the form of name=xpath.

See also [Creating a Corpus with XML]{@tutorial corpuscreator}.



## xmlExtractorTemplate 

Pass the XML document through the XSL template located at the specified URL before 
extraction (this is ignored in XML-based documents).

This is an advanced parameter that allows you to define a URL of an XSL template that can
be called *before* text extraction (in other words, the other XML-based parameters apply
after this template has been processed).



## inputRemoveUntil 

Omit text up until the start of the matching regular expression (this is ignored in 
XML-based documents).

		loadCorpus("Hello world! This is Voyant!", {
			 inputRemoveUntil: "This"
		}); // document would be: "This is Voyant!"

See also [Creating a Corpus with Text]{@tutorial corpuscreator}.



## inputRemoveUntilAfter 

Omit text up until the end of the matching regular expression (this is ignored in 
XML-based documents).

		loadCorpus("Hello world! This is Voyant!", {
			 inputRemoveUntilAfter: "world!"
		}); // document would be: "This is Voyant!"

See also [Creating a Corpus with Text]{@tutorial corpuscreator}.



## inputRemoveFrom 

Omit text from the start of the matching regular expression (this is ignored in XML-based 
documents).

		loadCorpus("Hello world! This is Voyant!", {
			 inputRemoveFrom: "This"
		}); // document would be: "Hello World!"

See also [Creating a Corpus with Text]{@tutorial corpuscreator}.



## inputRemoveFromAfter 

Omit text from the end of the matching regular expression (this is ignored in 
XML-based documents).

		loadCorpus("Hello world! This is Voyant!", {
			 inputRemoveFromAfter: "This"
		}); // document would be: "Hello World! This"

See also [Creating a Corpus with Text]{@tutorial corpuscreator}.



## subTitle 

A sub-title for the corpus.

This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.



## title 

A title for the corpus.

This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.

 

## curatorTsv 

a simple TSV of paths and labels for the DToC interface (this isn't typically used outside of 
the specialized DToC context).
 *
The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
 *
  	 p    	 paragraph
  	 ref[@target*="religion"]    	 religion
 *
 For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
