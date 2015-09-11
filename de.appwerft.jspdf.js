function sprintf( ) {
    // Return a formatted string  
    // 
    // version: 903.3016
    // discuss at: http://phpjs.org/functions/sprintf
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Ricardo F. Santos
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brettz9.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function(str, len, chr, leftJustify) {
        if (!chr) chr = ' ';
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) switch (flags.charAt(j)) {
            case ' ': positivePrefix = ' '; break;
            case '+': positivePrefix = '+'; break;
            case '-': leftJustify = true; break;
            case "'": customPadChar = flags.charAt(j+1); break;
            case '0': zeroPad = true; break;
            case '#': prefixBaseX = true; break;
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd': {
                number = parseInt(+value);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            }
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G': {
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            }
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
};

/** @preserve jsPDF ( ${buildDate} ${commitID} )
Copyright (c) 2010 James Hall, https://github.com/MrRio/jsPDF
Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
MIT license.
*/

/*
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */


/**
Creates new jsPDF document object instance
@class
@param orientation One of "portrait" or "landscape" (or shortcuts "p" (Default), "l")
@param unit Measurement unit to be used when coordinates are specified. One of "pt" (points), "mm" (Default), "cm", "in"
@param format One of 'a3', 'a4' (Default),'a5' ,'letter' ,'legal'
@returns {jsPDF}
@name jsPDF
*/

