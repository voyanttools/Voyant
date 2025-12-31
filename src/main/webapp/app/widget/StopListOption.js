Ext.define('Voyant.widget.StopListOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.stoplistoption',
    layout: 'hbox',
    statics: {
    		stoplists: {
    		    ar: "stop.ar.txt",
    			bg: "stop.bu.txt",
    			br: "stop.br.txt",
    			ca: "stop.ca.txt",
    			ckb: "stop.ku.txt",
    			cn: "stop.zh.txt",
    			cz: "stop.cz.txt",
    			de: "stop.de.txt",
    			el: "stop.el.txt",
    			en: "stop.en.txt",
    			es: "stop.es.txt",
    			eu: "stop.eu.txt",
    			fa: "stop.fa.txt",
    			fr: "stop.fr.txt",
    			ga: "stop.ga.txt",
    			gl: "stop.gl.txt",
    			grc: "stop.grc.txt",
				he: "stop.he.txt",
    			hi: "stop.hi.txt",
    			hu: "stop.hu.txt",
    			hy: "stop.hy.txt",
    			id: "stop.id.txt",
    			it: "stop.it.txt",
    			ja: "stop.ja.txt",
    			la: "stop.la.txt",
    			lv: "stop.lv.txt",
    			lt: "stop.lt.txt",
    			mu: "stop.multi.txt",
    			nl: "stop.nl.txt",
    			no: "stop.no.txt",
    			pt: "stop.pt.txt",
    			ro: "stop.ro.txt",
    			ru: "stop.ru.txt",
    			se: "stop.sv.txt",
    			th: "stop.th.txt",
    			tr: "stop.tr.txt",
				uk: "stop.uk.txt"
    		},
	    	i18n: {
	    		
	    	}
    },
    initComponent: function(config) {
    	var me = this;
    	var value = this.up('window').panel.getApiParam('stopList');
    	var data = [];
    	for (id in Voyant.widget.StopListOption.stoplists) {
    		data.push({name: this.localize(id), value: Voyant.widget.StopListOption.stoplists[id]})
    	}
    	data.sort(function(a,b) { // sort by label
    		return a.name < b.name ? -1 : 1;
    	})
    	data.splice(0, 0, {name : this.localize('auto'),   value: 'auto'}, {name : this.localize('none'),   value: ''},  {name : this.localize('new'),   value: 'new'})
    	Ext.apply(me, {
	    		items: [{
	    	        xtype: 'combo',
	    	        queryMode: 'local',
	    	        value: value,
	    	        triggerAction: 'all',
	    	        editable: true,
	    	        fieldLabel: this.localize('label'),
	    	        labelAlign: 'right',
	    	        name: 'stopList',
	    	        displayField: 'name',
	    	        valueField: 'value',
	    	        store: {
	    	            fields: ['name', 'value'],
	    	            data: data
	    	        }
	    		}, {width: 10}, {xtype: 'tbspacer'}, {
	    			xtype: 'button',
	    			text: this.localize('editList'),
		            ui: 'default-toolbar',
	    			handler: this.editList,
	    			scope: this
	    		}, {width: 10}, {
	    			xtype: 'checkbox',
	    			name: 'stopListGlobal',
	    			checked: true,
	    			boxLabel: this.localize('applyGlobally')
	    		}]
    	})
        me.callParent(arguments);
    },
    
    editList: function() {
    	var win = this.up('window');
    	var panel = win.panel;
    	var value = this.down('combo').getValue();
    	var corpusId = panel.getApplication && panel.getApplication().getCorpus ? panel.getApplication().getCorpus().getId() : undefined;
    	if (value=='auto' && !corpusId) {
    		Ext.Msg.show({
			    title: this.localize('noEditAutoTitle'),
			    message: this.localize('noEditAutoMessage'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
    		return
    	}
    	Ext.Ajax.request({
    	    url: panel.getTromboneUrl(),
    	    params: {
        		tool: 'resource.KeywordsManager',
    			stopList: value,
    			corpus: corpusId
    	    },
    	    success: function(response){
    	    	var json = Ext.util.JSON.decode(response.responseText);
    	    	var keywords = json.keywords.keywords.sort().join("\n");
    			Ext.Msg.show({
	    		    title: this.localize('editStopListTitle'),
	    		    message: this.localize('editStopListMessage'),
	    		    buttons: Ext.Msg.OKCANCEL,
	    		    buttonText: {
	    		        ok: this.localize('ok'),
	    		        cancel: this.localize('cancel')
	    		    },
	    		    icon: Ext.Msg.INFO,
	    		    prompt: true,
	    	        multiline: true,
	    	        value: keywords,
	    	        original: keywords,
	    	        fn: function(btn,value,stoplist) {
	    	        	// force lowercase for simple stopword list since it's lexical (this may change if the widget is used elsewhere)	    	        	value = value.toLowerCase();
	    	        	value = value.toLowerCase();
	    	        	if (btn=='ok' && stoplist.original!=value) {
	    	        		var combo = this.down('combo')
	    	        		if (Ext.String.trim(value).length==0) {
	    	        			combo.setValue('empty');
	    	        		}
	    	        		else {
	    	        	    	Ext.Ajax.request({
	    	        	    	    url: panel.getTromboneUrl(),
	    	        	    	    params: {
	    	        	        		tool: 'resource.StoredResource',
	    	        	    			storeResource: value,
	    	        	    			corpus: corpusId
	    	        	    	    },
	    	        	    	    combo: combo,
	    	        	    	    success: function(response, req) {
	    	        	    	    	var json = Ext.util.JSON.decode(response.responseText);
	    	        	    	    	var store = req.combo.getStore();
	    	        	    	    	var value = 'keywords-'+json.storedResource.id;
	    	        	    	    	store.add({name: value, value: value});
	    	        	    	    	req.combo.setValue(value)
	    	        	    	    	req.combo.updateLayout()
	    	        	    	    },
	    	        	    	    scope: this
	    	        	    	})
	    	        		}
	    	        	}
	    	        },
	    	        scope: this
    			})
    	    },
    	    scope: this
    	});
    }
})