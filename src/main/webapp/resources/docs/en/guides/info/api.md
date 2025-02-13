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

The overarching category of all tools that work with a corpus. These share the following common parameters:

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
  * value: `lexical` or `lemma`
  * the type of token to consider
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
* inDocumentsCount
* inDocumentsCountOnly
* comparisonCorpus
* whiteList
* withDistributions
* sort
* dir

#### corpus.DocumentTerms
* bins
* withPositions
* withOffsets
* whiteList
* withDistributions
* sort
* dir

#### corpus.CorpusCollocates
* collocatesWhitelist
* context
* position

#### corpus.DocumentCollocates
* collocatesWhitelist
* context
* position

#### corpus.DocumentContexts
* overlapStrategy
* perDocLimit
* accurateTotalNotNeeded
* stripTags
* context
* position
* sort
* dir

#### corpus.CorpusTermCorrelations
* termsOnly
* minInDocumentsCountRatio
* withDistributions
* sort
* dir

#### corpus.DocumentTermCorrelations
* termsOnly
* bins
* withDistributions
* sort
* dir

#### corpus.CorpusEntities
* annotator : `String`
  * value: `spacy`, `nssi`, `opennlp`, `stanford`
* type : `String|Array<String>`
  * a subset of entity types to search for, valid types depend on the annotator
* sort
* dir

#### corpus.CorpusNgrams
* overlapFilter
* minLength
* maxLength
* withDistributions
* sort
* dir

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
  * value: `1`, `2`, `3`, `4`, `5`
* **dimensions** : `Integer`
  * value: `2`, `3`
* **bins** : `Integer`
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
* start
* limit
* perDocLimit
* tokenType
* stripTags
* withPosLemmas
* noOthers

#### corpus.CorpusTexts
* noMarkup
* compactSpace
* format

#### corpus.TopicModeling
* iterations
* topics
* termsPerTopic
* seed

## Categories

Categories are term lists that be used within queries. See the [categories guide]{@tutorial categories} for more information.

You can programmatically create categories and use the resulting categories ID in your [queries](#common-parameters-1).

### Parameters
* tool : `String`
  * value: `resource.StoredCategories`
* storeResource : `JSON`
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
