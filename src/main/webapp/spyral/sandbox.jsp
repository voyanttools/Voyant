<%@ page contentType="text/html;charset=UTF-8" %><%
StringBuilder url = new StringBuilder();
url.append(request.getContextPath());
String base = url.toString();
%>
<!DOCTYPE html>
<html>
	<head>
		<title>Spyral Sandbox</title>
		
		<style type="text/css">	
body {
	font-family: helvetica, arial, verdana, sans-serif;
	font-size: 13px;
	margin: 0;
	padding: 0;
}
body .error {
	color: red;
}
body pre {
	font-size: smaller;
}	
body .info {
}
		</style>

		<link rel="stylesheet" type="text/css" href="<%= base %>/resources/highcharts/8/highcharts.css" />
		<!-- highcharts -->	
		<script type="text/javascript" src="<%=base %>/resources/highcharts/8/highcharts.js"></script>
		<!-- <script type="text/javascript" src="<%=base %>/resources/highcharts/8/highcharts-more.js"></script> -->
		<script type="text/javascript" src="<%=base %>/resources/highcharts/8/modules/data.js"></script>
		<script type="text/javascript" src="<%=base %>/resources/highcharts/8/modules/networkgraph.js"></script>

		<script type="text/javascript" src="<%= base %>/resources/spyral/build/spyral.js"></script>
		<script>
			<% // there's a very weird thing where reloading a secure page sometimes causes the insecure page to be requested, so let's rely on the browser for scheme %>
			Spyral.Load.setBaseUrl(document.location.protocol+'//<%
			
			StringBuilder fullurl = new StringBuilder();
			fullurl/*.append(request.getScheme()).append("://")*/.append(request.getServerName());
			int serverPort = request.getServerPort();
			if (serverPort != 80 && serverPort != 443) {
				fullurl.append(":").append(serverPort);
			}
			fullurl.append(request.getContextPath());
			
			String fullbase = fullurl.toString();
			%><%= fullbase %>/');



			window.Corpus = Spyral.Corpus;
			window.Table = Spyral.Table;

			window.loadCorpus = function() {
				return Spyral.Corpus.load.apply(Spyral.Corpus.load, arguments)
			}

			window.createTable = function() {
				return Spyral.Table.create.apply(Spyral.Table, arguments)
			}
			
			window.addEventListener('message', function(event) {
				var updateBody = function(result) {
					try {
						if (result.value !== undefined) {
							document.body.innerHTML = result.value;
						}
						setTimeout(function() {
							result.height = document.firstElementChild.offsetHeight;
							result.output = document.body.outerHTML;
							event.source.postMessage(result, event.origin);
						}, 25);
					} catch (err) {
						event.source.postMessage({
							type: 'error',
							value: 'exception: '+err.message
						}, event.origin);
					}
				}

				var runCode = function(codeArray) {
					if (codeArray.length > 0) {
						var code = codeArray.shift();
						var result = {
							type: 'result',
							value: undefined,
						};
						try {
							console.log('running:',code);
							result.value = eval(code);
						} catch (err) {
							result.type = 'error';
							result.value = 'exception: '+err.message;
						}

						if (result.type === 'error') {
							updateBody(result);
						} else {
							if (result.value && result.value.then && result.value.catch && result.value.finally) {
								var me = this;
								result.value.then(function(prResult) {
									result.value = prResult;
									if (codeArray.length === 0) {
										updateBody(result);
									} else {
										setTimeout(function() {
											runCode(codeArray);
										}, 100);
									}
								}).catch(function(err) {
									result.type = 'error';
									result.value = err.message;
									updateBody(result);
								})
							} else {
								if (codeArray.length === 0) {
									updateBody(result);
								} else {
									setTimeout(function() {
										runCode(codeArray);
									}, 100);
								}
							}
						}
					}
				}

				var result = {
					type: 'result',
					value: undefined,
				};
				try {
					var messageObj = JSON.parse(event.data);
					if (messageObj.type === 'code') {
						runCode(messageObj.value);
					} else {
						if (messageObj.type === 'command') {
							result.type = 'command';
							switch (messageObj.command) {
								case 'update':
									document.body.innerHTML = messageObj.value;
									break;
								case 'clear':
									document.body.innerHTML = '';
									break;
								case 'init':
									break;
							}
							result.value = messageObj.command;
							result.height = document.firstElementChild.offsetHeight;
						}
					}
				} catch (err) {
					result.type = 'error';
					result.value = 'exception: '+err.message;
				}

				switch (result.type) {
					case 'result':
						if (result.value && result.value.then && result.value.catch && result.value.finally) {
							var me = this;
							result.value.then(function(prResult) {
								result.value = prResult;
							}).catch(function(err) {
								result.type = 'error';
								result.value = err.message;
							}).finally(function() {
								updateBody(result);
							})
						} else {
							updateBody(result);
						}
						break;
					case 'error':
						updateBody(result);
						break;
					case 'command':
						event.source.postMessage(result, event.origin);
						break;
				}
			});
		</script>
	</head>
	<body>
	</body>
</html>