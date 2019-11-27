"use strict";

const path = require('path');

const loaderUtils = require("loader-utils"),
    assign = require("object-assign"),
    //asciidoctor = require('asciidoctor.js')(),
    asciidoctor = require('asciidoctor')()
    //Asciidoctor = require('asciidoctor.js')
    var asciidoctorRevealjs = require('asciidoctor-reveal.js');
    asciidoctorRevealjs.register()

// default option
const defaultOptions = {
    safe: 'unsafe', 
    sourceHighlighter: 'highlightjs',
    backend: 'revealjs',
    attributes: {
 //       'linkcss': true
    }
};

module.exports = function (content) {
    // merge params and default config
    console.log("content=", content)
    console.log("this.query=", this.query)
    console.log("this.options", this.options)
    
    
    const query = loaderUtils.parseQuery(this.query),
        options = assign({}, defaultOptions, query, {}),
        //options = assign({}, defaultOptions, query, {}),
        includeRegExp = new RegExp(/^include::(.*)\[\]/, 'm');

    let includePath,
        includeFileName;

    while (includeRegExp.test(content)) {
        includeFileName = content.match(includeRegExp)[1];
        includePath = path.join(`${this.context}/${includeFileName}`);
        content = content.replace(includeRegExp, "++++\n${require("+includeFileName+"')}\n++++");

    }

    this.cacheable();

    //let result = asciidoctor.Asciidoctor(true).$convert(content, asciidoctor.Opal.hash(options))
    //const result = asciidoctor.Asciidoctor(true).$convert(content, asciidoctor.Opal.hash(options))

    console.log("converting options: ", options)

    //var doc = asciidoctor.load(content)
    //console.log(doc.getDocumentTitle())
    //console.log(doc.getAttributes())
    //var result = doc.convert(options);

    const result = asciidoctor.convert(content, options)
    console.log("convert to adoc = ", result)
    return result;
};