var jsPDF = (function() {
'use strict';

// this will run on <=IE9, possibly some niche browsers
// new webkit-based, FireFox, IE10 already have native version of this.
if (typeof btoa === 'undefined') {
	var btoa = function(data) {
		// DO NOT ADD UTF8 ENCODING CODE HERE!!!!

		// UTF8 encoding encodes bytes over char code 128
		// and, essentially, turns an 8-bit binary streams
		// (that base64 can deal with) into 7-bit binary streams. 
		// (by default server does not know that and does not recode the data back to 8bit)
		// You destroy your data.

		// binary streams like jpeg image data etc, while stored in JavaScript strings,
		// (which are 16bit arrays) are in 8bit format already.
		// You do NOT need to char-encode that before base64 encoding.

		// if you, by act of fate
		// have string which has individual characters with code
		// above 255 (pure unicode chars), encode that BEFORE you base64 here.
		// you can use absolutely any approch there, as long as in the end,
		// base64 gets an 8bit (char codes 0 - 255) stream.
		// when you get it on the server after un-base64, you must 
		// UNencode it too, to get back to 16, 32bit or whatever original bin stream.

		// Note, Yes, JavaScript strings are, in most cases UCS-2 - 
		// 16-bit character arrays. This does not mean, however,
		// that you always have to UTF8 it before base64.
		// it means that if you have actual characters anywhere in
		// that string that have char code above 255, you need to
		// recode *entire* string from 16-bit (or 32bit) to 8-bit array.
		// You can do binary split to UTF16 (BE or LE)
		// you can do utf8, you can split the thing by hand and prepend BOM to it,
		// but whatever you do, make sure you mirror the opposite on
		// the server. If server does not expect to post-process un-base64
		// 8-bit binary stream, think very very hard about messing around with encoding.

		// so, long story short:
		// DO NOT ADD UTF8 ENCODING CODE HERE!!!!
		
		/* @preserve
		====================================================================
		base64 encoder
		MIT, GPL
	
		version: 1109.2015
		discuss at: http://phpjs.org/functions/base64_encode
		+   original by: Tyler Akins (http://rumkin.com)
		+   improved by: Bayron Guevara
		+   improved by: Thunder.m
		+   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		+   bugfixed by: Pellentesque Malesuada
		+   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		+   improved by: Rafal Kukawski (http://kukawski.pl)
		+   			 Daniel Dotsenko, Willow Systems Corp, willow-systems.com
		====================================================================
		*/
		
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
		, b64a = b64.split('')
		, o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		enc = "",
		tmp_arr = [];
	 
		do { // pack three octets into four hexets
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
	 
			bits = o1 << 16 | o2 << 8 | o3;

			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
	 
			// use hexets to index into b64, and append result to encoded string
			tmp_arr[ac++] = b64a[h1] + b64a[h2] + b64a[h3] + b64a[h4];
		} while (i < data.length);

		enc = tmp_arr.join('');
		var r = data.length % 3;
		return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

		// end of base64 encoder MIT, GPL
	};
};

var getObjectLength = typeof Object.keys === 'function' ?
	function(object){
		return Object.keys(object).length;
	} :
	function(object){
		var i = 0;
		for (var e in object){if(object.hasOwnProperty(e)){ i++; }}
		return i;
	};

/**
PubSub implementation
@class
@name PubSub
*/
var PubSub = function(context){
	'use strict';
	/**  @preserve 
	-----------------------------------------------------------------------------------------------
	JavaScript PubSub library
	2012 (c) ddotsenko@willowsystems.com
	based on Peter Higgins (dante@dojotoolkit.org)
	Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.
	Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
	http://dojofoundation.org/license for more information.
	-----------------------------------------------------------------------------------------------
	*/
	/**
	@private
	@fieldOf PubSub
	*/
	this.topics = {};
	/**
	Stores what will be `this` within the callback functions.
	@private
	@fieldOf PubSub#
	*/
	this.context = context;
	/**
	Allows caller to emit an event and pass arguments to event listeners.
	@public
	@function
	@param topic {String} Name of the channel on which to voice this event
	@param **args Any number of arguments you want to pass to the listeners of this event.
	@methodOf PubSub#
	@name publish
	*/
	this.publish = function(topic, args) {
		'use strict';
		if (this.topics[topic]) {
			var currentTopic = this.topics[topic]
			, args = Array.prototype.slice.call(arguments, 1)
			, toremove = []
			, fn
			, i, l
			, pair;

			for (i = 0, l = currentTopic.length; i < l; i++) {
				pair = currentTopic[i]; // this is a [function, once_flag] array
				fn = pair[0] ;
				if (pair[1] /* 'run once' flag set */){
				  pair[0] = function(){};
				  toremove.push(i);
				}
			   	fn.apply(this.context, args);
			}
			for (i = 0, l = toremove.length; i < l; i++) {
			  currentTopic.splice(toremove[i], 1);
			}
		}
	};
	/**
	Allows listener code to subscribe to channel and be called when data is available 
	@public
	@function
	@param topic {String} Name of the channel on which to voice this event
	@param callback {Function} Executable (function pointer) that will be ran when event is voiced on this channel.
	@param once {Boolean} (optional. False by default) Flag indicating if the function is to be triggered only once.
	@returns {Object} A token object that cen be used for unsubscribing.  
	@methodOf PubSub#
	@name subscribe
	*/
	this.subscribe = function(topic, callback, once) {
		'use strict';
		if (!this.topics[topic]) {
			this.topics[topic] = [[callback, once]];
		} else {
			this.topics[topic].push([callback,once]);
		}
		return {
			"topic": topic,
			"callback": callback
		};
	};
	/**
	Allows listener code to unsubscribe from a channel 
	@public
	@function
	@param token {Object} A token object that was returned by `subscribe` method 
	@methodOf PubSub#
	@name unsubscribe
	*/
	this.unsubscribe = function(token) {
		if (this.topics[token.topic]) {
			var currentTopic = this.topics[token.topic];
			
			for (var i = 0, l = currentTopic.length; i < l; i++) {
				if (currentTopic[i][0] === token.callback) {
					currentTopic.splice(i, 1);
				}
			}
		}
	};
};

	
/**
@constructor
@private
*/
function jsPDF(/** String */ orientation, /** String */ unit, /** String */ format){

	// Default parameter values
	if (typeof orientation === 'undefined') orientation = 'p';
	else orientation = orientation.toString().toLowerCase();
	if (typeof unit === 'undefined') unit = 'mm';
	if (typeof format === 'undefined') format = 'a4';

	var format_as_string = format.toString().toLowerCase()
	, version = '20120619'
	, content = []
	, content_length = 0
	, pdfVersion = '1.3' // PDF Version
	, pageFormats = { // Size in pt of various paper formats
		'a3': [841.89, 1190.55]
		, 'a4': [595.28, 841.89]
		, 'a5': [420.94, 595.28]
		, 'letter': [612, 792]
		, 'legal': [612, 1008]
	}
	, textColor = '0 g'
	, drawColor = '0 G'
	, page = 0
	, pages = []
	, objectNumber = 2 // 'n' Current object number
	, outToPages = false // switches where out() prints. outToPages true = push to pages obj. outToPages false = doc builder content
	, offsets = [] // List of offsets. Activated and reset by buildDocument(). Pupulated by various calls buildDocument makes.
	, fonts = {} // collection of font objects, where key is fontKey - a dynamically created label for a given font.
	, fontmap = {} // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
	, activeFontSize = 16
	, activeFontKey // will be string representing the KEY of the font as combination of fontName + fontStyle
	, lineWidth = 0.200025 // 2mm
	, pageHeight
	, pageWidth
	, k // Scale factor
	, documentProperties = {'title':'','subject':'','author':'','keywords':'','creator':''}
	, lineCapID = 0
	, lineJoinID = 0
	, API = {}
	, events = new PubSub(API)
    , fit = 'H';

	if (unit == 'pt') {
		k = 1;
	} else if(unit == 'mm') {
		k = 72/25.4;
	} else if(unit == 'cm') {
		k = 72/2.54;
	} else if(unit == 'in') {
		k = 72;
	} else {
		throw('Invalid unit: ' + unit);
	}
	
	// Dimensions are stored as user units and converted to points on output
	if (format_as_string in pageFormats) {
		pageHeight = pageFormats[format_as_string][1] / k;
		pageWidth = pageFormats[format_as_string][0] / k;
	} else {
		try {
			pageHeight = format[1];
			pageWidth = format[0];
		} 
		catch(err) {
			throw('Invalid format: ' + format);
		}
	}
	
	if (orientation === 'p' || orientation === 'portrait') {
		orientation = 'p';
		if ( pageWidth > pageHeight  ) {
			var tmp = pageWidth;
			pageWidth = pageHeight;
			pageHeight = tmp;
		}
	} else if (orientation === 'l' || orientation === 'landscape') {
		orientation = 'l';
		if ( pageHeight > pageWidth ) {
			var tmp = pageWidth;
			pageWidth = pageHeight;
			pageHeight = tmp;
		}
	} else {
		throw('Invalid orientation: ' + orientation);
	}

	/////////////////////
	// Private functions
	/////////////////////
	// simplified (speedier) replacement for sprintf's %.2f conversion  
	var f2 = function(number){
		return number.toFixed(2);
	}, f3 = function(number){
		return number.toFixed(3);
	}
	, padd2 = function(number) {
		var n = (number).toFixed(0);
		if ( number < 10 ) return '0' + n;
		else return n;
	}
	// simplified (speedier) replacement for sprintf's %02d
	, padd10 = function(number) {
        if (typeof (number) === 'number') {
            var n = (number).toFixed(0);
            if (n.length < 10) {
                return new Array( 11 - n.length ).join( '0' ) + n;
            } else {
                return n;
            }
        }
	}
	, out = function(string) {
		if(outToPages /* set by beginPage */) {
			pages[page].push(string);
		} else {
			content.push(string);
			content_length += string.length + 1; // +1 is for '\n' that will be used to join contents of content 
		}
	}
	, newObject = function() {
		// Begin a new object
		objectNumber ++;
		offsets[objectNumber] = content_length;
		out(objectNumber + ' 0 obj');		
		return objectNumber;
	}
	, putPages = function() {
		var wPt = pageWidth * k;
		var hPt = pageHeight * k;

		// outToPages = false as set in endDocument(). out() writes to content.
		
		var n, p;
		for(n=1; n <= page; n++) {
			newObject();
			out('<</Type /Page');
			out('/Parent 1 0 R');	
			out('/Resources 2 0 R');
			out('/Contents ' + (objectNumber + 1) + ' 0 R>>');
			out('endobj');
			
			// Page content
			p = pages[n].join('\n');
			newObject();
			out('<</Length ' + p.length  + '>>');
			putStream(p);
			out('endobj');
		}
		offsets[1] = content_length;
		out('1 0 obj');
		out('<</Type /Pages');
		var kids = '/Kids [';
		for (var i = 0; i < page; i++) {
			kids += (3 + 2 * i) + ' 0 R ';
		}
		out(kids + ']');
		out('/Count ' + page);
		out('/MediaBox [0 0 '+f2(wPt)+' '+f2(hPt)+']');
		out('>>');
		out('endobj');		
	}, putStream = function(str) {
		out('stream');
		out(str);
		out('endstream');
	}, putResources = function() {
		putFonts();
		events.publish('putResources');
		// Resource dictionary
		offsets[2] = content_length;
		out('2 0 obj');
		out('<<');
		putResourceDictionary();
		out('>>');
		out('endobj');
	}, putFonts = function() {
		for (var fontKey in fonts) {
			if (fonts.hasOwnProperty(fontKey)) {
				putFont(fonts[fontKey]);
			}
		}
	}, putFont = function(font) {
		font.objectNumber = newObject();
		out('<</BaseFont/' + font.PostScriptName + '/Type/Font');
		if (typeof font.encoding === 'string') {
			out('/Encoding/'+font.encoding)		;	
		}
		out('/Subtype/Type1>>');
		out('endobj');
	}
	, addToFontDictionary = function(fontKey, fontName, fontStyle) {
		// this is mapping structure for quick font key lookup.
		// returns the KEY of the font (ex: "F1") for a given pair of font name and type (ex: "Arial". "Italic")
		var undef;
		if (fontmap[fontName] === undef){
			fontmap[fontName] = {}; // fontStyle is a var interpreted and converted to appropriate string. don't wrap in quotes.
		}
		fontmap[fontName][fontStyle] = fontKey;
	}
	/**
	FontObject describes a particular font as member of an instnace of jsPDF
	It's a collection of properties like 'id' (to be used in PDF stream),
	'fontName' (font's family name), 'fontStyle' (font's style variant label)
	@class
	@public
	@property id {String} PDF-document-instance-specific label assinged to the font.
	@property PostScriptName {String} PDF specification full name for the font
	@property encoding {Object} Encoding_name-to-Font_metrics_object mapping.
	@name FontObject
	*/
	, FontObject = {}
	, addFont = function(PostScriptName, fontName, fontStyle, encoding) {
		var fontKey = 'F' + (getObjectLength(fonts) + 1).toString(10);
		
		// This is FontObject 
		var font = fonts[fontKey] = {
			'id': fontKey
			// , 'objectNumber':   will be set by putFont()
			, 'PostScriptName': PostScriptName
			, 'fontName': fontName
			, 'fontStyle': fontStyle
			, 'encoding': encoding
			, 'metadata': {}
		};
		addToFontDictionary(fontKey, fontName, fontStyle);
		events.publish('addFont', font)		;
		return fontKey;
	}
	, addFonts = function() {
		var HELVETICA = "helvetica"
		, TIMES = "times"
		, COURIER = "courier"
		, NORMAL = "normal"
		, BOLD = "bold"
		, ITALIC = "italic"
		, BOLD_ITALIC = "bolditalic"
		, encoding = 'StandardEncoding'
		, standardFonts = [
			['Helvetica', HELVETICA, NORMAL]
			, ['Helvetica-Bold', HELVETICA, BOLD]
			, ['Helvetica-Oblique', HELVETICA, ITALIC]
			, ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC]
			, ['Courier', COURIER, NORMAL]
			, ['Courier-Bold', COURIER, BOLD]
			, ['Courier-Oblique', COURIER, ITALIC]
			, ['Courier-BoldOblique', COURIER, BOLD_ITALIC]
			, ['Times-Roman', TIMES, NORMAL]
			, ['Times-Bold', TIMES, BOLD]
			, ['Times-Italic', TIMES, ITALIC]
			, ['Times-BoldItalic', TIMES, BOLD_ITALIC]
		];

		var i, l, fontKey, parts;
		for (i = 0, l = standardFonts.length; i < l; i++) {
			fontKey = addFont(
				standardFonts[i][0]
				, standardFonts[i][1]
				, standardFonts[i][2]
				, encoding
			);

			// adding aliases for standard fonts, this time matching the capitalization
			parts = standardFonts[i][0].split('-');
			addToFontDictionary(fontKey, parts[0], parts[1] || '');
		}

		events.publish('addFonts', {'fonts':fonts, 'dictionary':fontmap});
	}
	, putResourceDictionary = function() {
		out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
		out('/Font <<');
		// Do this for each font, the '1' bit is the index of the font
		for (var fontKey in fonts) {
			if (fonts.hasOwnProperty(fontKey)) {
				out('/' + fontKey + ' ' + fonts[fontKey].objectNumber + ' 0 R');
			}
		}
		out('>>');
		out('/XObject <<');
		putXobjectDict();
		out('>>');
	}
	, putXobjectDict = function() {
		// Loop through images, or other data objects
		events.publish('putXobjectDict');
	}
	, putInfo = function() {
		out('/Producer (jsPDF ' + version + ')');
		if(documentProperties.title) {
			out('/Title (' + pdfEscape(documentProperties.title) + ')');
		}
		if(documentProperties.subject) {
			out('/Subject (' + pdfEscape(documentProperties.subject) + ')');
		}
		if(documentProperties.author) {
			out('/Author (' + pdfEscape(documentProperties.author) + ')');
		}
		if(documentProperties.keywords) {
			out('/Keywords (' + pdfEscape(documentProperties.keywords) + ')');
		}
		if(documentProperties.creator) {
			out('/Creator (' + pdfEscape(documentProperties.creator) + ')');
		}		
		var created = new Date();
		out('/CreationDate (D:' + 
			[
				created.getFullYear()
				, padd2(created.getMonth() + 1)
				, padd2(created.getDate())
				, padd2(created.getHours())
				, padd2(created.getMinutes())
				, padd2(created.getSeconds())
			].join('')+
			')'
	);
	}
	, putCatalog = function () {
		out('/Type /Catalog');
		out('/Pages 1 0 R');
		// @TODO: Add zoom and layout modes
		out('/OpenAction [3 0 R /Fit' + fit + ' null]');
		out('/PageLayout /OneColumn');
	}	
	, putTrailer = function () {
		out('/Size ' + (objectNumber + 1));
		out('/Root ' + objectNumber + ' 0 R');
		out('/Info ' + (objectNumber - 1) + ' 0 R');
	}	
	, beginPage = function() {
		page ++;
		// Do dimension stuff
		outToPages = true;
		pages[page] = [];
	}
	, _addPage = function() {
		beginPage();
		// Set line width
		out(f2(lineWidth * k) + ' w');
		// Set draw color
		out(drawColor);
		// resurrecting non-default line caps, joins
		if (lineCapID !== 0) out(lineCapID.toString(10)+' J');
		if (lineJoinID !== 0) out(lineJoinID.toString(10)+' j');

		events.publish('addPage', {'pageNumber':page});
	}
	/**
	Returns a document-specific font key - a label assigned to a
	font name + font type combination at the time the font was added
	to the font inventory.
	Font key is used as label for the desired font for a block of text
	to be added to the PDF document stream.
	@private
	@function
	@param fontName {String} can be undefined on "falthy" to indicate "use current"
	@param fontStyle {String} can be undefined on "falthy" to indicate "use current"
	@returns {String} Font key.
	*/
	, getFont = function(fontName, fontStyle) {
		var key, undef;

		if (fontName === undef) {
			fontName = fonts[activeFontKey]['fontName'];
		}
		if (fontStyle === undef) {
			fontStyle = fonts[activeFontKey]['fontStyle'];
		}

		try {
			key = fontmap[fontName][fontStyle] ;// returns a string like 'F3' - the KEY corresponding tot he font + type combination.
		} catch (e) {
			key = undef;
		}
		if (!key){
			throw new Error("Unable to look up font label for font '"+fontName+"', '"+fontStyle+"'. Refer to getFontList() for available fonts.");
		}

		return key;
	}
	, buildDocument = function() {
		outToPages = false ;// switches out() to content
		content = [];
		offsets = [];
		// putHeader()
		out('%PDF-' + pdfVersion);
		putPages();
		putResources();
		newObject();
		out('<<');
		putInfo();
		out('>>');
		out('endobj');
		
		// Catalog
		newObject();
		out('<<');
		putCatalog();
		out('>>');
		out('endobj');
		
		// Cross-ref
		var o = content_length;
		out('xref');
		out('0 ' + (objectNumber + 1));
		out('0000000000 65535 f ');
		for (var i=1; i <= objectNumber; i++) {
			out(padd10(offsets[i]) + ' 00000 n ');
		}
		// Trailer
		out('trailer');
		out('<<');
		putTrailer();
		out('>>');
		out('startxref');
		out(o);
		out('%%EOF');
		outToPages = true;
		return content.join('\n');
	}
	/**
	
	@public
	@function
	@param text {String} 
	@param flags {Object} Encoding flags.
	@returns {String} Encoded string
	*/
	, to8bitStream = function(text, flags){
		/* PDF 1.3 spec:
		"For text strings encoded in Unicode, the first two bytes must be 254 followed by
		255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
		with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
		to be a meaningful beginning of a word or phrase.) The remainder of the
		string consists of Unicode character codes, according to the UTF-16 encoding
		specified in the Unicode standard, version 2.0. Commonly used Unicode values
		are represented as 2 bytes per character, with the high-order byte appearing first
		in the string."
		In other words, if there are chars in a string with char code above 255, we
		recode the string to UCS2 BE - string doubles in length and BOM is prepended.
		HOWEVER!
		Actual *content* (body) text (as opposed to strings used in document properties etc)
		does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
		Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
		a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
		fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
		code page. There, however, all characters in the stream are treated as GIDs,
		including BOM, which is the reason we need to skip BOM in content text (i.e. that
		that is tied to a font).
		To signal this "special" PDFEscape / to8bitStream handling mode,
		API.text() function sets (unless you overwrite it with manual values
		given to API.text(.., flags) )
			flags.autoencode = true
			flags.noBOM = true
		*/

		/*
		`flags` properties relied upon:
		.sourceEncoding = string with encoding label. 
			"Unicode" by default. = encoding of the incoming text.
			pass some non-existing encoding name 
			(ex: 'Do not touch my strings! I know what I am doing.')
			to make encoding code skip the encoding step.
		.outputEncoding = Either valid PDF encoding name 
			(must be supported by jsPDF font metrics, otherwise no encoding)
			or a JS object, where key = sourceCharCode, value = outputCharCode
			missing keys will be treated as: sourceCharCode === outputCharCode
		.noBOM
			See comment higher above for explanation for why this is important
		.autoencode
			See comment higher above for explanation for why this is important
		*/

		var i, l, undef;

		if (flags === undef) {
			flags = {};
		}

		var sourceEncoding = flags.sourceEncoding ? sourceEncoding : 'Unicode'
		, encodingBlock
		, outputEncoding = flags.outputEncoding
		, newtext
		, isUnicode, ch, bch;
		// This 'encoding' section relies on font metrics format 
		// attached to font objects by, among others, 
		// "Willow Systems' standard_font_metrics plugin"
		// see jspdf.plugin.standard_font_metrics.js for format
		// of the font.metadata.encoding Object.
		// It should be something like
		//   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
		//   .widths = {0:width, code:width, ..., 'fof':divisor}
		//   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
		if ((flags.autoencode || outputEncoding ) && 
			fonts[activeFontKey].metadata &&
			fonts[activeFontKey].metadata[sourceEncoding] &&
			fonts[activeFontKey].metadata[sourceEncoding].encoding
		) {
			encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;
			
			// each font has default encoding. Some have it clearly defined.
			if (!outputEncoding && fonts[activeFontKey].encoding) {
				outputEncoding = fonts[activeFontKey].encoding;
			}

			// Hmmm, the above did not work? Let's try again, in different place.
			if (!outputEncoding && encodingBlock.codePages) {
				outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
			}

			if (typeof outputEncoding === 'string') {
				outputEncoding = encodingBlock[outputEncoding];
			}
			// we want output encoding to be a JS Object, where
			// key = sourceEncoding's character code and 
			// value = outputEncoding's character code.
			if (outputEncoding) {
				isUnicode = false;
				newtext = [];
				for (i = 0, l = text.length; i < l; i++) {
					ch = outputEncoding[text.charCodeAt(i)];
					if (ch) {
						newtext.push(
							String.fromCharCode(ch)
						);
					} else {
						newtext.push(
							text[i]
						);
					}

					// since we are looping over chars anyway, might as well
					// check for residual unicodeness
					if (newtext[i].charCodeAt(0) >> 8 /* more than 255 */ ) {
						isUnicode = true;
					}
				}
				text = newtext.join('');
			}
		}

		i = text.length;
		// isUnicode may be set to false above. Hence the triple-equal to undefined
		while (isUnicode === undef && i !== 0){
			if ( text.charCodeAt(i - 1) >> 8 /* more than 255 */ ) {
				isUnicode = true;
			}
			;i--;
		}
		if (!isUnicode) {
			return text;
		} else {
			newtext = flags.noBOM ? [] : [254, 255];
			for (i = 0, l = text.length; i < l; i++) {
				ch = text.charCodeAt(i);
				bch = ch >> 8; // divide by 256
				if (bch >> 8 /* something left after dividing by 256 second time */ ) {
					throw new Error("Character at position "+i.toString(10)+" of string '"+text+"' exceeds 16bits. Cannot be encoded into UCS-2 BE");
				}
				newtext.push(bch);
				newtext.push(ch - ( bch << 8));
			}
			return String.fromCharCode.apply(undef, newtext);
		}
	}
	// Replace '/', '(', and ')' with pdf-safe versions
	, pdfEscape = function(text, flags) {
		// doing to8bitStream does NOT make this PDF display unicode text. For that
		// we also need to reference a unicode font and embed it - royal pain in the rear.

		// There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
		// which JavaScript Strings are happy to provide. So, while we still cannot display
		// 2-byte characters property, at least CONDITIONALLY converting (entire string containing) 
		// 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
		// is still parseable.
		// This will allow immediate support for unicode in document properties strings.
		return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
	}
	, getStyle = function(style){
		// see Path-Painting Operators of PDF spec
		var op = 'S'; // stroke
		if (style === 'F') {
			op = 'f'; // fill
		} else if (style === 'FD' || style === 'DF') {
			op = 'B'; // both
		}
		return op;
	};
	

	//---------------------------------------
	// Public API

	/*
	Object exposing internal API to plugins
	@public
	*/
	API.internal = {
		'pdfEscape': pdfEscape
		, 'getStyle': getStyle
		/**
		Returns {FontObject} describing a particular font.
		@public
		@function
		@param fontName {String} (Optional) Font's family name
		@param fontStyle {String} (Optional) Font's style variation name (Example:"Italic")
		@returns {FontObject}
		*/
		, 'getFont': function(){ return fonts[getFont.apply(API, arguments)]; }
		, 'getFontSize': function() { return activeFontSize;	}
		, 'btoa': btoa
		, 'write': function(string1, string2, string3, etc){
			out(
				arguments.length === 1? 
				arguments[0] : 
				Array.prototype.join.call(arguments, ' ')
			);
		}
		, 'getCoordinateString': function(value){
			return f2(value * k);
		}
		, 'getVerticalCoordinateString': function(value){
			return f2((pageHeight - value) * k);
		}
		, 'collections': {}
		, 'newObject': newObject
		, 'putStream': putStream
		, 'events': events
		// ratio that you use in multiplication of a given "size" number to arrive to 'point' 
		// units of measurement.
		// scaleFactor is set at initialization of the document and calculated against the stated 
		// default measurement units for the document.
		// If default is "mm", k is the number that will turn number in 'mm' into 'points' number.
		// through multiplication.
		, 'scaleFactor': k 
		, 'pageSize': {'width':pageWidth, 'height':pageHeight}
	};
	
	/**
	Adds (and transfers the focus to) new page to the PDF document.
	@function
	@returns {jsPDF} 
	@methodOf jsPDF#
	@name addPage
	 */
	API.addPage = function() {
		_addPage();
		return this;
	};

	/**
	Adds text to page. Supports adding multiline text when 'text' argument is an Array of Strings. 
	@function
	@param {String|Array} text String or array of strings to be added to the page. Each line is shifted one line down per font, spacing settings declared before this call.
	@param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Object} flags Collection of settings signalling how the text must be encoded. Defaults are sane. If you think you want to pass some flags, you likely can read the source.
	@returns {jsPDF}
	@methodOf jsPDF#
	@name text
	 */
	API.text = function(text, x, y, flags) {
		/**
		 * Inserts something like this into PDF
			BT 
			/F1 16 Tf  % Font name + size
			16 TL % How many units down for next line in multiline text
			0 g % color
			28.35 813.54 Td % position
			(line one) Tj 
			T* (line two) Tj
			T* (line three) Tj
			ET
	 	*/
		
	 	var undef;
		// Pre-August-2012 the order of arguments was function(x, y, text, flags)
		// in effort to make all calls have similar signature like 
		//   function(data, coordinates... , miscellaneous)
		// this method had its args flipped.
		// code below allows backward compatibility with old arg order.
		var _first, _second, _third;
		if (typeof arguments[0] === 'number') {
			_first = arguments[2];
			_second = arguments[0];
			_third = arguments[1];

			text = _first ;
			x = _second ;
			y = _third;
		}

		// If there are any newlines in text, we assume
		// the user wanted to print multiple lines, so break the
		// text up into an array.  If the text is already an array,
		// we assume the user knows what they are doing.
		if (typeof text === 'string' && text.match(/[\n\r]/)) {
			text = text.split(/\r\n|\r|\n/g);
		}

		if (typeof flags === 'undefined') {
			flags = {'noBOM':true,'autoencode':true};
		} else {

			if (flags.noBOM === undef) {
				flags.noBOM = true;
			}

			if (flags.autoencode === undef) {
				flags.autoencode = true;
			}

		}
		var newtext, str;
		if (typeof text === 'string') {
			str = pdfEscape(text, flags);
		} else if (text instanceof Array) /* Array */{
			// we don't want to destroy  original text array, so cloning it
			newtext = text.concat();
			// we do array.join('text that must not be PDFescaped")
			// thus, pdfEscape each component separately
			for ( var i = newtext.length - 1; i !== -1 ; i--) {
				newtext[i] = pdfEscape( newtext[i], flags);
			}
			str = newtext.join( ") Tj\nT* (" );
		} else {
			throw new Error('Type of text must be string or Array. "'+text+'" is not recognized.');
		}
		// Using "'" ("go next line and render text" mark) would save space but would complicate our rendering code, templates 
		
		// BT .. ET does NOT have default settings for Tf. You must state that explicitely every time for BT .. ET
		// if you want text transformation matrix (+ multiline) to work reliably (which reads sizes of things from font declarations) 
		// Thus, there is NO useful, *reliable* concept of "default" font for a page. 
		// The fact that "default" (reuse font used before) font worked before in basic cases is an accident
		// - readers dealing smartly with brokenness of jsPDF's markup.
		out( 
			'BT\n/' +
			activeFontKey + ' ' + activeFontSize + ' Tf\n' + // font face, style, size
			activeFontSize + ' TL\n' + // line spacing
			textColor + 
			'\n' + f2(x * k) + ' ' + f2((pageHeight - y) * k) + ' Td\n(' + 
			str +
			') Tj\nET'
		);
		return this;
	};

	API.line = function(x1, y1, x2, y2) {
		out(
			f2(x1 * k) + ' ' + f2((pageHeight - y1) * k) + ' m ' +
			f2(x2 * k) + ' ' + f2((pageHeight - y2) * k) + ' l S'			
		);
		return this;
	};

	/**
	Adds series of curves (straight lines or cubic bezier curves) to canvas, starting at `x`, `y` coordinates.
	All data points in `lines` are relative to last line origin.
	`x`, `y` become x1,y1 for first line / curve in the set.
	For lines you only need to specify [x2, y2] - (ending point) vector against x1, y1 starting point.
	For bezier curves you need to specify [x2,y2,x3,y3,x4,y4] - vectors to control points 1, 2, ending point. All vectors are against the start of the curve - x1,y1.
	
	@example .lines([[2,2],[-2,2],[1,1,2,2,3,3],[2,1]], 212,110, 10) // line, line, bezier curve, line 
	@param {Array} lines Array of *vector* shifts as pairs (lines) or sextets (cubic bezier curves).
	@param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Number} scale (Defaults to [1.0,1.0]) x,y Scaling factor for all vectors. Elements can be any floating number Sub-one makes drawing smaller. Over-one grows the drawing. Negative flips the direction.   
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name lines
	 */
	API.lines = function(lines, x, y, scale, style) {
		var undef;
		
		// Pre-August-2012 the order of arguments was function(x, y, lines, scale, style)
		// in effort to make all calls have similar signature like 
		//   function(content, coordinateX, coordinateY , miscellaneous)
		// this method had its args flipped.
		// code below allows backward compatibility with old arg order.
		var _first, _second, _third;
		if (typeof arguments[0] === 'number') {
			_first = arguments[2];
			_second = arguments[0];
			_third = arguments[1];

			lines = _first ;
			x = _second ;
			y = _third;
		}

		style = getStyle(style);
		scale = scale === undef ? [1,1] : scale;

		// starting point
		out(f3(x * k) + ' ' + f3((pageHeight - y) * k) + ' m ');
		
		var scalex = scale[0]
		, scaley = scale[1]
		, i = 0
		, l = lines.length
		, leg
		, x2, y2 // bezier only. In page default measurement "units", *after* scaling
		, x3, y3 // bezier only. In page default measurement "units", *after* scaling
		// ending point for all, lines and bezier. . In page default measurement "units", *after* scaling
		, x4 = x // last / ending point = starting point for first item.
		, y4 = y ;// last / ending point = starting point for first item.
		
		for (; i < l; i++) {
			leg = lines[i];
			if (leg.length === 2){
				// simple line
				x4 = leg[0] * scalex + x4; // here last x4 was prior ending point
				y4 = leg[1] * scaley + y4; // here last y4 was prior ending point
				out(f3(x4 * k) + ' ' + f3((pageHeight - y4) * k) + ' l')	;				
			} else {
				// bezier curve
				x2 = leg[0] * scalex + x4; // here last x4 is prior ending point
				y2 = leg[1] * scaley + y4; // here last y4 is prior ending point					
				x3 = leg[2] * scalex + x4; // here last x4 is prior ending point
				y3 = leg[3] * scaley + y4; // here last y4 is prior ending point										
				x4 = leg[4] * scalex + x4; // here last x4 was prior ending point
				y4 = leg[5] * scaley + y4; // here last y4 was prior ending point
				out(
					f3(x2 * k) + ' ' + 
					f3((pageHeight - y2) * k) + ' ' +
					f3(x3 * k) + ' ' + 
					f3((pageHeight - y3) * k) + ' ' +
					f3(x4 * k) + ' ' + 
					f3((pageHeight - y4) * k) + ' c'
				);
			}
		}			
		// stroking / filling / both the path
		out(style) ;
		return this;
	};

	/**
	Adds a rectangle to PDF
	
	@param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Number} w Width (in units declared at inception of PDF document) 
	@param {Number} h Height (in units declared at inception of PDF document) 
	@param {String} style (Defaults to active fill/stroke style) A string signalling if stroke, fill or both are to be applied.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name rect
	 */
	API.rect = function(x, y, w, h, style) {
		var op = getStyle(style);
		out([
			f2(x * k)
			, f2((pageHeight - y) * k)
			, f2(w * k)
			, f2(-h * k)
			, 're'
			, op
		].join(' '));
		return this;
	};

	/**
	Adds a triangle to PDF
	
	@param {Number} x1 Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y1 Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Number} x2 Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y2 Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Number} x3 Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y3 Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {String} style (Defaults to active fill/stroke style) A string signalling if stroke, fill or both are to be applied.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name triangle
	 */
	API.triangle = function(x1, y1, x2, y2, x3, y3, style) {
		this.lines(
			[
				[ x2 - x1 , y2 - y1 ] // vector to point 2
				, [ x3 - x2 , y3 - y2 ] // vector to point 3
				, [ x1 - x3 , y1 - y3 ] // closing vector back to point 1
			]
			, x1, y1 // start of path
			, [1,1]
			, style
		);
		return this;
	};

	/**
	Adds an ellipse to PDF
	
	@param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Number} rx Radius along x axis (in units declared at inception of PDF document) 
	@param {Number} rx Radius along y axis (in units declared at inception of PDF document) 
	@param {String} style (Defaults to active fill/stroke style) A string signalling if stroke, fill or both are to be applied.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name ellipse
	 */
	API.ellipse = function(x, y, rx, ry, style) {
		var op = getStyle(style)
		, lx = 4/3*(Math.SQRT2-1)*rx
		, ly = 4/3*(Math.SQRT2-1)*ry;
		
		out([
			f2((x+rx)*k)
			, f2((pageHeight-y)*k)
			, 'm'
			, f2((x+rx)*k)
			, f2((pageHeight-(y-ly))*k)
			, f2((x+lx)*k)
			, f2((pageHeight-(y-ry))*k)
			, f2(x*k)
			, f2((pageHeight-(y-ry))*k)
			, 'c'
		].join(' '));
		out([
			f2((x-lx)*k)
			, f2((pageHeight-(y-ry))*k)
			, f2((x-rx)*k)
			, f2((pageHeight-(y-ly))*k)
			, f2((x-rx)*k)
			, f2((pageHeight-y)*k)
			, 'c'
		].join(' '));
		out([
			f2((x-rx)*k)
			, f2((pageHeight-(y+ly))*k)
			, f2((x-lx)*k)
			, f2((pageHeight-(y+ry))*k)
			, f2(x*k)
			, f2((pageHeight-(y+ry))*k)
			, 'c'
		].join(' '));
		out([
			f2((x+lx)*k)
			, f2((pageHeight-(y+ry))*k)
			, f2((x+rx)*k)
			, f2((pageHeight-(y+ly))*k)
			, f2((x+rx)*k)
			, f2((pageHeight-y)*k) 
			,'c'
			, op
		].join(' '));
		return this;
	};

	/**
	Adds an circle to PDF
	
	@param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
	@param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
	@param {Number} r Radius (in units declared at inception of PDF document) 
	@param {String} style (Defaults to active fill/stroke style) A string signalling if stroke, fill or both are to be applied.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name circle
	 */
	API.circle = function(x, y, r, style) {
		return this.ellipse(x, y, r, r, style);
	};

	/**
	Adds a properties to the PDF document
	
	@param {Object} A property_name-to-property_value object structure.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setProperties
	 */
	API.setProperties = function(properties) {
		// copying only those properties we can render.
		for (var property in documentProperties){
			if (documentProperties.hasOwnProperty(property) && properties[property]) {
				documentProperties[property] = properties[property];
			}
		}
		return this;
	};

	API.addImage = function(imageData, format, x, y, w, h) {
		return this;
	};

	/**
	Sets font size for upcoming text elements.
	
	@param {Number} size Font size in points.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setFontSize
	 */
	API.setFontSize = function(size) {
		activeFontSize = size;
		return this;
	};

	/**
	Sets text font face, variant for upcoming text elements.
	See output of jsPDF.getFontList() for possible font names, styles.
	
	@param {String} fontName Font name or family. Example: "times"
	@param {String} fontStyle Font style or variant. Example: "italic"
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setFont
	 */
	API.setFont = function(fontName, fontStyle) {
		activeFontKey = getFont(fontName, fontStyle);
		// if font is not found, the above line blows up and we never go further
		return this;
	};

	/**
	Switches font style or variant for upcoming text elements,
	while keeping the font face or family same.
	See output of jsPDF.getFontList() for possible font names, styles.
	
	@param {String} style Font style or variant. Example: "italic"
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setFontStyle
	 */
	API.setFontStyle = API.setFontType = function(style) {
		var undef;
		activeFontKey = getFont(undef, style);
		// if font is not found, the above line blows up and we never go further
		return this;
	};

	/**
	Returns an object - a tree of fontName to fontStyle relationships available to 
	active PDF document. 
	@public
	@function
	@returns {Object} Like {'times':['normal', 'italic', ... ], 'arial':['normal', 'bold', ... ], ... }
	@methodOf jsPDF#
	@name getFontList
	*/
	API.getFontList = function(){
		// TODO: iterate over fonts array or return copy of fontmap instead in case more are ever added.
		var list = {}
		, fontName
		, fontStyle
		, tmp;
		for (fontName in fontmap) {
			if (fontmap.hasOwnProperty(fontName)) {
				list[fontName] = tmp = [];
				for (fontStyle in fontmap[fontName]){
					if (fontmap[fontName].hasOwnProperty(fontStyle)) {
						tmp.push(fontStyle);
					}
				}
			}
		};
		return list;
	};

	/**
	Sets line width for upcoming lines.
	
	@param {Number} width Line width (in units declared at inception of PDF document)
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setLineWidth
	 */
	API.setLineWidth = function(width) {
		out((width * k).toFixed(2) + ' w');
		return this;
	};

	/**
	Sets the stroke color for upcoming elements. 
	If only one, first argument is given,
	treats the value as gray-scale color value.
	
	@param {Number} r Red channel color value in range 0-255
	@param {Number} g Green channel color value in range 0-255
	@param {Number} b Blue channel color value in range 0-255
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setDrawColor
	 */
	API.setDrawColor = function(r,g,b) {
		var color;
		if ((r===0 && g===0 && b===0) || (typeof g === 'undefined')) {
			color = f3(r/255) + ' G';
		} else {
			color = [f3(r/255), f3(g/255), f3(b/255), 'RG'].join(' ');
		}
		out(color);
		return this;
	};

	/**
	Sets the fill color for upcoming elements. 
	If only one, first argument is given,
	treats the value as gray-scale color value.
	
	@param {Number} r Red channel color value in range 0-255
	@param {Number} g Green channel color value in range 0-255
	@param {Number} b Blue channel color value in range 0-255
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setFillColor
	 */
	API.setFillColor = function(r,g,b) {
		var color;
		if ((r===0 && g===0 && b===0) || (typeof g === 'undefined')) {
			color = f3(r/255) + ' g';
		} else {
			color = [f3(r/255), f3(g/255), f3(b/255), 'rg'].join(' ');
		}
		out(color);
		return this;
	};

	/**
	Sets the text color for upcoming elements. 
	If only one, first argument is given,
	treats the value as gray-scale color value.
	
	@param {Number} r Red channel color value in range 0-255
	@param {Number} g Green channel color value in range 0-255
	@param {Number} b Blue channel color value in range 0-255
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setTextColor
	*/
	API.setTextColor = function(r,g,b) {
		if ((r===0 && g===0 && b===0) || (typeof g === 'undefined')) {
			textColor = f3(r/255) + ' g';
		} else {
			textColor = [f3(r/255), f3(g/255), f3(b/255), 'rg'].join(' ');
		}
		return this;
	};

	/**
	Is an Object providing a mapping from human-readable to
	integer flag values designating the varieties of line cap 
	and join styles.
	
	@returns {Object}
	@fieldOf jsPDF#
	@name CapJoinStyles
	*/
	API.CapJoinStyles = {
		0:0, 'butt':0, 'but':0, 'bevel':0
		, 1:1, 'round': 1, 'rounded':1, 'circle':1
		, 2:2, 'projecting':2, 'project':2, 'square':2, 'milter':2
	};

	/**
	Sets the line cap styles
	See {jsPDF.CapJoinStyles} for variants
	
	@param {String|Number} style A string or number identifying the type of line cap
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setLineCap
	*/
	API.setLineCap = function(style) {
		var undefined
		, id = this.CapJoinStyles[style];
		if (id === undefined) {
			throw new Error("Line cap style of '"+style+"' is not recognized. See or extend .CapJoinStyles property for valid styles");
		}
		lineCapID = id;
		out(id.toString(10) + ' J');

		return this;
	};

	/**
	Sets the line join styles
	See {jsPDF.CapJoinStyles} for variants
	
	@param {String|Number} style A string or number identifying the type of line join
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name setLineJoin
	*/
	API.setLineJoin = function(style) {
		var undefined
		, id = this.CapJoinStyles[style];
		if (id === undefined) {
			throw new Error("Line join style of '"+style+"' is not recognized. See or extend .CapJoinStyles property for valid styles");
		}
		lineJoinID = id;
		out(id.toString(10) + ' j');

		return this;
	};

	/**
	Generates the PDF document.
	Possible values:
		datauristring (alias dataurlstring) - Data-Url-formatted data returned as string.
		datauri (alias datauri) - Data-Url-formatted data pushed into current window's location (effectively reloading the window with contents of the PDF).
	
	If `type` argument is undefined, output is raw body of resulting PDF returned as a string.
	@param {String} type A string identifying one of the possible output types.
	@param {Object} options An object providing some additional signalling to PDF generator.
	@function
	@returns {jsPDF}
	@methodOf jsPDF#
	@name output
	*/
	API.output = function(type, options) {
		var undef;
		switch (type){
			case undef: return buildDocument() ;
			case 'datauristring':
			case 'dataurlstring':
				return 'data:application/pdf;base64,' + btoa(buildDocument());
			case 'datauri':
			case 'dataurl':
				document.location.href = 'data:application/pdf;base64,' + btoa(buildDocument()); break;
			default: throw new Error('Output type "'+type+'" is not supported.') ;
		}
		// @TODO: Add different output options
	};

	// applying plugins (more methods) ON TOP of built-in API.
	// this is intentional as we allow plugins to override 
	// built-ins
	for (var plugin in jsPDF.API){
		if (jsPDF.API.hasOwnProperty(plugin)){
			if (plugin === 'events' && jsPDF.API.events.length) {
				(function(events, newEvents){

					// jsPDF.API.events is a JS Array of Arrays 
					// where each Array is a pair of event name, handler
					// Events were added by plugins to the jsPDF instantiator.
					// These are always added to the new instance and some ran
					// during instantiation.

					var eventname, handler_and_args;

					for (var i = newEvents.length - 1; i !== -1; i--){
						// subscribe takes 3 args: 'topic', function, runonce_flag
						// if undefined, runonce is false.
						// users can attach callback directly, 
						// or they can attach an array with [callback, runonce_flag]
						// that's what the "apply" magic is for below.
						eventname = newEvents[i][0];
						handler_and_args = newEvents[i][1];
						events.subscribe.apply(
							events
							, [eventname].concat(
								typeof handler_and_args === 'function' ?
							  	[ handler_and_args ] :
							  	handler_and_args
							)
						);
					}
				})(events, jsPDF.API.events);
			} else {
				API[plugin] = jsPDF.API[plugin];
			}
		}
	}

	/////////////////////////////////////////
	// continuing initilisation of jsPDF Document object
	/////////////////////////////////////////


	// Add the first page automatically
	addFonts();
	activeFontKey = 'F1';
	_addPage();

	events.publish('initialized');

	return API;
}

/**
jsPDF.API is a STATIC property of jsPDF class.
jsPDF.API is an object you can add methods and properties to.
The methods / properties you add will show up in new jsPDF objects.
One property is prepopulated. It is the 'events' Object. Plugin authors can add topics, callbacks to this object. These will be reassigned to all new instances of jsPDF. 
Examples: 
	jsPDF.API.events['initialized'] = function(){ 'this' is API object }
	jsPDF.API.events['addFont'] = function(added_font_object){ 'this' is API object }
@static
@public
@memberOf jsPDF
@name API
@example
	jsPDF.API.mymethod = function(){
		// 'this' will be ref to internal API object. see jsPDF source
		// , so you can refer to built-in methods like so: 
		//	 this.line(....)
		//	 this.text(....)
	}
	var pdfdoc = new jsPDF()
	pdfdoc.mymethod() // <- !!!!!!	
*/
jsPDF.API = {'events':[]};

return jsPDF;
})()

