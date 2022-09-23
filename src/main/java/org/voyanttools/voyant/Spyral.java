package org.voyanttools.voyant;

import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.IOUtils;
import org.voyanttools.trombone.util.FlexibleParameters;
import org.voyanttools.voyant.Voyant.PostedInputRequestWrapper;
import org.voyanttools.voyant.Voyant.PostedInputResponseWrapper;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class Spyral extends HttpServlet {

	private static final long serialVersionUID = 1048044723303994604L;
	
	private static enum AuthProvider { GitHub, Google };

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		doRequest(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		doRequest(req, resp);
	}

	private void doRequest(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		String path = req.getServletPath();
		if (path.endsWith("spyral/oauth/callback")) {
			AuthProvider provider = getAuthProvider(req);
			switch (provider) {
				case GitHub:
					doGitHubAuth(req, resp);
					break;
				case Google:
					doGoogleAuth(req, resp);
					break;
				default:
					throw new IOException("Unrecognized auth provider");
			}
		} else if (path.endsWith("spyral/account")) {
			resp.setContentType("application/json;charset=UTF-8");
			Writer writer = resp.getWriter();
			String accountInfo = getSpyralAccountInfo(req);
			writer.append(accountInfo);
			writer.flush();
			writer.close();
			resp.flushBuffer();
		} else if (path.endsWith("spyral/account/logout")) {
			clearAccountInfo(req);
			resp.flushBuffer();
		} else if (path.endsWith("spyral/account/save") || path.endsWith("spyral/account/delete")) {

			final FlexibleParametersFactory flexibleParametersFactory = new FlexibleParametersFactory(req.getSession().getServletContext());
			FlexibleParameters params;
			try {
				params = flexibleParametersFactory.getInstance(req);
			} catch (Exception e) {
				e.printStackTrace();
				throw new ServletException("Error getting parameters from request.");
			}
			
			// add spyral-id from session so it's available in GitNotebookManager
			HttpSession session = req.getSession(false);
			if (session != null) {
				Object spyralIdObj = session.getAttribute("spyral-id");
				if (spyralIdObj != null) {
					params.setParameter("spyral-id", (String) spyralIdObj);
				}
			}
			
			Properties oauthprops = new Properties();
			String propfile = this.getInitParameter("oauthprops");
			oauthprops.load(getClass().getClassLoader().getResourceAsStream(propfile));
			params.setParameter("key", oauthprops.getProperty("localKey"));
			
			String action = "save";
			if (path.endsWith("delete")) {
				action = "delete";
			}
			
			params.setParameter("action", action);
			
			params.setParameter("noCache", 1);
			
			PostedInputResponseWrapper postedInputResponseWrapper = new PostedInputResponseWrapper(resp);
			req.getRequestDispatcher("/trombone").include(new PostedInputRequestWrapper(req, params, "notebook.GitNotebookManager"), postedInputResponseWrapper);
			
			resp.setContentType("application/json;charset=UTF-8");
			Writer writer = resp.getWriter();
			writer.append(postedInputResponseWrapper.toString());
			writer.flush();
			writer.close();
			resp.flushBuffer();
		}
	}
	
	private void doGitHubAuth(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		String state = req.getParameter("state");
		String github_state = (String) req.getSession().getAttribute("github_state");
		
		if (state.equals(github_state)) {
//			req.getSession().removeAttribute("github_state");
			
			Properties oauthprops = new Properties();
			String propfile = this.getInitParameter("oauthprops");
			oauthprops.load(getClass().getClassLoader().getResourceAsStream(propfile));
			
			String clientId = (String) oauthprops.get("githubClientId");
			String clientSecret = (String) oauthprops.get("githubClientSecret");
			String oauthCallbackRedirect = (String) oauthprops.get("githubOauthCallbackRedirect");
			
			String code = req.getParameter("code");
			
			URLConnection tokenConnection = new URL("https://github.com/login/oauth/access_token?code="+code+"&client_id="+clientId+"&client_secret="+clientSecret).openConnection();
			tokenConnection.setDoOutput(true);
			tokenConnection.setRequestProperty("Accept-Charset", StandardCharsets.UTF_8.name());
			
			String accessToken = null;
			InputStream is = null;
			try {
				is = tokenConnection.getInputStream();
				String respString = IOUtils.toString(is, StandardCharsets.UTF_8.name());
				Pattern pattern = Pattern.compile("(access_token=)(\\w+)");
				Matcher matcher = pattern.matcher(respString);
				if (matcher.find()) {
					accessToken = matcher.group(2);
				} else {
					throw new IOException("Error finding access token.");
				}
			} finally {
				if (is != null) {
					is.close();
				}
			}
			
			URLConnection infoConnection = new URL("https://api.github.com/user").openConnection();
			infoConnection.setDoInput(true);
			infoConnection.setDoOutput(true);
			infoConnection.setRequestProperty("Authorization", "token "+accessToken);
			
			InputStream is2 = null;
			try {
				is2 = infoConnection.getInputStream();
				String respString = IOUtils.toString(is2, StandardCharsets.UTF_8.name());
				JsonParser parser = new JsonParser();
				try {
					JsonElement respJson = parser.parse(respString).getAsJsonObject();
					JsonObject jsonObj = respJson.getAsJsonObject();
					String login = jsonObj.get("login").getAsString();
					String name;
					JsonElement nameElement = jsonObj.get("name");
					if (nameElement.isJsonNull()) {
						name = login;
					} else {
						name = nameElement.getAsString();
					}
					String avatarUrl = jsonObj.get("avatar_url").getAsString();
					
					setSpyralAccountInfo(req, login+"@gh", name, avatarUrl);
				} catch (Exception e) {
					throw new IOException("Unexpected JSON response.");
				}
				
				resp.sendRedirect(oauthCallbackRedirect);
			} finally {
				if (is2 != null) {
					is2.close();
				}
			}
		} else {
			// potential cross-site request forgery
			throw new IOException("Invalid state parameter");
		}
	}
	
	private void doGoogleAuth(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		String idTokenString = req.getParameter("credential");
		
		Properties oauthprops = new Properties();
		String propfile = this.getInitParameter("oauthprops");
		oauthprops.load(getClass().getClassLoader().getResourceAsStream(propfile));
		
		String googleClientId = (String) oauthprops.get("googleClientId");
		String oauthCallbackRedirect = (String) oauthprops.get("googleOauthCallbackRedirect");
		
		GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory()).setAudience(Collections.singletonList(googleClientId)).build();
		
		GoogleIdToken idToken;
		try {
			idToken = verifier.verify(idTokenString);
		} catch (GeneralSecurityException e) {
			e.printStackTrace();
			throw new IOException("Error while verifying ID token.");
		}
		if (idToken != null) {
			Payload payload = idToken.getPayload();
//			String userId = payload.getSubject();
			String email = payload.getEmail();
			String userId = email.substring(0, email.indexOf("@"));
			String name = (String) payload.get("name");
			String pictureUrl = (String) payload.get("picture");
			
			setSpyralAccountInfo(req, userId+"@gg", name, pictureUrl);
			
			resp.sendRedirect(oauthCallbackRedirect);
		} else {
			throw new IOException("Invalid ID token.");
		}
	}
	
	private String getSpyralAccountInfo(HttpServletRequest req) {
		String id = (String) req.getSession().getAttribute("spyral-id");
		if (id == null) {
			return "";
		}
		String name = (String) req.getSession().getAttribute("spyral-name");
		String avatar = (String) req.getSession().getAttribute("spyral-avatar");
		return "{\"id\":\""+id+"\",\"name\":\""+name+"\",\"avatar\":\""+avatar+"\"}";
	}
	
	private void setSpyralAccountInfo(HttpServletRequest req, String id, String name, String avatar) {
		req.getSession().setAttribute("spyral-id", id);
		req.getSession().setAttribute("spyral-name", name);
		req.getSession().setAttribute("spyral-avatar", avatar);
	}
	
	private void clearAccountInfo(HttpServletRequest req) {
		req.getSession().removeAttribute("spyral-id");
		req.getSession().removeAttribute("spyral-name");
		req.getSession().removeAttribute("spyral-avatar");
	}
	
	private AuthProvider getAuthProvider(HttpServletRequest req) {
		Map<String, String[]> paramMap = req.getParameterMap();
		if (paramMap.containsKey("state") && paramMap.containsKey("code")) {
			return AuthProvider.GitHub;
		} else if (paramMap.containsKey("credential")) {
			return AuthProvider.Google;
		} else {
			return null;
		}
	}

}