# Compile Html v0.0.8
Compile templates and partials into a single html file
---
## Install
```
npm install @jikurata/compile-html
```
## Usage
```
const HtmlCompiler = require('@jikurata/compile-html');

const compiler = new HtmlCompiler();
let html = compiler.compile('src/index.html') // Synchronously returns compiled html string
```
To build asset tags, a url must be provided in the constructor
```
url = 'localhost:3000';
const compiler = new HtmlCompiler({url: url});
```
## Syntax
Tags to be used in an html file:
```
#template(relative path)
#import(relative path)
#asset(relative path)
#url(relative path)
```
- **#template()** tells the compiler that the current html file is using another html file as a template. The compiler will inject the current html at any instance of #content() within the template.
- **#import()** tells the compiler that the current html file uses another html file as a partial. The compiler will inject the partial at any instance of the same #import() tag.
## Example
Project structure:
- src/
- src/index.html
- src/style.css
- src/partial/head.html
- src/partial/content.html
- src/partial/more-content.html
- src/template/base.html<br/>
```
const compiler = new HtmlCompiler({url: 'locahost:3000});
compiler.compile('src/index.html');
```
*src/index.html:*
```
#template(src/template/base.html)
<section>
    #import(./partial/content.html)
    #import(./partial/more-content.html)
</section>
```
*src/template/base.html*:
```
<!DOCTYPE html>
<html>
    #import(src/partial/head.html)
    <body>
        #content()
    </body>
</html>
```
*src/partial/head.html*:
```
<head>
    <meta charset="utf-8">
    <title>Example</title>
    <link type="relsheet" href="#asset(dist/style.css)"?>
</head>
```
*src/partial/content.html*:
```
<div>
    <span>This content is from content.html</span>
</div>
<div>
    #import(./more-content.html)
</div>
```
*src/partial/more-content.html*:
```
<div>
    <span>This content is from more-content.html</span>
</div>
```
Output:
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Example1</title>
        <link type="relsheet" href="localhost:3000/dist/style.css">
    </head>
    <body>
        <div>
            <span>This content is from content.html</span>
            <div>
                <div>
                    <span>This content is from more-content.html</span>
                </div>
            </div>
        </div>
    </body>
</html>
```
## Version log
---
**v0.0.7**
- Fix an issue with regexp objects not finding tag matches<br>
**v0.0.6**
- Add #url tag to compiler search. #url resolves itself the same way #asset does, but now exists for semantics in the html file<br>
**v0.0.5**
- clearCache() now properly empties the compiler's cache<br>
**v0.0.4**
- Added method *clearCache* to clear the html cache<br>
**v0.0.3**
- Added new tag *#asset(...)*
- To build asset tags, a url must be provided in the HtmlCompiler constructor
```
const compiler = new HtmlCompiler({url: 'some url here'});
```
