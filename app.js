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


/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when upgrading.
*/

var WaweDebug = false;

// Extjs makes the assumption that both in development and in production all the files
// we'll be loading we'll load from the same path as the currently loaded page. For
// Indigo, that's a bad assumption. So the LIME_base_url variable gives us a way
// to change that.
if (typeof(LIME_base_url) == 'undefined') {
    var LIME_base_url = '';
}
var LIME_app = LIME_base_url + 'app';

Ext.Loader.setConfig({
    enabled : true,
    paths   : {
        'LIME' : LIME_app,
        'LIME.conf' : LIME_base_url + 'config',
        'Ext' : LIME_base_url + 'ext/src',
	'Ext.ux.layout.component.field.CodeMirror': LIME_base_url + 'plugins/ux/form/field/CodeMirror.js',
	'Ext.ux.form.field': LIME_base_url + 'plugins/ux/form/field',
	'Ext.ux.Iframe': LIME_base_url + 'plugins/ux/Iframe.js',
	'Ext.ux.DownloadManager': LIME_base_url + 'plugins/ux/DownloadManager.js',
	'Ext.ux.window.Notification': LIME_base_url + 'plugins/ux/window/Notification.js',
	'Ext.ux.TabCloseMenuImproved': LIME_base_url + 'plugins/ux/TabCloseMenuImproved.js',
	'Ext.ux.upload': LIME_base_url + 'plugins/ux/upload',
    }
});

Ext.syncRequire(['LIME.Global','LIME.Locale']);
Config.load();

Ext.require([
    'Ext.ux.window.Notification',
	'Ext.ux.Iframe',
	'Ext.ux.form.field.TinyMCE',
	'Ext.ux.form.field.TinyMCEWindowManager',
	'Ext.ux.form.field.CodeMirror',
	'Ext.ux.layout.component.field.CodeMirror',
	'LIME.Utilities',
	'LIME.Statics',
	'LIME.DocProperties',
    'LIME.DomUtils',
    'LIME.Server',
	'LIME.Interpreters',
	'LIME.XsltTransforms',
]);

Ext.application({
    name: 'LIME',
    appFolder: LIME_app,

    extend: 'LIME.Application',
});
