# Categories

Categories are a powerful way of handling lists of words that are of interest. For instance, instead of typing several words with positive connotations, you can use the built-in categories label `@positive` (`@positive` and `@negative` are the only two built-in categories but you can edit them, remove them and and more, as we'll see).

A good place to demonstrate this is in the Terms tool.

<iframe src="../tool/CorpusTerms/?corpus=austen" style="width: 400px; height: 250px;"></iframe>

Place the cursor in the search field at the bottom of the tool above and try each of the following searches, one at a time (remove the previous search term before entering a new one):

* *`positive`*: this is each occurrence of the word "positive" in the text (31)
* *`@positive`*: this is the aggregate number of occurrences for all words in the `positive` categories group (4,041)
 * *`^@positive`*: this shows the frequencies for each word in the `positive` categories group (there may be other words in the group that don't appear in the text)

<div style="float: left; max-width: 200px; margin: 0 1em 1em 0;">

![Options](imgs/ui/categories/cirrus-options.png)

</div>

Where are categories defined? They are usually available by clicking on the "Options icon in the header of the current tool.

Once you click on the "Options" icon then you should see a "Categories" control, a box in which you can copy and paste values (categories are transferable between corpora), as well as an "edit" button that allows you to edit the specified list. By default the "auto" categories are selected, which as we'll see is composed of a small number of built-in lists. If there is no "Categories" option then it's really not relevant for that tool. Once you hit the "edit" button you should see a box that allows you to add and remove categories. Please remember: when you edit a list the categories name changes (among other things that means that you need to export a new URL if you want to share your current results).

![Categories](imgs/ui/categories/categories.png)

A few common tasks:

* you can add new terms by using the search box on the left and the dragging the word over to the correct column
* you can remove terms by selecting them and hitting the "Remove Selected Terms" button
* you can add a category by clicking on the "Add Category" button
* you can remove a category by clicking on the X in the header of the category

Terms can be added to multiple categories, and will adopt the features of the category with the highest priority. Category priority is evaluated from left to right, and can be modified using the + and - buttons at the bottom of each category.

Features can be changed by switching to the Features tab in the top right of the categories window. There are currently three features: color, font, and orientation. Color is fairly widely supported amongst the tools. Font is supported by _Cirrus_, _Collocates Graph_, and _TermsBerry_. Orientation is a _Cirrus_ specific feature. There is also the option to customize a palette and then use it to set the color feature for your categories.

![Features](imgs/ui/categories/features.png)

Finally, most grid based tools will let you directly add or remove terms from categories by right-clicking (control-clicking) the term.

![Terms Categories](imgs/ui/categories/terms_categories.png)

These same tools have the option to select how much or little coloring to apply.

![Colors Terms Categories](imgs/ui/categories/colors_terms_categories.png)

## Next Steps

- [palette]{@tutorial palette}
- [explore the tools]{@tutorial tools}
- read [about Voyant Tools]{@tutorial about}