/** @preserve 
jsPDF addImage plugin (JPEG only at this time)
Copyright (c) 2012 https://github.com/siefkenj/
*/

/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(jsPDFAPI) {
'use strict';

var namespace = 'addImage_';

// takes a string imgData containing the raw bytes of
// a jpeg image and returns [width, height]
// Algorithm from: http://www.64lines.com/jpeg-width-height
var getJpegSize = function(filename) {
	'use strict';
    var imgFile = Ti.Filesystem.getFile(filename);
    var imgData = imgFile.read();
    var filesize = imgData.length;
	var width, height;
	var imageBuffer = Ti.createBuffer({ length: 1024*1024 });
	Ti.Stream.createStream({ 
		source: imgData, 
		mode: Ti.Stream.MODE_READ
	}).read(imageBuffer);
	// Verify we have a valid jpeg header 255,216,255,224,?,?,74,70,73,70,0
	if (!imageBuffer[0] === 255 ||
		!imageBuffer[1] === 216 ||
		!imageBuffer[2] === 255 ||
		!imageBuffer[3] === 224 ||
		!imageBuffer[6]===  74 || // J
		!imageBuffer[7]===  70 || // F
		!imageBuffer[8]===  73 || // I
		!imageBuffer[9]===  70 || // F	
		!imageBuffer[10]===  0 ) {
			throw new Error('getJpegSize requires a binary jpeg file');
	}
	var blockLength = imageBuffer[4]*256 + imageBuffer[5];
	
	var i = 4, len = imgData.length;
	while ( i < len ) {
		i += blockLength;
		if (imageBuffer[i] !== 255) {
			throw new Error('getJpegSize could not find the size of the image');
		}
		if (imageBuffer[i+1] === 192) {
			height = imageBuffer[i+5]*256 + imageBuffer[i+6];
			width = imageBuffer[i+7]*256 + imageBuffer[i+8];
			return {width:width, height:height,filesize:filesize};
		} else {
			i += 2;
			blockLength = imageBuffer[i]*256 + imageBuffer[i+1];
		}
	}
}
// Image functionality ported from pdf.js
, putImage = function(img) {
	var objectNumber = this.internal.newObject()
	, out = this.internal.write
	, putStream = this.internal.putStream;

	img['n'] = objectNumber;

	out('<</Type /XObject');
	out('/Subtype /Image');
	out('/Width ' + img['imageWidth']);
	out('/Height ' + img['imageHeight']);
	if (img['cs'] === 'Indexed') {
		out('/ColorSpace [/Indexed /DeviceRGB '
				+ (img['pal'].length / 3 - 1) + ' ' + (objectNumber + 1)
				+ ' 0 R]');
	} else {
		out('/ColorSpace /' + img['cs']);
		if (img['cs'] === 'DeviceCMYK') {
			out('/Decode [1 0 1 0 1 0 1 0]');
		}
	}
	out('/BitsPerComponent ' + img['bpc']);
	if ('f' in img) {
		out('/Filter /' + img['f']);
	}
	if ('dp' in img) {
		out('/DecodeParms <<' + img['dp'] + '>>');
	}
	if ('trns' in img && img['trns'].constructor == Array) {
		var trns = '';
		for ( var i = 0; i < img['trns'].length; i++) {
			trns += (img[trns][i] + ' ' + img['trns'][i] + ' ');
			out('/Mask [' + trns + ']');
		}
	}
	if ('smask' in img) {
		out('/SMask ' + (objectNumber + 1) + ' 0 R');
	}
	out('/Length ' + img['fileSize'] + '>>');

	putStream('#image ' + img['data'] + '#');

	out('endobj');
}
, putResourcesCallback = function() {
	var images = this.internal.collections[namespace + 'images'];
	for ( var i in images ) {
		putImage.call(this, images[i]);
	}
}
, putXObjectsDictCallback = function(){
	var images = this.internal.collections[namespace + 'images']
	, out = this.internal.write
	, image;
	for (var i in images) {
		image = images[i];
		out(
			'/I' + image['i']
			, image['n']
			, '0'
			, 'R'
		);
	}
};

jsPDFAPI.addImage = function(imageData, format, x, y, w, h) {
	'use strict';
	if (format.toUpperCase() !== 'JPEG') {
		throw new Error('addImage currently only supports format \'JPEG\', not \''+format+'\'');
	}
	var originaldimensions = getJpegSize(imageData);
	var imageIndex
	, images = this.internal.collections[namespace + 'images']
	, coord = this.internal.getCoordinateString
	, vcoord = this.internal.getVerticalCoordinateString;
	if (images) {
		// this is NOT the first time this method is ran on this instance of jsPDF object.
		imageIndex = Object.keys ? 
		Object.keys(images).length :
		(function(o){
			var i = 0;
			for (var e in o){if(o.hasOwnProperty(e)){ i++; }}
			return i;
		})(images);
	} else {
		// this is the first time this method is ran on this instance of jsPDF object.
		imageIndex = 0;
		this.internal.collections[namespace + 'images'] = images = {};
		this.internal.events.subscribe('putResources', putResourcesCallback);
		this.internal.events.subscribe('putXobjectDict', putXObjectsDictCallback);
	}
	var dims = [
        w,
        h
    ];
	var info = {
		w: dims.w,
		h: dims.h,
		imageWidth: originaldimensions.width,
		imageHeight: originaldimensions.height,
		cs: 'DeviceRGB',
		bpc: 8,
		format: format,
		f: 'DCTDecode',
		i: imageIndex,
		data: imageData,
		fileSize: originaldimensions.filesize
	};
	images[imageIndex] = info;
	if (!w && !h) {
		w = -96;
		h = -96;
	}
	if (w < 0) {
		w = (-1) * info['w'] * 72 / w / this.internal.scaleFactor;
	}
	if (h < 0) {
		h = (-1) * info['h'] * 72 / h / this.internal.scaleFactor;
	}
	if (w === 0) {
		w = h * info['w'] / info['h'];
	}
	if (h === 0) {
		h = w * info['h'] / info['w'];
	}

	this.internal.write(
		'q'
		, coord(w)
		, '0 0'
		, coord(h) // TODO: check if this should be shifted by vcoord
		, coord(x)
		, vcoord(y + h)
		, 'cm /I'+info['i']
		, 'Do Q'
	);

	return this; 
};

})(jsPDF.API)

