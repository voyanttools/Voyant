# Trombone API

The text analysis capabilities of Voyant Tools are directly accessible via Trombone: the backend of Voyant.

The endpoint for API calls is: `https://voyant-tools.org/trombone`.

API calls require at least two parameters: `corpus` and `tool`.

## Creating a Corpus

All API calls (except for this one) require a `corpus` parameter specifying the corpus ID, so the first step in using the API is to create a corpus if you don't already have one.

### Parameters
* **tool** : `String`
  * value: `corpus.CorpusCreator`
* **upload** : `File`
  * the source file(s) for your corpus
* **input** : `String`
  * the plain text or URL for your corpus

There are many additional processing parameters that can be specified. See the [Spyral CorpusConfig]{@link Spyral.Corpus~CorpusConfig} for the list.

### Response

The JSON response will provide you with your corpus ID, located at `stepEnabledCorpusCreator.storedId`.

```json
{
  ...
  "stepEnabledCorpusCreator": {
    "storedId": "054f70d7588cb6f2bf02e108b91bd9ab"
  }
}
```

## Documents Metadata

Once you have your corpus you can ask for the documents metadata, which includes the document IDs that can be used to narrow your queries in subsequent API calls.

### Parameters
* **tool** : `String`
  * value: `corpus.DocumentsMetadata`

### Response

The `id` and `index` properties can be used as `docId` and `docIndex` in subsequent calls.

```json
{
  ...
  "documentsMetadata": {
    "total": 8,
    "documents": [
    {
      "id": "344c515bb464b5a590a956a29ae2524f",
      "index": "0",
      "tokensCount-lexical": "33559",
      "lastTokenStartOffset-lexical": "259750",
      "typesCount-lexical": "4235",
      "typesCountMean-lexical": "7.924203",
      "lastTokenPositionIndex-lexical": "33558",
      "language": "en",
      "sentencesCount": "1302",
      "typesCountStdDev-lexical": "46.626404",
      "title": "1790 Love And Freindship",
      ...
    },
    ...
    ]
  }
}
```

## Corpus Tools

