package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.xml.transform.Source;
import javax.xml.transform.TransformerException;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.voyanttools.trombone.Controller;
import org.voyanttools.trombone.model.Corpus;
import org.voyanttools.trombone.model.CorpusAccess;
import org.voyanttools.trombone.results.ResultsOutputFormat;
import org.voyanttools.trombone.storage.Storage;
import org.voyanttools.trombone.storage.file.FileStorage;
import org.voyanttools.trombone.storage.memory.MemoryStorage;
import org.voyanttools.trombone.tool.corpus.CorpusManager;
import org.voyanttools.trombone.util.FlexibleParameters;

/**
 * @author Stéfan Sinclair, Cyril Briquet
 */
public class Trombone extends HttpServlet {

	private static final long serialVersionUID = 392155275393370320L;

	private final Set<String> hiddenParameters = new HashSet<String>();
	private Storage storage;

	private FlexibleParametersFactory flexibleParametersFactory;
	
	public Trombone() throws IOException {
		this.storage = null;
		String storage = System.getProperty("org.voyanttools.server.storage", "file-per-corpus").toLowerCase();
		if (storage.equals("memory")) {
			this.storage = new MemoryStorage();
		} else {
			FlexibleParameters parameters = new FlexibleParameters();
			parameters.setParameter("storage", storage);
			this.storage = new FileStorage(parameters);
		}
	}
	
	@Override
	public void init() {
		this.flexibleParametersFactory = new FlexibleParametersFactory(this.getServletContext());
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		
		doRequest(req, resp);
	
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {

		doRequest(req, resp);
	
	}
	
	private void doRequest(HttpServletRequest req, HttpServletResponse resp) throws IOException {

		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}
		if (resp == null) {
			throw new NullPointerException("illegal servlet response");
		}

		final FlexibleParameters parameters = getFlexibleParameters(req);
		
		if (parameters == null) {
			return;
		}
		
		// append accessIP in case it's needed
		parameters.setParameter("accessIP", req.getRemoteAddr());
	
		if (parameters.containsKey("corpus")) {
			
			String id = parameters.getParameterValue("corpus");
			
			// check for password, for now just setting the session value (error will be raised later if needed)
			if (parameters.containsKey("passwordForSession")) {
				String password = parameters.getParameterValue("passwordForSession");
				Corpus corpus = CorpusManager.getCorpus(storage, new FlexibleParameters(new String[]{"corpus="+id}));
				FlexibleParameters newParams = parameters.clone();
				newParams.setParameter("password", password);
				CorpusAccess corpusAccess = corpus.getValidatedCorpusAccess(newParams);
				if (corpusAccess==CorpusAccess.ADMIN || corpusAccess==CorpusAccess.ACCESS) {
					req.getSession().setAttribute("password-"+id, password);
				}
				resp.setContentType("text/plain");
				resp.getWriter().write(corpusAccess.name());
				return;
			}
			else if (parameters.containsKey("passwordForSessionRemove")) {
				HttpSession session = req.getSession();
				session.removeAttribute("password-"+id);
				return;
			}
			// see if we have a session-stored password
			else {
				HttpSession session = req.getSession();
				String password = (String) session.getAttribute("password-"+id);
				if (password!=null) {
					password = password.trim();
					if (password.isEmpty()==false) {
						parameters.setParameter("password", password);
					}
				}
			}
		}

		try {
			doRequest(parameters, req, resp);
			this.log(generateLogMessageForSuccessfulRequest(parameters, req));
		}
		catch (Exception e) {
			this.log("ERROR: "+e.getLocalizedMessage(), e);
			this.log(generateLogMessageForFailedRequest(parameters, this.hiddenParameters));
			resp.setStatus(500);
			try {
				final PrintWriter writer = resp.getWriter();
				String message = e.getMessage();
				if (message!=null && message.isEmpty()==false) {
					writer.write(e.getMessage()+"\n");
				}
				e.printStackTrace(writer);
			}
			catch (IOException ioe) {
				this.log("ERROR: Unable to write results", ioe);
			}
		}
		
	}

	private FlexibleParameters getFlexibleParameters(HttpServletRequest req) {

		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}

