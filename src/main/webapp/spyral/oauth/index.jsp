<%@page import="java.util.Properties"%>
<%@page import="java.util.UUID"%>
<%
ServletConfig sconfig = getServletConfig();
Properties oauthprops = new Properties();
String propfile = sconfig.getInitParameter("oauthprops");
oauthprops.load(getClass().getClassLoader().getResourceAsStream(propfile));

String state = UUID.randomUUID().toString();
request.getSession().setAttribute("github_state", state);

String clientId = (String) oauthprops.get("githubClientId");
String oauthCallback = (String) oauthprops.get("githubOauthCallback");
String githubAuthURL = "https://github.com/login/oauth/authorize?client_id="+clientId+"&scope=repo&redirect_uri="+oauthCallback+"&state="+state;
response.sendRedirect(githubAuthURL);
%>
