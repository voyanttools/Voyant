<% String voyant_js_id = "bf2c4ba9740c64164df8d1cc80277211"; %>
<%
String base_js = (String) request.getAttribute("base");
String lang_js = (String) request.getAttribute("lang");
String rtl_js = (String) request.getAttribute("rtl");
%>

<!-- EXTJS CLASSIC -->
<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/ext-all<%= rtl_js %>.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/charts.js"></script>

<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/theme-crisp/theme-crisp.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/ux.js"></script>

<!-- jQuery -->
<script type="text/javascript" src="<%= base_js %>/resources/jquery/jquery.min.js"></script>

<%
String showServerMessage = System.getProperty("org.voyanttools.server.showservermessage");
if (showServerMessage != null && showServerMessage.equals("true")) {
%>
<!-- showdown -->
<script type="text/javascript" src="<%= base_js %>/resources/showdown/showdown.min.js"></script>

<!-- purify -->
<script type="text/javascript" src="<%= base_js %>/resources/purify/purify.min.js"></script>
<% } %>

<!-- D3 -->
<script type="text/javascript" src="<%= base_js %>/resources/d3/current/d3.min.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/d3/fisheye.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/d3/d3-scale-chromatic.min.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/cirrus/html5/d3.layout.cloud.js"></script>

<!-- spectrum -->
<script type="text/javascript" src="<%=base_js %>/resources/spectrum/spectrum.js"></script>

<!-- spyral -->
<script type="text/javascript" src="<%= base_js %>/resources/spyral/build/spyral.js"></script>

<script type="text/javascript" src="<%= base_js %>/resources/voyant/current/voyant.<%= voyant_js_id %>.min.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/voyant/current/voyant-locale-<%= lang_js %>.js"></script>
