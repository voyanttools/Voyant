function BubblelinesD3(config) {
	this.container = config.container;
	this.externalClickHandler = config.clickHandler;
	
	this.INTERVAL = 50; // milliseconds between each redraw
	this.DISMISS_DELAY = 2500; // milliseconds before tooltip auto hides
	this.UNIFORM_LINE_LENGTH = true; // should all document lines be the same length?
	this.SEPARATE_LINES_FOR_TERMS = false; // draw a separate line for each term?
	
	// these 2 get set in the code
	this.MAX_LABEL_WIDTH = 0;
	this.MAX_LINE_WIDTH = 0;
	
	this.DRAW_TITLES = true; // where to draw the document titles for each graph; gets set to false if the corpus has only 1 document
	this.DRAW_SHORT_TITLES = false; // whether to use the docIndex for the title or not; gets set to true if the window is small enough
	
	this.MIN_GRAPH_SEPARATION = 50; // vertical separation between graphs
	this.graphSeparation = 50;

	this.margin = 20;
	
	this.yIndex = 0; // for tracking yIndex during the drawing process
	
	this.mouseOver = false; // is the mouse over the canvas
	this.intervalId = null;
	this.clearToolTipId = null;
	this.overBubbles = [];
	this.lastClickedBubbles = {};
	this.dragInfo = null;
	this.canvas = null;
	this.ctx = null;
	this.maxDocLength = 2;
	this.maxFreq = {term: null, value: 0};
	this.maxRadius = 0;
	
	/**
	 * The cache of docs. Each has the following properties:
	 * @param {String} id
	 * @param {String} title
	 * @param {Integer} index
	 * @param {Integer} totalTokens
	 * @param {Object} terms Stores the terms for this doc
	 * @param {Object} freqCounts Used for tool tip display
	 * @param {Float} height The height of the graph for this doc
	 * @param {Float} titleWidth The width of the title
	 * @param {Float} lineLength The length of the graph line for this doc
	 */
	this.cache = new Ext.util.MixedCollection();
	
	this.currentTerms = {}; // tracks what terms we're currently showing
	this.termsFilter = []; // tracks the subset of terms
	this.bubbleSpacing = 50;

	this.initialized = false;
}