/** @preserve 
jsPDF addImage plugin (JPEG only at this time)
Copyright (c) 2012 https://github.com/siefkenj/
*/




/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(jsPDFAPI) {
	'use strict';
    jsPDFAPI.save = function (file) {
        'use strict';
        if(file.exists()){
        	file.deleteFile();
        }
        var res = this.output();
        var parts = res.split(/#image\s([^#]*)#/gim);
        
        var intNode = 0, intNodes = parts.length, imgFile;
        for (intNode = 0; intNode < intNodes; intNode = intNode + 1) {
            switch (intNode % 2 ? false : true) {
            case true:
                file.write(parts[intNode],true);
                break;
            case false:
                imgFile = Ti.Filesystem.getFile(parts[intNode]);
                if(imgFile.exists()){
                	file.write(imgFile.read(),true);              	
                }
                break;  
            }
        }
        return this;
    };
    
})(jsPDF.API);

/* +++ PLUGIN FONT METRICS +++ */
/** @preserve 
jsPDF standard_fonts_metrics plugin
Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
MIT license.
*/
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(API) {
'use strict';



/**
Uncompresses data compressed into custom, base16-like format. 
@public
@function
@param
@returns {Type}
*/
var uncompress = function(data){
	var decoded = '0123456789abcdef'
	, encoded = 'klmnopqrstuvwxyz'
	, mapping = {};

	for (var i = 0; i < encoded.length; i++){
		mapping[encoded[i]] = decoded[i];
	}
	var undef
	, output = {}
	, sign = 1
	, stringparts // undef. will be [] in string mode
	
	, activeobject = output
	, parentchain = []
	, parent_key_pair
	, keyparts = ''
	, valueparts = ''
	, key // undef. will be Truthy when Key is resolved.
	, datalen = data.length - 1 // stripping ending }
	, ch;

	i = 1; // stripping starting {
	
	while (i != datalen){
		// - { } ' are special.

		ch = data[i];
		i += 1;

		if (ch == "'"){
			if (stringparts){
				// end of string mode
				key = stringparts.join('');
				stringparts = undef		;		
			} else {
				// start of string mode
				stringparts = []		;		
			}
		} else if (stringparts){
			stringparts.push(ch);
		} else if (ch == '{'){
			// start of object
			parentchain.push( [activeobject, key] );
			activeobject = {};
			key = undef;
		} else if (ch == '}'){
			// end of object
			parent_key_pair = parentchain.pop();
			parent_key_pair[0][parent_key_pair[1]] = activeobject;
			key = undef;
			activeobject = parent_key_pair[0];
		} else if (ch == '-'){
			sign = -1;
		} else {
			// must be number
			if (key === undef) {
				if (mapping.hasOwnProperty(ch)){
					keyparts += mapping[ch];
					key = parseInt(keyparts, 16) * sign;
					sign = +1;
					keyparts = '';
				} else {
					keyparts += ch;
				}
			} else {
				if (mapping.hasOwnProperty(ch)){
					valueparts += mapping[ch];
					activeobject[key] = parseInt(valueparts, 16) * sign;
					sign = +1;
					key = undef;
					valueparts = '';
				} else {
					valueparts += ch	;				
				}
			}
		}
	} // end while

	return output;
};

// encoding = 'Unicode' 
// NOT UTF8, NOT UTF16BE/LE, NOT UCS2BE/LE. NO clever BOM behavior
// Actual 16bit char codes used.
// no multi-byte logic here

// Unicode characters to WinAnsiEncoding:
// {402: 131, 8211: 150, 8212: 151, 8216: 145, 8217: 146, 8218: 130, 8220: 147, 8221: 148, 8222: 132, 8224: 134, 8225: 135, 8226: 149, 8230: 133, 8364: 128, 8240:137, 8249: 139, 8250: 155, 710: 136, 8482: 153, 338: 140, 339: 156, 732: 152, 352: 138, 353: 154, 376: 159, 381: 142, 382: 158}
// as you can see, all Unicode chars are outside of 0-255 range. No char code conflicts.
// this means that you can give Win cp1252 encoded strings to jsPDF for rendering directly
// as well as give strings with some (supported by these fonts) Unicode characters and 
// these will be mapped to win cp1252 
// for example, you can send char code (cp1252) 0x80 or (unicode) 0x20AC, getting "Euro" glyph displayed in both cases.

var encodingBlock = {
	'codePages': ['WinAnsiEncoding']
	, 'WinAnsiEncoding': uncompress("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")
}
, encodings = {'Unicode':{
	'Courier': encodingBlock
	, 'Courier-Bold': encodingBlock
	, 'Courier-BoldOblique': encodingBlock
	, 'Courier-Oblique': encodingBlock
	, 'Helvetica': encodingBlock
	, 'Helvetica-Bold': encodingBlock
	, 'Helvetica-BoldOblique': encodingBlock
	, 'Helvetica-Oblique': encodingBlock
	, 'Times-Roman': encodingBlock
	, 'Times-Bold': encodingBlock
	, 'Times-BoldItalic': encodingBlock
	, 'Times-Italic': encodingBlock
//	, 'Symbol'
//	, 'ZapfDingbats'
}}
/** 
Resources:
Font metrics data is reprocessed derivative of contents of
"Font Metrics for PDF Core 14 Fonts" package, which exhibits the following copyright and license:

Copyright (c) 1989, 1990, 1991, 1992, 1993, 1997 Adobe Systems Incorporated. All Rights Reserved.

This file and the 14 PostScript(R) AFM files it accompanies may be used,
copied, and distributed for any purpose and without charge, with or without
modification, provided that all copyright notices are retained; that the AFM
files are not distributed without this file; that all modifications to this
file or any of the AFM files are prominently noted in the modified file(s);
and that this paragraph is not modified. Adobe Systems has no responsibility
or obligation to support the use of the AFM files.

*/
, fontMetrics = {'Unicode':{
	// all sizing numbers are n/fontMetricsFractionOf = one font size unit
	// this means that if fontMetricsFractionOf = 1000, and letter A's width is 476, it's
	// width is 476/1000 or 47.6% of its height (regardless of font size)
	// At this time this value applies to "widths" and "kerning" numbers.

	// char code 0 represents "default" (average) width - use it for chars missing in this table.
	// key 'fof' represents the "fontMetricsFractionOf" value

	'Courier-Oblique': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-BoldItalic': uncompress("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}")
	, 'Helvetica-Bold': uncompress("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}")
	, 'Courier': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Courier-BoldOblique': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-Bold': uncompress("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}")
	//, 'Symbol': uncompress("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}")
	, 'Helvetica': uncompress("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
	, 'Helvetica-BoldOblique': uncompress("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}")
	//, 'ZapfDingbats': uncompress("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Courier-Bold': uncompress("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}")
	, 'Times-Italic': uncompress("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}")
	, 'Times-Roman': uncompress("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}")
	, 'Helvetica-Oblique': uncompress("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
}};

/*
This event handler is fired when a new jsPDF object is initialized
This event handler appends metrics data to standard fonts within
that jsPDF instance. The metrics are mapped over Unicode character
codes, NOT CIDs or other codes matching the StandardEncoding table of the
standard PDF fonts.
Future:
Also included is the encoding maping table, converting Unicode (UCS-2, UTF-16)
char codes to StandardEncoding character codes. The encoding table is to be used
somewhere around "pdfEscape" call.
*/

API.events.push([ 
	'addFonts'
	,function(fontManagementObjects) {
		// fontManagementObjects is {
		//	'fonts':font_ID-keyed hash of font objects
		//	, 'dictionary': lookup object, linking ["FontFamily"]['Style'] to font ID
		//}
		var font
		, fontID
		, metrics
		, unicode_section
		, encoding = 'Unicode'
		, encodingBlock;

		for (fontID in fontManagementObjects.fonts){
			if (fontManagementObjects.fonts.hasOwnProperty(fontID)) {
				font = fontManagementObjects.fonts[fontID];

				// // we only ship 'Unicode' mappings and metrics. No need for loop.
				// // still, leaving this for the future.

				// for (encoding in fontMetrics){
				// 	if (fontMetrics.hasOwnProperty(encoding)) {

						metrics = fontMetrics[encoding][font.PostScriptName];
						if (metrics) {
							if (font.metadata[encoding]) {
								unicode_section = font.metadata[encoding];
							} else {
								unicode_section = font.metadata[encoding] = {};
							}

							unicode_section.widths = metrics.widths;
							unicode_section.kerning = metrics.kerning;
						}
				// 	}
				// }
				// for (encoding in encodings){
				// 	if (encodings.hasOwnProperty(encoding)) {
						encodingBlock = encodings[encoding][font.PostScriptName];
						if (encodingBlock) {
							if (font.metadata[encoding]) {
								unicode_section = font.metadata[encoding];
							} else {
								unicode_section = font.metadata[encoding] = {};
							}

							unicode_section.encoding = encodingBlock;
							if (encodingBlock.codePages && encodingBlock.codePages.length) {
								font.encoding = encodingBlock.codePages[0];
							}
						}
				// 	}
				// }
			}
		}
	}
]) ;// end of adding event handler

})(jsPDF.API);

/* +++ /PLUGIN FONT METRICS +++ */


/* ++++ PLUGIN splittext */
/** @preserve
 jsPDF split_text_to_size plugin
 Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 MIT license.
 */
/**
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

;(function(API) {
	'use strict';

	/**
	 Returns an array of length matching length of the 'word' string, with each
	 cell ocupied by the width of the char in that position.

	 @function
	 @param word {String}
	 @param widths {Object}
	 @param kerning {Object}
	 @returns {Array}
	 */
	var getCharWidthsArray = API.getCharWidthsArray = function(text, options) {

		if (!options) {
			options = {};
		}

		var widths = options.widths ? options.widths : this.internal.getFont().metadata.Unicode.widths,
		    widthsFractionOf = widths.fof ? widths.fof : 1,
		    kerning = options.kerning ? options.kerning : this.internal.getFont().metadata.Unicode.kerning,
		    kerningFractionOf = kerning.fof ? kerning.fof : 1;

		// console.log("widths, kergnings", widths, kerning)

		var i,
		    l,
		    char_code,
		    char_width,
		    prior_char_code = 0// for kerning
		,
		    default_char_width = widths[0] || widthsFractionOf,
		    output = [];

		for ( i = 0,
		l = text.length; i < l; i++) {
			char_code = text.charCodeAt(i);
			output.push((widths[char_code] || default_char_width ) / widthsFractionOf + (kerning[char_code] && kerning[char_code][prior_char_code] || 0 ) / kerningFractionOf);
			prior_char_code = char_code;
		}

		return output;
	};
	var getArraySum = function(array) {
		var i = array.length,
		    output = 0;
		while (i) {
			;
			i--;
			output += array[i];
		}
		return output;
	};
	/**
	 Returns a widths of string in a given font, if the font size is set as 1 point.

	 In other words, this is "proportional" value. For 1 unit of font size, the length
	 of the string will be that much.

	 Multiply by font size to get actual width in *points*
	 Then divide by 72 to get inches or divide by (72/25.6) to get 'mm' etc.

	 @public
	 @function
	 @param
	 @returns {Type}
	 */
	var getStringUnitWidth = API.getStringUnitWidth = function(text, options) {
		return getArraySum(getCharWidthsArray.call(this, text, options));
	};

	/**
	 returns array of lines
	 */
	var splitLongWord = function(word, widths_array, firstLineMaxLen, maxLen) {
		var answer = [];

		// 1st, chop off the piece that can fit on the hanging line.
		var i = 0,
		    l = word.length,
		    workingLen = 0;
		while (i !== l && workingLen + widths_array[i] < firstLineMaxLen) {
			workingLen += widths_array[i];
			i++;
		}
		// this is first line.
		answer.push(word.slice(0, i));

		// 2nd. Split the rest into maxLen pieces.
		var startOfLine = i;
		workingLen = 0;
		while (i !== l) {
			if (workingLen + widths_array[i] > maxLen) {
				answer.push(word.slice(startOfLine, i));
				workingLen = 0;
				startOfLine = i;
			}
			workingLen += widths_array[i];
			i++;
		}
		if (startOfLine !== i) {
			answer.push(word.slice(startOfLine, i));
		}

		return answer;
	};

	// Note, all sizing inputs for this function must be in "font measurement units"
	// By default, for PDF, it's "point".
	var splitParagraphIntoLines = function(text, maxlen, options) {
		// at this time works only on Western scripts, ones with space char
		// separating the words. Feel free to expand.

		if (!options) {
			options = {};
		}

		var spaceCharWidth = getCharWidthsArray(' ', options)[0];

		var words = text.split(' ');

		var line = [],
		    lines = [line],
		    line_length = options.textIndent || 0,
		    separator_length = 0,
		    current_word_length = 0,
		    word,
		    widths_array;

		var i,
		    l,
		    tmp;
		for ( i = 0,
		l = words.length; i < l; i++) {
			word = words[i];
			widths_array = getCharWidthsArray(word, options);
			current_word_length = getArraySum(widths_array);

			if (line_length + separator_length + current_word_length > maxlen) {
				if (current_word_length > maxlen) {
					// this happens when you have space-less long URLs for example.
					// we just chop these to size. We do NOT insert hiphens
					tmp = splitLongWord(word, widths_array, maxlen - (line_length + separator_length), maxlen);
					// first line we add to existing line object
					line.push(tmp.shift());// it's ok to have extra space indicator there
					// last line we make into new line object
					line = [tmp.pop()];
					// lines in the middle we apped to lines object as whole lines
					while (tmp.length) {
						lines.push([tmp.shift()]); // single fragment occupies whole line
					}
					current_word_length = getArraySum(widths_array.slice(word.length - line[0].length));
				} else {
					// just put it on a new line
					line = [word];
				}

				// now we attach new line to lines
				lines.push(line);

				line_length = current_word_length;
				separator_length = spaceCharWidth;

			} else {
				line.push(word);

				line_length += separator_length + current_word_length;
				separator_length = spaceCharWidth;
			}
		}

		var output = [];
		for ( i = 0,
		l = lines.length; i < l; i++) {
			output.push(lines[i].join(' '));
		}
		return output;

	};

	/**
	 Splits a given string into an array of strings. Uses 'size' value
	 (in measurement units declared as default for the jsPDF instance)
	 and the font's "widths" and "Kerning" tables, where availabe, to
	 determine display length of a given string for a given font.

	 We use character's 100% of unit size (height) as width when Width
	 table or other default width is not available.

	 @public
	 @function
	 @param text {String} Unencoded, regular JavaScript (Unicode, UTF-16 / UCS-2) string.
	 @param size {Number} Nominal number, measured in units default to this instance of jsPDF.
	 @param options {Object} Optional flags needed for chopper to do the right thing.
	 @returns {Array} with strings chopped to size.
	 */
	API.splitTextToSize = function(text, maxlen, options) {
		'use strict';
		if (!options) {
			options = {};
		}
		var fsize = options.fontSize || this.internal.getFontSize(),
		    newOptions = (function(options) {
			var widths = {
				0 : 1
			},
			    kerning = {};

			if (!options.widths || !options.kerning) {
				var f = this.internal.getFont(options.fontName, options.fontStyle),
				    encoding = 'Unicode';
				// NOT UTF8, NOT UTF16BE/LE, NOT UCS2BE/LE
				// Actual JavaScript-native String's 16bit char codes used.
				// no multi-byte logic here

				if (f.metadata[encoding]) {
					return {
						widths : f.metadata[encoding].widths || widths,
						kerning : f.metadata[encoding].kerning || kerning
					};
				}
			} else {
				return {
					widths : options.widths,
					kerning : options.kerning
				};
			}

			// then use default values
			return {
				widths : widths,
				kerning : kerning
			};
		}).call(this, options);

		// first we split on end-of-line chars
		var paragraphs;
		if (text.match(/[\n\r]/)) {
			paragraphs = text.split(/\r\n|\r|\n/g);
		} else {
			paragraphs = [text];
		}

		// now we convert size (max length of line) into "font size units"
		// at present time, the "font size unit" is always 'point'
		// 'proportional' means, "in proportion to font size"
		var fontUnit_maxLen = 1.0 * this.internal.scaleFactor * maxlen / fsize;
		// at this time, fsize is always in "points" regardless of the default measurement unit of the doc.
		// this may change in the future?
		// until then, proportional_maxlen is likely to be in 'points'

		// If first line is to be indented (shorter or longer) than maxLen
		// we indicate that by using CSS-style "text-indent" option.
		// here it's in font units too (which is likely 'points')
		// it can be negative (which makes the first line longer than maxLen)
		newOptions.textIndent = options.textIndent ? options.textIndent * 1.0 * this.internal.scaleFactor / fsize : 0;
		var i,
		    l,
		    output = [];
		for ( i = 0,
		l = paragraphs.length; i < l; i++) {
			output = output.concat(splitParagraphIntoLines(paragraphs[i], fontUnit_maxLen, newOptions));
		}

		return output;
	};

})(jsPDF.API);
/* ++++ /PLUGIN splittext */