		try {
			return this.flexibleParametersFactory.getInstance(req);
		}
		catch (Exception e) {
			this.log("ERROR: Unable to create parameters", e);
			this.log(generateLogMessageForUnprocessableParameters(((Map<String, String[]>) req.getParameterMap()).entrySet(), this.hiddenParameters));
			return null;
		}
		
	}
	
	private void doRequest(FlexibleParameters parameters, HttpServletRequest req, HttpServletResponse resp) throws IOException, TransformerException {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}
		if (resp == null) {
			throw new NullPointerException("illegal servlet response");
		}

		if (System.getProperty("org.voyanttools.server.allowprivateip", "false").equals("false") && parameters.containsKey("uri")) {
			String[] uris = parameters.getParameterValues("uri");
			for (String uri : uris) {
				if (Trombone.isPrivateIP(uri)) {
					throw new NullPointerException("Private IPs are not allowed");
				}
			}
		}
		
		resp.setContentType(ResultsOutputFormat.getResultsOutputFormat(parameters.getParameterValue("outputFormat", "json")).getContentType());

		if (parameters.containsKey("fetchData")) {
			URL url;
			URLConnection c;
			try {
				url = new URL(parameters.getParameterValue("fetchData").replaceAll(" ", "+"));
				System.out.println(url);
				c = url.openConnection();
//				StringBuilder sb = new StringBuilder();
//				BufferedReader in = new BufferedReader(new InputStreamReader(c.getInputStream()));
//				String inputLine;
//				while ((inputLine = in.readLine()) != null) {
//					sb.append(inputLine);
//				}
//				in.close();
//				System.out.println(sb.toString());
			}
			catch (MalformedURLException e) {
				throw new IllegalArgumentException("Attempt to use a malformed URL: "+parameters.getParameterValue("fetchJSON"), e);
			}
			c.addRequestProperty("User-Agent", "Mozilla/4.0 (compatible; Trombone)");
			InputStream is = null;
			try {
				is = c.getInputStream();
				c.setReadTimeout(60000);
				resp.setContentType(c.getContentType());
//				if (parameters.containsKey("format")) {
//					String format = parameters.getParameterValue("format").toUpperCase();
//					if (format.equals("XML")) {
//						resp.setContentType("application/xml;charset=UTF-8");
//					} else if (format.equals("JSON")) {
//						resp.setContentType("application/json;charset=UTF-8");
//					}
//				}
				IOUtils.copy(is, resp.getWriter(), "UTF-8");
				resp.flushBuffer();
			}
			finally {
				if (is!=null) {
					is.close();
				}
			}
			
		}
		else if (parameters.containsKey("fetchJSON")) {
			URL url;
			URLConnection c;
			try {
				url = new URL(parameters.getParameterValue("fetchJSON").replaceAll(" ", "+"));
				System.out.println(url);
				c = url.openConnection();
				c.setReadTimeout(0);
			}
			catch (MalformedURLException e) {
				throw new IllegalArgumentException("Attempt to use a malformed URL: "+parameters.getParameterValue("fetchJSON"), e);
			}
			c.addRequestProperty("User-Agent", "Mozilla/4.0 (compatible; Trombone)");
//	        c.setReadTimeout(readTimeoutMilliseconds); 
//	        c.setConnectTimeout(connectTimeoutMilliseconds);
			InputStream is = null;
			try {
				is = c.getInputStream();
				//application/json
				resp.setContentType("application/json;charset=UTF-8");
				IOUtils.copy(is, resp.getWriter(), "UTF-8");
				resp.flushBuffer();
			}
			finally {
				if (is!=null) {
					is.close();
				}
			}
			
		}
		else if (parameters.containsKey("template")) {
			parameters.setParameter("outputFormat", "xml"); // we need xml for transformation
			final Writer xmlResultsWriter = new StringWriter();
			runTromboneController(parameters, xmlResultsWriter);

			Source xml = new StreamSource(new StringReader(xmlResultsWriter.toString()));
			Source xslt = XslTransformer.getTemplateSource(parameters.getParameterValue("template"), this.getServletConfig().getServletContext());

			FlexibleParameters xslParameters = new FlexibleParameters();
			xslParameters.setParameter("tromboneUrl", req.getRequestURL().toString());
			for (Map.Entry<String, String[]> param : ((Map<String, String[]>) req.getParameterMap()).entrySet()) {
				if (this.hiddenParameters.contains(param.getKey()) == true) { // skip hidden parameter
					continue;
				}
				xslParameters.setParameter(param.getKey(), param.getValue());
			}

			XslTransformer.transform(xslParameters, xml, xslt, resp.getWriter());
		}
		else if (parameters.getParameterValue("outputFormat", "").toUpperCase().equals("ZIP")) {
			resp.setHeader("Content-Disposition", "filename=" + parameters.getParameterValue("zipFilename", "VoyantCorpusDownload.zip"));
			OutputStream outputStream = resp.getOutputStream();
			final Controller controller = new Controller(storage, parameters);
			try {
				controller.run(outputStream);
			}
			catch (Exception e) {
				this.log("ERROR: "+e.getLocalizedMessage(), e);
				this.log(generateLogMessageForFailedRequest(parameters, this.hiddenParameters));
				resp.setStatus(500);
				resp.sendError(500, "Unable to produce ZIP file.\n"+e.getMessage());
			}
			outputStream.flush();
			outputStream.close();
		}
		else {
			// we set a permissive control to data to allow calls from elsewhere – this may need to be monitored
			resp.setHeader("Access-Control-Allow-Origin", "*");
			Writer writer = resp.getWriter();
			runTromboneController(parameters, resp.getWriter());
			writer.flush();
			writer.close();
		}
		
	}

	private void runTromboneController(FlexibleParameters parameters, Writer writer) throws IOException {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		if (writer == null) {
			throw new NullPointerException("illegal writer");
		}
		
		// intercept to see if we have a notebook in resources
		if (parameters.getParameterValue("tool", "").equals("notebook.NotebookManager") && parameters.getParameterValue("action", "").equals("load") && parameters.getParameterValue("id","").trim().isEmpty()==false) {
			File file = new File(getServletContext().getRealPath("/resources/spyral/notebooks"), parameters.getParameterValue("id")+".html");
			if (file.exists()) {
				String string = FileUtils.readFileToString(file, "UTF-8");
				parameters.setParameter("data", string);
				parameters.removeParameter("id"); // we can't overwrite this, so make sure to remove it
			}
		}
		final Controller controller = new Controller(storage, parameters, writer);
		controller.run();

	}
	
	private static String generateLogMessageForUnprocessableParameters(Set<Map.Entry<String, String[]>> rawParameters, Set<String> hiddenParameters) {

		if (rawParameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		
		if (rawParameters.isEmpty()) {
			return "(No parameters specified.)";
		}
		else {
			final StringBuilder sb = new StringBuilder("Parameters:\n");
			for (Map.Entry<String, String[]> param : rawParameters) {
				appendRequestParameter(sb.append("\t"), param.getKey(), param.getValue(), hiddenParameters);
			}
			return sb.toString();
		}
		
	}

	private static String generateLogMessageForSuccessfulRequest(FlexibleParameters parameters, HttpServletRequest req) {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}

		final StringBuilder sb = new StringBuilder("TOOL: ");
		if (parameters.containsKey("tool") == true) {
			final String[] tools = parameters.getParameterValues("tool");
			for (int i=0, len=tools.length ; i < len ; i++) {
				sb.append(tools[i]);
				if (i+1 < len) {
					sb.append(",");
				}
			}
		}
		else {
			sb.append("CorpusSummary");
		}
		
		if (parameters.containsKey("corpus")) {
			sb.append("; CORPUS: ").append(parameters.getParameterValue("corpus"));
		}
		
		final Calendar now = Calendar.getInstance();
		sb.append("; TIME: ").append(DateFormat.getInstance().format(now.getTime())).append(" (").append(now.getTimeInMillis()).append(")");
		sb.append("; REQUEST: ").append(req.getRemoteHost()).append(" (").append(req.getRemoteAddr()).append(")");
		
		return sb.toString();
		
	}

	private static String generateLogMessageForFailedRequest(FlexibleParameters parameters, Set<String> hiddenParameters) {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}

		final StringBuilder sb = new StringBuilder("Parameters:\n");
		
		for (String key : parameters.getKeys()) {
			appendRequestParameter(sb.append("\t"), key, parameters.getParameterValues(key), hiddenParameters);
		}
		
		return sb.toString();
	
	}

	private static void appendRequestParameter(StringBuilder sb, String key, String[] values, Set<String> hiddenParameters) {

		if (sb == null) {
			throw new NullPointerException("illegal StringBuilder");
		}
		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (values == null) {
			throw new NullPointerException("illegal values");
		}
		if (hiddenParameters == null) {
			throw new NullPointerException("illegal hidden parameters");
		}

		sb.append(key).append(": ");
		
		if (hiddenParameters.contains(key) == true) { // bail if we shouldn't show this
			sb.append(" (hidden)");
		}
		else if (values.length == 1) { // 1 key, 1 value
			sb.append(cleanParameterValue(values[0]));
		}
		else { // 1 key, multiple values
			sb.append("[");
			for (int i=0, len=values.length, mlen=values.length-1 ; i < len ; i++) {
				sb.append(cleanParameterValue(values[i]));
				if (i < mlen) {
					sb.append("; ");
				}
			}
			sb.append("]");
		}
		
		sb.append("\n");
		
	}
	
	private static String cleanParameterValue(String parameterValue) {
	
		if (parameterValue == null) {
			throw new NullPointerException("illegal value");
		}
		
		parameterValue = parameterValue.replaceAll("\\s+", " ");

		if (parameterValue.length() > 100) {
			parameterValue = parameterValue.substring(0, 100) + "…";
		}
		
		return parameterValue;
		
	}
	
	private static boolean isPrivateIP(String uri) throws MalformedURLException {
		InetAddress address;
		try {
			URL url = new URL(uri);
			String host = url.getHost();
			InetAddress ad = InetAddress.getByName(host);
			byte[] ip = ad.getAddress();
			address = InetAddress.getByAddress(ip);
		} catch (UnknownHostException e) {
			return true;
		}
		boolean isPrivate = address.isSiteLocalAddress() || address.isAnyLocalAddress() || address.isLinkLocalAddress() || address.isLoopbackAddress() || address.isMulticastAddress();
		return isPrivate;
	}
	
	public static boolean hasVoyantServerResource(String resource) {
		return Files.exists(getVoyantServerResourcePath(resource));
	}

	public static String getVoyantServerResource(String resource) throws IOException {
		return new String(Files.readAllBytes(getVoyantServerResourcePath(resource)), Charset.forName("UTF-8"));
	}
	
	private static Path getVoyantServerResourcePath(String resource) {
		// make file from resource to get filename only (avoid traversal vulnerability)
		return Paths.get(System.getProperty("java.io.tmpdir"), "voyant-server", new File(resource).getName());
	}
}
