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
 * This controller handles the interaction with the window used
 * to open a document. It provides methods to get the list of the saved
 * documents, to open a particular document and so on.
 */
Ext.define('LIME.controller.Storage', {
    extend : 'Ext.app.Controller',
    // set the references for this controller
    
    views: ['modal.newOpenfile.Main', 'modal.newSavefile.Main', 'modal.newSavefile.VersionSelector'],

    refs : [{
        selector: 'newOpenfileToolbarOpenButton',
        ref: 'newOpenfileToolbarOpenButton'
    }, {
        selector: 'newOpenfileToolbarCancelButton',
        ref: 'newOpenfileToolbarCancelButton'
    },{
        selector: 'newDocument',
        ref: 'newDocument'
    }],
   
    storageColumns: [{
        text: Locale.strings.folderLabel,
        fieldName: "folder",
        defaultValue: "my_documents",
        getValue: function() {
            return this.defaultValue;
        }
    },{
        text: Locale.strings.countryLabel,
        editor: {
            xtype: "nationalitySelector",
            selectOnFocus: true
        },
        fieldName: "nationality",
        getValue: function() {
            return ((DocProperties.frbr && DocProperties.frbr.work) ? DocProperties.frbr.work[this.fieldName] : false) 
                   || DocProperties.documentInfo["docLocale"];
        }
    }, {
        text: Locale.strings.docTypeLabel,
        editor: {
            xtype: "docTypeSelector",
            selectOnFocus: true
        },
        fieldName: 'docType',
        getValue: function() {
            return DocProperties.documentInfo[this.fieldName]; 
        }
    }, {
        text: Locale.strings.docProponent,
        fieldName: "docProponent",
        getValue: function(uri) {
            var docUri = (uri) ? uri.split("/") : [],
                value = (docUri.length && isNaN(new Date(docUri[3]).getYear())) ? docUri[3] : false;

            value = (value) ? value : Ext.emptyString.toString();
            return value;
        }
    }, {
        text: Locale.strings.docDateLabel,
        editor: {
            xtype: "datefield",
            allowBlank: false,
            selectOnFocus: true,
            format: 'Y-m-d'
        },
        fieldName: 'date',
        getValue: function(uri, meta) {
            var date;
            var dom = meta.originalMetadata.metaDom;
            var frbrDate = dom.querySelector(".FRBRWork .FRBRdate");

            if ( frbrDate ) {
                date = frbrDate.getAttribute('date');
            }

            if (!date) {
                return Ext.Date.format(new Date(), this.editor.format);
            }
            return date || "";
        }
    },{
        text: Locale.strings.docNumberLabel,
        fieldName: 'number',
        getValue: function(uri) {
            var docUri = (uri) ? uri.split("/") : [],
                value = (docUri.length) ? docUri[(docUri.length-3)] : false;
            value = (value) ? value : Ext.emptyString.toString();
            return value;
        }
    },{
        text: Locale.strings.versionLabel,
        width: 245,
        fieldName: 'version',
        editor: {
            xtype: "docVersionSelector",
            selectOnFocus: true
        },
        getValue: function(uri, meta) {
            var dom = meta.originalMetadata.metaDom;
            var frbrDate = dom.querySelector(".FRBRExpression .FRBRdate");
            var date = "";
            if ( frbrDate ) {
                date = frbrDate.getAttribute('date');
            }
            return DocProperties.documentInfo["docLang"]+"@"+date;
        }
    },{
        text: Locale.strings.fileLabel,
        fieldName: 'docName',
        defaultValue: 'new',
        getValue: function() {
            return this.defaultValue;
        }
    }],
    
    /**
     * Simply close the window
     * @param {Ext.Button} button The button that was clicked to close the document
     * this simply close the open file window and enables to open document button
     */
    newCloseWindow : function(button) {
        var me = this;
        var openFileWindow = button.up('window');
        openFileWindow.close();
    },
    /**
     * @param {Ext.Button} button The button that was clicked to open the document
     */
    newGetSelectedDocument : function(button) {
        var me = this,
            openFileWindow = button.up('window');
        // check if the user actually selected a document
        if (openFileWindow.selectedFile) {
            if (Ext.isFunction(openFileWindow.onOpen)) {
                openFileWindow.onOpen(openFileWindow.selectedFile.data);
                openFileWindow.close();
            } else {
                me.openDocument(openFileWindow.selectedFile.data.id, openFileWindow);    
            }
        }
    },

    /**
     * @param {Ext.Button} button The button that was clicked to open the document
     */
    getSelectedDocument : function(button) {
        // get the documents visible in the tree
        var me = this, 
            nodesSelected = button.up('modalOpenfileMain').down('modalOpenfileExplorer').getSelectionModel().selected.items;

        // check if the user actually selected a document
        if (nodesSelected.length > 0) {
            // get the selected document
            var node = nodesSelected[0];
            // Don't try to open a folder
            if (node.isLeaf()) {
                me.openDocument(node.data.id);
            }
        }
    },

    openDocumentNoEditor: function(path, callback) {
        var me = this;
        me.openDocument(path, null, callback);
    },

    /**
     * Request and load the document by using proper methods of the Editor controller.
     */
    openDocument : function(filePath, openWindow, openNoEffectCallback) {
        var me = this, 
            app = this.application, 
            LanguageController = this.getController('Language'),
            noOpeningEffects = Ext.isFunction(openNoEffectCallback);

        this.application.fireEvent(Statics.eventsNames.progressStart, null, {
            value : 0.1,
            text : Locale.strings.progressBar.openingDocument
        });

        // get the url for the request
        var params = {
            'requestedFile' : filePath,
            'userName' : localStorage.getItem('username'),
            'userPassword' : localStorage.getItem('password')
        }, requestMetaUrl = Utilities.getAjaxUrl(Ext.Object.merge(params, {
            'requestedService' : Statics.services.getFileMetadata
        }));

        Ext.Ajax.request({
            url : requestMetaUrl,
            async : false,
            success : function(response, opts) {
                var config = LanguageController.parseMetadata(response.responseXML, response.responseText, noOpeningEffects);
                if(!noOpeningEffects) {
                    DocProperties.clearMetadata(app);    
                }
                me.requestDoc(filePath, config, openWindow, openNoEffectCallback);
            },
            failure : function(response, opts) {
                Ext.Msg.alert('server-side failure with status code ' + response.status);
                me.requestDoc(filePath, null, openWindow);
            }
        });

    },
    
    requestDoc: function(filePath, config, openWindow, openNoEffectCallback) {
        config = config || {};
        var me = this, app = this.application, 
            prefManager = this.getController('PreferencesManager');

        var transformAndLoadDocument = function(text, transformFile, markingLang) {
            Server.applyXslt(text, transformFile, function(content) {
                var documentId = filePath,
                    idParts = filePath.split('/');

                // Avoid overwriting examples, TODO: warn the user that the example will not be overwritten (use save as)
                // The 4th part of the id represents the first-level collection in the user's directory
                if (idParts[4] && idParts[4].indexOf('examples') != -1) {
                    documentId = '';
                }
                
                config = Ext.Object.merge(config, {
                    docText : content,
                    docId : documentId,
                    originalDocId: filePath,
                    docMarkingLanguage : markingLang
                });

                if(Ext.isFunction(openNoEffectCallback)) {
                    Ext.callback(openNoEffectCallback, this, [config]);
                    app.fireEvent(Statics.eventsNames.progressEnd);
                } else {
                    // If the service is called with empty name the file will be saved in a temporary location
                    app.fireEvent(Statics.eventsNames.loadDocument, config);

                    // Set the last opened document into the user's preferences
                    prefManager.setUserPreferences({
                        lastOpened : documentId
                    });
                }
            }, Ext.emptyFn, {
                output: 'html', 
                markingLanguage: markingLang,
                includeFiles: Config.getLocaleXslPath(markingLang, config.docLocale)});
        };
        
        Server.getDocument(filePath, localStorage.getItem('username'), localStorage.getItem('password'), function(responseText) {
            var markingLang = me.detectMarkingLang(responseText) || config.docMarkingLanguage || Config.languages[0].name,
                transformFile = (markingLang) ? Config.getLanguageTransformationFile("languageToLIME", markingLang) : "";

            if (transformFile) {
                transformAndLoadDocument(responseText, transformFile, markingLang);
            } else {
                Config.setLanguage(markingLang, function() {
                    transformFile = Config.getLanguageTransformationFile("languageToLIME", markingLang);
                    transformAndLoadDocument(responseText, transformFile, markingLang);
                });
            }

            //Close the Open Document window
            if (openWindow) {
                openWindow.close();
            }

            }, function(response, opts) {
            app.fireEvent(Statics.eventsNames.progressEnd);
            Ext.Msg.alert('server-side failure with status code ' + response.status);
        });
    },

    detectMarkingLang: function(xmlString) {
        var name ;
        for(var i = 0; i < Config.languages.length; i++) {
            name = Config.languages[i].name;
            var config = Config.getLanguageConfig(name);
            if ( config && config.schemaRegex && xmlString.match(config.schemaRegex) ) {
                return name;
            }
        }
    },
    
    loadOpenFileListData: function(cmp, path, callback) {
        var store = cmp.getStore();
        if (store && (cmp.path || path)) {
            store.requestNode = path || cmp.path;
            store.load({
                scope: this,
                callback: function(records, operation, success) {
                    // Store after load may change data on the fly, so reconfigure the grid
                    cmp.reconfigure(store);
                    if (Ext.isFunction(callback)) {
                        callback(store, cmp);
                    }
                }
            });
        }
    },
    
    removeUselessListViews:function(listView, parentPanel) {
        var listIterator = listView;
        while(listIterator) {
            if (listIterator != listView) {
                parentPanel.remove(listIterator);               
            }
            listIterator = listView.nextNode("grid[addedDyn]");
        }
    },
    
    scrollToListView: function(listView, parentPanel) {
        listView.getEl().scrollIntoView(parentPanel.body, true, true);
    },
    
    setColumnText: function(listView, index) {
        var column = this.storageColumns[index];
        // Save the index in parent items, next it will be used
        listView.indexInParent = index;
        if (column) {
            listView.columns[0].setText(column.text);
        }
    },
    
    fileListViewClick: function(cmp, record, item, index, e, eOpts, storeCallback) {
        var data = record.getData(),
            path = data.id, nextList, 
            relatedWindow = cmp.up('window'),
            relatedButton = relatedWindow.down('button[dynamicDisable]'),
            parent = relatedWindow.down('listFilesPanel') || relatedWindow.down('panel'),  
            thisListView = cmp.up('grid') || cmp, thisListViewIndex, columnConfig = {};
        
        if(record.notSelectable) {
            return;
        }

        data.path = data.path.replace(/%3A/g, ':');

        if (record.data.leaf) {
            if(relatedButton) {
                relatedButton.enable();    
            }
            relatedWindow.selectedFile = record;
            relatedWindow.activeList = thisListView;
        } else {
            if(relatedButton) {
                relatedButton.disable();    
            }
            nextList = cmp.nextNode(thisListView.xtype);
            //TODO: call function for configuration
            if (!nextList) {
                if (Ext.isFunction(relatedWindow.onAddColumn)) {
                    columnConfig = relatedWindow.onAddColumn(this.storageColumns[thisListView.indexInParent + 1]);
                }
                columnConfig = Ext.merge(columnConfig, {
                        addedDyn: true,
                        indexInParent: thisListView.indexInParent + 1
                });
                nextList = parent.add(Ext.widget(thisListView.xtype, columnConfig));
                Ext.callback(relatedWindow.afterAddColumn, this, [nextList]);
            }
            this.removeUselessListViews(nextList, parent);
            
            Ext.each(parent.query(thisListView.xtype), function(element, index) {
                if (element == thisListView) {
                    thisListViewIndex = index;
                } else if((thisListViewIndex!=null) && (index > thisListViewIndex)) {
                    element.getSelectionModel().deselectAll(); 
                    element.getStore().removeAll();   
                } 
                if (element == nextList) {
                    this.setColumnText(nextList, index);
                    this.setContextualButton(relatedWindow, index);
                }
            }, this);
            nextList.userClick = (item) ? true : false;               
            this.loadOpenFileListData(nextList, path, function(store, cmp) {
                Ext.callback(storeCallback, false, [store, cmp]);
                Ext.callback(relatedWindow.onLoad, false, [store, cmp]);
            });
            this.scrollToListView(nextList, parent);
            relatedWindow.activeList = nextList;
        }
        if(!relatedWindow.avoidTitleUpdate) {
            this.updateTitle(relatedWindow, data.path);
        }
    },
    
    updateTitle: function(relatedWindow, pathToShow) {
        var regVersion = RegExp("(/([a-z]{3}))\\."), 
            matches = pathToShow.match(regVersion);
         if (matches) {
            pathToShow = pathToShow.replace(regVersion, "$1@");
        }
        relatedWindow.setTitle(relatedWindow.fullTitle.apply({
            title: relatedWindow.originalTitle,
            url: pathToShow
        }));
    },
    
    initFileWindow: function (cmp) {
        cmp.originalTitle = cmp.title;
        cmp.setTitle(cmp.fullTitle.apply({title: cmp.originalTitle}));
        
        // Setting the right columns name
        Ext.each(cmp.query('grid'), function(element, index) {
            this.setColumnText(element, index);
        }, this);
    },
    
    setContextualButton: function(cmp, index) {
        var button = cmp.down('newSavefileToolbarContextualButton');
        if (!button) return;
        button.originalText = (!button.originalText) ? button.text : button.originalText;
        button.setText(button.fullText.apply({
            operation: button.originalText,
            what: this.storageColumns[index].text
        }));
        if (index == (this.storageColumns.length-1)) {
            button.setIcon(button.fileIcon);
            button.isFile = true;
        } else {
            button.setIcon(button.folderIcon);
        }       
    },
    
    contextualButtonClick: function(cmp) {
        var relatedWindow = cmp.up('window'),
            listView = relatedWindow.activeList;
        if (!listView) {
            listView = relatedWindow.down('grid');
        }
       
        this.createRecord(listView, this.columnValues[listView.indexInParent], true);
    },
    
    prepareSaveDocument: function(cmp) {
        var relatedWindow = cmp.up('window'),
            listViews = relatedWindow.query('grid'),
            values = {}, frbrValues = {}, separator = "@", separatorPos, versionDate, versionLang,
            selectedItem = relatedWindow.activeList.getSelectionModel().getSelection()[0],
            regVersion = RegExp("(/([a-z]{3}))@");
        
        Ext.each(listViews, function(view, index) {
            var selectedItem = view.getSelectionModel().getSelection()[0],
                selectedData;
            if (selectedItem) {
                selectedData = selectedItem.getData();
                values[this.storageColumns[index].fieldName] = (selectedData.originalName) ? selectedData.originalName : selectedData.name;
            }
        }, this);
        
        separatorPos = values.version.indexOf(separator);
        if (separatorPos != -1) {
            versionDate = values.version.substring(separatorPos+1);
            versionLang = values.version.substring(0, separatorPos);
        } else {
            versionLang = values.version;
        }
        frbrValues.work = {
            nationality: values.nationality,
            docType: values.docType,
            date: values.date,
            docNumber: values.docNumber
        };
        frbrValues.expression = {
            date: versionDate,
            docLang: versionLang
        };
        
        frbrValues.manifestation = {
            docName: values.docName
        };
        
        DocProperties.setDocumentInfo({
            folder: values.folder
        });
        DocProperties.setFrbr(frbrValues);

        this.saveDocument({
            view : relatedWindow,
            path :  selectedItem.getData().path
        });
    },

    saveDocument: function(config) {
        var me = this, metadataDom,
            frbr = DocProperties.frbr,
            languageController = this.getController('Language');
        
        config.path = config.path || DocProperties.documentInfo.docId || Ext.emptyString;

        if (!config || !config.autosave) {
            partialUrl = config.path.substring(1);
            partialUrl = partialUrl.substring(partialUrl.indexOf('/'));
            metadataDom = languageController.buildMetadata(frbr, true, partialUrl);
        } else {
            // TODO: don't call this every autosave
            metadataDom = languageController.buildInternalMetadata(true);
        }

        // Before saving
        me.application.fireEvent(Statics.eventsNames.beforeSave, {
            editorDom: me.getController('Editor').getDom(),
            metadataDom: metadataDom,
            documentInfo: DocProperties.documentInfo
        });

        config.metaString = DomUtils.serializeToString(metadataDom) || Ext.emptyString;
        config.metadataDom = metadataDom;
        config.docName = (frbr.manifestation) ? frbr.manifestation.docName : "";

        me.application.fireEvent(Statics.eventsNames.translateRequest, function(xml) {
           xml = xml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
           me.saveDocumentText(xml, config);
        }, {complete: true});
    },

    /**
     * This is a wrapper for Language.saveDocument function
     */
    saveDocumentText: function(text, config) {
        var me = this,
            userInfo = this.getController('LoginManager').getUserInfo(),
            params = {
                userName : userInfo.username,
                fileContent : text,
                metadata: config.metaString
            };

        if ( !Ext.isEmpty(config.path) && Ext.isString(config.path) ) {
            config.path = config.path.replace(/:/g, '%3A');    
        }

        // Saving phase
        me.application.fireEvent(Statics.eventsNames.saveDocument, config.path, params, function(response, path) {
            var responseText = response.responseText;
            if(responseText[responseText.length-1] == "1") {
                responseText = responseText.substring(0, (responseText.length-1));
            }
            // If it's an autosave don't show anything
            if (!config || !config.autosave) {
               if ( config && config.view ) {
                   config.view.close();
               }

               Ext.Msg.alert({
                    title : Locale.strings.saveAs,
                    msg :  new Ext.Template(Locale.strings.savedToTpl).apply({
                        docName : config.docName,
                        docUrl : config.path.replace(config.docName, '')
                    })
                });
            }

            // After saving
            me.application.fireEvent(Statics.eventsNames.afterSave, {
                editorDom: me.getController('Editor').getDom(),
                metadataDom: config.metadataDom,
                documentInfo: DocProperties.documentInfo,
                saveData: Ext.decode(responseText, true)
            });
        });
    },
    
    fillInFields: function(cmp) {
        var columnDescriptor, value;
        this.columnValues = [];
        var editor = this.getController('Editor');
        var uri = editor.getDocumentUri();
        var meta = editor.getDocumentMetadata();

        for (var i = 0; i < this.storageColumns.length; i++) {
            value = Ext.emptyString.toString();
            columnDescriptor = this.storageColumns[i];
            if (Ext.isFunction(columnDescriptor.getValue)) {
                value = columnDescriptor.getValue(uri, meta);
            }
            value = value || Ext.emptyString.toString();
            this.columnValues.push(value);
        }
    },
    
    createRecord: function(cmp, name, editMode) {
        var record, me = this, store = cmp.getStore(),
            plugin = cmp.getPlugin('cellediting'),
            newRecordId = "new", prevList = cmp.previousNode('grid'),
            prevListSelected, path = "";
            
        plugin.newFieldRecordId = newRecordId; 
        
        if (prevList) {
            prevListSelected = prevList.getSelectionModel().getSelection()[0];
            if (prevListSelected) {
                path+=prevListSelected.get("path");
            }
        }
        store.loadData([{
            "id": newRecordId,
            "leaf": (cmp.indexInParent==(me.storageColumns.length-1)) ? "1" : "",
            "name": name,
            "path": path,
            "cls": newRecordId
         }], true);
         record = store.getById(newRecordId);
         if (!editMode) {
             cmp.fireEvent("recordChanged", cmp, record, true);
             // Since loadData doesn't fire a load event, call the saveListViewOnStoreLoad
             this.saveListViewOnStoreLoad(store, cmp);
         } else {
            Ext.defer(function() {
                plugin.startEdit(record, cmp.columns[0]);
            }, 50); 
         }
    },
    saveListViewOnStoreLoad: function(loadedStore, cmp) {
        var me = this, columnDescriptor = me.storageColumns[cmp.indexInParent],
            columnValue = me.columnValues[cmp.indexInParent], recordPos;
        if (columnValue) {
            recordPos = loadedStore.findBy(function(record, id) {
                return ((record.get("name") == columnValue) || (record.get("text") == columnValue));
            });
            if (recordPos != -1) {
                loadedStore.automatedFill = true;
                cmp.getView().select(recordPos);
                cmp.fireEvent("itemclick", cmp, loadedStore.getAt(recordPos));
            } else {
                this.createRecord(cmp, columnValue, (columnValue == columnDescriptor.defaultValue));
            }
        } else {
            this.createRecord(cmp, columnDescriptor.defaultValue, true);
        }
    },
    
    selectDocument: function(config) {
        var onLoad, afterAddColumn, notAllowedPaths, allowOnlyInPaths, path = config.path || "";

        notAllowedPaths = Ext.isArray(config.notAllowedPaths) ? 
                          config.notAllowedPaths : (config.notAllowedPaths) ? [config.notAllowedPaths] : [];
        allowOnlyInPaths = Ext.isArray(config.allowOnlyInPaths) ? 
                          config.allowOnlyInPaths : (config.allowOnlyInPaths) ? [config.allowOnlyInPaths] : [];

        if (allowOnlyInPaths.length || notAllowedPaths.length) {
            onLoad = function(store, cmp) {
                var view = cmp.getView(), recordsForbidden = store.queryBy(function(record, id) {
                    var allow = (allowOnlyInPaths.length) ? false : true, idLength = id.length;
                    for(var i = 0; i < allowOnlyInPaths.length; i++) {
                        var can = (allowOnlyInPaths[i].length > idLength) ? 
                                   (allowOnlyInPaths[i].indexOf(id) != -1) : (id.indexOf(allowOnlyInPaths[i]) != -1);
                        if(can) {
                            allow = true;
                            break;
                        }
                    }
                    return Ext.Array.contains(notAllowedPaths, id) || !allow;
                }), notAllowedRecords = store.queryBy(function(record, id) {
                    return Ext.Array.contains(notAllowedPaths, id);
                });
                recordsForbidden.each(function(record) {
                    view.addRowCls(record.index, 'forbidden-row');
                    record.notSelectable = true;
                });
                notAllowedRecords.each(function(record) {
                    var recordEl = cmp.getView().getEl().down("[data-recordindex="+record.index+"]"); 
                    view.addRowCls(record.index, 'forbidden-cell');
                    if(recordEl) {
                        Ext.callback(config.notAllowedPathRender, false, [recordEl, record]);
                    }
                    record.notSelectable = true;
                });
            };
            afterAddColumn = function(cmp) {
                cmp.addListener("beforeselect", function(selModel, record, index) {
                    return (record.notSelectable) ? false : true;
                });
            };
        }

        Ext.widget('newOpenfileMain', {
            pathToOpen : config.path,
            afterAddColumn : afterAddColumn,
            onLoad : onLoad,
            onOpen : Ext.bind(config.callback, config.scope)
        }).show();
    },
    
    openDocumentByUri: function(config) {
        var me = this,
            fullPath = DocProperties.documentInfo.originalDocId ||  DocProperties.documentInfo.docId, indexPath;
        if (fullPath && config.path) {
            indexPath = fullPath.indexOf(config.path);
            if(indexPath != -1) {
                config.path = fullPath.substr(0, indexPath+config.path.length);
            } else {
                indexPath = Utilities.globalIndexOf("/", fullPath);
                if(indexPath.length>4) {
                    config.path = fullPath.substr(0, indexPath[4]) + config.path; 
                }
            }
        }
        config.callback = function(document) {
            me.openDocument(document.id);
        };
        config.scope = me;
        me.selectDocument(config);
    },
    
    init : function() {
        // save a reference to the controller
        var me = this;
        me.application.on(Statics.eventsNames.selectDocument, this.selectDocument, this);
        me.application.on(Statics.eventsNames.openDocument, this.openDocumentByUri, this);
        // set up the control
        this.control({

            // the action that must be performed when the user clicks on the cancel button
            'newOpenfileToolbarCancelButton' : {
                // the function executed at the click on this button
                click : me.newCloseWindow
            },
            'newSavefileToolbarCancelButton' : {
                // the function executed at the click on this button
                click : me.newCloseWindow
            },
            // the action that must be performed when the user clicks on the open button
            'newOpenfileToolbarOpenButton' : {
                // this will be fired when the user clicks a file
                click : me.newGetSelectedDocument
            },

           'listFilesPanel openFileListView': {
               itemclick: this.fileListViewClick
           },
           'listFilesPanel': {
               activated: function(cmp) {
                   var me = this, listViews = cmp.query("openFileListView"),
                       relatedWindow = cmp.up("window"), path,
                       onStoreLoad = function(store, cmp) {
                           var recordIndex = store.findBy(function(record, id) {
                                   return (path.indexOf(id) != -1);
                               }), record, fullPath;
                           if(recordIndex != -1) {
                               record = store.getAt(recordIndex);
                               fullPath = record.get("id");
                               cmp.getView().select(recordIndex);
                               me.fileListViewClick(cmp, record, false, false, false, false, onStoreLoad);
                           }
                       };
                   if(relatedWindow && relatedWindow.pathToOpen) {
                       path = relatedWindow.pathToOpen || "";
                        me.loadOpenFileListData(listViews[0], false, function(store, cmp) {
                            Ext.callback(onStoreLoad, false, [store, cmp]);
                            Ext.callback(relatedWindow.onLoad, false, [store, cmp]);
                        }); 
                   } else {
                       Ext.each(listViews, function(listView) {
                           me.loadOpenFileListData(listView, false, relatedWindow.onLoad);
                       });
                   }
               }
           },
            'saveFileListView': {
                beforerender: function(cmp) {
                    var me = this, store = cmp.getStore(), column;
                    columnConfig = this.storageColumns[cmp.indexInParent],
                    this.loadOpenFileListData(cmp, false);
                    store.on("load", function(loadedStore) {
                        if (!cmp.userClick) {
                            me.saveListViewOnStoreLoad(loadedStore, cmp);    
                        }
                    }, this);
                    if (cmp.filter) {
                        var notExamples = new Ext.util.Filter({
                            filterFn: function(item) {
                                return (item.data.text.indexOf("examples") == -1);
                            }
                        });
                        store.addFilter(notExamples);
                    }
                    column = cmp.columns[0];
                    if (columnConfig && columnConfig.editor) {
                        column.editor = columnConfig.editor;
                    }

                    if ( columnConfig && columnConfig.width ) {
                        cmp.width = columnConfig.width;
                    }
                },
                itemclick: this.fileListViewClick,
                recordChanged: function(cmp, record, silent) {
                    var data = record.getData(),
                        path = data.path,
                        relPath = data.relPath;
                    if (relPath) {
                        path = path.substring(0, path.lastIndexOf('/'))+'/'+data.name;
                    } else {
                        path = path+'/'+data.name;
                    }
                    path = path.replace("//", "/");
                    record.beginEdit();
                    record.set('id', path);
                    record.set('path', path);
                    record.set('relPath', data.name);
                    record.endEdit();
                    if (!silent) {
                        this.updateTitle(cmp.up('window'), path);
                        cmp.fireEvent("itemclick", cmp, record, true);
                    }
                }
            },
            'newOpenfileMain': {
                beforerender: function(cmp) {
                    var openButton = cmp.down('newOpenfileToolbarOpenButton'),
                        listFiles = cmp.down('listFilesPanel');
                    openButton.dynamicDisable = true;
                    openButton.disable();
                    listFiles.fireEvent('activated', listFiles);
                    this.initFileWindow(cmp);
                }
            },
            'newSavefileMain': {
                beforerender: function(cmp) {
                    var saveButton = cmp.down('newSavefileToolbarOpenButton');
                    saveButton.dynamicDisable = true;
                    saveButton.disable();
                    this.initFileWindow(cmp);
                    this.setContextualButton(cmp, 0);
                    this.fillInFields(cmp);
                }
            },
            'newSavefileMain newSavefileToolbarContextualButton': {
                click: this.contextualButtonClick
            },
            'newSavefileMain newSavefileToolbarOpenButton': {
                click: this.prepareSaveDocument
            },
            'newDocument' : {
                close: function(cmp, option) {
                    if(!cmp.autoClosed) {
                        me.application.fireEvent(Statics.eventsNames.progressEnd);
                    }
                }
            }
        });
    }
}); 
