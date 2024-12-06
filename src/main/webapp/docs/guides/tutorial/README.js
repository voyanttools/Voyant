Ext.data.JsonP.tutorial({"guide":"<h1 id='tutorial-section-tutorial%2Fworkshop'>Tutorial/Workshop</h1>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/tutorial-section-topics'>Topics</a></li>\n<li><a href='#!/guide/tutorial-section-basics-of-voyant'>Basics of Voyant</a></li>\n<li><a href='#!/guide/tutorial-section-create-a-corpus'>Create a Corpus</a></li>\n<li><a href='#!/guide/tutorial-section-explore-a-corpus'>Explore a Corpus</a></li>\n<li><a href='#!/guide/tutorial-section-digging-deeper'>Digging Deeper</a></li>\n<li><a href='#!/guide/tutorial-section-beyond-voyant'>Beyond Voyant</a></li>\n<li><a href='#!/guide/tutorial-section-get-involed'>Get Involed</a></li>\n<li><a href='#!/guide/tutorial-section-roadmap'>Roadmap</a></li>\n</ol>\n</div>\n\n<p>This page is intended to provide a possible starting point for tutorials or workshops on Voyant Tools. Please feel free to adapt it as needed. This page is also written to serve as a self-study guide.</p>\n\n<p>There are some core concepts in Voyant that can be covered during a workshop, but there are also many specific issues that arise depending on the background and interests of users and participants. We tend to view workshops on Voyant as serving two purposes:</p>\n\n<ol>\n<li>how to use Voyant and get a grasp on what's available (how to use it)</li>\n<li>how to think differently about texts with tools such as Voyant (why use it)</li>\n</ol>\n\n\n<p>Pre-prepared materials like this document are perhaps best suited for the first purpose but we also think that a workshop can provide a venue for spontaneous explorations about the strengths and limitations of text analysis in general and Voyant in particular.</p>\n\n<p>There is a hosted version of Voyant Tools (https://voyant-tools.org) but we very strongly encourage anyone following along to download and launch the desktop version. Things can become unpredictable when 30 people hit the same button on the hosted version of Voyant. Besides, running a local version is likely to be faster, more private, and more flexible (you can work \"offline\"). Running VoyantServer is easy, you just <a href=\"https://github.com/sgsinclair/VoyantServer/wiki/VoyantServer-Desktop\">download</a>, unzip, and click on the application. We usually try to contact workshop participants in advance to ask that they install a local version and sometimes we provide USB keys with download file.</p>\n\n<h2 id='tutorial-section-topics'>Topics</h2>\n\n<p>The tutorial will cover the following topics:</p>\n\n<ul>\n<li>basic information about Voyant (essential background about the tool and its design)</li>\n<li>how to create (or use) a Voyant corpus (especially with URLs and file uploads)</li>\n<li>how to begin exploring a corpus in Voyant (the default tools and their interactions)</li>\n<li>digging deeper into Voyant functionality (power searches, working with grids, additional tools)</li>\n<li>beyond Voyant (exporting data, bookmarking, embedding tools elsewhere)</li>\n<li>getting involved (as a user, developer, translator, content provider)</li>\n<li>future directions (such as Spyral Notebooks)</li>\n</ul>\n\n\n<p>There is a lot of material here and if you are leading a workshop you may want to select parts to skip (or cover some things more quickly than others). Depending on how things are presented and how much time is given for discussion and exploration, this outline might work well for a full-day workshop. Shorter formats are of course possible by being more selective or having a more instructional rather than hands-on tutorial style.</p>\n\n<p>Before getting into the specific topics we often take a moment to ask people to introduce themselves, describe their areas of interests, their expectations of Voyant and the workshop, and to indicate any specific topics or areas that they would like covered in more detail. (This is also an opportunity for the workshop leaders to introduce themselves and describe their own areas of research and interests.)</p>\n\n<h2 id='tutorial-section-basics-of-voyant'>Basics of Voyant</h2>\n\n<p>The <a href=\"#!/guide/about\">About</a> page contains a useful introduction to Voyant: what it is, who has contributed, and some of the core design principles. It's worth reading as time permits.</p>\n\n<p>For the purposes of the workshop, we typically like to emphasize the following:</p>\n\n<ul>\n<li>Voyant Tools fits in a long tradition of humanities scholars building tools for reading, finding, analyzing and visualizing digital texts.</li>\n<li>Voyant Tools strives to lower the barrier of entry for text analysis and balance user-friendliness with powerful functionality. For instance, no installation or login are required, and you can work with texts in a wide variety of formats (plain text, PDF, XML, MS Word, RTF, etc.).</li>\n<li>Voyant Tools is open-source and is a work in progress, it may not always work as intended and it's best to approach all observations with some circumspection.</li>\n<li>Voyant Tools has the advantage of being able to work with almost any language (represented in Unicode) but has the disadvantage that it has almost no language-specific functionality (needed for things like semantic analysis).</li>\n<li>Voyant Tools is intended as a tool for exploration and to assist with interpretative practices, it is not intended to tell you what questions to ask or to provide irrefutable results, though you may notice some interesting things and you may be led to construct some compelling interpretations while using it.</li>\n<li>Voyant Tools has no ambition to be the only tool that you use, there may come a point where its pre-programmed functionality seems constraining or inappropriate and other tools may be more suitable (we're especially big fans of <a href=\"https://github.com/sgsinclair/alta/blob/2eb10ab6787d032e317ce883fb0bc3427406333d/ipynb/Useful%20Resources.ipynb\">Python and Juypter Notebooks</a>).</li>\n<li>Voyant is designed to integrate into a collaborative research process, including the possibility of sharing corpora and embedding tools into web pages (as you might embed a video); we are interested in how tools and argumentation can be combined in scholarship.</li>\n</ul>\n\n\n<p>Ok, that's all somewhat abstract and conceptual, let's jump into using Voyant.</p>\n\n<h2 id='tutorial-section-create-a-corpus'>Create a Corpus</h2>\n\n<p>There's more detail in the <a href=\"#!/guide/corpuscreator\">Creating a Corpus</a> page, but there are four main ways of creating and using a corpus in Voyant (\"corpus\" is another word for a set of documents):</p>\n\n<ol>\n<li>open an existing corpus (click on the \"Open\" button under the text box)</li>\n<li>type or paste text into the main text box (this creates a corpus with one document)</li>\n<li>type or paste one or more URLs into the main text box (one URL per line)</li>\n<li>click the \"Upload\" button under the text box to use files from your computer</li>\n</ol>\n\n\n<p>Take a moment to try each kind of corpus source (open, text, URLs, upload) in the box below (or in a <a href=\"../\" target=\"_blank\">new window</a>).</p>\n\n<iframe src=\"../\" style=\"width: 90%; height: 520px;\"></iframe>\n\n\n<p>Some tips:</p>\n\n<ul>\n<li>typing or pasting text into the box is ok for shorter documents, but for longer documents it's probably best to upload a file</li>\n<li>when you upload files you can select multiple files at a time</li>\n<li>if you have several local files to upload, consider creating a zip archive first, then upload just that file</li>\n<li>URLs need to be visible to the Voyant server (not behind a firewall) so the contents can be fetched</li>\n<li>some servers (like Gutenberg) may limit the number of requests, which could cause URLs to behave sporadically</li>\n<li>it can take a while to fetch a long list of URLs, it's probably preferable to use another tool to download the files (or download them manually) and then upload them in a zip archive</li>\n<li>uploaded plain text files need to be in UTF-8</li>\n</ul>\n\n\n<p>If an error occurs during corpus creation you may see an error message appear. Unfortunately, sometimes the system just fails silently (especially if you're creating a big corpus and there's a server timeout). One advantage of using a local instance of VoyantServer is that you may see some helpful errors reported in the VoyantServer window.</p>\n\n<p>Voyant can be used with a corpus of variable size, from one document to many. Some of the functionality depends on multiple documents and some tools work less well when there are hundreds or more documents.</p>\n\n<p>It's good to think of a corpus as a fluid concept, you may be able to change the meaning as you proceed. For instance, if you have thousands of tweets, you could treat each one as a separate document, or combine tweets by time, by author, or by some other criteria. Sometimes you might want to edit a corpus or sometimes you might want to create a new corpus for comparison.</p>\n\n<p>We won't experiment for now with more advanced options for Corpus creation, but there are several <a href=\"#!/guide/corpuscreator-section-options\">options</a> available to tweak the processing of text, XML, and even spreadsheets. If you have a moment during the workshop you could start experimenting with these.</p>\n\n<h2 id='tutorial-section-explore-a-corpus'>Explore a Corpus</h2>\n\n<p>Once you create a corpus you will arrive at the default \"<a href=\"#!/guide/skins\">skin</a>\" or arrangement of tools. There is a lot happening at once, but we'll start by describing the tools that you see and how they can interact.</p>\n\n<h3 id='tutorial-section-default-skin'>Default Skin</h3>\n\n<p>At first you will see three tool panels along the top and two tool panels along the bottom:</p>\n\n<ul>\n<li><a href=\"#!/guide/cirrus\">Cirrus</a>: a kind of word cloud showing the most frequent terms</li>\n<li><a href=\"#!/guide/reader\">Reader</a>: an efficient corpus reader that fetches segments of text as you scroll</li>\n<li><a href=\"#!/guide/trends\">Trends</a>: a distribution graph showing terms across the corpus (or terms within a document)</li>\n<li><a href=\"#!/guide/summary\">Summary</a>: a tool that provides a simple, textual overview of the current corpus</li>\n<li><a href=\"#!/guide/contexts\">Contexts</a>: a concordance that shows each occurrence of a keyword with a bit of surrounding context</li>\n</ul>\n\n\n<iframe src=\"../?corpus=austen\" style=\"width: 90%; height: 500px;\"></iframe>\n\n\n<h3 id='tutorial-section-tool-interactions'>Tool Interactions</h3>\n\n<p>An essential part of Voyant is that events in one tool can cause changes in other tools (the exact interactions depend on a number of factors, including which tools are visible). For instance, try the following sequence in the window above:</p>\n\n<ul>\n<li>click on a word (like \"know\") in Cirrus, the tool in the upper left</li>\n<li>notice how the Trends tool (upper right) now shows just the word you clicked</li>\n<li>click on one of the discs in the Trends tool</li>\n<li>notice that the Contexts tool (bottom right) has updated with just the clicked word</li>\n<li>click the first row of the Contexts tool (bottom right)</li>\n<li>notice how the Reader tool has jumped to a location where that word appears, highlighted</li>\n</ul>\n\n\n<h3 id='tutorial-section-cirrus'>Cirrus</h3>\n\n<iframe src=\"../tool/Cirrus/?corpus=austen\" style=\"width: 500px; height: 300px; float: right; padding-left: 1em;\"></iframe>\n\n\n<p> Now let's zoom in for a moment on Cirrus. We might ask ourselves several questions about what we're seeing. For instance, what does size represent? What about colour? What about the placement of words? This is a text in English but the most commonly occurring words aren't there (like \"the\" and \"a\"), why not? For a tool like Cirrus some of these questions may be obvious, but for <strong>all</strong> tools it's good to continuing asking ourselves what we're seeing, what we're not seeing, and why.</p>\n\n<h3 id='tutorial-section-options'>Options</h3>\n\n<p><img src=\"guides/tutorial/cirrus-options.png\" style=\"float: left; max-width: 200px; padding-right: 1em;\"> Some options in Cirrus (like other tools) are available directly within the tool panel, like the \"Scale\" button and the \"Terms\" slider (experiment with both of these to see what they do). Other options are accessible from the options dialog that appears when you click on slider in the grey bar of the tool (like the image to the left). The full list of options are described in the <a href=\"#!/guide/cirrus-section-options\">Cirrus</a> documentation page, but let's have a quick look at the Stopwords option by clicking the \"Edit List\" button. This will show a dialog box with a long list of words that are excluded from the top frequency words in Cirrus. These are generally \"function\" words, or words that carry less meaning, but you may be surprised to see some of the words included (like \"must\" or \"nobody\"). Likewise, you may want to add a word that's not currently in the list (like \"said\"). Either way it's good to know what's there and to confirm that's what you want. You can find <a href=\"#!/guide/stopwords\">more information on stopwords</a>.</p>\n\n<h3 id='tutorial-section-summary'>Summary</h3>\n\n<p>One last thing to point out from the Summary tool (bottom left): the \"Distinctive words\" list. Assuming your corpus has multiple documents, this shows the words that are not only high frequency, but high frequency and relatively distinctive to that document (the frequency is weighted by how often it's found i other documents using something called <a href=\"https://en.wikipedia.org/wiki/Tf%E2%80%93idf\">TF-IDF</a>).</p>\n\n<iframe src=\"../?corpus=austen&view=summary\" style=\"width: 90%; height: 300px;\"></iframe>\n\n\n<p>Now that an initial presentation of the interface has been made, this would be a good time to allow participants an opportunity to further explore. We will see some more functionality and some more tools in the next section, so the emphasis can be on the tools that are visible in the default interface: What information is shown in the five tools? What interactions between tools are possible? What simple tweaks to the settings and options are worth trying? Participants can use the Austen corpus or a simple corpus of their own (ideally that contains multiple documents).</p>\n\n<h2 id='tutorial-section-digging-deeper'>Digging Deeper</h2>\n\n<p>Voyant is an ongoing negotiation between simplicity and power: the design tries to simplify (relatively) the interface while still allowing more advanced operations.</p>\n\n<h3 id='tutorial-section-search'>Search</h3>\n\n<iframe src=\"../tool/CorpusTerms/?corpus=austen\" style=\"width: 350px; height: 350px; float: right\"></iframe>\n\n\n<p>A good example of this is <a href=\"#!/guide/search\">search</a>, which is supported in several of the tools (including Reader, Trends and Contexts in the default view). It's possible to search for a single word, but more advanced searches are also supported with a special syntax (hovering over the question mark in the search box shows examples of the syntax). Try the search terms (in bold) in the list below (you can remove a query by hitting x in the box surrounding the query, or hitting backspace to delete it). Also notice that Voyant tries to suggest search terms as you type, you can click on a suggestion to add it to the queries.</p>\n\n<ul>\n<li><strong>love</strong>: exact word match</li>\n<li><strong>lov*</strong>: combine all words that start with \"lov\"</li>\n<li><strong>^lov*</strong>: separate all words that start with \"lov\"</li>\n<li><strong>love|loves</strong>: combine all words separated by a pipe |</li>\n<li><strong>\"he loves\"</strong>: exact phrase match</li>\n<li><strong>\"she he love*\"~10</strong>: all words within a proximity of 10 words</li>\n</ul>\n\n\n<p>The notion of boolean operators (AND, OR) isn't relevant for most tools since we're querying for any instance of any of the <strong>words</strong> (unlike when we're wanting to find <strong>documents</strong> that contain any or all queries). Note also that Voyant doesn't support directly notions like singular and plural forms, but that you can determine what forms are present (\"<strong>^dog*</strong>\") and then decide if you want to combine forms (\"<strong>dog|dogs</strong>\") or keep them separate (\"<strong>dog,dogs</strong>\"). That helps for individual queries but of course doesn't help much when you would want to see all singular and plural forms combined in a frequency list.</p>\n\n<h3 id='tutorial-section-grids'>Grids</h3>\n\n<p>Another example of somewhat hidden power in the Voyant interface can be found in most grid-based tools (that look like spreadsheets, like Contexts in the default view). This is an overview of some of the functionality that may not be obvious:</p>\n\n<ul>\n<li>hover over the column header to get a short description of the column values</li>\n<li>some columns allow you to sort values by that column by clicking on it (and clicking again to reverse the order)</li>\n<li>most columns can be reordered by dragging and dropping the column headers</li>\n<li>most grids allow for row selection: select a row by clicking on it, select multiple rows by using the Shift or Ctrl/Command key</li>\n<li>some grids have checkboxes (leftmost column) that facilitate selecting multiple items</li>\n<li>selected rows should persist even when querying for additional data</li>\n<li>some grids have a plus icon (leftmost colunm) that allows the user to expand more information about that row</li>\n<li>most grids have \"infinite scrolling\" which means that more rows will be loaded dynamically as needed and as available</li>\n<li>hovering over most column headers will cause an arrow to appear in the right part of the column header, click on it for further options:\n\n<ul>\n<li>another way of sorting</li>\n<li>a way of selecting additional columns to display</li>\n</ul>\n</li>\n</ul>\n\n\n<div style=\"max-width: 450px;\"><p><img src=\"guides/tutorial/../grids/grid.png\" alt=\"Grid\" width=\"1015\" height=\"542\"></p></div>\n\n\n<h3 id='tutorial-section-additional-tools'>Additional Tools</h3>\n\n<p>Voyant's default view (or skin) shows a collection of 5 tools, but in fact there are many more tools available in Voyant. You may have already discovered one way of accessing some of them: by clicking on a tab (for instance, the Cirrus tool can be replaced by the Terms or Links tools simply by clicking on the tab (and of course you can click on the Cirrus tab to return to the default view).</p>\n\n<p><p><img src=\"guides/tutorial/../start/more-tools.png\" alt=\"More Tools\" width=\"1670\" height=\"482\"></p></p>\n\n<p>The tabs are pre-programmed alternatives, but you can also choose from a much longer list of tools by clicking on the little window icon that appears when hovering over the header (either the blue header at the top that replaces all of the tools in the window or the grey header in each tool panel that replaces just that tool). Additional tools are organized into the following categories (tools can appear in multiple categories):</p>\n\n<ul>\n<li>the first tools above the line are recommended alternatives</li>\n<li>corpus tools: showing data about the corpus as a whole</li>\n<li>document tools: showing data about individual documents</li>\n<li>visualization tools: presenting data as charts, graphs, and other visual forms</li>\n<li>grid tools: presenting data primarily in tabular form</li>\n<li>other tools: various other forms of data presentation</li>\n</ul>\n\n\n<p>Another convenient way of browsing tools is to consult the <a href=\"#!/guide/tools\">list of tools</a>, especially as there is a small thumbnail image and short description for each tool.</p>\n\n<h2 id='tutorial-section-beyond-voyant'>Beyond Voyant</h2>\n\n<p>Voyant is designed to</p>\n\n<h3 id='tutorial-section-boomarking'>Boomarking</h3>\n\n<h3 id='tutorial-section-exporting-data'>Exporting Data</h3>\n\n<h3 id='tutorial-section-embeddding-voyant'>Embeddding Voyant</h3>\n\n<h2 id='tutorial-section-get-involed'>Get Involed</h2>\n\n<p>We think of Voyant as a community-driven project, enriched by bug reports and feature requests from users, code contributions from developers, translators of the interface, and content providers who integrate Voyant into their platforms.</p>\n\n<h3 id='tutorial-section-users'>Users</h3>\n\n<h3 id='tutorial-section-developers'>Developers</h3>\n\n<h3 id='tutorial-section-translators'>Translators</h3>\n\n<p>The interface of Voyant has been partially or fully translated from English into multiple languages, including <a href=\"../?lang=ar\">Arabic</a>, <a href=\"../?lang=bs\">Bosnian</a>, <a href=\"../?lang=cz\">Czech</a>, <a href=\"../?lang=hr\">Croatian</a>, <a href=\"../?lang=fr\">French</a>, <a href=\"../?lang=he\">Hebrew</a>, <a href=\"../?lang=it\">Italian</a>, <a href=\"../?lang=ja\">Japanese</a>, and <a href=\"../?lang=sr\">Serbian</a>. Help would be welcome to complete or update most of these languages, and we would gratefully welcome anyone wanting to start a new language (or coordinate with a team to do so). Voyant is a great way for new users anywhere in the world to start experimenting with text analysis. Please contact us if you're interested in helping!</p>\n\n<h3 id='tutorial-section-content-providers'>Content Providers</h3>\n\n<h2 id='tutorial-section-roadmap'>Roadmap</h2>\n\n<p>Voyant is an ongoing effort and we're always balanacing multiple priorities, including the following:</p>\n\n<ul>\n<li>addressing bugs (see our issues tracker)</li>\n<li>improving robustness of the application (especially for multiple concurrent users)</li>\n<li>adding requested features, in particular:\n\n<ul>\n<li>progress monitoring for corpus creation (important for larger corpora)</li>\n<li>a more useful and widely supported word groupings mechanism (creating simple lists of words that can function as a unit)</li>\n<li>a preliminary geospatial mapping tool</li>\n<li>some more language-specific functionality (lemmatization and semantic analysis)</li>\n</ul>\n</li>\n</ul>\n\n\n<h3 id='tutorial-section-spyral'>Spyral</h3>\n\n<p>Finally, we are working on a web-based notebook environment (like <a href=\"***\">Juypter</a>) that combines text (argumentation or documentation) with code snippets and results. Spyral will have the advantage of requiring no installation (unlike Jupyter) and will leverage much of the functionality in Voyant (both back-end analysis and front-end tools).</p>\n\n<p>There is no end to the new functionality that we could add in Voyant, but Spyral will allow power users to implement some of that functionality themselves.</p>\n\n<p>Voyant is an environment for reading, analysis and visualization, Spyral will include that and also be a writing and coding environment: we envision it as a full scholarly environment for text analysis.</p>\n\n<p>We have a working prototype and anticipate a more official release at some point in 2019.</p>\n","title":"Tutorial/Workshop"});