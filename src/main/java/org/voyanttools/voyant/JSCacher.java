package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.Result;
import com.google.javascript.jscomp.SourceFile;
import com.google.javascript.jscomp.SourceMap;
import com.google.javascript.jscomp.SourceMap.PrefixLocationMapping;


/**
 * @author Andrew MacDonald and Stéfan Sinclair
 */
public class JSCacher {

	final static String ENCODING = "UTF-8";
	final static String CACHED_FILENAME = "voyant.js";
	final static String CACHED_FILENAME_MINIFIED = "voyant.min.js";
	final static String SOURCE_MAP_FILENAME = "voyant.min.map.js";
	final static String CACHED_FILE_PATH = "/resources/voyant/current/";
	
	// Closure options
	final static int SUMMARY_DETAIL_LEVEL = 1;


	public static void main(String[] args) throws IOException {
		System.out.println("Running JSCacher with: "+String.join(", ", args));
		
		String webappPath = null;
		boolean includeSrcMap = false;
		
		final Options options = new Options();
		Option webappPathOption = new Option("p", "webappPath", true, "Path that points to the webapp directory");
		Option includeSrcMapOption = new Option("m", "includeSrcMap", false, "Should the source map be included");
		options.addOption(webappPathOption);
		options.addOption(includeSrcMapOption);
		
		CommandLineParser parser = new DefaultParser();
		try {
			CommandLine line = parser.parse(options, args);
			if (line.hasOption(webappPathOption)) {
				webappPath = line.getOptionValue(webappPathOption);
			}
			if (line.hasOption(includeSrcMapOption)) {
				includeSrcMap = true;
			}
		} catch (ParseException e) {
		}
		
		File basePath = null;
		if (webappPath != null) {
			basePath = new File(webappPath);
		} else {
			File voyantRoot = new File(".").getCanonicalFile();
			basePath = new File(voyantRoot, "/src/main/webapp/");	
		}
		
		doCache(basePath, includeSrcMap, true);
	}
	
	public static void sendCache(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		response.setCharacterEncoding(ENCODING);
		
		// TODO add config for this?
		boolean doSourceMap = true;
		
		String requestURL = request.getRequestURL().toString();
		// reconstruct the url base to ensure that https is maintained
		String redirectBase = requestURL.substring(0, requestURL.lastIndexOf("/"))+"/";
		String serverName = request.getServerName();
		// force https
		if (serverName.contains("voyant-tools")) {
			redirectBase = redirectBase.replaceFirst("http:", "https:");
		}
		

		String debug = request.getParameter("debug");
		if (debug!=null && debug.equals("true")) {
			File basePath = new File(request.getSession().getServletContext().getRealPath("/"));
			doCache(basePath, doSourceMap, true);
			
			response.sendRedirect(redirectBase+CACHED_FILENAME);
		}
		else {
			response.sendRedirect(redirectBase+CACHED_FILENAME_MINIFIED);
		}

	}
	
