<%@ page contentType="text/html;charset=UTF-8" %>
<% 
	StringBuilder url = new StringBuilder();
	url.append(request.getContextPath());
	String base = url.toString();
%>

<html>
<head>
<link rel="stylesheet" type="text/css" href="<%= base %>/resources/fontawesome/4.4.0/font-awesome-all.css" />
<script src="<%= base %>/resources/jquery/current/jquery.min.js"></script>
<style>
	body {
		font-family: HelveticaNeue, helvetica, arial, clean, sans-serif;
		font-size: 13px;
	}
	ul {
		padding-left: 8px;
	}
	li ul {
		padding-left: 16px;
		padding-top: 8px;
	}
	li {
		margin-bottom: 8px;
		list-style-type: none;
	}
	.server {
		margin-bottom: 16px;
	}
	.server > a {
		font-weight: 600;
	}
	a:link, a:visited {
		color: #157fcc
	}
	.health.fa-smile-o {color: green;}
	.health.fa-meh-o {color: yellow;}
	.health.fa-frown-o {color: red;}
</style>
<script>

var Voyant = Voyant || {};
Voyant.Mirrors = {
	local: '<%= base %>/resources/docs/servers.json',
	remote: 'https://raw.githubusercontent.com/voyanttools/Voyant/master/src/main/webapp/resources/docs/servers.json',
	buildMirrorsList: function(url) {
		// for remote URL we use Trombone to fetch JSON to avoid any cross-domain issues
		$.getJSON(url==Voyant.Mirrors.local ? url : "<%= base %>/trombone", {
			fetchJSON: url
		})
		.done(function( data ) {
			Voyant.Mirrors.generateMirrorsList(data)
		})
		.fail(function(data) {
			if (url!=Voyant.Mirrors.local) {
				Voyant.Mirrors.buildMirrorsList(Voyant.Mirrors.local);
			}
		})
	},
	generateMirrorsList: function(data, el) {
		var list = "<ul>";
		for (var i=0, len=data.servers.length; i<len; i++) {
			var server = data.servers[i];
			list+="<li class='server' id='server"+i+"'>"+
				"<a href='"+server.url+"' target='_blank'>"+server.name+"</a>"+
				"<ul>"+
				"<li class='health'>Status: </li>"+
				"<li>Location: "+server.location+"</li>"+
				"<li>Contact: "+server.contact+"</li>"+
				"</ul>"+
				"</li>";
			Voyant.Mirrors.checkHealth("server"+i, server.check_url ? server.check_url : server.url, server.check_corpus ? server.check_corpus: "austen")
		}
		list+="</ul>";
		document.body.innerHTML = list;
	},
	checkHealth: function(id, url, corpus) {
		// we query something that tests the general health because it needs to consider all terms, assumes Austen is on all servers, which may not be the case
		$.getJSON("<%= base %>/trombone", {
			fetchJSON: url+"trombone?corpus="+corpus+"&tool=corpus.CorpusTerms&limit=1&withDistributions=true&noCache=1"
		})
		.done(function( data ) {
			var version;
			if (data.voyantVersion) {
				version = "(version "+data.voyantVersion;
				if (data.voyantBuild) {
					version += " "+data.voyantBuild
				}
				version+=")";
			}
			var health = "frown";
			if (data && data.duration) {
				if (data.duration<1000) {
					health = "smile"
				} else if (data.duration<2000) {
					health = "meh"
				}
			}
			Voyant.Mirrors.setHealth(id, health, version);
		})
		.fail(function() {
			Voyant.Mirrors.setHealth(id, "frown");
		})
	},
	setHealth: function(id, health, version) {
		$("#"+id+" .health").append('<i class="health fa fa-'+health+'-o" aria-hidden="true"></i> '+(version ? version+' ' : ''))
	}
}
$(function() {
	Voyant.Mirrors.buildMirrorsList(Voyant.Mirrors.remote); // try remote first
});
</script>
</head>
<body></body>
</html>

