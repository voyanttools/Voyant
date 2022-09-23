Ext.define('Voyant.notebook.Authenticator', {
	mixins: ['Voyant.util.Localization','Voyant.notebook.util.NotebooksList'],
	statics: {
		i18n: {
			account: 'Account',
			signInWithGithub: 'Sign in with GitHub',
			signInWithGoogle: 'Sign in with Google',
			logout: 'Logout',
			yourNotebooks: 'Your Notebooks',
			authenticateWithGithub: 'Authenticate with GitHub',
			authorizeSpyralGithub: 'You must authorize Spyral to use GitHub on your behalf.',
			signInSuccess: 'Sign in successful!',
			close: 'Close',
			openSelected: 'Open Selected Notebook',
			deleteSelected: 'Delete Selected Notebook',
			notebookDeleted: 'Notebook deleted',
			errorDeletingNotebook: 'Error deleting notebook'
		}
	},

	accountInfo: undefined,

	getGitHubAuthButton: function(callback) {
		const me = this;
		return {
			xtype: 'button',
			glyph: 'xf09b@FontAwesome',
			text: me.localize('signInWithGithub'),
			margin: '5 15',
			handler: function(button) {
				function postMessageHandler(event) {
					if (event.origin === window.location.origin && event.data === 'oauth_cookie_set') {
						window.removeEventListener("message", postMessageHandler, false);
						event.source.close();
						me.retrieveAccountInfo().then(function(info) {
							callback.call(me, info);
						});
					} else {
						console.warn('Error authenticating with GitHub');
					}
				}
				window.open(Voyant.application.getBaseUrlFull()+'spyral/oauth', '_blank');
				window.addEventListener("message", postMessageHandler, false);
			}
		}
	},

	getGoogleAuthButton: function(callback) {
		google.accounts.id.initialize({
			client_id: "foobar",
			ux_mode: "redirect",
			login_uri: "http://localhost:8080/voyant/spyral/oauth/callback"
		});

		return {
			xtype: 'component',
			html: '<div id="signInWithGoogleButton"></div>',
			margin: 5,
			listeners: {
				afterrender: function() {
					google.accounts.id.renderButton(
						document.getElementById("signInWithGoogleButton"),
						{theme: "outline", size: "medium"}
					);
				}
			}
		}
	},

	showGitHubAuthentication: function(callback) {
		const me = this;

		Ext.create('Ext.window.Window', {
			title: me.localize('authenticateWithGithub'),
			width: 750,
			height: 550,
			closable: false,
			layout: {
				type: 'vbox',
				align: 'middle',
				pack: 'center'
			},
			items: [
				{html: '<div style="margin-bottom: 10px;">'+me.localize('authorizeSpyralGithub')+'</div>'},
				me.getGitHubAuthButton(callback)
			],
			buttons: [{
				text: 'Cancel',
				handler: function() {
					me.close();
				}
			}]
		}).show();
	},

	showAccountWindow: function() {
		const me = this;

		if (this.isAuthenticated()) {
			const idInfo = this.accountInfo.id.split('@');
			const id = idInfo[0];
			const idType = idInfo[1];

			const accountWin = Ext.create('Ext.window.Window', {
				title: me.localize('account'),
				width: 750,
				height: 550,
				modal: true,
				maximizable: true,
				closable: true,
				layout: {
					type: 'hbox',
					align: 'stretch',
					pack: 'center'
				},
				items: [{
					width: 200,
					layout: {
						type: 'vbox',
						align: 'middle',
						pack: 'start'
					},
					items: [{
						html:
`<div style="padding: 10px">
	<img src="${me.accountInfo.avatar}" width="100" height="100" style="display: block; margin-bottom: 5px" />
	<div style="margin-bottom: 5px">${me.accountInfo.name}</div>
	<div><i class="fa fa-${idType === 'gh' ? 'github' : 'google'}"></i> ${id}</div>
</div>`
					},{
						xtype: 'button',
						glyph: 'xf08b@FontAwesome',
						text: me.localize('logout'),
						handler: function(btn) {
							Ext.Ajax.request({url: me.getApplication().getBaseUrlFull()+'spyral/account/logout'});
							me.accountInfo = undefined;
							btn.up('window').close();
						}
					}]
				},{
					flex: 1,
					layout: {
						type: 'vbox',
						align: 'middle',
						pack: 'start'
					},
					items:[{
						html: '<h3>'+me.localize('yourNotebooks')+'</h3>'
					},{
						flex: 1,
						itemId: 'notebookslist',
						xtype: 'notebookslist',
						listeners: {
							itemdblclick: function(view, record, el) {
								const notebookId = record.get('id');
								me.fireEvent('notebookSelected', me, notebookId, function() {
									view.up('window').close()
								});
							}
						}
					}]
				}],
				buttons: [{
					text: me.localize('close'),
					ui: 'default-toolbar',
					handler: function(btn) {
						btn.up('window').close();
					}
				},{
					text: me.localize('deleteSelected'),
					ui: 'default-toolbar',
					glyph: 'xf1f8@FontAwesome',
					handler: function(btn) {
						const win = btn.up('window');
						const sel = win.down('#notebookslist').getSelection();
						if (sel[0]) {
							Ext.Msg.confirm('Delete', 'Are you sure you want to permanently delete the selected notebook?', function(button) {
								if (button === 'yes') {
									const notebookId = sel[0].get('id');
									me.deleteNotebook(notebookId).then(function() {
										win.down('#notebookslist').getStore().remove(sel[0]);
										me.toastInfo({
											html: me.localize('notebookDeleted'),
											anchor: 'tr'
										});
									}, function(err) {
										Ext.Msg.show({
											title: me.localize('errorDeletingNotebook'),
											msg: err,
											buttons: Ext.MessageBox.OK,
											icon: Ext.MessageBox.ERROR
										});
									});
								}
							}, me);
							
						}
					}
				},{
					text: me.localize('openSelected'),
					glyph: 'xf115@FontAwesome',
					handler: function(btn) {
						const win = btn.up('window');
						const sel = win.down('#notebookslist').getSelection();
						if (sel[0]) {
							const notebookId = sel[0].get('id');
							me.fireEvent('notebookSelected', me, notebookId, function() {
								win.close()
							});
						}
					}
				}]
			});
			accountWin.show();

			this.populateNotebookList(accountWin);
		}
	},

	retrieveAccountInfo: function() {
		const me = this;
		var dfd = new Ext.Deferred();

		Ext.Ajax.request({
			url: this.getApplication().getBaseUrlFull()+'spyral/account',
			success: function(resp) {
				if (resp.responseText === '') {
					dfd.resolve(undefined);
				} else {
					var info = JSON.parse(resp.responseText);
					me.accountInfo = info;
					dfd.resolve(info);
				}
			},
			failure: function() {
				dfd.reject();
			}
		});

		return dfd.promise;
	},

	isAuthenticated: function(refresh) {
		if (refresh) {
			return this.retrieveAccountInfo().then(function(info) {
				return info !== undefined;
			}, function() {
				return false;
			})
		}
		return this.accountInfo !== undefined;
	},

	populateNotebookList: function(accountWin) {
		accountWin.down('#notebookslist').mask('Loading');
		Spyral.Load.trombone({
			tool: 'notebook.NotebookFinder',
			query: 'facet.userId:'+this.accountInfo.id,
			noCache: 1
		}).then(function(json) {
			accountWin.down('#notebookslist').unmask();
			accountWin.down('#notebookslist').getStore().loadRawData(json.catalogue.notebooks);
			accountWin.down('#notebookslist').getStore().sort('modified', 'DESC');
		}).catch(function(err) {
			accountWin.unmask()
		});
	},

	deleteNotebook: function(notebookId) {
		const me = this;

		const dfd = new Ext.Deferred();

		Ext.Ajax.request({
			method: 'POST',
			url: Voyant.application.getBaseUrlFull()+'spyral/account/delete',
			params: {
				id: notebookId
			},
			success: function(resp) {
				const json = JSON.parse(resp.responseText);
				if (json.notebook.success) {
					me.fireEvent('fileDeleted', me, notebookId);
					dfd.resolve(true);
				} else {
					me.fireEvent('fileDeleted', me, null, json.notebook.error);
					dfd.reject(json.notebook.error);
				}
			},
			failure: function(resp) {
				me.fireEvent('fileDeleted', me, null, resp.responseText);
				dfd.reject(resp.responseText);
			}
		});

		return dfd.promise;
	},

	getCookie: function(cookieName) {
		const re = new RegExp('[; ]'+cookieName+'=([^\\s;]*)');
		const sMatch = (' '+document.cookie).match(re);
		if (cookieName && sMatch) return unescape(sMatch[1]);
		return '';
	},

	deleteCookie: function(cookieName, cookiePath) {
		cookiePath = cookiePath === undefined ? '/' : cookiePath;
		document.cookie = cookieName +'=; Path='+cookiePath+'; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
});