/* ++++ PLUGIN addAutotable */
/**
 * jsPDF AutoTable plugin
 * Copyright (c) 2014 Simon Bengtsson, https://github.com/someatoms/jsPDF-AutoTable
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */
(function (API) {
    'use strict';
    // Ratio between font size and font height. The number comes from jspdf's source code
    var FONT_ROW_RATIO = 1.15;
    var doc, // The current jspdf instance
        cursor, // An object keeping track of the x and y position of the next table cell to draw
        settings, // Default options merged with user options
        pageCount, // The  page count the current table spans
        table; // The current Table instance

    // Base style for all themes
    var defaultStyles = {
        cellPadding: 5,
        fontSize: 10,
        font: "helvetica", // helvetica, times, courier
        lineColor: 200,
        lineWidth: 0.1,
        fontStyle: 'normal', // normal, bold, italic, bolditalic
        overflow: 'ellipsize', // visible, hidden, ellipsize or linebreak
        fillColor: 255,
        textColor: 20,
        halign: 'left', // left, center, right
        valign: 'middle', // top, middle, bottom
        fillStyle: 'F', // 'S', 'F' or 'DF' (stroke, fill or fill then stroke)
        rowHeight: 20,
        columnWidth: 'auto'
    };

    // Styles for the themes
    var themes = {
        'striped': {
            table: {
                fillColor: 255,
                textColor: 80,
                fontStyle: 'normal',
                fillStyle: 'F'
            },
            header: {
                textColor: 255,
                fillColor: [41, 128, 185],
                rowHeight: 23,
                fontStyle: 'bold'
            },
            body: {},
            alternateRow: {fillColor: 245}
        },
        'grid': {
            table: {
                fillColor: 255,
                textColor: 80,
                fontStyle: 'normal',
                lineWidth: 0.1,
                fillStyle: 'S'
            },
            header: {
                textColor: 255,
                fillColor: [26, 188, 156],
                rowHeight: 23,
                fillStyle: 'F',
                fontStyle: 'bold'
            },
            body: {},
            alternateRow: {}
        },
        'plain': {header: {fontStyle: 'bold'}}
    };

    // See README.md for documentation of the options
    // See examples.js for usage examples
    var defaultOptions = function () {
        return {
            // Styling
            theme: 'striped', // 'striped', 'grid' or 'plain'
            styles: {},
            headerStyles: {},
            bodyStyles: {},
            alternateRowStyles: {},
            columnStyles: {},

            // Properties
            startY: false, // false indicates the margin.top value
            margin: 10,
            pageBreak: 'auto', // 'auto', 'avoid', 'always'
            tableWidth: 'auto', // number, 'auto', 'wrap'

            // Hooks
            createdHeaderCell: function (cell, data) {},
            createdCell: function (cell, data) {},
            drawHeaderRow: function (row, data) {},
            drawRow: function (row, data) {},
            drawHeaderCell: function (cell, data) {},
            drawCell: function (cell, data) {},
            beforePageContent: function (data) {},
            afterPageContent: function (data) {}
        };
    };

    /**
     * Create a table from a set of rows and columns.
     *
     * @param {Object[]|String[]} headers Either as an array of objects or array of strings
     * @param {Object[][]|String[][]} data Either as an array of objects or array of strings
     * @param {Object} [options={}] Options that will override the default ones
     */
    API.addAutoTable = function (args) {
    	var headers = args.headers || [];
    	var data=args.data || [[]];
    	var options = args.options|| {};
        doc = this;
        settings = initOptions(options || {});
        pageCount = 1;
        cursor = {
            x: settings.margin.left,
            y: settings.startY === false ? settings.margin.top : settings.startY
        };

        var userStyles = {
            textColor: 30, // Setting text color to dark gray as it can't be obtained from jsPDF
            fontSize: doc.internal.getFontSize(),
            fontStyle: doc.internal.getFont().fontStyle
        };

        // Create the table model with its columns, rows and cells
        createModels(headers, data);
        calculateWidths();

        // Page break if there is room for only the first data row
        var firstRowHeight = table.rows[0] && settings.pageBreak === 'auto' ? table.rows[0].height : 0;
        var minTableBottomPos = settings.startY + settings.margin.bottom + table.headerRow.height + firstRowHeight;
        if (settings.pageBreak === 'avoid') {
            minTableBottomPos += table.height;
        }
        if ((settings.pageBreak === 'always' && settings.startY !== false) ||
            (settings.startY !== false && minTableBottomPos > doc.internal.pageSize.height)) {
            doc.addPage();
            cursor.y = settings.margin.top;
        }
        applyStyles(userStyles);
        settings.beforePageContent(hooksData());
        if (settings.drawHeaderRow(table.headerRow, hooksData({row: table.headerRow})) !== false) {
            printRow(table.headerRow, settings.drawHeaderCell);
        }
        applyStyles(userStyles);
        printRows();
        settings.afterPageContent(hooksData());
        applyStyles(userStyles);
        return this;
    };

    /**
     * Returns the Y position of the last drawn cell
     * @returns int
     */
    API.autoTableEndPosY = function () {
        if (typeof cursor === 'undefined' || typeof cursor.y === 'undefined') {
            console.error("autoTableEndPosY() called without autoTable() being called first");
            return 0;
        }
        return cursor.y;
    };

    /**
     * Parses an html table
     *
     * @param table Html table element
     * @returns Object Object with two properties, columns and rows
     */
    API.autoTableHtmlToJson = function (table) {
        var data = [],
            headers = [],
            header = table.rows[0],
            tableRow,
            rowData,
            i,
            j;

        for (i = 0; i < header.cells.length; i++) {
            headers.push(typeof header.cells[i] !== 'undefined' ? header.cells[i].textContent : '');
        }

        for (i = 1; i < table.rows.length; i++) {
            tableRow = table.rows[i];
            rowData = [];
            for (j = 0; j < header.cells.length; j++) {
                rowData.push(typeof tableRow.cells[j] !== 'undefined' ? tableRow.cells[j].textContent : '');
            }
            data.push(rowData);
        }
        return {columns: headers, data: data, rows: data};
    };

    /**
     * Improved text function with halign and valign support
     * Inspiration from: http://stackoverflow.com/questions/28327510/align-text-right-using-jspdf/28433113#28433113
     */
    API.autoTableText = function (text, x, y, styles) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            console.error('The x and y parameters are required. Missing for the text: ', text);
        }
        var fontSize = doc.internal.getFontSize() / doc.internal.scaleFactor;

        // As defined in jsPDF source code
        var lineHeightProportion = FONT_ROW_RATIO;

        var splitRegex = /\r\n|\r|\n/g;
        var splittedText = null;
        var lineCount = 1;
        if (styles.valign === 'middle' || styles.valign === 'bottom' || styles.halign === 'center' || styles.halign === 'right') {
            splittedText = typeof text === 'string' ? text.split(splitRegex) : text;

            lineCount = splittedText.length || 1;
        }

        // Align the top
        y += fontSize * (2 - lineHeightProportion);

        if (styles.valign === 'middle')
            y -= (lineCount / 2) * fontSize;
        else if (styles.valign === 'bottom')
            y -= lineCount * fontSize;

        if (styles.halign === 'center' || styles.halign === 'right') {
            var alignSize = fontSize;
            if (styles.halign === 'center')
                alignSize *= 0.5;

            if (lineCount >= 1) {
                for (var iLine = 0; iLine < splittedText.length; iLine++) {
                    doc.text(splittedText[iLine], x - doc.getStringUnitWidth(splittedText[iLine]) * alignSize, y);
                    y += fontSize;
                }
                return doc;
            }
            x -= doc.getStringUnitWidth(text) * alignSize;
        }

        doc.text(text, x, y);
        return doc;
    };

    function initOptions(userOptions) {
        var settings = extend(defaultOptions(), userOptions);

        // Options
        if (typeof settings.extendWidth !== 'undefined') {
            settings.tableWidth = settings.extendWidth ? 'auto' : 'wrap';
            console.error("Use of deprecated option: extendWidth, use tableWidth instead.");
        }
        if (typeof settings.margins !== 'undefined') {
            if (typeof settings.margin === 'undefined') settings.margin = settings.margins;
            console.error("Use of deprecated option: margins, use margin instead.");
        }

        [['padding', 'cellPadding'], ['lineHeight', 'rowHeight'], 'fontSize', 'overflow'].forEach(function (o) {
            var deprecatedOption = typeof o === 'string' ? o : o[0];
            var style = typeof o === 'string' ? o : o[1];
            if (typeof settings[deprecatedOption] !== 'undefined') {
                if (typeof settings.styles[style] === 'undefined') {
                    settings.styles[style] = settings[deprecatedOption];
                }
                console.error("Use of deprecated option: " + deprecatedOption + ", use the style " + style + " instead.");
            }
        });

        // Unifying
        var marginSetting = settings.margin;
        settings.margin = {};
        if (typeof marginSetting.horizontal === 'number') {
            marginSetting.right = marginSetting.horizontal;
            marginSetting.left = marginSetting.horizontal;
        }
        if (typeof marginSetting.vertical === 'number') {
            marginSetting.top = marginSetting.vertical;
            marginSetting.bottom = marginSetting.vertical;
        }
        ['top', 'right', 'bottom', 'left'].forEach(function (side, i) {
            if (typeof marginSetting === 'number') {
                settings.margin[side] = marginSetting;
            } else {
                var key = Array.isArray(marginSetting) ? i : side;
                settings.margin[side] = typeof marginSetting[key] === 'number' ? marginSetting[key] : 40;
            }
        });

        return settings;
    }

    /**
     * Create models from the user input
     *
     * @param inputHeaders
     * @param inputData
     */
    function createModels(inputHeaders, inputData) {
        table = new Table();

        var splitRegex = /\r\n|\r|\n/g;

        // Header row and columns
        var headerRow = new Row();
        headerRow.raw = inputHeaders;
        headerRow.index = -1;

        var themeStyles = extend(defaultStyles, themes[settings.theme].table, themes[settings.theme].header);
        headerRow.styles = extend(themeStyles, settings.styles, settings.headerStyles);

        // Columns and header row
        inputHeaders.forEach(function (rawColumn, dataKey) {
            if (typeof rawColumn === 'object') {
                dataKey = typeof rawColumn.dataKey !== 'undefined' ? rawColumn.dataKey : rawColumn.key;
            }

            if (typeof rawColumn.width !== 'undefined') {
                console.error("Use of deprecated option: column.width, use column.styles.columnWidth instead.");
            }

            var col = new Column(dataKey);
            col.styles = {};
            if (typeof col.styles.columnWidth === 'undefined') col.styles.columnWidth = 'auto';
            table.columns.push(col);

            var cell = new Cell();
            cell.raw = typeof rawColumn === 'object' ? rawColumn.title : rawColumn;
            cell.styles = headerRow.styles;
            cell.text = '' + cell.raw;
            cell.contentWidth = cell.styles.cellPadding * 2 + getStringWidth(cell.text, cell.styles);
            cell.text = cell.text.split(splitRegex);

            headerRow.cells[dataKey] = cell;
            settings.createdHeaderCell(cell, {column: col, row: headerRow, settings: settings});
        });
        table.headerRow = headerRow;

        // Rows och cells
        inputData.forEach(function (rawRow, i) {
            var row = new Row(rawRow);
            var isAlternate = i % 2 === 0;
            var themeStyles = extend(defaultStyles, themes[settings.theme].table, isAlternate ? themes[settings.theme].alternateRow : {});
            var userStyles = extend(settings.styles, settings.bodyStyles, isAlternate ? settings.alternateRowStyles : {});
            row.styles = extend(themeStyles, userStyles);
            row.index = i;
            table.columns.forEach(function (column) {
                var cell = new Cell();
                cell.raw = rawRow[column.dataKey];
                cell.styles = extend(row.styles, column.styles);
                cell.text = typeof cell.raw !== 'undefined' ? '' + cell.raw : ''; // Stringify 0 and false, but not undefined
                row.cells[column.dataKey] = cell;
                settings.createdCell(cell, {column: column, row: row, settings: settings});
                cell.contentWidth = cell.styles.cellPadding * 2 + getStringWidth(cell.text, cell.styles);
                cell.text = cell.text.split(splitRegex);
            });
            table.rows.push(row);
        });
    }

    /**
     * Calculate the column widths
     */
    function calculateWidths() {
        // Column and table content width
        var tableContentWidth = 0;
        table.columns.forEach(function (column) {
            column.contentWidth = table.headerRow.cells[column.dataKey].contentWidth;
            table.rows.forEach(function (row) {
                var cellWidth = row.cells[column.dataKey].contentWidth;
                if (cellWidth > column.contentWidth) {
                    column.contentWidth = cellWidth;
                }
            });
            column.width = column.contentWidth;
            tableContentWidth += column.contentWidth;
        });
        table.contentWidth = tableContentWidth;

        var maxTableWidth = doc.internal.pageSize.width - settings.margin.left - settings.margin.right;
        var preferredTableWidth = maxTableWidth; // settings.tableWidth === 'auto'
        if (typeof settings.tableWidth === 'number') {
            preferredTableWidth = settings.tableWidth;
        } else if (settings.tableWidth === 'wrap') {
            preferredTableWidth = table.contentWidth;
        }
        table.width = preferredTableWidth < maxTableWidth ? preferredTableWidth : maxTableWidth;

        // To avoid subjecting columns with little content with the chosen overflow method,
        // never shrink a column more than the table divided by column count (its "fair part")
        var dynamicColumns = [];
        var dynamicColumnsContentWidth = 0;
        var fairWidth = table.width / table.columns.length;
        var staticWidth = 0;
        table.columns.forEach(function (column) {
            if (column.styles.columnWidth === 'wrap') {
                column.width = column.contentWidth;
            } else if (typeof column.styles.columnWidth === 'number') {
                column.width = column.styles.columnWidth;
            } else if (column.styles.columnWidth === 'auto' || true) {
                if (column.contentWidth <= fairWidth && table.contentWidth > table.width) {
                    column.width = column.contentWidth;
                } else {
                    dynamicColumns.push(column);
                    dynamicColumnsContentWidth += column.contentWidth;
                    column.width = 0;
                }
            }
            staticWidth += column.width;
        });

        // Distributes extra width or trims columns down to fit
        distributeWidth(dynamicColumns, staticWidth, dynamicColumnsContentWidth, fairWidth);

        // Row height, table height and text overflow
        table.height = 0;
        var all = table.rows.concat(table.headerRow);
        all.forEach(function (row, i) {
            var lineBreakCount = 0;
            table.columns.forEach(function (col) {
                var cell = row.cells[col.dataKey];
                applyStyles(cell.styles);
                var textSpace = col.width - cell.styles.cellPadding * 2;
                if (cell.styles.overflow === 'linebreak') {
                    // Add one pt to textSpace to fix rounding error
                    cell.text = doc.splitTextToSize(cell.text, textSpace + 1, {fontSize: cell.styles.fontSize});
                } else if (cell.styles.overflow === 'ellipsize') {
                    cell.text = ellipsize(cell.text, textSpace, cell.styles);
                } else if (cell.styles.overflow === 'visible') {
                    // Do nothing
                } else if (cell.styles.overflow === 'hidden') {
                    cell.text = ellipsize(cell.text, textSpace, cell.styles, '');
                } else if (typeof cell.styles.overflow === 'function') {
                    cell.text = cell.styles.overflow(cell.text, textSpace);
                } else {
                    console.error("Unrecognized overflow type: " + cell.styles.overflow);
                }
                var count = Array.isArray(cell.text) ? cell.text.length - 1 : 0;
                if (count > lineBreakCount) {
                    lineBreakCount = count;
                }
            });
            row.height = row.styles.rowHeight + lineBreakCount * row.styles.fontSize * FONT_ROW_RATIO;
            table.height += row.height;
        });
    }

    function distributeWidth(dynamicColumns, staticWidth, dynamicColumnsContentWidth, fairWidth) {
        var extraWidth = table.width - staticWidth - dynamicColumnsContentWidth;
        for (var i = 0; i < dynamicColumns.length; i++) {
            var col = dynamicColumns[i];
            var ratio = col.contentWidth / dynamicColumnsContentWidth;
            // A column turned out to be none dynamic, start over recursively
            var isNoneDynamic = col.contentWidth + extraWidth * ratio < fairWidth;
            if (extraWidth < 0 && isNoneDynamic) {
                dynamicColumns.splice(i, 1);
                dynamicColumnsContentWidth -= col.contentWidth;
                col.width = fairWidth;
                staticWidth += col.width;
                distributeWidth(dynamicColumns, staticWidth, dynamicColumnsContentWidth, fairWidth);
                break;
            } else {
                col.width = col.contentWidth + extraWidth * ratio;
            }
        }
    }

    function printRows() {
        table.rows.forEach(function (row, i) {
            // Add a new page if cursor is at the end of page
            var newPage = table.rows[i] && (cursor.y + table.rows[i].height + settings.margin.bottom) >= doc.internal.pageSize.height;
            if (newPage) {
                settings.afterPageContent(hooksData());
                doc.addPage();
                pageCount++;
                cursor = {x: settings.margin.left, y: settings.margin.top};
                settings.beforePageContent(hooksData());
                if (settings.drawHeaderRow(row, hooksData({row: row})) !== false) {
                    printRow(table.headerRow, settings.drawHeaderCell);
                }
            }
            row.y = cursor.y;
            doc.setTextColor(0);
            if (settings.drawRow(row, hooksData({row: row})) !== false) {
                printRow(row, settings.drawCell);
            }
        });
    }

    function printRow(row, hookHandler) {
        table.columns.forEach(function (column) {
            var cell = row.cells[column.dataKey];
            applyStyles(cell.styles);

            cell.x = cursor.x;
            cell.y = cursor.y;
            cell.height = row.height;
            cell.width = column.width;

            if (cell.styles.valign === 'top') {
                cell.textPos.y = cursor.y + cell.styles.cellPadding;
            } else if (cell.styles.valign === 'bottom') {
                cell.textPos.y = cursor.y + row.height - cell.styles.cellPadding;
            } else {
                cell.textPos.y = cursor.y + row.height / 2;
            }

            if (cell.styles.halign === 'right') {
                cell.textPos.x = cursor.x + cell.width - cell.styles.cellPadding;
            } else if (cell.styles.halign === 'center') {
                cell.textPos.x = cursor.x + cell.width / 2;
            } else {
                cell.textPos.x = cursor.x + cell.styles.cellPadding;
            }

            var data = hooksData({column: column, row: row});
            if (hookHandler(cell, data) !== false) {
                doc.rect(cell.x, cell.y, cell.width, cell.height, cell.styles.fillStyle);
                doc.autoTableText(cell.text, cell.textPos.x, cell.textPos.y, {
                    halign: cell.styles.halign,
                    valign: cell.styles.valign
                });
            }

            cursor.x += cell.width;
        });

        cursor.y += row.height;
        cursor.x = settings.margin.left;
    }

    function applyStyles(styles) {
        var arr = [
            {func: doc.setFillColor, value: styles.fillColor},
            {func: doc.setTextColor, value: styles.textColor},
            {func: doc.setFontStyle, value: styles.fontStyle},
            {func: doc.setDrawColor, value: styles.lineColor},
            {func: doc.setLineWidth, value: styles.lineWidth},
            {func: doc.setFont, value: styles.font},
            {func: doc.setFontSize, value: styles.fontSize}
        ];
        arr.forEach(function (obj) {
            if (typeof obj.value !== 'undefined') {
                if (obj.value.constructor === Array) {
                    obj.func.apply(this, obj.value);
                } else {
                    obj.func(obj.value);
                }
            }
        });
    }

    function hooksData(additionalData) {
        additionalData = additionalData || {};
        var data = {
            pageCount: pageCount,
            settings: settings,
            table: table,
            cursor: cursor
        };
        for (var prop in additionalData) {
            if (additionalData.hasOwnProperty(prop)) {
                data[prop] = additionalData[prop];
            }
        }
        return data;
    }

    /**
     * Ellipsize the text to fit in the width
     */
    function ellipsize(text, width, styles, ellipsizeStr) {
        ellipsizeStr = typeof  ellipsizeStr !== 'undefined' ? ellipsizeStr : '...';

        if (Array.isArray(text)) {
            text.forEach(function (str, i) {
                text[i] = ellipsize(str, width, styles, ellipsizeStr);
            });
            return text;
        }

        if (width >= getStringWidth(text, styles)) {
            return text;
        }
        while (width < getStringWidth(text + ellipsizeStr, styles)) {
            if (text.length < 2) {
                break;
            }
            text = text.substring(0, text.length - 1);
        }
        return text.trim() + ellipsizeStr;
    }

    function getStringWidth(text, styles) {
        applyStyles(styles);
        var w = doc.getStringUnitWidth(text);
        return w * styles.fontSize;
    }

    function extend(defaults) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (defaults.hasOwnProperty(prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (var i = 1; i < arguments.length; i++) {
            var options = arguments[i];
            for (prop in options) {
                if (options.hasOwnProperty(prop)) {
                    if (typeof options[prop] === 'object' && !Array.isArray(options[prop])) {
                        //extended[prop] = extend(extended[prop] || {}, options[prop])
                        extended[prop] = options[prop];
                    } else {
                        extended[prop] = options[prop];
                    }
                }
            }
        }
        return extended;
    }
})(jsPDF.API);

