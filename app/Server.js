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

// Wrapper around the server REST interface.
Ext.define('LIME.Server', {
    singleton: true,
    alternateClassName: 'Server',

    // Get document content.
    getDocument: function (path, username, password, success, failure) {
        var requestUrl = Utilities.getAjaxUrl({
            'requestedService': Statics.services.getFileContent,
            'requestedFile': path,
            'userName': username,
            'userPassword': password,
            'transformFile': "",
            'format': 'xml'
        });

        Ext.Ajax.request({
            url: requestUrl,
            success: function(response, opts) {
                success(response.responseText);
            },
            failure: failure || function(error) {
                Ext.log('Getting document failed' + error);
            }
        });
    },

    // Transform XML in content with the given xslt path
    applyXslt: function (content, xslt, success, failure, extraConfig) {
        Ext.Ajax.request({
            url: Utilities.getAjaxUrl(),
            method: 'POST',
            params: Ext.merge({
                requestedService: Statics.services.xsltTrasform,
                transformFile: xslt,
                input: content,
                output: '',
                markingLanguage: ''
            }, extraConfig),
            success: function(response) {
                success(response.responseText);
            },
            failure: failure || function(error) {
                Ext.log('XSLT conversion failed', xslt, error);
            }
        });
    },

    // Convert PDF and Doc files to html
    fileToHtml: function (path, success, failure) {
        Ext.Ajax.request({
            url: Utilities.getAjaxUrl(),
            method: 'POST',
            params: {
                requestedService: Statics.services.fileToHtml,
                fileExistPath: path
            },
            success: function(response) {
                    console.log(response)
                try {
                    var res = JSON.parse(response.responseText);
                    console.log(res)
                    if (res.html)
                        success(res.html, res.language);
                    else throw new Error();
                } catch (e) {
                    console.log(e);
                    if (failure) failure (response);
                    else Ext.log('Html conversion failed', path);
                }
            },
            failure: failure || function(error) {
                Ext.log('Html conversion failed', path, error);
            }
        });
    }
});
