Ext.define('Voyant.widget.DocumentSelector', {
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.documentselector',
	glyph: 'xf10c@FontAwesome',
	statics: {
		i18n: {
		}
	},

	config: {
		docs: undefined,
		corpus: undefined,
		singleSelect: false
	},
	
    initComponent: function() {

		var me = this;
		
		this.setSingleSelect(this.config.singleSelect == undefined ? this.getSingleSelect() : this.config.singleSelect);
		
		Ext.apply(me, {
			text: this.localize('documents'),
			menu: {
				width: 250,
				fbar: [{
					xtype: 'checkbox',
					hidden: this.getSingleSelect(),
					boxLabel: this.localize("all"),
					listeners: {
						change: {
							fn: function(item, checked) {
								this.getMenu().items.each(function(item) {
									item.setChecked(checked);
								});
							},
							scope: this
						}
					}
				},{xtype:'tbfill'},{
		    		xtype: 'button',
		    		text: this.localize('ok'),
					hidden: this.getSingleSelect(),
	    	    	scale: 'small',
		    		handler: function(button, e) {
		    			var docs = [];
		    			this.getMenu().items.each(function(item) {
		    				if (item.checked) {
			    				docs.push(item.docId);
		    				}
		    			}, this);
		    			
		    			// tell parent tool
						var panel = button.findParentBy(function(clz) {
							return clz.mixins["Voyant.panel.Panel"];
						});
						if (panel) {
			    			panel.fireEvent('documentsSelected', button, docs);
						}

		    			// hide the opened menu
		    			button.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true;
		    				}
		    				return false;
		    			});
		    		},
		    		scope: this
		    	},{
		    		xtype: 'button',
		    		text: this.localize('cancel'),
	    	    	scale: 'small',
		    		handler: function(b, e) {
		    			this.findParentBy(function(clz) {
		    				if (clz.isXType("button") && clz.hasVisibleMenu()) {
		    					clz.hideMenu();
		    					return true;
		    				}
		    				return false;
		    			}, this);
		    			this.hideMenu();
		    		},
		    		scope: this
		    	}]
			},
			listeners: {
				afterrender: function(selector) {
					selector.on("loadedCorpus", function(src, corpus) {
						this.setCorpus(corpus);
						if (corpus.getDocumentsCount()==1) {
							this.hide();
						} else {
							selector.populate(corpus.getDocumentsStore().getRange());
						}
					}, selector);
					var panel = selector.findParentBy(function(clz) {
						return clz.mixins["Voyant.panel.Panel"];
					});
					if (panel) {
						panel.on("loadedCorpus", function(src, corpus) {
							selector.fireEvent("loadedCorpus", src, corpus);
						}, selector);
						if (panel.getCorpus && panel.getCorpus()) {selector.fireEvent("loadedCorpus", selector, panel.getCorpus());}
						else if (panel.getStore && panel.getStore() && panel.getStore().getCorpus && panel.getStore().getCorpus()) {
							selector.fireEvent("loadedCorpus", selector, panel.getStore().getCorpus());
						}
					}
				}
			}
		});


    },
    
    populate: function(docs) {
    	this.setDocs(docs);
    	
		var checkedDocs = {docId: undefined, docIndex: undefined, match: false};
		var panel = this.findParentBy(function(clz) {
			return clz.mixins["Voyant.panel.Panel"];
		});
		if (panel && panel.getApiParam) {
			checkedDocs.docId = panel.getApiParam('docId');
			checkedDocs.docIndex = panel.getApiParam('docIndex');
			if (checkedDocs.docId !== undefined && typeof checkedDocs.docId === 'string') {
				checkedDocs.docId = checkedDocs.docId.split(',');
				checkedDocs.match = true;
			}
			if (checkedDocs.docIndex !== undefined && typeof checkedDocs.docIndex === 'string') {
				checkedDocs.docIndex = checkedDocs.docIndex.split(',').map(function(di) { return parseInt(di)});
				checkedDocs.match = true;
			}
		}

    	var menu = this.getMenu();
    	menu.removeAll();
    	
    	var isSingleSelect = this.getSingleSelect();
    	
    	var groupId = 'docGroup'+Ext.id();
    	docs.forEach(function(doc, index) {
			var checked = isSingleSelect && index == 0 || !isSingleSelect;
			if (checkedDocs.match) {
				checked = (checkedDocs.docId !== undefined && checkedDocs.docId.indexOf(doc.get('id')) !== -1) || (checkedDocs.docIndex !== undefined && checkedDocs.docIndex.indexOf(doc.get('index')) !== -1);
			}
    		menu.add({
    			xtype: 'menucheckitem',
    			text: doc.getShortTitle(),
    			docId: doc.get('id'),
    			checked: checked,
    			group: isSingleSelect ? groupId : undefined,
    			checkHandler: function(item, checked) {
    				if (this.getSingleSelect() && checked) {
    					var panel = this.findParentBy(function(clz) {
    						return clz.mixins["Voyant.panel.Panel"];
    					});
    					if (panel) {
	    					panel.fireEvent('documentSelected', this, doc);
    					}
    				}
    			},
    			scope: this
    		});
    	}, this);
    	
    }
});

Ext.define('Voyant.widget.DocumentSelectorButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.documentselectorbutton',
    mixins: ['Voyant.widget.DocumentSelector'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelector"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
    
Ext.define('Voyant.widget.DocumentSelectorMenuItem', {
    extend: 'Ext.menu.Item',
    alias: 'widget.documentselectormenuitem',
    mixins: ['Voyant.widget.DocumentSelector'],
    initComponent: function() {
    	this.mixins["Voyant.widget.DocumentSelector"].initComponent.apply(this, arguments);
		this.callParent();
    }
})
