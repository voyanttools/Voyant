/**
 * A class for simplying resource storage
 * @memberof Spyral.Util
 * @class
 */
class Storage {

	constructor(config) {
		this.MAX_LENGTH = 950000; // keep it under 1 megabyte
	}
	
	/**
	 * Store a resource
	 * @name Spyral.Util.Storage.storeResource
	 * @function
	 * @static
	 * @param {String} id 
	 * @param {*} data 
	 * @returns {Promise}
	 */
	static storeResource(id, data) {
		var dataString = JSON.stringify(data);
		
		if (dataString.length > this.MAX_LENGTH) {
			// split into chunks
			var promise = new Promise(function(resolve, reject) {
				var numChunks = Math.ceil(dataString.length / this.MAX_LENGTH);
			
				var chunkIds = [];
				for (var i = 0; i < numChunks; i++) {
					chunkIds.push(id+'-chunk'+i);
				}
				this._doStore(id+'-hasChunks', JSON.stringify(chunkIds)).then(function() {
					var chunkCount = 0;
					var currIndex = 0;
					for (var i = 0; i < numChunks; i++) {
						var chunkString = dataString.substr(currIndex, this.MAX_LENGTH);
						
						this._doStore(chunkIds[i], chunkString).then(function() {
							chunkCount++;
							if (chunkCount == numChunks) {
								resolve();
							}
						}, function() {
							reject();
						});
						
						currIndex += this.MAX_LENGTH;
					}
				}.bind(this), function() {
					reject();
				});
			}.bind(this));
			
			return promise;
		} else {
			return this._doStore(id, dataString);
		}
	}

	/**
	 * Get the URL for trombone
	 * @name Spyral.Util.Storage.getTromboneUrl
	 * @function
	 * @static
	 * @returns {String}
	 */
	static getTromboneUrl() {
		return Voyant.application.getTromboneUrl();
	}
	
	static _doStore(id, dataString) {
		return fetch(this.getTromboneUrl(), {
			method: 'GET',
			body: {
                tool: 'resource.StoredResource',
                resourceId: id,
                storeResource: dataString
            }
		});
	}
	
	/**
	 * Get a stored resource
	 * @name Spyral.Util.Storage.getStoredResource
	 * @function
	 * @static
	 * @param {String} id 
	 * @returns {Promise}
	 */
	static getStoredResource(id) {
		return fetch(this.getTromboneUrl(), {
			method: 'GET',
			body: {
                tool: 'resource.StoredResource',
                verifyResourceId: id+'-hasChunks'
            }
		}).then(function(response) {
			if (response.ok) {
				response.json().then(json => {
					if (json && json.storedResource && json.storedResource.id && json.storedResource.id !== '') {
						// chunks
						this._doGetStored(json.storedResource.id, false).then(function(chunkIds) {
							var fullData = '';
							var dataChunks = {};
							for (var i = 0; i < chunkIds.length; i++) {
								this._doGetStored(chunkIds[i], true).then(function(response) {
									var chunkId = response[0];
									var value = response[1];
									dataChunks[chunkId] = value;
									
									var done = true;
									for (var j = chunkIds.length-1; j >= 0; j--) {
										if (dataChunks[chunkIds[j]] === undefined) {
											done = false;
											break;
										}
									}
									
									if (done) {
										for (var j = 0; j < chunkIds.length; j++) {
											fullData += dataChunks[chunkIds[j]];
										}
										return fullData;
									}
								}, function(err) {
									throw Error('Storage: '+err)
								});
							}
						}, function(err) {
							throw Error('Storage: '+err)
						});
					} else {
						// no chunks
						return this._doGetStored(id, false).then(function(value) {
							return value
						}, function(err) {
							throw Error('Storage: '+err)
						});
					}
				});
			} else {

			}
		});
	}
	
	static _doGetStored(id, isChunk) {
		return fetch(this.getTromboneUrl(), {
			method: 'GET',
			body: {
                tool: 'resource.StoredResource',
                retrieveResourceId: id,
                failQuietly: true
            }
		}).then(function(response) {
			if (response.ok) {
				response.json().then(json => {
					var id = json.storedResource.id;
					var value = json.storedResource.resource;
					if (value.length == 0) {
						throw Error('Storage: stored file is empty')
					} else {
						if (isChunk !== true) {
							// value = JSON.parse(value);
							return value;
						} else {
							return [id, value];
						}
					}
				})
			}
		});
	}
}

export default Storage
