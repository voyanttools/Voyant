package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

import com.google.common.primitives.Longs;
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
	final static String BASE_FILE_PATH = "/src/main/webapp/";
	final static String CACHED_FILE_PATH = "/resources/voyant/current/";
	final static String CACHED_FILE_PATTERN = "voyant.(\\w{32}).min.js";
	final static String JSP_FILE = "/resources/jsp/load_js.jsp";
	
	// Closure options
	final static int SUMMARY_DETAIL_LEVEL = 1;


	public static void main(String[] args) throws IOException {
		System.out.println("Running JSCacher with: "+String.join(", ", args));
		
		String webappPath = null;
		
		final Options options = new Options();
		Option webappPathOption = new Option("p", "webappPath", true, "Path that points to the webapp directory");
		options.addOption(webappPathOption);
		
		CommandLineParser parser = new DefaultParser();
		try {
			CommandLine line = parser.parse(options, args);
			if (line.hasOption(webappPathOption)) {
				webappPath = line.getOptionValue(webappPathOption);
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
		
		doCache(basePath, true, true);
	}
	
	private static void doCache(File basePath, boolean doSourceMap, boolean forceUpdate) throws IOException {
		
		System.out.println("JSCacher: path: "+basePath.getPath()+", source: "+doSourceMap+", force: "+forceUpdate);
		
		// find the previously cached file and get its ID and modified date
		File lastCachedFile = getCachedFile(basePath);
		long lastModifiedCachedFile = 18000; // unix epoch
		String lastFileID = null;
		if (lastCachedFile != null) {
			Matcher idMatcher = Pattern.compile(CACHED_FILE_PATTERN).matcher(lastCachedFile.getName());
			idMatcher.find();
			lastFileID = idMatcher.group(1);
			System.out.println("JSCacher: previous ID: "+lastFileID);
			lastModifiedCachedFile = lastCachedFile.lastModified();
		}
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
			String newFileID = DigestUtils.md5Hex(Longs.toByteArray(System.nanoTime()));
			System.out.println("JSCacher: creating new file with ID: "+newFileID);
			
			String sourceMapFilename = "voyant."+newFileID+".min.js.map";
			
			String header = "/* This file created by JSCacher. Last modified: "+new Date().toString()+" */\n";
			String footer = doSourceMap ? "\n//# sourceMappingURL=" + sourceMapFilename : "";
			
			StringBuffer cache = new StringBuffer(header);
			
			List<SourceFile> sourceFiles = new ArrayList<SourceFile>();
			for (File file : files) {
				String s = FileUtils.readFileToString(file, Charset.forName(ENCODING));
				cache.append(s).append("\n"); // assuming UTF-8
				sourceFiles.add(SourceFile.fromFile(file.getPath()));
			}
			
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
				options.setSourceMapOutputPath(sourceMapFilename);
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

			File cachedFileMinified = new File(basePath, CACHED_FILE_PATH+"voyant."+newFileID+".min.js");
			FileUtils.writeStringToFile(cachedFileMinified, cache.toString(), Charset.forName(ENCODING));
			
			// source map
			if (doSourceMap && result.sourceMap != null) {
				StringBuilder sourceMap = new StringBuilder();
				result.sourceMap.appendTo(sourceMap, sourceMapFilename);
				File sourceMapFile = new File(basePath, CACHED_FILE_PATH+"voyant."+newFileID+".min.js.map");
				FileUtils.writeStringToFile(sourceMapFile, sourceMap.toString(), Charset.forName(ENCODING));
			}
			
			// modify jsp file
			File jspFile = new File(basePath, JSP_FILE);
			List<String> jspFileContent = new ArrayList<>(Files.readAllLines(jspFile.toPath(), Charset.forName(ENCODING)));
			jspFileContent.set(0, "<% String voyant_js_id = \""+newFileID+"\"; %>");
			FileUtils.writeLines(jspFile, ENCODING, jspFileContent, "\n");
			
			
			// remove previous files
			if (lastFileID != null) {
				try {
					FileUtils.delete(new File(basePath, CACHED_FILE_PATH+"voyant."+lastFileID+".min.js"));
					FileUtils.delete(new File(basePath, CACHED_FILE_PATH+"voyant."+lastFileID+".min.js.map"));
				} catch (NoSuchFileException e) {
					System.out.println(e);
				}
			}
		}
	}
	
	private static File getCachedFile(File basePath) {
		final Path dir = new File(basePath, CACHED_FILE_PATH).toPath();
		try (Stream<Path> results = Files.find(dir, 1,
				(path, basicFileAttributes) -> path.toFile().getName().matches(CACHED_FILE_PATTERN))) {
			return results.findAny().get().toFile();
		} catch (Exception e) {
			return null;
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
