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
     * and call +callbacks+ on success or failure. This may be asynchronous.
     *
     * Params supports:
     *
     *   transformFile: the URL of the XSLT file
     *   serialize: should the result be serialized to text, or should
     *              the transformed document element be returned?
     *              Default: true
     */
    transform: function(input, params, callbacks) {
        params = Ext.merge({
            serialize: true,
        }, params);

        if (this.useLocalTransforms()) {
            this.transformLocally(input, params, callbacks);
        } else {
            this.transformRemotely(input, params, callbacks);
        }
    },

    /** Should we use local transforms? **/
    useLocalTransforms: function() {
        return this.getLocal() && this.supportsLocal();
    },

    /** Are local transforms supported? **/
    supportsLocal: function() {
        return typeof("XSLTProcessor") != "undefined" && typeof("XMLSerializer") != "undefined";
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

    transformLocally: function(input, params, callbacks) {
        this.loadTransform(params.transformFile, function(xslt) {
            var root = Ext.DomHelper.createDom({
                tag : 'div',
                html : input.replace(/\xa0/g, ' '),   // ignore &nbsp; chars
            }); 

            var output = xslt.transformToFragment(root.firstChild, document);
            if (params.serialize) {
                output = new XMLSerializer().serializeToString(output);
            }
            callbacks.success(output);
        }, callbacks.failure);
    },

    transformRemotely: function(input, params, callbacks) {
        Ext.merge(params, {
            requestedService : Statics.services.xsltTrasform,
            input : input,
        });

        Ext.Ajax.request({
            // the url of the web service
            url : Utilities.getAjaxUrl(),
            method : 'POST',
            // send the content in XML format
            params : params,
            scope : this,
            // if the translation was performed
            success : function(result, request) {
                var xml = result.responseText;

                // de-serialize?
                if (!params.serialize) {
                    xml = Utilities.parseXml(xml);
                }

                callbacks.success(xml);
            },
            failure : callbacks.failure
        });
    }
});
