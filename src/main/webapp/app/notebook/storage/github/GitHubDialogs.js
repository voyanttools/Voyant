Ext.define("Voyant.notebook.github.GitHubDialogs", {
	extend: "Ext.Component",
	requires: ['Voyant.notebook.github.OctokitWrapper','Voyant.notebook.github.ReposBrowser','Voyant.notebook.github.FileSaver'],
	alias: "widget.githubdialogs",
	config: {
		repoType: 'owner',
		currentFile: undefined
	},

	octokitWrapper: undefined,

	currentWindow: undefined,

	parent: undefined,

	constructor: function(config) {
		config = config || {};
		this.parent = config.parent;
    	this.callParent(arguments);
    },

	initComponent: function() {
		this.callParent(arguments);
	},

	close: function() {
		if (this.currentWindow !== undefined) {
			this.currentWindow.close();
			this.currentWindow = undefined;
		}
	},

	showLoad: function() {
		const me = this;

		if (this.parent.isAuthenticated) {
			if (this.octokitWrapper === undefined) {
				this.initOctokitWrapper(this.parent.githubAuthToken);
			}
		} else {
			this.parent.showGitHubAuthentication(this.showLoad.bind(this));
			return;
		}

		let loadWin = undefined;
		loadWin = Ext.create('Ext.window.Window', {
			title: 'Load from GitHub',
			modal: true,
			width: 750,
			height: 550,
			closable: false,
			maximizable: true,
			layout: 'fit',
			items: {
				xtype: 'githubreposbrowser',
				octokit: this.octokitWrapper,
				itemId: 'repoBrowser',
				listeners: {
					nodeSelected: function(src, type, node) {
						if (type === 'file') {
							loadWin.queryById('load').setDisabled(false);
						} else {
							loadWin.queryById('load').setDisabled(true);	
						}
					},
					nodeDeselected: function(node) {
						loadWin.queryById('load').setDisabled(true);
					}
				}
			},
			buttons: [{
				text: 'Load Selected',
				itemId: 'load',
				disabled: true,
				handler: function() {
					const repoBrowser = loadWin.queryById('repoBrowser');
					this.loadFile(repoBrowser.getRepoId(), repoBrowser.getPath());
				},
				scope: this
			},{
				text: 'Cancel',
				handler: function() {
					me.close();
				}
			}]
		});
		loadWin.show();

		this.currentWindow = loadWin;
	},

	showSave: function(data) {
		const me = this;

		if (this.parent.isAuthenticated) {
			if (this.octokitWrapper === undefined) {
				this.initOctokitWrapper(this.parent.githubAuthToken);
			}
		} else {
			this.parent.showGitHubAuthentication(this.showSave.bind(this));
			return;
		}

		let saveWin = undefined;
		saveWin = Ext.create('Ext.window.Window', {
			title: 'Save to GitHub',
			modal: true,
			width: 750,
			height: 650,
			closable: false,
			maximizable: true,
			layout: 'fit',
			items: {
				xtype: 'githubfilesaver',
				octokit: this.octokitWrapper,
				currentFile: this.getCurrentFile(),
				saveData: data,
				itemId: 'fileSaver',
				listeners: {
					formValidityChange: function(src, valid) {
						saveWin.queryById('save').setDisabled(!valid);
					},
					fileSaved: function(src, fileData) {
						me.fireEvent('fileSaved', me, fileData);
					}
				}
			},
			buttons: [{
				text: 'Save',
				itemId: 'save',
				disabled: true,
				handler: function() {
					saveWin.queryById('fileSaver').doSave();
				},
				scope: this
			},{
				text: 'Cancel',
				handler: function() {
					me.close();
					me.fireEvent('saveCancelled', me);
				}
			}]
		});
		saveWin.show();

		this.currentWindow = saveWin;
	},

	initOctokitWrapper: function(authToken) {
		this.octokitWrapper = new Voyant.notebook.github.OctokitWrapper({
			authToken: authToken
		});
	},

	loadFileFromId: function(id) {
		const parts = decodeURIComponent(id).split('/');
		if (parts.length >= 3) {
			const repoId = parts[0]+'/'+parts[1];
			const filePath = parts.slice(2).join('/');
			this.loadFile(repoId, filePath);
		}
	},

	loadFile: function(repoId, filePath) {
		if (this.parent.isAuthenticated) {
			if (this.octokitWrapper === undefined) {
				this.initOctokitWrapper(this.parent.githubAuthToken);
			}
		} else {
			this.parent.showGitHubAuthentication(this.loadFile.bind(this));
			return;
		}

		this.octokitWrapper.loadFile(repoId, filePath).then((data) => {
			this.setCurrentFile(data);
			this.fireEvent('fileLoaded', this, data);
		});
	}
})