var Table = function () {
    this.height = 0;
    this.width = 0;
    this.contentWidth = 0;
    this.rows = [];
    this.columns = [];
    this.headerRow = null;
    this.settings = {};
};

var Row = function () {
    this.raw = {};
    this.index = 0;
    this.styles = {};
    this.cells = {};
    this.height = -1;
    this.y = 0;
};

var Cell = function (raw) {
    this.raw = raw;
    this.styles = {};
    this.text = '';
    this.contentWidth = -1;
    this.textPos = {};
    this.height = 0;
    this.width = 0;
    this.x = 0;
    this.y = 0;
};

var Column = function (dataKey) {
    this.dataKey = dataKey;
    this.options = {};
    this.styles = {};
    this.contentWidth = -1;
    this.width = -1;
};

/*    ++++++++++++ */



;(function(jsPDFAPI) {
	'use strict';
    jsPDFAPI.test = function () {
        'use strict';
        this.addPage();
        return this;
    };
})(jsPDF.API);


;(function(jsPDFAPI) {
	'use strict';
    jsPDFAPI.addQRCode = function (args) {
        'use strict';
        var x= args.x;
        var y= args.y;
        var qroptions = args.qr;
        var width = args.width || 100;
        var PADDING = args.padding || 3;
     	var color = args.color || 0;
     	var qrcodeModule = require('de.appwerft.qrcode');
		var qrcode = new qrcodeModule(qroptions.data, qroptions.ecstrategy, qroptions.maskPattern, qroptions.version, qroptions.dataOnly, qroptions.maskTest);
		var code = qrcode.getData();
		var R = width / qrcode.getSize();
		console.log('Info: QR uses raster of ' + R)
		this.setDrawColor(color);
		this.setFillColor(color);
		for (var r = 0; r < code.length; r += 1) {
				for (var c = 0; c < code[r].length; c += 1) {
					if (code[r][c] === 1) {
						/*5% more size to cover the border of rect. */
						this.rect(PADDING + x + r * R, PADDING + y + c * R, R * 1.05, R * 1.05, 'F');
					}
				}
		}
        return this;
    };
})(jsPDF.API); 
   
   




module.exports = jsPDF;  