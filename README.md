# Compile Html v0.0.10
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
let html = compiler.compile('src/index.html') // Synchronously returns compiled html
```
To build asset tags, a url must be provided in the constructor
```
url = 'localhost:3000';
const compiler = new HtmlCompiler({url: url});
```
## Syntax
Tags to be used in an html file:
```
#namespace(...property: value)
#var(variable)
#template(relative path)
#import(relative path)
#asset(relative path)
#url(relative path)
```
### #namespace()
*#namespace(...key:value;)* defines a namespace for the compiler to use during compilation. **Namespaces will persist within an HtmlCompiler object**<br>
Namespace definitions are delimited by semi-colons(;)<br>
Furthermore, property-value pairs are delimited by colons(:)<br>
**Finally, append namespace definitions to the top of a html document. Not doing so might result in unintended behavior.**
#### Examples
```
// BAD NAMESPACE (No semi-colon delimiters)
#namespace(
    foo: bar
    baz: foobar
)

// GOOD NAMESPACE
#namespace(
    foo: bar;
    baz: foobar;
)

// ANOTHER GOOD NAMESPACE (No line breaks is OK)
#namespace(foo:bar;baz:foobar;)
```
### #var()
*#var(key)* tells the compiler to search for a key-value pair in the namespace and to replace the tag with the value.
#### Example
```
// Somewhere before calling a #var() tag
#namespace(
    foo: bar
    baz: foobar
)
// And then somewhere else down the compilation process
<section id="#var(foo)>">
    <h1>#var(baz)</h1>
</section>

// At the end of compilation
<section id="bar">
    <h1>foobar</h1>
</section>
```
### #import()
*#import(path)* tells the compiler to append the html document at path at the location of the import call.<br>
#### Example
```
//some/file.html
<div>I'm an import</div>

//compile/this.html
<div>What are you?</div>
#import(some/file.html)

// Result for compile/this.html
<div>What are you?</div>
<div>I'm an import</div>
```
### #template()
*#template(path)* tells the compiler to search the path for a html file and to treat it as a template.<br>
Templates are handled similarly to import calls, however any template file is expected to contain a **#content()** tag. The #content() tag tells the compiler to insert anything following the #template() call at the #content() tag.<br>
**Regarding nested templates**<br>
Do **not** nest a template call within another template file. Doing so might result in unexpected behavior.
However, you can perform template calls sequentially (More below):
#### Examples
```
//some/template.html
<!DOCTYPE html>
<html>
    <head>
        #import(head.html)
    </head>
    <body>
        #content()
    </body>
</html>
// head.html
<meta charset="utf-8">
<title>Template Example</title>
// index.html
#template(some/template/html)
<header>
    <h1>Example</h1>
</header>

// After compiling index.html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Template Example</title>
    </head>
    <body>
        <header>
            <h1>Example</h1>
        </header>
    </body>
</html>
```
```
// Sequential template calls
#template(templateA.html)
#template(templateB.html)
<div></div>

// Result:
<div></div> is imported into #content() of templateB
templateB is imported into #content() of templateA
```
### #asset() & #url()
*#asset(path)* and *#url(path)* both behave similarly. The purpose of these tags is to resolve relative href and src paths into their absolute paths using a provided url. The primary difference is that asset() is intended for file links and url() is for routes.
#### Example
```
const compiler = new HtmlCompiler({url: 'http://mywebsite.com'})

// In some html file
<link rel="stylesheet type="text/css" href="#asset(css/style.css)">
<a href="#url(/home)">return</a>

// Result

<link rel="stylesheet type="text/css" href="http://mywebsite.com/css/style.css">
<a href="http://mywebsite.com/home">return</a>
```
## Full Example
Project structure:
- src/index.html
- src/style.css
- src/partial/head.html
- src/partial/content.html
- src/partial/more-content.html
- src/template/base.html
- src/template/nested.template.html<br/>
```
const compiler = new HtmlCompiler({url: 'locahost:3000});
compiler.compile('src/index.html');
```
*src/index.html:*
```
#namespace(
foo: bar;
baz: foobar;
)
#template(src/template/base.html)
#template(src/template/nested.template.html)
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
*src/template/nested.template.html
```
<article>
    <header>
        <h1>Nested Template</h1>
    </header>
    <section>
        #content()
    </section>
    <footer>
        #var(foo)
    </footer>
</article>
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
    <span>Also, #var(baz)</span>
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
        <article>
            <header>
                <h1>Nested Template</h1>
            </header>
            <section>
                <div>
                    <span>This content is from content.html</span>
                    <div>
                        <div>
                            <span>This content is from more-content.html</span>
                            <span>Also, foobar</span>
                        </div>
                    </div>
                </div>
            </section>
            <footer>
                bar
            </footer>
        </article>
    </body>
</html>
```
## Version log
---
**v0.0.10**
- Fixed readme typos<br>

**v0.0.9**
- Implemented an environment tag *#---* to define any variables to be inserted in the html file
- Implemented a variable tag #var() to tell the compiler to insert a value defined by the environment<br>

**v0.0.8**
- Nested template calls now compile in the order they are defined, top-to-bottom.<br>

**v0.0.7**
- Fixed an issue with regexp objects not finding tag matches<br>

**v0.0.6**
- Added #url tag to compiler search. #url resolves itself the same way #asset does, but now exists for semantics in the html file<br>

**v0.0.5**
- clearCache() now properly empties the compiler's cache<br>

**v0.0.4**
- Added method *clearCache* to clear the html cache<br>

**v0.0.3**
- Added new tag *#asset(...)*
- To build asset tags, a url must be provided in the HtmlCompiler constructor
