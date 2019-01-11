# Compile Html
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
## Syntax
Tags to be used in an html file:
```
#template(relative path)
#import(relative path)
```
- **#template()** tells the compiler that the current html file is using another html file as a template. The compiler will inject the current html at any instance of {{content}} within the template.
- **#import()** tells the compiler that the current html file uses another html file as a partial. The compiler will inject the partial at any instance of the same #import() tag.
## Example
Project structure:
- src/
- src/index.html
- src/partial/head.html
- src/partial/content.html
- src/partial/more-content.html
- src/template/base.html<br/>
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