BubblelinesD3.prototype = {
	constructor: BubblelinesD3,
	
	initializeCanvas: function() {
		var container = this.container;
		var height = container.getHeight();
		var width = container.getWidth();
		this.DRAW_SHORT_TITLES = width < 500;
		this.canvasId = Ext.id('bubblelines');
		container.add({
			xtype: 'container',
			width: width,
			height: height,
			html: '<svg width="'+width+'" height="'+height+'"><g id="'+this.canvasId+'" transform="translate('+this.margin+', '+this.margin+')"></g></svg>',
			border: false,
        	listeners: {
        		afterrender: {
        			fn: function(cnt) {
        			},
        			single: true,
        			scope: this
        		}
        	}
		});
		container.updateLayout();
		this.initialized = true;
	},
	
	doBubblelinesLayout: function() {
		if (this.initialized) {
			var width = this.container.getWidth();
			
			// width related calculations
			this.DRAW_SHORT_TITLES = width < 500;
			
			var children = Ext.DomQuery.jsSelect('div:not(div[class*=term])', this.container.el.dom);
			for (var i = 0; i < children.length; i++) {
				var child = Ext.fly(children[i]);
				child.setWidth(width);
			}
			
			this.recache();
			
			// height related calculations
			this.setCanvasHeight();
			
			this.drawGraph();
		}
	},
	
	addDocToCache: function(doc) {
		this.cacheBubbles(doc);
		this.calculateBubbleRadii(doc);
		doc.lineLength = 600;
		doc.freqCounts = {}; // used for tool tip display
		if (this.cache.containsKey(doc.id) === false) {
			this.cache.add(doc);
		} else {
			this.cache.replace(doc.id, doc);
		}
		this.cache.sort('index', 'ASC');
	},
	
	addTermToDoc: function(termData, docId) {
		this.currentTerms[termData.term] = true;
		
		var doc = this.cache.get(docId);
		doc.terms.push(termData);
		var maxFreqChanged = this.cacheBubbles(doc);
		if (maxFreqChanged) {
			this.recache();
		} else {
			this.calculateBubbleRadii(doc);
		}
	},
	
	cacheBubbles: function(doc) {
		var maxFreqChanged = false;
		doc.terms.forEach(function(termInfo) {
			var bins = termInfo.distributions.length;
			
			var cachedPositions = [];
			var tokenPos = 0;
			var maxDistribution = 0;
			for (var i = 0; i < bins; i++) {
				var d = termInfo.distributions[i];
				if (d > maxDistribution) {
					maxDistribution = d;
				}
				
				cachedPositions.push({docId: doc.id, term: termInfo.term, freq: d, radius: 0, bin: i, tokenPositions: termInfo.positions.slice(tokenPos, tokenPos+=d)});
			}
			
			termInfo.docId = doc.id;
			termInfo.maxDistribution = maxDistribution;
			termInfo.pos = cachedPositions;
			
			if (maxDistribution > this.maxFreq.value) {
				maxFreqChanged = true;
				this.setMaxFreq({term: termInfo.term, value: maxDistribution});
			}
		}.bind(this));
		return maxFreqChanged;
	},
	
	calculateBubbleRadii: function(doc, newTerm) {
		var maxFreqLog = Math.log(this.maxFreq.value);
		var minFreq = Math.log(2) / 2;
		doc.terms.forEach(function(docTerm) {
			var t = docTerm.term;
			if (docTerm) {
				if (newTerm == null || t == newTerm) {
					for (var i = 0; i < docTerm.pos.length; i++) {
						var bubble = docTerm.pos[i];
						if (bubble.freq > 0) {
							var freqLog = Math.max(Math.log(bubble.freq), minFreq);
							var radius = freqLog / maxFreqLog * this.maxRadius;
							bubble.radius = radius;
						} else {
							bubble.radius = 0;
						}
					}
				}
			}
		}.bind(this));
	},
	
	
	recache: function() {
		function doCache(doc) {
			this.cacheBubbles(doc);
			this.calculateBubbleRadii(doc);
		}
		
		this.cache.each(doCache, this);
	},
	
	/**
	 * Get the total height of the all the graphs
	 */
	getTotalHeight: function() {
		var totalHeight = this.maxRadius;
		this.cache.each(function(doc, index, length) {
			totalHeight += doc.height;
		}, this);
		return totalHeight;
	},
	

	/**
	 * Set the height for the canvas and associated elements
	 */
	setCanvasHeight: function() {
		this.calculateGraphHeights();
		var height = this.getTotalHeight();
		var container = this.container.dom;
		if (container !== undefined) {
			var children = Ext.DomQuery.jsSelect('div', container);
			for (var i = 0; i < children.length; i++) {
				var child = Ext.fly(children[i]);
				child.setHeight(height);
			}
		}
	},
	
	/**
	 * Calculate graph heights, based on maxRadius
	 */
	calculateGraphHeights: function() {
		var graphSeparation = this.maxRadius * 0.5;
		if (this.SEPARATE_LINES_FOR_TERMS) {
			var terms = this.termsFilter;
			this.cache.each(function(doc, index, length) {
				var height = this.maxRadius * terms.length;
				for (var i = 0; i < terms.length; i++) {
					if (!doc.terms[terms[i]]) {
						height -= this.maxRadius;
					}
				}
				if (height == 0) height = this.maxRadius;
				
				doc.height = height + graphSeparation;
			}, this);
		} else {
			var height = Math.max(this.maxRadius, this.MIN_GRAPH_SEPARATION);
			this.cache.each(function(doc, index, length) {
				doc.height = height + graphSeparation;
			}, this);
		}
	},
	
	drawGraph: function(includeLegend) {
		console.log('drawGraph');
		if (this.intervalId != null) clearInterval(this.intervalId);
		
		if (this.mouseOver) {
			this.intervalId = setInterval(this.doDraw.bind(this, [includeLegend]), this.INTERVAL);
		} else {
			setTimeout(this.doDraw.bind(this, [includeLegend]), 5);
		}
	},
	
	doDraw: function(includeLegend) {
		var svg = d3.select('#'+this.canvasId);
		var totalWidth = parseInt(svg.node().parentNode.getAttribute('width')) - this.margin*2;

		var cacheArray = [];
		this.cache.each(function(item) {
			if (item.hidden === false) cacheArray.push(item);
		})

		console.log('doDraw');

		// add the g.doc parent containers
		var docs = svg.selectAll('g.doc').data(cacheArray, function(d) { return d.id });
		docs.exit().remove();
		var docsEnter = docs.enter().append('g')
			.attr('class', 'doc')
			.attr('id', function(d) { return 'doc_'+d.id; });

		// add doc titles and then measure them
		docsEnter.append('text')
			.attr('class', 'docTitle')
			.text(function(d) { return d.title });
		
		var maxTitleWidth = 0;
		d3.selectAll('text.docTitle').each(function(d) {
			maxTitleWidth = Math.max(this.getBBox().width, maxTitleWidth);
		});
		maxTitleWidth += this.maxRadius;

		// calculate other measurements
		var maxLineWidth = totalWidth - maxTitleWidth;

		var maxRadius = maxLineWidth / 30;
		var maxFreqLog = Math.log(this.maxFreq.value);
		var minFreq = Math.log(2) / 2;

		var maxDocLength = d3.max(cacheArray, function(doc) { return doc.totalTokens });

		// set the line length for each doc
		cacheArray.forEach(function(doc, index) {
			if (this.UNIFORM_LINE_LENGTH) {
				doc.lineLength = maxLineWidth;
			} else {
				var percentage = Math.log(doc.getTotalWordTokens()) / Math.log(maxDocLength);
				doc.lineLength = percentage * maxLineWidth;
			}
		}.bind(this));

		docsEnter.append('line')
			.attr('class', 'docLine')
			.attr('stroke', 'rgba(128,128,128,1')
			.attr('stroke-width', '0.25');

		docsEnter.merge(docs)
			.attr('transform', function(d, i) {
				return 'translate(0,'+(i*d.height)+')'
			})
			.selectAll('line')
				.attr('x1', maxTitleWidth).attr('y1', 0)
				.attr('x2', function(d) {
					return maxTitleWidth+d.lineLength
				}).attr('y2', 0);



		var termsParent = docs.selectAll('g.term').data(function(d) { return d.terms }, function(d) { return d.docId+'_'+d.term });
		termsParent.exit().remove();
		termsParent.enter().append('g')
			.attr('class', 'term')
			.merge(termsParent)
				.attr('transform', function(d) { return 'translate('+maxTitleWidth+',0)'})
		


		var termCircles = termsParent.selectAll('circle').data(function(d) { return d.pos }, function(d) { return d.docId+'_'+d.term+'_'+d.bin; });
		termCircles.exit().remove();
		termCircles.enter().append('circle')
			.attr('cy', 0)
			.attr('stroke-width', '0.25')
			.merge(termCircles)
				.attr('cx', function(d, i, all) {
					var lineLength = d3.select(this.parentNode.parentNode).datum().lineLength;
					return i/all.length * lineLength;
				})
				.attr('r', function(d) {
					if (d.freq > 0) {
						var freqLog = Math.max(Math.log(d.freq), minFreq);
						var radius = freqLog / maxFreqLog * maxRadius;
						return radius;
					} else {
						return 0;
					}
				})
				.attr('fill', function(d) {
					var color = d3.select(this.parentNode).datum().color;
					return 'rgba('+color.join(',')+',0.35)'
				})
				.attr('stroke', function(d) {
					var color = d3.select(this.parentNode).datum().color;
					return 'rgba('+color.join(',')+',1)'
				});
	},
	
	drawDocument: function(doc, index, totalDocs) {
		if (!doc.hidden) {
			var lineLength = doc.lineLength;
			var titleIndent = this.MAX_LABEL_WIDTH - doc.titleWidth;
			
			var xIndex = 5;
			
			this.ctx.textBaseline = 'top';
			this.ctx.font = 'bold 12px Verdana';
			
			if (this.dragInfo != null && this.dragInfo.oldIndex == index) {
				this.ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
				xIndex += titleIndent;
				this.ctx.fillText(doc.title, xIndex, this.yIndex);
				if (this.SEPARATE_LINES_FOR_TERMS) {
					this.yIndex += doc.height;
				}
			} else {			
				// draw label
				if (this.DRAW_TITLES) {
					xIndex += titleIndent;
	//				var c = this.getColor(this.getApplication().getCorpus().getDocument(doc.id).getIndex());
	//				this.ctx.strokeStyle = 'rgba('+c[0]+', '+c[1]+', '+c[2]+', 1.0)';
	//				this.ctx.lineWidth = 2;
	//				this.ctx.beginPath();
	//				this.ctx.moveTo(xIndex, this.yIndex+12);
	//				this.ctx.lineTo(this.MAX_LABEL_WIDTH, this.yIndex+12);
	//				this.ctx.stroke();
					
					this.ctx.fillStyle = 'rgba(128, 128, 128, 1.0)';
					var title = doc.title;
					if (this.DRAW_SHORT_TITLES) title = (index+1)+')';
					this.ctx.fillText(title, xIndex, this.yIndex);
				}
				
	//			this.ctx.fillStyle = 'rgba(0, 0, 128, 1.0)';
	//			this.ctx.fillRect(0, this.yIndex-this.maxRadius*0.75, 250, 2);
				
				// shift down slightly to vertically align line and bubbles with label
				this.yIndex += 4;
				
				// draw line
				var that = this;
				function drawLine() {
					xIndex = that.MAX_LABEL_WIDTH + that.maxRadius;
					that.ctx.strokeStyle = 'rgba(128, 128, 128, 1.0)';
					that.ctx.fillStyle = 'rgba(128, 128, 128, 1.0)';
					that.ctx.lineWidth = 0.25;
					
					that.ctx.beginPath();
					that.ctx.moveTo(xIndex, that.yIndex-6);
					that.ctx.lineTo(xIndex, that.yIndex+6);
					that.ctx.stroke();
					
					that.ctx.beginPath();
					that.ctx.moveTo(xIndex, that.yIndex);
					that.ctx.lineTo(xIndex + lineLength, that.yIndex);
					that.ctx.stroke();
					
					that.ctx.beginPath();
					that.ctx.moveTo(xIndex + lineLength, that.yIndex-6);
					that.ctx.lineTo(xIndex + lineLength, that.yIndex+6);
					that.ctx.stroke();
				}
				
	//			var filter = this.getApiParamValue('typeFilter');
	//			var filter = [];
	//			for (var term in this.currentTerms) {
	//				filter.push(term);
	//			}
				
				if (!this.SEPARATE_LINES_FOR_TERMS) {
					drawLine();
				} else if (this.termsFilter == null || this.termsFilter.length === 0) {
					drawLine();
				}
				
				// draw bubbles
				var pi2 = Math.PI * 2;
				
				var freqTotal = 0;
				doc.freqCounts = {};
				var terms = doc.terms;
				var checkClickedBubbles = this.lastClickedBubbles[index] != null;
				var termsDrawn = 0;
				for (var t in terms) {
					if (this.termsFilter.indexOf(t) !== -1) {
						var info = terms[t];
						if (info) {
							termsDrawn++;
							if (this.SEPARATE_LINES_FOR_TERMS) {
								drawLine();
							}
							
							var freqForType = 0;
							
							var c = info.color.join(',');
							this.ctx.strokeStyle = 'rgba('+c+', 1)';
							this.ctx.fillStyle = 'rgba('+c+', 0.35)';
							this.ctx.lineWidth = 0.25;
							
							freqTotal += info.rawFreq;
							freqForType += info.rawFreq;
							
							var checkCurrentType = checkClickedBubbles && this.lastClickedBubbles[index][t];
							
							for (var i = 0; i < info.pos.length; i++) {
								var b = info.pos[i];
								if (b.radius > 0) {
									var doClickedBubble = false;
									if (checkCurrentType && this.lastClickedBubbles[index][t] == b.id) {
										this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
										this.ctx.fillStyle = 'rgba('+c+', 0.5)';
										this.ctx.lineWidth = 1;
										doClickedBubble = true;
									}
									
									this.ctx.beginPath();
									this.ctx.arc(b.x+xIndex, this.yIndex, b.radius, 0, pi2, true);
									this.ctx.closePath();
									this.ctx.fill();
									this.ctx.stroke();
									
									if (doClickedBubble) {
										this.ctx.strokeStyle = 'rgba('+c+', 1)';
										this.ctx.fillStyle = 'rgba('+c+', 0.35)';
										this.ctx.lineWidth = 0.25;
									}
								}
							}
							doc.freqCounts[t] = freqForType;
							
							if (this.SEPARATE_LINES_FOR_TERMS) {
								this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
								this.ctx.font = '10px Verdana';
								this.ctx.fillText(freqForType, xIndex + lineLength + 5, this.yIndex-4);
								
								this.yIndex += this.maxRadius;
							}
						}
					}
				}
				
				if (this.SEPARATE_LINES_FOR_TERMS && termsDrawn == 0) {
					drawLine();
					
					this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
					this.ctx.font = '10px Verdana';
					this.ctx.fillText(0, xIndex + lineLength + 5, this.yIndex-4);
					
					this.yIndex += this.maxRadius;
				}
				
				xIndex += lineLength;
				
				if (!this.SEPARATE_LINES_FOR_TERMS) {
					this.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
					this.ctx.font = '10px Verdana';
					this.ctx.fillText(freqTotal, xIndex + 5, this.yIndex-4);
				}
			}
			
			if (!this.SEPARATE_LINES_FOR_TERMS) {
				this.yIndex += doc.height;
			} else {
				this.yIndex += this.maxRadius * 0.5;
			}
			
			// undo previous shift
			this.yIndex -= 4;
			
	//		this.ctx.fillStyle = 'rgba(128, 0, 0, 1.0)';
	//		this.ctx.fillRect(0, this.yIndex-this.maxRadius*0.75, 350, 2);
		}
	},
	
	drawLegend: function() { // obsolete code?
		var x = this.MAX_LABEL_WIDTH + this.maxRadius;
		var y = 5;
		this.ctx.textBaseline = 'top';
		this.ctx.font = '16px serif';
		if (this.typeStore) {
			this.typeStore.each(function(record) {
				var color = record.get('color').join(',');
				this.ctx.fillStyle = 'rgb('+color+')';
				var type = record.get('type');
				this.ctx.fillText(type, x, y);
				var width = this.ctx.measureText(type).width;
				x += width + 8;
			}, this);
		}
	},
	
	drawToolTip: function() {
		if (this.overBubbles.length > 0) {
			this.ctx.lineWidth = 0.5;
			this.ctx.fillStyle = 'rgba(224, 224, 224, 0.8)';
			this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
			
			var x = this.overBubbles[0].x;
			var y = this.overBubbles[0].y;
			var width = 110;
			if (x + width > this.canvas.width) {
				x -= width;
			}
			var height;
			var summary = this.overBubbles[0].label == null;
			if (summary) {
				var doc = this.cache.get(this.overBubbles[0].docIndex);
				var count = 1;
				for (var t in doc.freqCounts) {
					count++;
				}
				height = count * 16;// + 10;
				if (y + height > this.canvas.height) {
					y -= height;
				}
				this.ctx.fillRect(x, y, width, height);
				this.ctx.strokeRect(x, y, width, height);
				x += 10;
				y += 10;
				this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
				this.ctx.font = '10px Verdana';
//				var total = 0;
				for (var t in doc.freqCounts) {
					var freq = doc.freqCounts[t];
//					total += freq;
					this.ctx.fillText(t+': '+freq, x, y, 90);
					y += 16;
				}
//				this.ctx.fillText(this.localize('total')+': '+total, x, y, 90);
				
			} else {
				height = this.overBubbles.length * 16 + 10;
				if (y + height > this.canvas.height) {
					y -= height;
				}
				this.ctx.fillRect(x, y, width, height);
				this.ctx.strokeRect(x, y, width, height);
				x += 10;
				y += 10;
				this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
				this.ctx.font = '10px Verdana';
				for (var i = 0; i < this.overBubbles.length; i++) {
					var b = this.overBubbles[i];
					this.ctx.fillText(b.label+': '+b.freq, x, y, 90);
					y += 16;
				}
			}
			
			if (this.clearToolTipId == null) {
				this.clearToolTipId = setTimeout(this.clearToolTip.bind(this), this.DISMISS_DELAY);
			}
		}
	},
	
	clearToolTip: function() {
		this.overBubbles = [];
		clearTimeout(this.clearToolTipId);
		this.clearToolTipId = null;
	},
	
	clickHandler: function(event) {
		this.lastClickedBubbles = {};
		if (this.overBubbles.length > 0 && this.overBubbles[0].label) {
			var hits = [];
			var tokenPositions = [];
			var termData = [];
			for (var i = 0; i < this.overBubbles.length; i++) {
				var b = this.overBubbles[i];
				
				termData.push({term: b.label, docIndex: b.docIndex, docId: b.docId, tokenPositions: b.tokenPositions});
				
				if (this.lastClickedBubbles[b.docIndex] == null) {
					this.lastClickedBubbles[b.docIndex] = {};
				}
				this.lastClickedBubbles[b.docIndex][b.label] = b.id;
				hits.push(b.docId+':'+b.label);
				tokenPositions.push(b.tokenPositions);
			}
			tokenPositions = Ext.flatten(tokenPositions);
			tokenPositions.sort();
			
			if (this.externalClickHandler !== undefined) {
				this.externalClickHandler(termData);
			}
		}
		this.overBubbles = [];
	},
	
	setMaxFreq: function(maxObj) {
		if (maxObj == null) {
			maxObj = this.findMaxFreq();
		}
		this.maxFreq = maxObj;
	},
	
	findMaxFreq: function() {
		var max = {term: '', value: 0};
		this.cache.each(function(doc) {
			doc.terms.forEach(function(docTerm) {
				if (docTerm.maxDistribution > max.value) {
					max = {term: docTerm.term, value: docTerm.maxDistribution};
				}
			}.bind(this))
		}, this);
		return max;
	},
	
	getNewColor: function() {
		var color = null;
		for (var i = 0; i < this.colors.length; i++) {
			color = this.colors[i];
			var match = this.typeStore.findExact('color', color);
			if (match == -1) break;
			else color = null;
		}
		if (color == null) color = [128, 128, 128];
		return color;
	},
	
	removeAllTerms: function() {
		this.cache.each(function(doc) {
			doc.terms = {};
		}, this);
		this.currentTerms = {};
		this.termsFilter = [];
	},
	
	removeTerm: function(term) {
//		var types = this.store.query('type', type);
//		types.each(function(type) {
//			this.store.remove(type);
//		}, this);
		
		delete this.currentTerms[term];
		
//		var types = this.getApiParamValue('type');
//		types = types.remove(type);
//		this.setApiParams({type: types});
		
		var getNewMax = false;
		this.cache.each(function(doc) {
			doc.terms = doc.terms.filter(function(docTerm) {
				if (docTerm.term === term) {
					if (this.maxFreq.term === term) {
						this.maxFreq = {term: null, value: 0};
						getNewMax = true;
					}
					return false;
				} else {
					return true;
				}
			}.bind(this));
		}, this);
		
		for (var i in this.lastClickedBubbles) {
			var lcTypes = this.lastClickedBubbles[i];
			for (var lcType in lcTypes) {
				if (lcType == term) {
					delete this.lastClickedBubbles[i][lcType];
				}
			}
			
		}
		
		if (getNewMax) {
			this.setMaxFreq();
			this.cache.each(this.calculateBubbleRadii, this);
			this.drawGraph();
		}
	}
};