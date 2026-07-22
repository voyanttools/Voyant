(function(global) {
	'use strict';

	function escapeHtml(text) {
		return asString(text)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function asString(v) {
		return v === undefined || v === null ? '' : String(v);
	}

	function toFormUrlEncoded(params) {
		var form = new URLSearchParams();
		Object.keys(params || {}).forEach(function(key) {
			var val = params[key];
			if (val === undefined || val === null) return;
			form.set(key, asString(val));
		});
		return form.toString();
	}

	function getSpyralBaseUrl() {
		if (global.Spyral && global.Spyral.Load && global.Spyral.Load.baseUrl) {
			return global.Spyral.Load.baseUrl;
		}
		// Fallback: best effort
		return (global.location && global.location.origin ? global.location.origin : '') + '/';
	}

	function corpusIdFrom(corpus) {
		if (!corpus) {
			return Promise.reject(new Error('Spyral.LLM: missing corpus'));
		}
		if (typeof corpus === 'string') {
			return Promise.resolve(corpus);
		}
		if (corpus.corpusid) {
			return Promise.resolve(corpus.corpusid);
		}
		if (typeof corpus.id === 'function') {
			try {
				return Promise.resolve(corpus.id());
			} catch (e) {
				return Promise.reject(e);
			}
		}
		return Promise.reject(new Error('Spyral.LLM: unrecognized corpus object'));
	}

	async function summarize(opts) {
		opts = opts || {};
		var corpusId = await corpusIdFrom(opts.corpus);

		var maxChars = opts.maxChars === undefined ? 8000 : opts.maxChars;
		var numPredict = opts.numPredict === undefined ? 256 : opts.numPredict;
		var docTokenLimit = opts.docTokenLimit === undefined ? 4000 : opts.docTokenLimit;

		var baseUrl = getSpyralBaseUrl();
		var url = new URL('llm/summarize', baseUrl);
		var body = toFormUrlEncoded({
			corpus: corpusId,
			docIndex: opts.docIndex,
			model: opts.model,
			maxChars: maxChars,
			numPredict: numPredict,
			docTokenLimit: docTokenLimit
		});

		var res = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body: body
		});

		var text = await res.text();
		if (!res.ok) {
			throw new Error('LLM HTTP ' + res.status + ': ' + text.slice(0, 300));
		}

		var json;
		try {
			json = JSON.parse(text);
		} catch (e) {
			throw new Error('LLM: invalid JSON response');
		}

		if (!json || json.ok !== true) {
			throw new Error((json && json.error) ? json.error : 'LLM error');
		}

		return json.summary || '';
	}

	function summarizeToIframeHtml(title, summaryText) {
		var safeTitle = escapeHtml(title || 'LLM Summary');
		var safeBody = escapeHtml(summaryText || '');
		var srcdoc =
			'<!doctype html><html><head><meta charset="utf-8" />' +
			'<style>' +
			'body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;padding:12px;}' +
			'h3{margin:0 0 8px 0;font-size:14px;}' +
			'pre{white-space:pre-wrap;word-wrap:break-word;margin:0;font-size:13px;line-height:1.35;}' +
			'</style></head><body>' +
			'<h3>' + safeTitle + '</h3>' +
			'<pre>' + safeBody + '</pre>' +
			'</body></html>';

		// srcdoc is an attribute, so must be HTML-escaped.
		return '<iframe style="width:100%;height:320px;border:1px solid #ddd;border-radius:6px;" sandbox="allow-scripts allow-forms allow-same-origin" srcdoc="' + escapeHtml(srcdoc) + '"></iframe>';
	}

	function toolIframeHtml(title, srcdocHtml, heightPx) {
		var srcdoc =
			'<!doctype html><html><head><meta charset="utf-8" />' +
			'<meta name="viewport" content="width=device-width, initial-scale=1" />' +
			'<style>' +
			'body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;padding:12px;}' +
			'.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;}' +
			'input,textarea,button,select{font:inherit;font-size:13px;}' +
			'input,textarea,select{padding:6px 8px;border:1px solid #ccc;border-radius:6px;}' +
			'button{padding:6px 10px;border:1px solid #333;border-radius:6px;background:#111;color:#fff;cursor:pointer;}' +
			'button:disabled{opacity:.6;cursor:default;}' +
			'pre{white-space:pre-wrap;word-wrap:break-word;background:#fafafa;border:1px solid #eee;border-radius:6px;padding:10px;}' +
			'.muted{color:#666;font-size:12px;}' +
			'.err{color:#b00020;font-size:12px;white-space:pre-wrap;}' +
			'</style></head><body>' +
			'<h3 style="margin:0 0 8px 0;font-size:14px;">' + escapeHtml(title || '') + '</h3>' +
			srcdocHtml +
			'</body></html>';
		var h = heightPx || 420;
		return '<iframe style="width:100%;height:' + h + 'px;border:1px solid #ddd;border-radius:6px;" sandbox="allow-scripts allow-forms allow-same-origin" srcdoc="' + escapeHtml(srcdoc) + '"></iframe>';
	}

	async function postForm(path, params) {
		var baseUrl = getSpyralBaseUrl();
		var url = new URL(path, baseUrl);
		var res = await fetch(url.toString(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			body: toFormUrlEncoded(params)
		});
		var text = await res.text();
		if (!res.ok) {
			throw new Error('HTTP ' + res.status + ': ' + text.slice(0, 500));
		}
		var json;
		try { json = JSON.parse(text); } catch (e) { throw new Error('Invalid JSON'); }
		if (!json || json.ok !== true) {
			throw new Error((json && json.error) ? json.error : 'LLM error');
		}
		return json;
	}

	function toolChatbot(corpus, options) {
		options = options || {};
		var corpusId = (typeof corpus === 'string') ? corpus : (corpus && (corpus.corpusid || (typeof corpus.id === 'function' ? corpus.id() : '')));
		var baseUrl = escapeHtml(getSpyralBaseUrl());
		var initialDocIndex = options.docIndex === undefined ? '' : String(options.docIndex);
		var title = options.title || (initialDocIndex ? ('Document Assistant (Doc ' + initialDocIndex + ')') : 'Chatbot');

		var html =
			'<div class="row">' +
			'<div class="muted">Corpus:</div><code style="font-size:12px;">' + escapeHtml(corpusId || '') + '</code>' +
			'</div>' +
			'<form id="f" method="POST" action="/llm/chat" target="result" style="margin:0">' +
			'<input type="hidden" name="corpus" value="' + escapeHtml(corpusId || '') + '" />' +
			'<div class="row">' +
			'<input id="docIndex" name="docIndex" style="width:120px" placeholder="docIndex (optional)" value="' + escapeHtml(initialDocIndex) + '" />' +
			'<input id="query" name="query" style="flex:1;min-width:180px" placeholder="optional: retrieval query for passages" />' +
			'</div>' +
			'<div class="row">' +
			'<textarea id="message" name="message" style="width:100%;min-height:80px" placeholder="Ask a question..."></textarea>' +
			'</div>' +
			'<div class="row">' +
			'<button id="send" type="submit">Send</button>' +
			'<span id="status" class="muted"></span>' +
			'<span class="muted">(Fallback: response shows below)</span>' +
			'</div>' +
			'</form>' +
			'<div id="err" class="err"></div>' +
			'<pre id="out"></pre>' +
			'<iframe name="result" style="width:100%;height:200px;border:1px solid #eee;border-radius:6px;"></iframe>' +
			'<script>' +
			'(function(){' +
			'const base=' + JSON.stringify(baseUrl) + ';' +
			'const corpus=' + JSON.stringify(corpusId || '') + ';' +
			'const $=id=>document.getElementById(id);' +
			'async function post(params){' +
			'  const form=new URLSearchParams(params);' +
			'  const res=await fetch(new URL("llm/chat", base).toString(), {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}, body: form.toString()});' +
			'  const txt=await res.text();' +
			'  if(!res.ok) throw new Error("HTTP "+res.status+": "+txt.slice(0,500));' +
			'  const json=JSON.parse(txt);' +
			'  if(!json.ok) throw new Error(json.error||"LLM error");' +
			'  return json;' +
			'}' +
			'$("f").addEventListener("submit", async function(ev){' +
			'  ev.preventDefault();' +
			'  $("err").textContent=""; $("status").textContent="Sending..."; $("send").disabled=true;' +
			'  try{' +
			'    const msg=$("message").value.trim(); if(!msg){ throw new Error("Enter a message"); }' +
			'    const q=$("query").value.trim();' +
			'    const di=$("docIndex").value.trim();' +
			'    const json=await post({corpus:corpus, message:msg, query:q||undefined, docIndex:di||undefined});' +
			'    $("out").textContent = json.reply || "";' +
			'    if(json.contexts && json.contexts.length){' +
			'      $("out").textContent += "\n\n--- Contexts ("+json.contexts.length+") ---\n" + json.contexts.map(c=>`[doc ${c.docIndex}] ${c.left||""} ${c.middle||""} ${c.right||""}`).join("\n");' +
			'    }' +
			'  }catch(e){ $("err").textContent=String(e.message||e); }' +
			'  finally{ $("status").textContent=""; $("send").disabled=false; }' +
			'});' +
			'})();' +
			'</script>';

		return Promise.resolve(toolIframeHtml(title, html, 520));
	}

	function toolPassageFinder(corpus, options) {
		options = options || {};
		var corpusId = (typeof corpus === 'string') ? corpus : (corpus && (corpus.corpusid || (typeof corpus.id === 'function' ? corpus.id() : '')));
		var baseUrl = escapeHtml(getSpyralBaseUrl());
		var title = options.title || 'Passage Finder';

		var html =
			'<div class="row">' +
			'<div class="muted">Corpus:</div><code style="font-size:12px;">' + escapeHtml(corpusId || '') + '</code>' +
			'</div>' +
			'<form id="f" method="POST" action="/llm/search" target="result" style="margin:0">' +
			'<input type="hidden" name="corpus" value="' + escapeHtml(corpusId || '') + '" />' +
			'<div class="row">' +
			'<input id="query" name="query" style="flex:1;min-width:200px" placeholder="Search query (e.g., forest)" />' +
			'<input id="limit" name="limit" style="width:90px" placeholder="limit" value="20" />' +
			'<button id="go" type="submit">Search</button>' +
			'<span id="status" class="muted"></span>' +
			'<span class="muted">(Fallback: response shows below)</span>' +
			'</div>' +
			'</form>' +
			'<div id="err" class="err"></div>' +
			'<pre id="out"></pre>' +
			'<iframe name="result" style="width:100%;height:200px;border:1px solid #eee;border-radius:6px;"></iframe>' +
			'<script>' +
			'(function(){' +
			'const base=' + JSON.stringify(baseUrl) + ';' +
			'const corpus=' + JSON.stringify(corpusId || '') + ';' +
			'const $=id=>document.getElementById(id);' +
			'async function post(params){' +
			'  const form=new URLSearchParams(params);' +
			'  const res=await fetch(new URL("llm/search", base).toString(), {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}, body: form.toString()});' +
			'  const txt=await res.text(); if(!res.ok) throw new Error("HTTP "+res.status+": "+txt.slice(0,500));' +
			'  const json=JSON.parse(txt); if(!json.ok) throw new Error(json.error||"Search error"); return json;' +
			'}' +
			'$("f").addEventListener("submit", async function(ev){' +
			'  ev.preventDefault();' +
			'  $("err").textContent=""; $("status").textContent="Searching..."; $("go").disabled=true;' +
			'  try{' +
			'    const q=$("query").value.trim(); if(!q){ throw new Error("Enter a query"); }' +
			'    const lim=$("limit").value.trim()||"20";' +
			'    const json=await post({corpus:corpus, query:q, limit:lim});' +
			'    const lines=(json.contexts||[]).map(c=>`[doc ${c.docIndex}] ${c.left||""} ${c.middle||""} ${c.right||""}`);' +
			'    $("out").textContent = lines.length ? lines.join("\n\n") : "No results.";' +
			'  }catch(e){ $("err").textContent=String(e.message||e); }' +
			'  finally{ $("status").textContent=""; $("go").disabled=false; }' +
			'});' +
			'})();' +
			'</script>';

		return Promise.resolve(toolIframeHtml(title, html, 520));
	}

	function toolTopicLabeler(corpus, options) {
		options = options || {};
		var corpusId = (typeof corpus === 'string') ? corpus : (corpus && (corpus.corpusid || (typeof corpus.id === 'function' ? corpus.id() : '')));
		var baseUrl = escapeHtml(getSpyralBaseUrl());
		var title = options.title || 'Topic Labeler';

		var html =
			'<div class="row">' +
			'<div class="muted">Corpus:</div><code style="font-size:12px;">' + escapeHtml(corpusId || '') + '</code>' +
			'</div>' +
			'<div class="row">' +
			'<input id="topics" style="width:90px" placeholder="topics" value="10" />' +
			'<input id="iterations" style="width:110px" placeholder="iterations" value="150" />' +
			'<input id="terms" style="width:120px" placeholder="terms/topic" value="10" />' +
			'<button id="go">Run</button>' +
			'<span id="status" class="muted"></span>' +
			'</div>' +
			'<div id="err" class="err"></div>' +
			'<pre id="out"></pre>' +
			'<script>' +
			'(function(){' +
			'const base=' + JSON.stringify(baseUrl) + ';' +
			'const corpus=' + JSON.stringify(corpusId || '') + ';' +
			'const $=id=>document.getElementById(id);' +
			'async function post(params){' +
			'  const form=new URLSearchParams(params);' +
			'  const res=await fetch(new URL("llm/topic-labels", base).toString(), {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}, body: form.toString()});' +
			'  const txt=await res.text(); if(!res.ok) throw new Error("HTTP "+res.status+": "+txt.slice(0,500));' +
			'  const json=JSON.parse(txt); if(!json.ok) throw new Error(json.error||"Topic label error"); return json;' +
			'}' +
			'$("go").addEventListener("click", async function(){' +
			'  $("err").textContent=""; $("status").textContent="Running..."; $("go").disabled=true;' +
			'  try{' +
			'    const json=await post({corpus:corpus, topics:$("topics").value.trim()||"10", iterations:$("iterations").value.trim()||"150", termsPerTopic:$("terms").value.trim()||"10"});' +
			'    const lines=(json.topics||[]).map(t=>`Topic ${t.index}: ${t.label}\n  Words: ${(t.words||[]).join(", ")}`);' +
			'    $("out").textContent = lines.join("\n\n");' +
			'  }catch(e){ $("err").textContent=String(e.message||e); }' +
			'  finally{ $("status").textContent=""; $("go").disabled=false; }' +
			'});' +
			'})();' +
			'</script>';

		return Promise.resolve(toolIframeHtml(title, html, 520));
	}

	function toolMetadataEnricher(corpus, options) {
		options = options || {};
		var corpusId = (typeof corpus === 'string') ? corpus : (corpus && (corpus.corpusid || (typeof corpus.id === 'function' ? corpus.id() : '')));
		var baseUrl = escapeHtml(getSpyralBaseUrl());
		var title = options.title || 'Metadata Enricher';
		var initialDocIndex = options.docIndex === undefined ? '' : String(options.docIndex);

		var html =
			'<div class="row">' +
			'<div class="muted">Corpus:</div><code style="font-size:12px;">' + escapeHtml(corpusId || '') + '</code>' +
			'</div>' +
			'<div class="row">' +
			'<input id="docIndex" style="width:140px" placeholder="docIndex" value="' + escapeHtml(initialDocIndex) + '" />' +
			'<button id="go">Enrich</button>' +
			'<span id="status" class="muted"></span>' +
			'</div>' +
			'<div id="err" class="err"></div>' +
			'<pre id="out"></pre>' +
			'<script>' +
			'(function(){' +
			'const base=' + JSON.stringify(baseUrl) + ';' +
			'const corpus=' + JSON.stringify(corpusId || '') + ';' +
			'const $=id=>document.getElementById(id);' +
			'async function post(params){' +
			'  const form=new URLSearchParams(params);' +
			'  const res=await fetch(new URL("llm/metadata-enrich", base).toString(), {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}, body: form.toString()});' +
			'  const txt=await res.text(); if(!res.ok) throw new Error("HTTP "+res.status+": "+txt.slice(0,500));' +
			'  const json=JSON.parse(txt); if(!json.ok) throw new Error(json.error||"Metadata error"); return json;' +
			'}' +
			'$("go").addEventListener("click", async function(){' +
			'  $("err").textContent=""; $("status").textContent="Working..."; $("go").disabled=true;' +
			'  try{' +
			'    const di=$("docIndex").value.trim(); if(!di){ throw new Error("Enter docIndex"); }' +
			'    const json=await post({corpus:corpus, docIndex:di});' +
			'    $("out").textContent = JSON.stringify(json.metadata||{}, null, 2);' +
			'  }catch(e){ $("err").textContent=String(e.message||e); }' +
			'  finally{ $("status").textContent=""; $("go").disabled=false; }' +
			'});' +
			'})();' +
			'</script>';

		return Promise.resolve(toolIframeHtml(title, html, 480));
	}

	function toolCompare(corpus, options) {
		options = options || {};
		var corpusId = (typeof corpus === 'string') ? corpus : (corpus && (corpus.corpusid || (typeof corpus.id === 'function' ? corpus.id() : '')));
		var baseUrl = escapeHtml(getSpyralBaseUrl());
		var title = options.title || 'Compare';

		var html =
			'<div class="row">' +
			'<div class="muted">Corpus:</div><code style="font-size:12px;">' + escapeHtml(corpusId || '') + '</code>' +
			'</div>' +
			'<div class="row">' +
			'<input id="a" style="width:140px" placeholder="docIndexA" />' +
			'<input id="b" style="width:140px" placeholder="docIndexB" />' +
			'<button id="go">Compare</button>' +
			'<span id="status" class="muted"></span>' +
			'</div>' +
			'<div id="err" class="err"></div>' +
			'<pre id="out"></pre>' +
			'<script>' +
			'(function(){' +
			'const base=' + JSON.stringify(baseUrl) + ';' +
			'const corpus=' + JSON.stringify(corpusId || '') + ';' +
			'const $=id=>document.getElementById(id);' +
			'async function post(params){' +
			'  const form=new URLSearchParams(params);' +
			'  const res=await fetch(new URL("llm/compare", base).toString(), {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}, body: form.toString()});' +
			'  const txt=await res.text(); if(!res.ok) throw new Error("HTTP "+res.status+": "+txt.slice(0,500));' +
			'  const json=JSON.parse(txt); if(!json.ok) throw new Error(json.error||"Compare error"); return json;' +
			'}' +
			'$("go").addEventListener("click", async function(){' +
			'  $("err").textContent=""; $("status").textContent="Comparing..."; $("go").disabled=true;' +
			'  try{' +
			'    const a=$("a").value.trim(); const b=$("b").value.trim(); if(!a||!b){ throw new Error("Enter both docIndexA and docIndexB"); }' +
			'    const json=await post({corpus:corpus, docIndexA:a, docIndexB:b});' +
			'    $("out").textContent = json.comparison || "";' +
			'  }catch(e){ $("err").textContent=String(e.message||e); }' +
			'  finally{ $("status").textContent=""; $("go").disabled=false; }' +
			'});' +
			'})();' +
			'</script>';

		return Promise.resolve(toolIframeHtml(title, html, 520));
	}

	function summarizeCorpus(corpus, options) {
		options = options || {};
		options.corpus = corpus;
		delete options.docIndex;
		return summarize(options);
	}

	function summarizeDocument(corpus, docIndex, options) {
		options = options || {};
		options.corpus = corpus;
		options.docIndex = docIndex;
		return summarize(options);
	}

	function toolLlmSummary(corpus, options) {
		options = options || {};
		options.corpus = corpus;
		var title = options.title || (options.docIndex === undefined ? 'LLM Summary (Corpus)' : ('LLM Summary (Doc ' + options.docIndex + ')'));
		return summarize(options).then(function(summaryText) {
			return summarizeToIframeHtml(title, summaryText);
		});
	}

	function install() {
		if (!global.Spyral) return;
		if (!global.Spyral.LLM) {
			global.Spyral.LLM = {};
		}
		global.Spyral.LLM.summarize = summarize;
		global.Spyral.LLM.summarizeCorpus = summarizeCorpus;
		global.Spyral.LLM.summarizeDocument = summarizeDocument;
		global.Spyral.LLM._toolLlmSummary = toolLlmSummary;
		global.Spyral.LLM._toolChatbot = toolChatbot;
		global.Spyral.LLM._toolPassageFinder = toolPassageFinder;
		global.Spyral.LLM._toolTopicLabeler = toolTopicLabeler;
		global.Spyral.LLM._toolMetadataEnricher = toolMetadataEnricher;
		global.Spyral.LLM._toolCompare = toolCompare;

		// Convenience instance methods
		if (global.Spyral.Corpus && global.Spyral.Corpus.prototype) {
			// Add as a pseudo-tool so notebooks can do: myCorpus.tool('llmSummary')
			if (typeof global.Spyral.Corpus.prototype.tool === 'function' && !global.Spyral.Corpus.prototype._llmToolPatched) {
				var originalTool = global.Spyral.Corpus.prototype.tool;
				global.Spyral.Corpus.prototype.tool = function(toolName, config) {
					if (typeof toolName === 'string') {
						var tn = toolName.toLowerCase();
						if (tn === 'llmsummary') {
							return toolLlmSummary(this, config || {});
						}
						if (tn === 'chatbot') {
							return toolChatbot(this, config || {});
						}
						if (tn === 'passagefinder') {
							return toolPassageFinder(this, config || {});
						}
						if (tn === 'documentassistant') {
							return toolChatbot(this, Object.assign({ docIndex: (config && config.docIndex !== undefined) ? config.docIndex : '' }, config || {}));
						}
						if (tn === 'topiclabeler') {
							return toolTopicLabeler(this, config || {});
						}
						if (tn === 'metadataenricher') {
							return toolMetadataEnricher(this, config || {});
						}
						if (tn === 'compare') {
							return toolCompare(this, config || {});
						}
					}
					return originalTool.apply(this, arguments);
				};
				global.Spyral.Corpus.prototype._llmToolPatched = true;
			}

			if (typeof global.Spyral.Corpus.prototype.llmSummary !== 'function') {
				global.Spyral.Corpus.prototype.llmSummary = function(options) {
					return summarizeCorpus(this, options);
				};
			}
			if (typeof global.Spyral.Corpus.prototype.llmSummaryDocument !== 'function') {
				global.Spyral.Corpus.prototype.llmSummaryDocument = function(docIndex, options) {
					return summarizeDocument(this, docIndex, options);
				};
			}
		}
	}

	install();
})(window);

