<% request.setAttribute("title", "Voyant Tools for Datawalls"); %>
<%@ include file="../resources/jsp/html_head.jsp" %>
<%@ include file="../resources/jsp/head_body.jsp" %>

<script>
    Ext.Loader.setConfig({
        enabled : true,
        paths : {
            'Voyant' : '../app',
            'resources': '../resources'
        }
    });
    
    Ext.application({
        extend : 'Voyant.VoyantCorpusApp',
        name: 'VoyantDataWallApp',
        config: {
			baseUrl: '<%= org.voyanttools.voyant.Voyant.getBaseUrlString(request) %>',
            version: '<%= application.getInitParameter("version") %>',
            build: '<%= application.getInitParameter("build") %>',
			refreshTime: 250,
			lastEvent: {
				timestamp: -1
			},
			mockupEvent: {}
        },
        
        launch: function() {
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: [{xtype: 'customset'}]
            });
            this.callParent(arguments);

			Ext.interval(this.mockupGenerateEvent, this.getRefreshTime()*10, this);

			Ext.interval(this.fetchEvent, this.getRefreshTime(), this);
        },

		mockupGenerateEvent: function() {
			var getRandomFromArray = function(array) {
				return array[Math.floor(Math.random()*array.length)]
			}

			var eventTypes = ['query', 'query', 'query', 'query', 'query', 'query', 'query', 'loadedCorpus']
			var queryValues = [['man'], ['woman'], ['child'], ['man', 'woman'], ['man', 'woman', 'child'], ['man', 'child'], ['woman', 'child']];
			var corpusValues = ['austen', 'shakespeare'];
			// var corpusValues = ['ca663b264f8a9d2c0eb8654180ae8e45', 'e0283d424d38601c5e915b51b9689d7d'];

			var eventType = getRandomFromArray(eventTypes);
			var eventValue = eventType === 'query' ? getRandomFromArray(queryValues) : getRandomFromArray(corpusValues);

			this.setMockupEvent({
				timestamp: Math.floor(new Date().getTime() / 1000),
				event: {
					name: eventType,
					value: eventValue
				}
			})
		},

		mockupGetEventFromRemote: function() {
			var dfd = new Ext.Deferred();
			dfd.resolve(this.getMockupEvent());
			return dfd;
		},

		fetchEvent: function() {
			var me = this;
			var previousTime = this.getLastEvent().timestamp;
			this.mockupGetEventFromRemote().then(function(response) {
				try {
					if (response.timestamp && response.timestamp > previousTime) {
						var event = response.event;
						if (event && event.name && event.value) {
							console.log('new event',event.name);
							if (event.name === 'loadedCorpus') {
								new Voyant.data.model.Corpus(event.value).then(function(corpus) {
									me.setLastEvent({
										timestamp: response.timestamp,
										event: event
									})
									me.dispatchEvent(event.name, me, corpus);
								}).otherwise(function(err) {
									console.log('error loading corpus:',err);
								})
							} else {
								me.setLastEvent({
									timestamp: response.timestamp,
									event: event
								})
								me.dispatchEvent(event.name, me, event.value);
							}
							
						}
					} else {
						// console.log('no new event');
					}
				} catch (e) {
					console.log('error getting event:',e);
				}
			}, function(error) {
				console.warn('error getting event: ',error);
			});
		}
    });
</script>

</body>
</html>