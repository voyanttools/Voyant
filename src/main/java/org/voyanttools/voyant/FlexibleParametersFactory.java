package org.voyanttools.voyant;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload2.core.DiskFileItem;
import org.apache.commons.fileupload2.core.FileUploadException;
import org.apache.commons.fileupload2.core.DiskFileItemFactory;
import org.apache.commons.fileupload2.jakarta.servlet6.JakartaServletFileUpload;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;

import org.voyanttools.trombone.input.source.InputSourcesBuilder;
import org.voyanttools.trombone.util.FlexibleParameters;

/**
 * This is a utility class for instantiating {@link FlexibleParameters} from {@link HttpServletRequest}s.
 * @author Stéfan Sinclair, Cyril Briquet
 */
public class FlexibleParametersFactory {
	
	private String build;
	private String version;

	public FlexibleParametersFactory(ServletContext servlet) {
		this.build = servlet.getInitParameter("build");
		this.version = servlet.getInitParameter("version");
	}

	/**
	 * Get an instance of {@link FlexibleParameters} from the {@link HttpServletRequest}.
	 * 
	 * <p>This method handles simple forms as wells as multipart forms with file uploads.</p>
	 * @param request
	 * @return {@link FlexibleParameters} instance
	 * @throws Exception
	 */
	public FlexibleParameters getInstance(HttpServletRequest request) throws Exception {

		return getInstance(request, false);
	
	}
	
	/**
	 * Get an instance of {@link FlexibleParameters} from the {@link HttpServletRequest}.
	 * 
	 * <p>This method handles simple forms as wells as multipart forms with file uploads.</p>
	 * @param request
	 * @return {@link FlexibleParameters} instance
	 * @throws Exception
	 */
	public FlexibleParameters getInstance(HttpServletRequest request, boolean allowLocalFileSystemAccess) throws Exception {

		if (request == null) {
			throw new NullPointerException("illegal request");
		}
		
		final FlexibleParameters parameters = new FlexibleParameters();
		parameters.setParameter("VOYANT_VERSION", version!=null ? version : "");
		parameters.setParameter("VOYANT_BUILD", build!=null ? build : "");
		parameters.setParameter("VOYANT_REMOTE_ID", request.getHeader("X-FORWARDED-FOR")!=null ? request.getHeader("X-FORWARDED-FOR") : request.getRemoteAddr());

		final HttpParametersDecoder parametersDecoder = new HttpParametersDecoder(parameters);
		
		if (JakartaServletFileUpload.isMultipartContent(request) && !(request instanceof Voyant.PostedInputRequestWrapper)) {
			final List<DiskFileItem> items = getRequestItems(request);
			String tmpDir = System.getProperty("java.io.tmpdir");
			Path tmpPath = Paths.get(tmpDir, "tmp.voyant.uploads");
			if (!Files.exists(tmpPath)) {
				Files.createDirectory(tmpPath);
			}
			
			for (DiskFileItem item : items) {
				if (item.isFormField()) { // normal form field
					parametersDecoder.decodeParameter(item.getFieldName(), item.getString(StandardCharsets.UTF_8), allowLocalFileSystemAccess);
				}
				else { // file form field: this is uploaded, therefore the local access check can be bypassed
					Path path = Files.createTempDirectory(tmpPath, "tmp.voyant.uploads");
					String rawName = item.getName();
					String safeName = Paths.get(rawName).getFileName().toString();
					Path fileTarget = path.resolve(safeName).normalize();
					if (!fileTarget.startsWith(path)) {
						throw new SecurityException("Illegal path traversal");
					}

					item.write(fileTarget);
					parametersDecoder.decodeParameter("upload", fileTarget.toString(), true);
				}
			}
		}
		else {
			if (request.getMethod().equals("GET")) {
				// I couldn't for the life of me convince a GET request to use the specified character encoding (tried req.setCharacterEncoding() etc.)
				// so we'll not use the simpler request.getParameterMap() and instead parse the query string ourselves
				String queryString = request.getQueryString();
				if (queryString!=null) {
					List<NameValuePair> pairs = URLEncodedUtils.parse(request.getQueryString(), Charset.forName("UTF-8"));
					for (NameValuePair pair : pairs) {
						if (pair.getName().equals("_dc")==false) { // ignore the EXTJS param for GET requests
							parametersDecoder.decodeParameters(pair.getName(), new String[]{pair.getValue()}, allowLocalFileSystemAccess);
						}
					}
				}
			}
			else {
				for (Map.Entry<String, String[]> param : ((Map<String, String[]>) request.getParameterMap()).entrySet()) {
					parametersDecoder.decodeParameters(param.getKey(), param.getValue(), allowLocalFileSystemAccess || (request instanceof Voyant.PostedInputRequestWrapper && param.getKey().equals("upload")));
				}		
			}
		}
		
		// check to see if this instance allows new input
		if (System.getProperty("org.voyanttools.server.allowinput", "true").equals("false") && InputSourcesBuilder.hasParameterSources(parameters)) {
			throw new IllegalArgumentException("This server has been configured to refuse new input.");
		}
		
		if (System.getProperty("org.voyanttools.server.allowdownload", "true").equals("false") && parameters.getParameterValue("tool", "").contains("corpus.CorpusExporter")) {
			throw new IllegalArgumentException("This server has been configured to refuse corpus downloads.");
		}
		
		return parameters;
	
	}
	
	private static List<DiskFileItem> getRequestItems(HttpServletRequest request) throws FileUploadException {
		
		if (request == null) {
			throw new NullPointerException("illegal request");
		}
		
		final DiskFileItemFactory factory = DiskFileItemFactory.builder().get();
		final JakartaServletFileUpload upload = new JakartaServletFileUpload(factory);
		final List<DiskFileItem> items = upload.parseRequest(request);

		return items;
		
	}

}