The overarching category of all Voyant tools. Here they are divided into 3 subsets: [Terms](#terms-tools), [Dimension Reduction](#dimension-reduction-tools), and [Other](#other-tools). These share the following common parameters:

### Common Parameters
* **corpus** : `String`
  * the corpus ID
* **docId** : `String|Array<String>`
  * the document ID(s)
* **docIndex** : `Integer|Array<Integer>`
  * the document index(es)
* **stopList** : `String|Array<String>`
  * A list of words, or the ID for a list, to filter out terms from the result. Using the value `auto` will filter out common terms based on the detected language of the document.

## Terms Tools

A subset of [Corpus Tools](#corpus-tools) that work with terms. These share the following common parameters:

### Common Parameters
* **tokenType** : `String`
  * the type of token to consider:  `lexical`, `lemma`, `opentag`, `closetag`, `other`, `emptytag`, `processinginstruction`
* **start** : `Integer`
  * the term index at which to start the query
* **limit** : `Integer`
  * the number of terms to limit the query to
* **minRawFreq** : `Integer`
  * the minimum raw frequency of a term for it to be included in the result
* **query** : `String`
  * A query to limit the results to. See the [search documentation]{@tutorial search} for information on formatting.
  * These tools are "category aware" and support the inclusion of [categories](#categories) within the query.
* **categories** : `String`
  * the [categories](#categories) ID

### Tools

#### corpus.CorpusTerms
* **inDocumentsCountOnly** : `Boolean`
  * only include the inDocumentsCount for each term in the results
* **comparisonCorpus** : `String`
  * a corpus ID to compare with
* **whiteList** : `String|Array<String>`
  * a list of terms to always include in the results; the opposite of a stopList
* **withDistributions** : `Boolean`
  * whether to include term distributions in the results
* **sort** : `String`
  * the field to sort by: `term`, `rawFreq`, `relativePeakedness`, `relativeSkewness`, `comparisonRelativeFreqDifference`, `inDocumentsCount`, `comparisonRelativeFreqDifference`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

#### corpus.DocumentTerms
* **bins** : `Integer`
  * the number of bins to split the distributions into
* **withPositions** : `Boolean`
  * whether to include term positions in the results
* **withOffsets** : `Boolean`
  * whether to include term offsets in the results
* **whiteList** : `String|Array<String>`
  * a list of terms to always include in the results; the opposite of a stopList
* **withDistributions** : `Boolean`
  * whether to include term distributions in the results
* **sort** : `String`
  * the field to sort by: `term`, `rawFreq`, `relativeFreq`, `tfidf`, `zscore`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

#### corpus.CorpusCollocates
* **collocatesWhitelist** : `String|Array<String>`
  * a white list of terms to always include in the results
* **context** : `Integer`
  * the number of terms to consider on each side of the keyword

#### corpus.DocumentCollocates
* **collocatesWhitelist** : `String|Array<String>`
  * a white list of terms to always include in the results
* **context** : `Integer`
  * the number of terms to consider on each side of the keyword

#### corpus.DocumentContexts
* **overlapStrategy** : `String`
  * how to handle overlapping contexts: `none`, `first`, `merge`
* **perDocLimit** : `Integer`
  * the number of contexts to return per document
* **stripTags** : `String`
  * what tags if any to remove from the result: `all`, `blocksOnly`, `none`
* **context** : `Integer`
  * the number of terms to consider on each side of the keyword
* **position** : `Integer`
  * return only a specific position from within the results
* **sort** : `String`
  * the field to sort by: `docIndex`, `left`, `term`, `right`, `position`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

#### corpus.CorpusTermCorrelations
* **termsOnly** : `Boolean`
  * only include the terms in the results and not additional metadata
* **minInDocumentsCountRatio** : `Integer`
  * the minimum coverage (as a percentage) for terms in documents, `50` means at least half of all documents must contain the term
* **withDistributions** : `Boolean`
  * whether to include term distributions in the results
* **sort** : `String`
  * the field to sort by: `correlation`, `significance`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

#### corpus.DocumentTermCorrelations
* **termsOnly** : `Boolean`
  * only include the terms in the results and not additional metadata
* **bins** : `Integer`
  * the number of bins to split the distributions into
* **withDistributions** : `Boolean`
  * whether to include term distributions in the results
* **sort** : `String`
  * the field to sort by: `correlation`, `significance`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

#### corpus.CorpusEntities
* **annotator** : `String`
  * which annotator to use: `spacy`, `nssi`, `opennlp`, `stanford`
* **type** : `String|Array<String>`
  * a subset of entity types to search for, valid types depend on the annotator
* **sort** : `String`
  * the field to sort by: `term`, `rawFreq`, `inDocumentsCount`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

#### corpus.CorpusNgrams
* **overlapFilter** : `String`
  * whether to filter out repeated ngrams: `none` (no filtering), `length` (keep longest), `rawFreq` (keep most frequent)
* **minLength** : `Integer`
  * the lower bound of the ngrams length
* **maxLength** : `Integer`
  * the upper bound of the ngrams length
* **withDistributions** : `Boolean`
  * whether to include term distributions in the results
* **sort** : `String`
  * the field to sort by: `rawFreq`, `term`, `length`
* **dir** : `String`
  * the sort direction: `asc` or `desc`

## Dimension Reduction Tools

A subset of [Corpus Tools](#corpus-tools) for performing [dimensionality reduction](https://en.wikipedia.org/wiki/Dimensionality_reduction), and are what drive the [ScatterPlots visualization]{@tutorial scatterplot}.

### Common Parameters

* **query** : `String`
  * A query to limit the results to. See the [search documentation]{@tutorial search} for information on formatting.
* **start** : `Integer`
  * the term index at which to start the query
* **limit** : `Integer`
  * the number of terms to limit the query to
* **clusters** : `Integer`
  * the number of clusters to group results into: `1`, `2`, `3`, `4`, `5`
* **dimensions** : `Integer`
  * the number of dimensions to reduce to: `2`, `3`
* **comparisonType** : `String`
  * value: `tfidf`, `raw`, `relative`
* **target** : `String`
* **term** : `String|Array<String>`

### Tools

#### corpus.PCA

#### corpus.CA

#### corpus.TSNE
  * perplexity : `Float`
  * iterations : `Integer`
  * theta : `Float`

#### corpus.DocumentSimilarity

## Other Tools

Other [Corpus Tools](#corpus-tools).

### Tools

#### corpus.DocumentTokens
* **start** : `Integer`
  * the term index at which to start the query
* **limit** : `Integer`
  * the number of terms to limit the query to
* **perDocLimit** : `Integer`
  * the number of tokens to return per document
* **tokenType** : `String`
  * the type of token to consider: `lexical`, `lemma`, `opentag`, `closetag`, `other`, `emptytag`, `processinginstruction`
* **stripTags** : `String`
  * what tags if any to remove from the result: `all`, `blocksOnly`, `none`
* **withPosLemmas** : `Boolean`
  * whether to include part of speech lemmas in the results
* **noOthers** : `Boolean`
  * whether to exclude all non-lexical tokens

#### corpus.CorpusTexts
* **noMarkup** : `Boolean`
  * whether to remove all markup (tags) from the result
* **compactSpace** : `Boolean`
  * whether to compact all whitespace in the results

#### corpus.TopicModeling
* **iterations** : `Integer`
  * the number of iterations to run the modeling
* **topics** : `Integer`
  * the number of topics to return
* **termsPerTopic** : `Integer`
  * the number of terms to include in each topic
* **seed** : `Integer`
  * the seed for the random number generator

## Categories

Categories are term lists that be used within queries. See the [categories guide]{@tutorial categories} for more information.

You can programmatically create categories and use the resulting categories ID in your [queries](#common-parameters-1).

### Parameters
* **tool** : `String`
  * value: `resource.StoredCategories`
* **storeResource** : `JSON`
  * value: see the [Spyral.Categories constructor]{@link Spyral.Categories} for an example

### Response

The JSON response will provide you with your categories ID, located at `storedCategories.id`.

```json
{
  ...
  "storedCategories": {
    "id": "521116fb7bc549e102d2c2691f8a7477",
    ...
  }
}
```
