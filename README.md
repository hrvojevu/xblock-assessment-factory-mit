Assessment Factory XBlock
=======================

This XBlock is implementing problem resolving using drag and drop functionality. User drags item which can be text or image to zones inside categories which can also be text or image.


Installation
------------

Install the requirements into the Python virtual environment of your
`edx-platform` installation by running the following command from the
root folder:

```bash
$ pip install -r requirements.txt
```


Enabling in Studio
------------------

You can enable the Drag and Drop XBlock in Studio through the Advanced
Settings.

1. From the main page of a specific course, navigate to `Settings ->
   Advanced Settings` from the top menu.
2. Check for the `Advanced Module List` policy key, and add
   `"assessment_factory"` to the policy value list.
3. Click the "Save changes" button.

Compile Sass
-----
This XBlock uses Sass for writing style rules. The Sass is compiled
and committed to the git repo using:

```bash
$ make compile-sass
```

Usage
-------
This XBlock is combined of three main parts: items, categories and zones. Items and categories type can be "text" or "image". When creating items inside "Item Management" tab, it is necessary to add unique item id and, depending on item type, value which can be text (for "text" item) or URL (for "image" item). When creating categories inside "Category Management" tab, it is also necessary to add unique category id and, depending on type, value. Since categories contain zones in which items will be dropped, depending on category type, there is two ways of adding zones. 
* If a category type is "text", zone is added inside text block by adding following structure $$zone_id;item_id$$ to mark zone with it's item. Example:

```bash
Lorem ipsum $$zone-1;item-1$$ sit amet, consectetur adipiscing elit. Nam ac sem dictum, congue elit non, lacinia est. Nulla pretium arcu $$zone-2;item-2$$, eu pretium leo convallis at.
```
* If a category type is "image", zone is added by double clicking on the category image. When double clicked, zone box will appear with input fields for item and zone id. Zone box can be resized and dragged.


License
-------

The MIT License (MIT)
Copyright (c) 2016 ExtensionEngine, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.