/*************************************************************
 *
 *  Copyright (c) 2019 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/**
 * @fileoverview  Configuration file for sample extension that creates
 *                some MathML token elements.
 *
 * @author dpvc@mathjax.org (Davide P. Cervone)
 */

import {Configuration}  from '../../../../node_modules/mathjax-full/js/input/tex/Configuration.js';
import {CommandMap} from '../../../../node_modules/mathjax-full/js/input/tex/SymbolMap.js';
import TexError from '../../../../node_modules/mathjax-full/js/input/tex/TexError.js';

/**
 * This function prevents multi-letter mi elements from being
 *   interpretted as TEXCLASS.OP
 */
function classORD(node) {
    this.getPrevClass(node);
    return this;
}

/**
 *  Convert \uXXXX to corresponding unicode characters within a string
 */
function convertEscapes(text) {
    return text.replace(/\\u([0-9A-F]{4})/gi, (match, hex) => String.fromCharCode(parseInt(hex,16)));
}

function parseAttributes(text) {
    const attr = {};
    if (text) {
        let match;
        while ((match = text.match(/^\s*((?:data-)?[a-z][-a-z]*)\s*=\s*(?:"([^"]*)"|(.*?))(?:\s+|,\s*|$)/i))) {
            const name = match[1], value = match[2] || match[3]
            attr[name] = convertEscapes(value);
            text = text.substr(match[0].length);
        }
        if (text.length) {
            throw new TexError('BadAttributeList', 'Can\'t parse as attributes: %1', text);
        }
    }
    return attr;
}

/**
 *  The methods needed for the MathML token commands
 */
const TexFragmentsMethods = {

    /**
     * @param {TeXParser} parser   The TeX parser object
     * @param {string} name        The control sequence that is calling this function
     * @param {string} type        The MathML element type to be created
     */
    tex_fragments(parser, name, type) {
      
        let def = parseAttributes(parser.GetBrackets(name))

        /**
        *  if (type == 'texclass') {
        *    do nothing, def is already good
        *  }
        */

        if (type == 'texfragment') {
            def = {
              class: 'fragment fragment-mjx',
              'data-fragment-index': def.index
            }
        }

        if (type == 'texapply') {
            if (def.index) {
                def = {
                    class: `fragapply fragment fragment-mjx ${def.class}`,
                    'data-fragment-index': def.index
                }
            } else {
                def = {
                    class: `fragapply fragment fragment-mjx ${def.class}`
                }
            }
            
        }

        const math = parser.ParseArg(name)
        const node = parser.create('node', 'mrow', [math], def)
        parser.Push(node)
  
    }

};

/**
 *  The macro mapping of control sequence to function calls
 */
const TexFragmentsMap = new CommandMap('tex_fragments', {
    texclass: ['tex_fragments', 'texclass'],
    texfragment: ['tex_fragments', 'texfragment'],
    texapply: ['tex_fragments', 'texapply']
}, TexFragmentsMethods);


/**
 * The configuration used to enable the MathML macros
 */
const TexFragmentsConfiguration = Configuration.create(
  'tex_fragments', {handler: {macro: ['tex_fragments']}}
);
