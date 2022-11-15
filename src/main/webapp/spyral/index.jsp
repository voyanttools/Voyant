<% // we changed from spiral to spyral, so redirect if needed
if (request.getServletPath().equals("/spiral")) {
    response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
    StringBuffer url = request.getRequestURL();
    String query = request.getQueryString();
    if (query!=null) {url.append("?").append(query);}
	response.setHeader("Location", url.toString().replace("/spiral/","/spyral/"));
    return;
} %>

<% request.setAttribute("title", "Spyral"); %>
<%@ include file="../resources/jsp/html_head.jsp" %>

<style>
	.ace-chrome .ace_gutter {
		background-color: rgba(0,0,0,.025)!important;
	}
	.ace-chrome .ace_gutter-active-line {
		background-color: rgba(0,0,0,.05)!important;
	}
	
</style>
<!--script src="<%= base %>/resources/ace/1.4.12/src-min-noconflict/ext-language_tools.js"></script-->
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/spyral/css/spyral.css" />


<%@ include file="../resources/jsp/head_body.jsp" %>


<script src="<%= base %>/resources/octokitrest/octokit-rest-17.10.0.js"></script>

<script src="<%= base %>/resources/spyral/build/spyral.js"></script>

<script src="<%= base %>/resources/ckeditor/ckeditor4.19.1/ckeditor.js"></script>
<script>
// adapted from http://handsomedogstudio.com/ckeditor-set-default-target-blank
CKEDITOR.on('dialogDefinition', function(ev) {
    try {
		var dialogName = ev.data.name;
		var dialogDefinition = ev.data.definition;
		/* Make sure that the dialog opened is the link plugin ... otherwise do nothing */
		if(dialogName == 'link') {
	    /* Getting the contents of the Target tab */
	    	var informationTab = dialogDefinition.getContents('target');
		    /* Getting the contents of the dropdown field "Target" so we can set it */
		    var targetField = informationTab.get('linkTargetType');
		    /* Now that we have the field, we just set the default to _blank
			    A good modification would be to check the value of the URL field
	    		and if the field does not start with "mailto:" or a relative path,
			    then set the value to "_blank" */
    		targetField['default'] = '_blank';
		}
    } catch(exception) {
        alert('Error ' + ev.message);
    }
});
</script>

<!-- codemirror -->
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/codemirror/lib/codemirror.css" />
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/spyral/css/codemirror.css" />
<script src="<%= base %>/resources/codemirror/lib/codemirror.js"></script>
<script src="<%= base %>/resources/codemirror/mode/javascript/javascript.js"></script>
<script src="<%= base %>/resources/codemirror/mode/xml/xml.js"></script>
<script src="<%= base %>/resources/codemirror/addon/comment/comment.js"></script>
<script src="<%= base %>/resources/codemirror/addon/selection/active-line.js"></script>
<script src="<%= base %>/resources/codemirror/addon/selection/mark-selection.js"></script>
<script src="<%= base %>/resources/codemirror/addon/edit/closebrackets.js"></script>
<script src="<%= base %>/resources/codemirror/addon/edit/matchbrackets.js"></script>
<!-- codemirror autocomplete-->
<link rel="stylesheet" href="<%= base %>/resources/codemirror/addon/dialog/dialog.css">
<link rel="stylesheet" href="<%= base %>/resources/codemirror/addon/hint/show-hint.css">
<link rel="stylesheet" href="<%= base %>/resources/codemirror/addon/tern/tern.css">
<script src="<%= base %>/resources/codemirror/addon/dialog/dialog.js"></script>
<script src="<%= base %>/resources/codemirror/addon/hint/show-hint.js"></script>
<script src="<%= base %>/resources/codemirror/addon/tern/tern.js"></script>

<!-- google sign in-->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<script>
	Ext.Loader.setConfig({
		enabled : true,
		paths : {
			'Voyant' : '<%= base %>/app',
			'resources': '<%= base %>/resources'
		}
	});

	Ext.application({
		extend : 'Voyant.VoyantNotebookApp',
		name: 'VoyantNotebookApp',
		config: {
			baseUrl: '<%= base %>/',
			version: '<%= application.getInitParameter("version") %>',
			build: '<%= application.getInitParameter("build") %>',
			allowInput: '<%= System.getProperty("org.voyanttools.server.allowinput")==null ? "" : System.getProperty("org.voyanttools.server.allowinput") %>'
		}
	});
	
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

</body>
</html>