/* ══════════════════════════════════════════════════════════════════════════
   LLM Companion layer — multi-provider engine + corpus.llm API
   Loaded into every Spyral cell sandbox via sandbox.jsp, BEFORE sandbox.js
   captures __defaultWindowKeys__, so these globals exist natively in every
   cell with no notebook import required.

   Provider config and the session log persist across cells via localStorage
   (each cell runs in its own iframe; window state does not carry over).
   ══════════════════════════════════════════════════════════════════════════ */
(function (global) {
    'use strict';

    var CFG_KEY  = 'spyral-llm-config';
    var LOG_KEY  = 'spyral-llm-log';
    var KEYS_KEY = 'spyral-llm-keys';
    var NEEDS_KEY = ['openai', 'anthropic', 'gemini'];

    var PROVIDER_URLS = {
        'openai':      'https://api.openai.com/v1/chat/completions',
        'anthropic':   'https://api.anthropic.com/v1/messages',
        'gemini':      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
    };

    var DEFAULT_MODELS = {
        'openai':      'gpt-4o-mini',
        'anthropic':   'claude-opus-4-8',
        'gemini':      'gemini-3.5-flash',
        'ollama':      'llama3',
        'custom':      null
    };

    var DEFAULT_CFG = { provider: 'ollama', model: null, apiKey: null, baseUrl: null };

    function storageGet(key) {
        try { return global.localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, val) {
        try { global.localStorage.setItem(key, val); } catch (e) { /* sandboxed without same-origin */ }
    }

    // API keys live in their own per-provider map, so switching providers never
    // discards a key already entered. Keys stay in this browser's localStorage;
    // they are never written to the provenance log or echoed in cell output.
    function keyGet(provider) {
        var raw = storageGet(KEYS_KEY);
        if (raw) { try { return JSON.parse(raw)[provider] || null; } catch (e) { } }
        return null;
    }

    function keySet(provider, key) {
        var m = {};
        var raw = storageGet(KEYS_KEY);
        if (raw) { try { m = JSON.parse(raw); } catch (e) { } }
        m[provider] = key;
        storageSet(KEYS_KEY, JSON.stringify(m));
    }

    // A DOM overlay here would be position:fixed inside this cell's own sandbox
    // iframe, not the full browser window — on a short iframe the modal clips
    // and the input becomes unreachable. A native prompt dialog is unaffected
    // by the iframe's box entirely — but global.prompt is shadowed by
    // llmPrompt() further down this file, so this must call nativePrompt(),
    // not prompt(), or it silently hits the template lookup instead.
    global.requestLLMKey = function (providerKey) {
        var key = global.nativePrompt('API key required for "' + providerKey + '". Kept only in ' +
            'this browser (localStorage) — never in the provenance log, never shown in cell output:');
        if (key && key.trim()) { return Promise.resolve(key.trim()); }
        return Promise.reject(new Error('No API key provided for "' + providerKey + '" — enter one ' +
            'when prompted, or run showModelSelector().'));
    };

    // Live getter: cell iframes load once at notebook startup, so a provider switch
    // in one cell must be re-read from localStorage by every other cell.
    var memoryCfg = null;
    function loadCfg() {
        var raw = storageGet(CFG_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { /* fall through */ }
        }
        return memoryCfg || Object.assign({}, DEFAULT_CFG);
    }

    Object.defineProperty(global, '_llmCfg', {
        get: loadCfg,
        set: function (v) {
            memoryCfg = v;
            storageSet(CFG_KEY, JSON.stringify(v));
        },
        configurable: true
    });

    global._configureProvider = function (cfg) {
        cfg = cfg || {};
        var p = cfg.provider || 'ollama';
        var known = Object.keys(PROVIDER_URLS).concat(['ollama', 'custom']);
        if (known.indexOf(p) === -1) {
            throw new Error('Unknown provider "' + p + '". Choose: ' + known.join(', '));
        }
        if (cfg.apiKey) { keySet(p, cfg.apiKey); }
        global._llmCfg = {
            provider: p,
            model:    cfg.model   || DEFAULT_MODELS[p] || null,
            apiKey:   cfg.apiKey  || keyGet(p),
            baseUrl:  cfg.baseUrl || null
        };
        // Masked copy: a bare configureLLM(...) at the end of a cell gets its
        // return value rendered as the cell result — the key must never appear there.
        var stored = global._llmCfg;
        return { provider: stored.provider, model: stored.model, baseUrl: stored.baseUrl,
                 apiKey: stored.apiKey ? '(stored in this browser)' : null };
    };

    global.configureLLM = global._configureProvider;
    // Matches the portable layer's name — notebooks written to be dual-server
    // portable (B01-B07) call this directly instead of configureLLM/llm.configure.
    global.setLLMConfig = global._configureProvider;

    // Session log — persists across cell iframes via localStorage. Cell iframes are
    // created once at notebook load, so this must be a live getter (re-read on every
    // access) rather than a snapshot, or later cells would see a stale log.
    var memoryLog = [];
    var storageWorks = (function () {
        try {
            global.localStorage.setItem('spyral-llm-probe', '1');
            global.localStorage.removeItem('spyral-llm-probe');
            return true;
        } catch (e) { return false; }
    })();

    function loadLog() {
        if (!storageWorks) { return memoryLog; }
        var raw = storageGet(LOG_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch (e) { /* fall through */ }
        }
        return [];
    }

    function saveLog(arr) {
        if (!storageWorks) { return; }
        // Full prompts are logged, so cap the serialized log at ~2MB by dropping
        // the oldest entries — otherwise localStorage writes start failing silently.
        var json = JSON.stringify(arr);
        while (json.length > 2000000 && arr.length > 1) {
            arr.shift();
            json = JSON.stringify(arr);
        }
        storageSet(LOG_KEY, json);
    }

    Object.defineProperty(global, '_companionLog', {
        get: function () {
            var arr = loadLog();
            arr.push = function () {
                var n = Array.prototype.push.apply(this, arguments);
                saveLog(Array.prototype.slice.call(this));
                return n;
            };
            return arr;
        },
        // Setter accepts legacy assignments like `_companionLog = _companionLog || []`
        // (strict-mode code throws "readonly property" against a getter-only accessor)
        set: function (v) {
            if (Array.isArray(v)) { saveLog(Array.prototype.slice.call(v)); }
        },
        configurable: true
    });

    global.clearLLMLog = function () {
        memoryLog.length = 0;
        storageSet(LOG_KEY, '[]');
    };

    global.downloadLog = function () {
        var data = JSON.stringify(Array.prototype.slice.call(loadLog()), null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'llm-companion-session-' +
            new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    };

    // FNV-1a — stable fingerprint of the input payload for the provenance log
    function inputHash(str) {
        var h = 0x811c9dc5;
        for (var i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193) >>> 0;
        }
        return ('0000000' + h.toString(16)).slice(-8);
    }

    global._llmCall = function (messages, opts) {
        opts = opts || {};
        var cfg = global._llmCfg;
        var url, headers, body, parse;

        // Bring-your-own-key providers: fall back to the per-provider key store,
        // and failing that prompt once (masked input) and remember the answer.
        if (NEEDS_KEY.indexOf(cfg.provider) !== -1 && !cfg.apiKey) {
            cfg.apiKey = keyGet(cfg.provider);
            if (!cfg.apiKey) {
                return global.requestLLMKey(cfg.provider).then(function (key) {
                    global._configureProvider({ provider: cfg.provider, model: cfg.model,
                                                apiKey: key, baseUrl: cfg.baseUrl });
                    return global._llmCall(messages, opts);
                });
            }
        }

        if (cfg.provider === 'anthropic') {
            // Native Messages API: x-api-key auth, system prompt as a top-level
            // param, browser calls gated behind an explicit opt-in header, and
            // no temperature (current Claude models reject sampling params).
            url = cfg.baseUrl || PROVIDER_URLS['anthropic'];
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': cfg.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            };
            var sys = messages.filter(function (m) { return m.role === 'system'; })
                .map(function (m) { return m.content; }).join('\n');
            body = {
                model: opts.model || cfg.model || DEFAULT_MODELS['anthropic'],
                max_tokens: opts.maxTokens || opts.max_tokens || 600,
                messages: messages.filter(function (m) { return m.role !== 'system'; })
            };
            if (sys) { body.system = sys; }
            parse = function (d) {
                if (!d || !Array.isArray(d.content)) { return null; }
                var txt = d.content.filter(function (b) { return b.type === 'text'; })
                    .map(function (b) { return b.text; }).join('\n').trim();
                if (!txt && d.stop_reason === 'refusal') {
                    txt = "[Request declined by the model's safety system.]";
                }
                return txt ? { content: txt, truncated: d.stop_reason === 'max_tokens' } : null;
            };
        } else {
            // OpenAI-compatible providers (openai, gemini, ollama, custom)
            if (cfg.provider === 'ollama') {
                url = (cfg.baseUrl || 'http://localhost:11434') + '/v1/chat/completions';
            } else if (cfg.provider === 'custom') {
                url = cfg.baseUrl;
                if (!url) { return Promise.reject(new Error('provider "custom" requires baseUrl')); }
            } else {
                url = cfg.baseUrl || PROVIDER_URLS[cfg.provider];
            }
            headers = { 'Content-Type': 'application/json' };
            if (cfg.apiKey) {
                headers['Authorization'] = 'Bearer ' + cfg.apiKey;
            }
            body = {
                model:       opts.model       || cfg.model || DEFAULT_MODELS[cfg.provider],
                messages:    messages,
                max_tokens:  opts.maxTokens   || opts.max_tokens || 600,
                temperature: opts.temperature !== undefined ? opts.temperature : 0.4
            };
            parse = function (d) {
                if (d && d.choices && d.choices[0] && d.choices[0].message) {
                    return { content: d.choices[0].message.content.trim(),
                             truncated: d.choices[0].finish_reason === 'length' };
                }
                return null;
            };
        }

        var payload = JSON.stringify(body);
        var t0 = Date.now();

        return fetch(url, {
            method:  'POST',
            headers: headers,
            body:    payload
        })
        .then(function (r) {
            if (!r.ok) {
                return r.text().then(function (t) {
                    // Cell output only shows a short message; log everything to
                    // the browser console so a recurring failure is actually
                    // diagnosable from devtools instead of a truncated string.
                    var headerDump = {};
                    r.headers.forEach(function (v, k) { headerDump[k] = v; });
                    console.error('[spyral-llm] LLM call failed', {
                        status: r.status, statusText: r.statusText, url: url,
                        provider: cfg.provider, headers: headerDump, body: t
                    });
                    throw new Error('LLM error ' + r.status + ': ' + t.slice(0, 200) +
                        ' — full response logged to the browser console (F12 / DevTools).');
                });
            }
            return r.json();
        })
        .then(function (d) {
            var result = parse(d);
            if (!result) {
                throw new Error('LLM returned no content: ' + JSON.stringify(d).slice(0, 200));
            }
            var content = result.content;
            if (result.truncated) {
                content += '\n\n[Response truncated at the maxTokens limit — ' +
                    'pass a higher value, e.g. { maxTokens: 900 }, for the full answer.]';
            }
            // One provenance record per API call — the exact prompt, parameters,
            // provider/model, input hash, and timing. Never includes the API key.
            global._companionLog.push({
                timestamp:   new Date().toISOString(),
                fn:          'llm-call',
                provider:    cfg.provider,
                model:       body.model,
                temperature: body.temperature,
                maxTokens:   body.max_tokens,
                inputHash:   inputHash(payload),
                messages:    messages,
                reply:       content,
                truncated:   result.truncated,
                durationMs:  Date.now() - t0
            });
            return content;
        });
    };

    global._companionChat = function (messages, opts) {
        return global._llmCall(messages, opts);
    };

    // Public raw-messages entry point — mirrors the portable layer's llmCall(),
    // where _companionChat is documented as the legacy alias, not the other way round.
    global.llmCall = global._llmCall;

    // Matches the portable layer's llmExplain(corpus, question, opts): fetches
    // the corpus's own top terms and grounds the answer in them. Defined here
    // as a thin wrapper over corpus.llm.explain (installed further down this
    // file) so dual-server notebooks can call one name on either layer.
    global.llmExplain = function (corpus, question, opts) {
        return corpus.llm.explain(question, opts);
    };

    // Matches the portable layer's llmChat(question, opts): a single-turn,
    // history-free chat call with the same default system prompt as
    // LLMCompanion — for cells that already built their own evidence string
    // and just need a plain question-in/answer-out call, no auto-fetch.
    global.llmChat = function (question, opts) {
        var sys = (opts && opts.system) ||
            'You are a careful and knowledgeable Digital Humanities research assistant. ' +
            'Interpret patterns analytically, cite evidence, and suggest next steps.';
        return global._companionChat([
            { role: 'system', content: sys },
            { role: 'user', content: String(question) }
        ], opts);
    };

    function stripFences(reply) {
        return reply.replace(/^```[a-z]*\s*/m, '').replace(/```\s*$/m, '').trim();
    }

    global.analyseTopics = async function analyseTopics(topicData, opts) {
        opts = opts || {};
        var topicList = (topicData || []).map(function (t, i) {
            var terms = Array.isArray(t)       ? t :
                        Array.isArray(t.terms) ? t.terms :
                        Object.keys(t);
            return 'Topic ' + (i + 1) + ': ' + terms.slice(0, 10).join(', ');
        });
        var reply = await global._companionChat([
            { role: 'system', content:
                'You are a Digital Humanities corpus analyst specialising in topic modelling. ' +
                'Each topic below is a set of co-occurring terms. ' +
                'For each topic produce a concise thematic label (2-5 words), a confidence ' +
                'score 0-100, and a one-sentence interpretive note. ' +
                'Return ONLY a valid JSON array (no markdown fences):\n' +
                '[{"topicIndex":0,"label":"...","confidence":85,"note":"..."}, ...]' },
            { role: 'user', content: 'Label these topics:\n\n' + topicList.join('\n') }
        ], Object.assign({ maxTokens: 900, temperature: 0.3 }, opts));
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'analyseTopics', input: topicList, reply: reply });
        try {
            return JSON.parse(stripFences(reply));
        } catch (e) {
            return [{ topicIndex: 0, label: 'Parse error', confidence: 0, note: reply.slice(0, 300) }];
        }
    };

    global.analyseTrends = async function analyseTrends(trendsData, opts) {
        opts = opts || {};
        var context = opts.context || 'a literary corpus';
        var lines = (trendsData || []).map(function (t) {
            var term, freqs;
            if (Array.isArray(t)) {
                term = t[0];
                freqs = t.slice(1);
            } else {
                term = t.term || t.word || String(t);
                freqs = Array.isArray(t.frequencies) ? t.frequencies :
                        Array.isArray(t.rawFreqs)    ? t.rawFreqs    : [];
            }
            return '"' + term + '": [' +
                freqs.map(function (f) { return Math.round(f * 1000) / 1000; }).join(', ') + ']';
        });
        var reply = await global._companionChat([
            { role: 'system', content:
                'You are a Digital Humanities scholar analysing term frequency trends in ' +
                context + '. Data shows frequencies across documents/bins ' +
                '(left = earliest, right = latest). Write 2-3 analytical paragraphs: ' +
                'identify which terms rise, fall, peak, or shift; explain what this ' +
                'signals about discourse or genre in the corpus. Be specific — cite data.' },
            { role: 'user', content: 'Interpret these term frequency trends:\n\n' + lines.join('\n') }
        ], Object.assign({ maxTokens: 700, temperature: 0.5 }, opts));
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'analyseTrends', reply: reply });
        return reply;
    };

    global.buildCategory = async function buildCategory(opts) {
        opts = opts || {};
        var theme = opts.theme || 'theme';
        var seed = (opts.seed || []).slice(0, 10);
        var maxTerms = opts.maxTerms || 20;
        var collocateHint = '';
        if (opts.corpus && typeof opts.corpus.collocates === 'function') {
            try {
                var colls = await opts.corpus.collocates({ query: seed.join('|'), limit: 30 });
                // Trombone rows: 'term' is the QUERY word; the collocate is 'contextTerm'
                var collTerms = (colls || []).slice(0, 20)
                    .map(function (c) { return c.contextTerm || (typeof c === 'string' ? c : ''); })
                    .filter(Boolean);
                if (collTerms.length) {
                    collocateHint = '\n\nTerms that collocate with the seed words in this corpus:\n' +
                        collTerms.join(', ');
                }
            } catch (e) { /* corpus not ready — continue without collocates */ }
        }
        var reply = await global._companionChat([
            { role: 'system', content:
                'You are a Digital Humanities scholar building thematic word categories for ' +
                'corpus text analysis. Expand the seed terms into a comprehensive category. ' +
                'Include: synonyms, near-synonyms, morphological variants, culturally specific ' +
                'terms, and related concepts. Avoid stopwords. ' +
                'Return ONLY a JSON object (no markdown fences):\n' +
                '{"theme":"...","terms":["term1","term2",...],' +
                '"rationale":"one sentence explaining the category"}\n' +
                'Target ' + maxTerms + ' terms.' },
            { role: 'user', content: 'Theme: ' + theme + '\nSeed terms: ' + seed.join(', ') + collocateHint }
        ], { maxTokens: 500, temperature: 0.4 });
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'buildCategory', theme: theme, reply: reply });
        try {
            return JSON.parse(stripFences(reply));
        } catch (e) {
            return { theme: theme, terms: seed, rationale: 'Parse error — raw: ' + reply.slice(0, 100) };
        }
    };

    global.sparql = async function sparql(question, opts) {
        var reply = await global._companionChat([
            { role: 'system', content:
                'You are a Wikidata SPARQL expert. Write a correct, executable SPARQL query ' +
                'for the Wikidata endpoint (https://query.wikidata.org/sparql). ' +
                'Use standard prefixes: wd: wdt: wikibase: rdfs: bd: p: ps: pq: xsd: ' +
                'Include SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } ' +
                'for human-readable labels. Add LIMIT 50 unless otherwise implied. ' +
                'Return ONLY the SPARQL query — no explanation, no markdown.' },
            { role: 'user', content: String(question) }
        ], Object.assign({ maxTokens: 600, temperature: 0.2 }, opts));
        var query = stripFences(reply);
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'sparql', question: question, query: query });
        return query;
    };

    global.extractEntities = async function extractEntities(textOrCorpus, entityTypes, opts) {
        var text = textOrCorpus;
        if (textOrCorpus && typeof textOrCorpus !== 'string') {
            var c = (typeof textOrCorpus.then === 'function') ? await textOrCorpus : textOrCorpus;
            text = (typeof c.text === 'function')
                ? await c.text({ noMarkup: true, compactSpace: true, limit: 6000 })
                : String(c);
        }
        text = String(text).slice(0, 6000);
        var types = Array.isArray(entityTypes) ? entityTypes : ['person', 'place', 'organization'];
        var reply = await global._companionChat([
            { role: 'system', content:
                'You are a Named Entity Recognition expert. Extract entities of the specified types. ' +
                'Return ONLY a JSON array (no markdown):\n' +
                '[{"text":"...","type":"...","context":"surrounding phrase"}, ...]' },
            { role: 'user', content: 'Types: ' + types.join(', ') + '\n\nText:\n' + text }
        ], Object.assign({ maxTokens: 900, temperature: 0.2 }, opts));
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'extractEntities', reply: reply });
        try { return JSON.parse(stripFences(reply)); } catch (e) { return []; }
    };

    global.classify = async function classify(texts, categories, opts) {
        var catList = Array.isArray(categories) ? categories.join(', ') : String(categories);
        var reply = await global._companionChat([
            { role: 'system', content:
                'You are a precise text classifier. Classify each text into exactly one of the ' +
                'given categories. Return ONLY a JSON array with one object per text: ' +
                '[{"category":"...","confidence":0.0,"reasoning":"one sentence"}]. ' +
                'No markdown, no extra text.' },
            { role: 'user', content: 'Categories: ' + catList + '\n\nTexts:\n' + JSON.stringify(texts) }
        ], Object.assign({ maxTokens: 800, temperature: 0.2 }, opts));
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'classify', categories: catList, reply: reply });
        try { return JSON.parse(stripFences(reply)); } catch (e) { return reply; }
    };

    var COMPANION_TEMPLATES = {
        summarise: {
            system: 'You are a precise academic summariser. Produce: (1) a one-paragraph ' +
                    'summary, (2) five key points as bullet points. Be factual and concise.',
            user:   'Summarise the following text:\n\n{{text}}'
        },
        themes: {
            system: 'You are a literary and cultural scholar. Identify major themes, motifs, ' +
                    'and symbols. For each, provide a name, a one-paragraph explanation, ' +
                    'and one textual example.',
            user:   'Identify the main themes in:\n\n{{text}}'
        },
        classify: {
            system: 'You are a text classifier. Classify the text into one of the provided ' +
                    'categories. Return ONLY JSON: {"category":"...","confidence":0.0,"reasoning":"..."}',
            user:   'Categories: {{categories}}\n\nText:\n{{text}}'
        },
        periodize: {
            system: 'You are a literary historian. Identify which literary period the text ' +
                    'belongs to. Justify with stylistic, thematic, and historical evidence.',
            user:   'Which literary period does this text belong to and why?\n\n{{text}}'
        },
        argue: {
            system: 'You are an academic writing assistant. Generate a single focused thesis ' +
                    'sentence for a scholarly argument about the given text.',
            user:   'Write a thesis sentence about:\n\n{{text}}'
        },
        counterargue: {
            system: 'You are a critical academic. Generate a counter-thesis that challenges ' +
                    'the dominant reading of the text. Be intellectually provocative.',
            user:   'Write a counter-argument to the obvious reading of:\n\n{{text}}'
        },
        annotate: {
            system: 'You are a scholarly annotator focusing on {{focus}}. Identify significant ' +
                    'moments, ideological patterns, stylistic choices, and interpretive tensions.',
            user:   'Annotate this text, focusing on {{focus}}:\n\n{{text}}'
        },
        sentiment: {
            system: 'You are a sentiment analyst. Return ONLY JSON:\n' +
                    '{"sentiment":"positive|negative|neutral|mixed","intensity":0.0,' +
                    '"dominant_emotions":["..."],"evidence":"..."}',
            user:   'Analyse the sentiment of:\n\n{{text}}'
        },
        translate: {
            system: 'You are an expert translator. Translate to {{target_language}}. ' +
                    'Preserve style, register, and cultural nuance. Return only the translation.',
            user:   'Translate to {{target_language}}:\n\n{{text}}'
        },
        sparql_explain: {
            system: 'You are a SPARQL and Wikidata educator. Explain the query in plain English ' +
                    'for a Digital Humanities researcher with no programming background.',
            user:   'Explain what this SPARQL query does:\n\n{{query}}'
        }
    };

    global.llmPrompt = async function llmPrompt(templateName, vars, opts) {
        var tpl = COMPANION_TEMPLATES[templateName];
        if (!tpl) {
            throw new Error('Unknown template: "' + templateName + '". Available: ' +
                Object.keys(COMPANION_TEMPLATES).join(', '));
        }
        vars = vars || {};
        function fill(str) {
            return str.replace(/\{\{(\w+)\}\}/g, function (_, k) {
                return vars[k] !== undefined ? String(vars[k]) : '';
            });
        }
        var reply = await global._companionChat([
            { role: 'system', content: fill(tpl.system) },
            { role: 'user',   content: fill(tpl.user) }
        ], opts);
        global._companionLog.push({ timestamp: new Date().toISOString(),
            fn: 'prompt', template: templateName, reply: reply });
        return reply;
    };
    // Notebook-facing alias — shadows window.prompt inside the sandbox iframe only.
    // The browser dialog stays available as nativePrompt().
    if (!global.nativePrompt) { global.nativePrompt = global.prompt.bind(global); }
    global.prompt = global.llmPrompt;

    function LLMCompanion(opts) {
        this.opts = opts || {};
        this.log = [];
        this._history = [];
    }

    LLMCompanion.prototype.chat = function (message, opts) {
        var self = this;
        var sysMsg = (opts && opts.system) || this.opts.system ||
            'You are a careful and knowledgeable Digital Humanities research assistant. ' +
            'Interpret patterns analytically, cite evidence, and suggest next steps.';
        this._history.push({ role: 'user', content: String(message) });
        var messages = [{ role: 'system', content: sysMsg }].concat(this._history);
        return global._companionChat(messages, Object.assign({}, this.opts, opts)).then(function (reply) {
            self._history.push({ role: 'assistant', content: reply });
            var entry = { timestamp: new Date().toISOString(), message: String(message), reply: reply };
            self.log.push(entry);
            global._companionLog.push(entry);
            return reply;
        });
    };

    LLMCompanion.prototype.explain         = function (q, opts) { return this.chat(q, opts); };
    LLMCompanion.prototype.analyseTopics   = function () { return global.analyseTopics.apply(null, arguments); };
    LLMCompanion.prototype.analyseTrends   = function () { return global.analyseTrends.apply(null, arguments); };
    LLMCompanion.prototype.buildCategory   = function () { return global.buildCategory.apply(null, arguments); };
    LLMCompanion.prototype.sparql          = function () { return global.sparql.apply(null, arguments); };
    LLMCompanion.prototype.extractEntities = function () { return global.extractEntities.apply(null, arguments); };
    LLMCompanion.prototype.classify        = function () { return global.classify.apply(null, arguments); };
    LLMCompanion.prototype.prompt          = function () { return global.llmPrompt.apply(null, arguments); };
    LLMCompanion.prototype.configure       = function (cfg) { global._configureProvider(cfg); return this; };
    LLMCompanion.prototype.clearHistory    = function () { this._history = []; };
    LLMCompanion.prototype.downloadLog     = function () { global.downloadLog(); };

    global.LLMCompanion = LLMCompanion;
    global.llm = new LLMCompanion();
    // llmChat is defined earlier in this file (stateless, matches the portable
    // layer) — not redefined here as a singleton wrapper, so notebooks get the
    // same single-turn behavior on both layers.
    // Legacy idiom support: older tutorials run
    //   (document.__llmCompanion ? Promise.resolve() : import(...)).then(function () {
    //       window.llm = document.__llmCompanion; ... })
    // Pointing __llmCompanion at the built-in instance makes both halves work:
    // the import is skipped and the assignment restores the real llm.
    if (global.document) { global.document.__llmCompanion = global.llm; }

    global.__llmCompanionLoaded = true;
    global.getLLMCompanion = function (config) {
        if (config) { global._configureProvider(config); }
        return Promise.resolve(global.llm);
    };

    // Kept for compatibility with older notebooks; .llm now comes from the prototype
    global.makeLLMCorpus = function (c) { return c; };

    global.showModelSelector = function () {
        var providers = [
            { key: 'openai', label: 'OpenAI (requires API key)',
              models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
            { key: 'anthropic', label: 'Anthropic Claude (requires API key)',
              models: ['claude-opus-4-8', 'claude-sonnet-5', 'claude-sonnet-4-6', 'claude-haiku-4-5'] },
            { key: 'gemini', label: 'Google Gemini (requires API key)',
              models: ['gemini-3.5-flash'] },
            { key: 'ollama', label: 'Ollama (local install)',
              models: ['llama3', 'llama3.2', 'mistral', 'gemma3', 'phi3', 'qwen2.5'] },
            { key: 'custom', label: 'Custom OpenAI-compatible endpoint', models: [] }
        ];

        var html = [
            '<div style="font-family:sans-serif;font-size:13px;max-width:520px;',
            '     background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">',
            '<strong style="color:#1d4ed8;">LLM Provider / Model Selector</strong>',
            '<table style="width:100%;margin-top:10px;border-collapse:collapse;">',
            '<tr>',
            '<td style="padding:6px 8px;font-weight:bold;">Provider</td>',
            '<td><select id="llm-sel-provider" style="width:100%;padding:4px;border-radius:4px;">'
        ];
        providers.forEach(function (p) {
            var sel = (global._llmCfg && global._llmCfg.provider === p.key) ? ' selected' : '';
            html.push('<option value="' + p.key + '"' + sel + '>' + p.label + '</option>');
        });
        html.push('</select></td></tr>');
        html.push('<tr><td style="padding:6px 8px;font-weight:bold;">Model</td>',
            '<td><select id="llm-sel-model" style="width:100%;padding:4px;border-radius:4px;"></select></td></tr>');
        html.push('<tr id="llm-sel-key-row" style="display:none;">',
            '<td style="padding:6px 8px;font-weight:bold;">API Key</td>',
            '<td><input id="llm-sel-apikey" type="password" placeholder="sk-..." ',
            '     style="width:100%;padding:4px;border-radius:4px;box-sizing:border-box;" /></td></tr>');
        html.push('<tr id="llm-sel-url-row" style="display:none;">',
            '<td style="padding:6px 8px;font-weight:bold;">Base URL</td>',
            '<td><input id="llm-sel-baseurl" type="text" placeholder="https://..." ',
            '     style="width:100%;padding:4px;border-radius:4px;box-sizing:border-box;" /></td></tr>');
        html.push('</table>',
            '<button id="llm-sel-apply" style="margin-top:12px;padding:6px 18px;',
            '  background:#1d4ed8;color:#fff;border:none;border-radius:6px;cursor:pointer;',
            '  font-size:13px;">Apply</button>',
            '<span id="llm-sel-status" style="margin-left:12px;font-size:12px;color:#6b7280;"></span>',
            '</div>');

        Spyral.Util.show(html.join(''));

        var provSel  = document.getElementById('llm-sel-provider');
        var modSel   = document.getElementById('llm-sel-model');
        var keyRow   = document.getElementById('llm-sel-key-row');
        var urlRow   = document.getElementById('llm-sel-url-row');
        var keyInput = document.getElementById('llm-sel-apikey');
        var urlInput = document.getElementById('llm-sel-baseurl');
        var applyBtn = document.getElementById('llm-sel-apply');
        var statusEl = document.getElementById('llm-sel-status');

        function updateModelList() {
            var pk = provSel.value;
            var p = providers.filter(function (x) { return x.key === pk; })[0];
            var curModel = global._llmCfg ? global._llmCfg.model : null;
            modSel.innerHTML = '';
            var mlist = (p && p.models.length) ? p.models : ['(enter model name below)'];
            mlist.forEach(function (m) {
                var opt = document.createElement('option');
                opt.value = m; opt.textContent = m;
                if (m === curModel) { opt.selected = true; }
                modSel.appendChild(opt);
            });
            if (pk === 'custom') {
                modSel.innerHTML = '<option value="">(enter in custom URL)</option>';
            }
            keyRow.style.display = (['openai', 'anthropic', 'gemini', 'custom'].indexOf(pk) !== -1) ? '' : 'none';
            urlRow.style.display = (pk === 'custom' || pk === 'ollama') ? '' : 'none';
        }

        provSel.addEventListener('change', updateModelList);
        updateModelList();

        applyBtn.addEventListener('click', function () {
            var cfg = { provider: provSel.value, model: modSel.value || null };
            if (keyInput.value) { cfg.apiKey = keyInput.value; }
            if (urlInput.value) { cfg.baseUrl = urlInput.value; }
            try {
                global._configureProvider(cfg);
                statusEl.textContent = '✓ Set to ' + cfg.provider +
                    (cfg.model ? ' / ' + cfg.model : '') + ' — applies to all cells';
                statusEl.style.color = '#16a34a';
            } catch (e) {
                statusEl.textContent = '✗ ' + e.message;
                statusEl.style.color = '#dc2626';
            }
        });
    };

    // ── corpus.llm — every Spyral.Corpus instance in every cell gets this ────
    if (global.Spyral && global.Spyral.Corpus && global.Spyral.Corpus.prototype &&
        !Object.getOwnPropertyDescriptor(global.Spyral.Corpus.prototype, 'llm')) {
        Object.defineProperty(global.Spyral.Corpus.prototype, 'llm', {
            get: function () {
                var corpus = this;
                return {
                    explain: function (question, opts) {
                        return corpus.terms({ stopList: 'auto', limit: 40 })
                            .then(function (terms) {
                                var tw = terms.map(function (t) {
                                    return t.term + ' (' + t.rawFreq + ')';
                                }).join(', ');
                                var sys = 'You are a Digital Humanities corpus analyst. ' +
                                    'The corpus contains these top terms (with raw counts): ' +
                                    tw + '. Answer only based on evidence from these terms.';
                                if (opts && opts.strict) {
                                    sys += ' STRICT MODE: treat the term list as anonymous data. Do NOT attempt to identify the work, author, or characters, and do NOT use outside knowledge about any text this might be. Every claim must be derivable from the term frequencies alone; frequencies cannot show co-occurrence, so make no co-occurrence claims.';
                                }
                                return global._companionChat([
                                    { role: 'system', content: sys },
                                    { role: 'user', content: String(question) }
                                ], opts).then(function (reply) {
                                    global._companionLog.push({
                                        timestamp: new Date().toISOString(),
                                        fn: 'corpus.llm.explain', question: String(question), reply: reply });
                                    return reply;
                                });
                            });
                    },
                    topics: function (opts) {
                        opts = opts || {};
                        var limit = opts.limit || 5;
                        return corpus.terms({ stopList: 'auto', limit: limit })
                            .then(function (terms) {
                                var seeds = terms.map(function (t) { return t.term; });
                                return Promise.all(seeds.map(function (seed) {
                                    return corpus.collocates({ query: seed, limit: 8 })
                                        .then(function (colls) {
                                            // 'term' is the seed itself; the collocate is 'contextTerm'
                                            return colls.map(function (x) { return x.contextTerm; })
                                                .filter(Boolean);
                                        });
                                }));
                            })
                            .then(function (clusters) {
                                return global.analyseTopics(clusters, opts);
                            });
                    },
                    trends: function (termList, opts) {
                        if (!Array.isArray(termList) || !termList.length) {
                            return Promise.reject(new Error('corpus.llm.trends() needs a term array'));
                        }
                        // Multi-document corpus: bins run across documents (e.g. across
                        // the 37 plays). Single document: that yields one value and
                        // structural zeros, so switch to within-document bins (docIndex).
                        return corpus.metadata().then(function (md) {
                            var single = md && md.documentsCount === 1;
                            var params = { withDistributions: true, limit: 1 };
                            if (single) { params.docIndex = 0; params.bins = 10; }
                            var promises = termList.map(function (term) {
                                var p = Object.assign({ query: term }, params);
                                return corpus.terms(p).then(function (rows) {
                                    if (!rows || !rows.length) { return null; }
                                    return { term: term, rawFreqs: rows[0].distributions || [] };
                                });
                            });
                            return Promise.all(promises).then(function (rows) {
                                return global.analyseTrends(rows.filter(Boolean), opts);
                            });
                        });
                    },
                    entities: function (opts) {
                        opts = opts || {};
                        return global.extractEntities(corpus, opts.types, opts);
                    },
                    category: function (theme, seeds, opts) {
                        return global.buildCategory(
                            Object.assign({ theme: theme, seed: seeds, corpus: corpus }, opts || {}));
                    },
                    configure: function (cfg) {
                        global._configureProvider(cfg);
                        return this;
                    },
                    select: function () {
                        global.showModelSelector();
                    }
                };
            },
            configurable: true
        });
    }
})(window);
