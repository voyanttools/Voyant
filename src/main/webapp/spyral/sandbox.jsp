<%@ page contentType="text/html;charset=UTF-8" %><%
StringBuilder url = new StringBuilder();
url.append(request.getContextPath());
String base = url.toString();
%>
<!DOCTYPE html>
<html>
	<head>
		<title>Spyral Sandbox</title>
		
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
						document.body.innerHTML = result.value;
						result.height = document.body.offsetHeight;
						event.source.postMessage(result, event.origin);
					} catch (err) {
						event.source.postMessage({
							type: 'error',
							value: 'exception: '+err.message
						}, event.origin);
					}
				}

				// if (event.origin === document.location.origin) {
					var result = {
						type: 'result',
						value: undefined,
					};
					try {
						result.value = eval(event.data);
					} catch (err) {
						result.type = 'error';
						result.value = 'exception: '+err.message;
					}
					if (result.type !== 'error' && result.value !== undefined) {
						if (result.value.then && result.value.catch && result.value.finally) {
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
					} else {
						updateBody(result);
					}
				// } else {
				// 	console.warn('message from unknown origin', event.origin);
				// }
			});
		</script>
	</head>
	<body>
	</body>
</html>