	private static void doCache(File basePath, boolean doSourceMap, boolean forceUpdate) throws IOException {
		
		System.out.println("JSCacher: path: "+basePath.getPath()+", source: "+doSourceMap+", force: "+forceUpdate);
		
		File cachedFile = new File(basePath, CACHED_FILE_PATH+CACHED_FILENAME);
		File cachedFileMinified = new File(basePath, CACHED_FILE_PATH+CACHED_FILENAME_MINIFIED);
		File sourceMapFile = new File(basePath, CACHED_FILE_PATH+SOURCE_MAP_FILENAME);
		
		if (cachedFile.canWrite() && cachedFileMinified.canWrite() && sourceMapFile.canWrite()) {
		
			long lastModifiedCachedFile = cachedFile.lastModified();
			Date lastModifiedDate = new Date(lastModifiedCachedFile);
			List<File> files = getCacheableFiles(basePath);
			
			System.out.println("JSCacher: files: "+files.size()+", last modified: "+lastModifiedDate);
	
			// look for any file that's been updated since last cache
			boolean needsUpdate = false;
			if (forceUpdate) {
				needsUpdate = true;
			} else {
				for (File file : files) {
					if (file.lastModified() > lastModifiedCachedFile) {
						System.out.println("JSCacher: new change in: "+file.getName()+", last modified: "+new Date(file.lastModified()));
						needsUpdate = true;
						break;
					}
				}
			}
			
			if (needsUpdate) {
				System.out.println("JSCacher: running");
				
				List<SourceFile> sourceFiles = new ArrayList<SourceFile>();
				
				String header = "/* This file created by JSCacher. Last modified: "+new Date().toString()+" */\n";
				String footer = doSourceMap ? "\n//# sourceMappingURL=" + SOURCE_MAP_FILENAME : "";
				
				StringBuffer cache = new StringBuffer(header);
				
				for (File file : files) {
					String s = FileUtils.readFileToString(file, Charset.forName(ENCODING));
					cache.append(s).append("\n"); // assuming UTF-8
					sourceFiles.add(SourceFile.fromFile(file.getPath()));
				}
				
				// non-minified version
				FileUtils.writeStringToFile(cachedFile, cache.toString(), Charset.forName(ENCODING));
				
				// minified version
				Compiler compiler = new Compiler();
				CompilerOptions options = new CompilerOptions();
				
				List<String> tags = new ArrayList<String>();
				tags.add("cfg");
				tags.add("exports");
				tags.add("choices");
				tags.add("distinguishingFldsArray");
				tags.add("undistinguishedRoot");
				options.setExtraAnnotationNames(tags);
				
				options.setStrictModeInput(false); // needed to avoid error on "arguments.callee.caller"
				
				options.setSummaryDetailLevel(SUMMARY_DETAIL_LEVEL);
				
				options.setLanguageIn(CompilerOptions.LanguageMode.ECMASCRIPT_2019);
				options.setLanguageOut(CompilerOptions.LanguageMode.ECMASCRIPT5);
				
				if (doSourceMap) {
					options.setSourceMapOutputPath(SOURCE_MAP_FILENAME);
					options.setSourceMapFormat(SourceMap.Format.V3);
					options.setSourceMapIncludeSourcesContent(true);
					
					List<PrefixLocationMapping> prefixes = new ArrayList<>();
					String baseLocation = basePath.toString().replaceAll("\\\\", "/");
					prefixes.add(new PrefixLocationMapping(baseLocation, ""));
					options.setSourceMapLocationMappings(prefixes);
				}
				
				CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
				Result result = compiler.compile(new ArrayList<SourceFile>(), sourceFiles, options);
				
				cache.setLength(0);
				cache.append(header);
				cache.append(compiler.toSource());
				cache.append(footer);
	
				FileUtils.writeStringToFile(cachedFileMinified, cache.toString(), Charset.forName(ENCODING));
				
				// source map
				if (doSourceMap && result.sourceMap != null) {
					StringBuilder sourceMap = new StringBuilder();
					result.sourceMap.appendTo(sourceMap, SOURCE_MAP_FILENAME);
					FileUtils.writeStringToFile(sourceMapFile, sourceMap.toString(), Charset.forName(ENCODING));
				}
	
			}
		} else {
			System.out.println("Can't write to files!");
		}
	}

	private static List<File> getCacheableFiles(File basePath) throws IOException {
		InputStream is = org.voyanttools.voyant.JSCacher.class.getResourceAsStream("voyant-js.txt");
		List<String> lines = IOUtils.readLines(is, Charset.forName(ENCODING));
		is.close();
		List<File> files = new ArrayList<File>();
		for (String jsFile : lines) {
			if (jsFile.trim().startsWith("#") || jsFile.trim().isEmpty()) {continue;}
			File f = new File(basePath, jsFile);
			if (f.exists()) {files.add(f);}
			else {
				throw new IOException("File does not exist:"+f);
			}
		}
		return files;
	}
}
