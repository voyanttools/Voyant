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
	margin: 6px;
	padding: 0;
}
body .error {
	color: #C23241;
}
body pre {
	font-size: smaller;
}

table.spyral-table {
	border: thin solid #ccc;
}
table.spyral-table th {
	background-color: rgba(255, 255, 0, .05);
}
table.spyral-table td, table.spyral-table th {
	border-right: thin solid #eee; border-bottom: thin solid #eee;
}
table.spyral-table td:last-child {
	border-right: none; border-bottom: none;
}
		</style>

		<link rel="stylesheet" type="text/css" href="<%= base %>/resources/highcharts/8/highcharts.css" />
		<!-- highcharts -->	
		<script type="text/javascript" src="<%=base %>/resources/highcharts/8/highcharts.js"></script>
		<!-- <script type="text/javascript" src="<%=base %>/resources/highcharts/8/highcharts-more.js"></script> -->
		<script type="text/javascript" src="<%=base %>/resources/highcharts/8/modules/data.js"></script>
		<script type="text/javascript" src="<%=base %>/resources/highcharts/8/modules/networkgraph.js"></script>

		<script type="text/javascript" src="<%=base %>/resources/esprima/esprima.min.js"></script>

		<link rel="stylesheet" type="text/css" href="<%= base %>/resources/spyral/css/json-viewer.css" />

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
		</script>
		<script type="text/javascript" src="<%= base %>/resources/spyral/sandbox.js"></script>
	</head>
	<body>
	</body>
</html>