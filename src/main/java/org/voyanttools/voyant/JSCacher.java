package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

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
		
		// remove previous files
		cleanup(basePath);
		
		doCache(basePath, true);
	}
	
	private static void doCache(File basePath, boolean doSourceMap) throws IOException {
		
		System.out.println("JSCacher: path: "+basePath.getPath()+", source: "+doSourceMap);
		
		List<File> files = getCacheableFiles(basePath);
		
		System.out.println("JSCacher: files: "+files.size());
		
		String newFileID = DigestUtils.md5Hex(Longs.toByteArray(System.nanoTime()));
		System.out.println("JSCacher: creating new file with ID: "+newFileID);
		
		String sourceMapFilename = "voyant."+newFileID+".min.js.map";
		
		String footer = doSourceMap ? "\n//# sourceMappingURL=" + sourceMapFilename : "";
		
		List<SourceFile> sourceFiles = new ArrayList<SourceFile>();
		for (File file : files) {
			sourceFiles.add(SourceFile.fromFile(file.getPath(), Charset.forName(ENCODING)));
		}
		
		// minified version
		Compiler compiler = new Compiler();
		CompilerOptions options = new CompilerOptions();
		
		// support for non-standard tags to avoid JSC_BAD_JSDOC_ANNOTATION warnings
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
		
		StringBuffer cache = new StringBuffer();
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
	}

	private static void cleanup(File basePath) {
		// find the previously cached file and get its ID and modified date
		File cacheDir = new File(basePath, CACHED_FILE_PATH);
		List<File> lastCachedFiles = getCachedFiles(cacheDir);
		
		if (lastCachedFiles != null) {
			for (File file : lastCachedFiles) {
				Matcher idMatcher = Pattern.compile(CACHED_FILE_PATTERN).matcher(file.getName());
				idMatcher.find();
				String fileID = idMatcher.group(1);
				System.out.println("JSCacher: remove previous build: "+cacheDir.toString()+File.separator+fileID);
				if (fileID != null) {
					try {
						FileUtils.delete(new File(cacheDir, "voyant."+fileID+".min.js"));
						FileUtils.delete(new File(cacheDir, "voyant."+fileID+".min.js.map"));
					} catch (Exception e) {
						System.out.println(e);
					}
				}
			}
		}
	}
	
	private static List<File> getCachedFiles(File cacheDir) {
		try (Stream<Path> results = Files.find(cacheDir.toPath(), 1,
				(path, basicFileAttributes) -> path.toFile().getName().matches(CACHED_FILE_PATTERN))) {
			return results.map(p -> p.toFile()).collect(Collectors.toList());
		} catch (Exception e) {
			System.out.println(e);
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
