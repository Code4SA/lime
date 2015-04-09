/*
 * Copyright (c) 2014 - Copyright holders CIRSFID and Department of
 * Computer Science and Engineering of the University of Bologna
 * 
 * Authors: 
 * Monica Palmirani – CIRSFID of the University of Bologna
 * Fabio Vitali – Department of Computer Science and Engineering of the University of Bologna
 * Luca Cervone – CIRSFID of the University of Bologna
 * 
 * Permission is hereby granted to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The Software can be used by anyone for purposes without commercial gain,
 * including scientific, individual, and charity purposes. If it is used
 * for purposes having commercial gains, an agreement with the copyright
 * holders is required. The above copyright notice and this permission
 * notice shall be included in all copies or substantial portions of the
 * Software.
 * 
 * Except as contained in this notice, the name(s) of the above copyright
 * holders and authors shall not be used in advertising or otherwise to
 * promote the sale, use or other dealings in this Software without prior
 * written authorization.
 * 
 * The end-user documentation included with the redistribution, if any,
 * must include the following acknowledgment: "This product includes
 * software developed by University of Bologna (CIRSFID and Department of
 * Computer Science and Engineering) and its authors (Monica Palmirani, 
 * Fabio Vitali, Luca Cervone)", in the same place and form as other
 * third-party acknowledgments. Alternatively, this acknowledgment may
 * appear in the software itself, in the same form and location as other
 * such third-party acknowledgments.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * This class provides an interface for running XSLT Transforms either
 * in the browser on on the server if the browser doesn't support it.
 */
Ext.define('LIME.XsltTransforms', {
    /* Since this is merely a utility class define it as a singleton (static members by default) */
    singleton : true,
    alternateClassName : 'XsltTransforms', 

    config: {
        local: true,
        transforms: {},
    },

    /**
     * Transform +source+ using the transform described in +params+
     * and call +success+ on success or +failure+ on failure. This may be
     * asynchronous.
     *
     * Params supports:
     *
     *   transformFile: the URL of the XSLT file
     */
    transform: function(input, xsltfile, params, success, failure) {
        if (this.useLocalTransforms()) {
            this.transformLocally(input, xsltfile, params, success, failure);
        } else {
            this.transformRemotely(input, xsltfile, params, success, failure);
        }
    },

    /** Should we use local transforms? **/
    useLocalTransforms: function() {
        return this.getLocal() && this.supportsLocal();
    },

    /** Are local transforms supported? **/
    supportsLocal: function() {
        return typeof("XSLTProcessor") != "undefined";
    },

    loadTransform: function(url, success, failure) {
        var self = this;

        if (!this.transforms[url]) {
            Ext.Ajax.request({
                url: url,
                success: function(response) {
                    var xslt = self.transforms[url] = new XSLTProcessor();
                    xslt.importStylesheet(Utilities.parseXml(response.responseText));
                    success(xslt);
                },
                failure: failure
            });
        } else {
            success(this.transforms[url]);
        }
    },

    transformLocally: function(input, xsltfile, params, success, failure) {
        if (typeof(input) == "string") {
            input = Ext.DomHelper.createDom({
                tag : 'div',
                html : input.replace(/\xa0/g, ' '),   // ignore &nbsp; chars
            }).firstChild;
        }

        this.loadTransform(xsltfile, function(xslt) {
            var output = xslt.transformToDocument(input);
            success(output);
        }, failure);
    },

    transformRemotely: function(input, xslt, params, success, failure) {
        Server.applyXslt(input, xslt, function(xml) {
            // parse XML
            success(Utilities.parseXml(result.responseText));
        }, failure, params);
    }
});
