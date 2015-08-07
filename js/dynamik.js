/* -----------------------------------------------------
	Application class
------------------------------------------------------ */

var Dynamik = (function($) {

	/* -----------------------------------------------------
		Properties
	------------------------------------------------------ */
	
	var self;
	var canvas;
	var terminal;
	
	var nodes = [];
	
	var files, filesLoaded;

	/* -----------------------------------------------------
		Initializer
	------------------------------------------------------ */
	
	var init = function(ev) {
		var self = this;
		
		terminal = $('textarea#terminal');
		
		terminal.log = onTerminalLog;
		console.log('ready');
		
		canvas = Raphael("canvas", 640, 480);
		
		$('input#browse').bind('change', onFileSelect);
		$('input#save-svg').bind('click', onSaveSVG);
		
		$('div#drop-zone').bind('dragover', onZoneDragOver);
		$('div#drop-zone').bind('drop', onFileSelect);
		
		$( "#zoom" ).slider({
			orientation: "vertical",
			range: "min",
			min: 1,
			max: 100,
			value: 50,
			slide: onZoomChange
		});
		
		$( "#speed" ).slider({
			orientation: "horizontal",
			range: "min",
			min: 1,
			max: 100,
			value: 50,
			slide: onSpeedChange
		});
		
		$(window).bind('resize', onWindowResize).trigger('resize');
	}
	
	/* -----------------------------------------------------
		Methods
	------------------------------------------------------ */
	
	var getNodeById = function(id) {
		for (var i in nodes) {
			var node = nodes[i];
			if (node.id == id) {
				return node;
			}
		}
		
		return null;
	}
	
	var start = function() {
		drawFrame(0);
	}
	
	var drawFrame = function(frameId) {
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var frame = node.frames[frameId];
			
			var c = canvas.circle(frame.x + canvas.width / 2, frame.y + canvas.height / 2, frame.width / 2);
			
			c.attr({stroke:frame.borderColor, fill:frame.fillColor});
			
			// console.log(canvas.width);
		}
		/*
		angle = 0;
		while (angle < 360) {
			var color = Raphael.getColor();
			(function (t, c) {
				canvas.circle(320, 450, 20).attr({stroke: c, fill: c, transform: t, "fill-opacity": .4}).click(function () {
					s.animate({transform: t, stroke: c}, 2000, "bounce");
					}).mouseover(function () {
					this.animate({"fill-opacity": .75}, 500);
					}).mouseout(function () {
					this.animate({"fill-opacity": .4}, 500);
				});
			})("r" + angle + " 320 240", color);
			angle += 30;
		}
		
		Raphael.getColor.reset();
		
		var s = canvas.set();
		s.push(canvas.path("M320,240c-50,100,50,110,0,190").attr({fill: "none", "stroke-width": 2}));
		s.push(canvas.circle(320, 450, 20).attr({fill: "none", "stroke-width": 2}));
		s.push(canvas.circle(320, 240, 5).attr({fill: "none", "stroke-width": 10}));
		s.attr({stroke: Raphael.getColor()});
		*/
	}

	/* -----------------------------------------------------
		Events
	------------------------------------------------------ */
	
	var onTerminalLog = function(log) {
		terminal.text(terminal.text() + '\n' + log);
		terminal.scrollTop(terminal.get(0).scrollHeight);
	}

	/* -----------------------------------------------------
		UI Events
	------------------------------------------------------ */
	
	var onSpeedChange = function(ev, ui) {
		
	}
	
	var onZoomChange = function(ev, ui) {
		
	}
	
	var onSaveSVG = function(ev) {
		ev.preventDefault();
		
		$('form#loader #data').val($('#canvas').html());
		$('form#loader').trigger('submit');
	}
	
	var onZoneDragOver = function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		
		ev.originalEvent.dataTransfer.dropEffect = 'copy';
	}
	
	var onWindowResize = function(ev) {
		w = $(window).width();
		h = $(window).height();
		
		canvas.setSize(w,h);
	}

	/* -----------------------------------------------------
		File Events
	------------------------------------------------------ */
	
	var onFileSelect = function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		
		// Reset
		nodes = [];
		filesLoaded = 0;
		files = [];
		
		if (ev.originalEvent.dataTransfer.files) {
			files = ev.originalEvent.dataTransfer.files;
		} else if (ev.target.dataTransfer) {
			files = ev.target.files;
		}
		
		// files is a FileList of File objects. List some properties.
		var output = [];
		for (var i = 0, f; f = files[i]; i++) {
			output.push(
				escape(f.name) + ' ' + Math.round(f.size / 1024 * 100) / 100 + 'kb'
				
			);
			
			terminal.log(output.join('\n'));
			
			var reader = new FileReader();
			reader.onload = onFileRead;
			reader.readAsText(f);
		}
		
		// console.log(nodes);
	}
	
	var onFileRead = function(ev) {
		var result = ev.target.result;
		var lines = result.split('\n');
		
		// console.log('Parsing new file');
		
		for (var i in lines) {
			var row = lines[i].split(',');
			
			var nodeId = row[0];
			
			var frameFillColor = row[1];
			var frameBorderColor = row[2];
			var frameX = parseFloat(row[3]);
			var frameY = parseFloat(row[4]);
			var frameWidth = parseFloat(row[5]);
			var frameHeight = parseFloat(row[6]);
			
			frameFillColor = (frameFillColor.match(/^#/)) ? frameFillColor : stringToHex(frameFillColor);
			frameBorderColor = (frameBorderColor.match(/^#/)) ? frameBorderColor : stringToHex(frameBorderColor);
			
			var node = getNodeById(nodeId);
			
			if (!node) {
				// console.log('new frame');
				node = new Node(nodeId);
				nodes.push(node);
			}
			
			if (node.id == 'n7') {
				// console.log(frameX);
			}
			
			node.addFrame(frameFillColor, frameBorderColor, frameX, frameY, frameWidth, frameHeight);
		}
		
		filesLoaded++;
		
		if (filesLoaded >= files.length) {
			onNodesParsed();
		}
		
	}
	
	var onNodesParsed = function() {
		// console.log(nodes);
		
		start();
	}
	
	$(document).bind('ready', init);
	
})(jQuery);

/* -----------------------------------------------------
	Node class
------------------------------------------------------ */

var Node = function(id) {
	
	var self = this;
	
	this.id = id;
	this.frames = [];
	
	this.addFrame = function(frameFillColor, frameBorderColor, frameX, frameY, frameWidth, frameHeight) {
		var frame = new NodeFrame(frameFillColor, frameBorderColor, frameX, frameY, frameWidth, frameHeight);
		self.frames.push(frame);
	}
}

/* -----------------------------------------------------
	Node frame class
------------------------------------------------------ */

var NodeFrame = function(fillColor, borderColor, x, y, width, height) {
	
	this.fillColor = fillColor;
	this.borderColor = borderColor;
	this.x  = x;
	this.y = y;
	this.width = width;
	this.height = height;	
}