var SliderInput =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(2);

	var React = __webpack_require__(6);
	var Draggable = __webpack_require__(7);

	var rValidNum = /^[0-9\.]+%?$/;

	var nullfn = function nullfn() {};

	/**
	 * snap a number to certain length with specific steps
	 * e.g.:
	 *
	 * step is 0.01, and value is 12.52412
	 * result will be 12.52
	 * @param  {Number} value 
	 * @param  {Number} step  should be unit number
	 * @return {Number}       
	 */
	function snap(value, step) {
		var fixture = Math.abs(~ ~Math.log10(step));
		return parseFloat(value.toFixed(fixture));
	}

	// we only consider a horizontal slider
	function computeProgress(bounds, left) {
		left = between(left, bounds.left, bounds.right) - bounds.left;
		return left / (bounds.right - bounds.left);
	}

	// snap the value between min and max
	function between(val, min, max) {
		return Math.min(Math.max(min, val), max);
	}

	/**
	 * To prevent text selection while dragging.
	 * http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
	 */
	function stopEvent(e) {
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
		e.cancelBubble = true;
		e.returnValue = false;
		return false;
	}

	function stopPropagation(e) {
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true;
	}

	var SliderInput = React.createClass({
		displayName: 'SliderInput',

		canSlide: false,
		getInitialState: function getInitialState() {
			return {
				progress: this.props.initialProgress / (this.props.max - this.props.min),
				dragging: false
			};
		},
		getDefaultProps: function getDefaultProps() {
			return {
				initialProgress: 0,
				size: 400,
				min: 0,
				max: 100,
				indicate: false,
				step: 1,
				editable: true,
				onChange: nullfn,
				onChangeStop: nullfn,
				badgeSize: 20,
				percentageMode: false
			};
		},
		propTypes: {
			/**
	   * initial progress
	   *
	   * type `Number` denote to the real value of the slider
	   * e.g when `max` is 100, `min` is 0, and when setting `initialProgress`
	   * to 50, the slider will be at the center of the track.
	   * 
	   */
			initialProgress: React.PropTypes.number,
			/**
	   * the width of the track, the height of the track can be modified
	   * by css.
	   *
	   * since the track box-sizing is border-box, size will always
	   * ensure the track take space denote by size
	   */
			size: React.PropTypes.number,
			badgeSize: React.PropTypes.number,
			min: React.PropTypes.number,
			max: React.PropTypes.number,
			indicate: React.PropTypes.bool,
			step: React.PropTypes.number,
			editable: React.PropTypes.bool,
			percentageMode: React.PropTypes.bool,
			onChangeStop: React.PropTypes['function'],
			onChange: React.PropTypes['function']
		},
		componentDidUpdate: function componentDidUpdate() {
			// @TODO: a bit bad here.
			this.props.onChange(this.val());
			if (!this.state.dragging) {
				this.props.onChangeStop(this.val());
			}
		},
		_onMouseDown: function _onMouseDown(e) {
			stopEvent(e);

			var bounds = this.refs.draggable.getBounds();
			var badgeHalfWidth = this.refs.badge.getDOMNode().getBoundingClientRect().width / 2;
			var clientX = e.clientX,
			    clientY = e.clientY;

			bounds.left += badgeHalfWidth;
			bounds.right += badgeHalfWidth;
			this.setState({
				// Attention: the range of click event isn't the same as drag event
				progress: computeProgress(bounds, e.clientX - e.target.getBoundingClientRect().left)
			}, function () {
				this.refs.draggable.startDrag({
					clientX: clientX,
					clientY: clientY
				});
			});
		},

		// convert touch start event to click event.
		_onTouchStart: function _onTouchStart(e) {
			e.clientX = e.touches[0].clientX;
			this._onMouseDown(e);
		},
		_onDrag: function _onDrag(e, ui) {
			e.stopPropagation();
			this.setState({
				progress: computeProgress(this.refs.draggable.getBounds(), ui.position.left)
			});
		},
		_onDragStart: function _onDragStart(e, ui) {
			// prevent the editable div to be selected when mouse enter it.
			stopEvent(e);
			this.setState({
				dragging: true
			});
		},
		_onDragStop: function _onDragStop(e, ui) {
			e.stopPropagation();
			this.setState({
				dragging: false,
				progress: computeProgress(this.refs.draggable.getBounds(), ui.position.left)
			});
		},
		_onInputBlur: function _onInputBlur(e) {
			if (this.val(e.target.innerHTML) !== true) {
				e.target.innerHTML = this.formatIndicate();
			}
		},
		_onInputMouseDown: function _onInputMouseDown(e) {
			e.stopPropagation();
			if (!this.props.editable) {
				e.preventDefault();
				return false;
			}
		},
		_onInputKeypress: function _onInputKeypress(e) {
			if (e.key === 'Enter') {
				e.target.blur();
				// Workaround for webkit's bug
				// http://stackoverflow.com/questions/4878713/how-can-i-blur-a-div-where-contenteditable-true
				window.getSelection().removeAllRanges();
			}
		},
		// return the true value of current state.
		val: function val(value) {
			if (typeof value !== 'undefined') {
				value = this.parseInput(value);
				if (typeof value !== 'undefined' && value !== snap(this.state.progress, 0.01)) {
					this.setState({
						progress: value
					});
					return true;
				} else if (typeof value === 'undefined') {
					this.forceUpdate();
				}
			}
			return snap(this.state.progress * (this.props.max - this.props.min) + this.props.min, this.props.step);
		},
		// parse the input according to `precentageMode`
		parseInput: function parseInput(value) {
			if (rValidNum.test(value)) {
				if (this.props.percentageMode) {
					value = parseInt(value) / 100;
				} else {
					value = value / (this.props.max - this.props.min);
				}
				return between(value, 0, 1);
			}
		},
		// formatting the indicator
		formatIndicate: function formatIndicate() {
			var value;
			if (this.props.percentageMode) {
				value = snap(this.state.progress * 100, 1) + '%';
			} else {
				value = this.val();
			}
			return value;
		},
		render: function render() {
			var className = this.state.dragging ? ' active' : "";
			var badgeSize = this.props.badgeSize;
			var style = {
				boxSizing: 'border-box',
				width: this.props.size,
				position: 'relative',
				backgroundImage: '-webkit-linear-gradient(left, transparent ' + this.state.progress * 100 + '%, #bbb 0%)'
			},
			    badgeStyle = {
				width: badgeSize,
				height: badgeSize,
				boxSizing: 'border-box',
				position: 'absolute',
				top: -badgeSize / 2 + 2
			},
			    inidicateStyle = {
				position: 'absolute',
				top: '100%',
				marginTop: 5,
				minWidth: 30,
				left: -15 + this.props.badgeSize / 2 - 3,
				display: 'block',
				textAlign: 'center',
				overflow: 'hidden',
				lineHeight: '20px'
			};

			return React.createElement(
				'div',
				{ className: 'slider-input', onTouchStart: this._onTouchStart, onMouseDown: this._onMouseDown,
					style: {
						height: this.props.indicate ? badgeSize * 2 : badgeSize
					} },
				React.createElement('input', { type: 'hidden', name: this.props.name, value: this.val() }),
				React.createElement(
					'div',
					{ className: "slider-track" + className, style: style, ref: 'track' },
					React.createElement(
						Draggable,
						{
							axis: 'x',
							handle: '.slider-badge',
							start: { x: this.state.progress * 100 + '%', y: 0 },
							moveOnStartChange: !this.state.dragging,
							bounds: {
								left: -badgeSize / 2,
								right: this.props.size - badgeSize / 2
							},
							zIndex: 100,
							onDrag: this._onDrag,
							onStart: this._onDragStart,
							onStop: this._onDragStop,
							ref: 'draggable' },
						React.createElement(
							'div',
							{ className: "slider-badge" + className, ref: 'badge', style: badgeStyle },
							this.props.indicate && React.createElement(
								'div',
								{
									contentEditable: 'true',
									className: 'slider-indicate',
									ref: 'indicate',
									style: inidicateStyle,
									onKeyPress: this._onInputKeypress,
									onBlur: this._onInputBlur,
									onMouseDown: this._onInputMouseDown },
								this.formatIndicate()
							)
						)
					)
				)
			);
		}
	});

	module.exports = SliderInput;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./index.less", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/less-loader/index.js!./index.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, ".clearfix:before,\n.clearfix:after {\n  content: '';\n  display: table;\n}\n.clearfix:after {\n  clear: both;\n}\n.slider-input {\n  font-family: Helvetica;\n}\n.slider-input:before,\n.slider-input:after {\n  content: '';\n  display: table;\n}\n.slider-input:after {\n  clear: both;\n}\n.slider-track {\n  background-color: #6bb5f2;\n  height: 4px;\n  margin-top: 8px;\n}\n.slider-track:before,\n.slider-track:after {\n  content: '';\n  display: table;\n}\n.slider-track:after {\n  clear: both;\n}\n.slider-track.active {\n  background-color: #9FD4FF;\n}\n.slider-track .slider-badge {\n  border-radius: 50%;\n  background-color: #6bb5f2;\n  width: 12px;\n  height: 12px;\n  position: absolute;\n  top: -8px;\n  cursor: default;\n  border: 3px solid #fff;\n  transition: border 140ms;\n}\n.slider-track .slider-badge.active {\n  background-color: #9FD4FF;\n  border-color: #9FD4FF;\n}\n.slider-track .slider-badge .slider-indicate {\n  color: rgba(0, 0, 0, 0.47);\n  padding: 0;\n  margin: 0;\n  outline: 0;\n  border: 0;\n  text-align: center;\n}\n.slider-track .slider-badge .slider-indicate:focus {\n  border-bottom: 1px solid #6bb5f2;\n  box-shadow: none;\n}\n.range-input {\n  width: 400px;\n  display: table;\n}\n.range-input > span {\n  width: 1%;\n}\n.range-input > span:first-child {\n  padding-right: 7px;\n}\n.range-input > span:last-child {\n  padding-left: 7px;\n}\n.range-input input[type=\"range\"] {\n  width: 100%;\n  vertical-align: middle;\n}\n", ""]);

	// exports


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(6);
	var emptyFunction = function emptyFunction() {};
	var assign = __webpack_require__(8);
	var classNames = function classNames() {

	  var classes = '';

	  for (var i = 0; i < arguments.length; i++) {
	    var arg = arguments[i];
	    if (!arg) continue;

	    var argType = typeof arg;

	    if ('string' === argType || 'number' === argType) {
	      classes += ' ' + arg;
	    } else if (Array.isArray(arg)) {
	      classes += ' ' + classNames.apply(null, arg);
	    } else if ('object' === argType) {
	      for (var key in arg) {
	        if (arg.hasOwnProperty(key) && arg[key]) {
	          classes += ' ' + key;
	        }
	      }
	    }
	  }

	  return classes.substr(1);
	};
	var browserPrefix = (function () {
	  if (typeof window === 'undefined') return '';
	  // Thanks David Walsh
	  var styles = window.getComputedStyle(document.documentElement, ''),
	      pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
	  // 'ms' is not titlecased
	  if (pre === 'ms') return pre;
	  return pre.slice(0, 1).toUpperCase() + pre.slice(1);
	})();

	//
	// Helpers. See Element definition below this section.
	//

	function createUIEvent(draggable) {
	  // State changes are often (but not always!) async. We want the latest value.
	  var state = draggable._pendingState || draggable.state;
	  return {
	    node: draggable.getDOMNode(),
	    position: {
	      top: state.clientY,
	      left: state.clientX
	    }
	  };
	}

	function canDragX(draggable) {
	  return draggable.props.axis === 'both' || draggable.props.axis === 'x';
	}

	function canDragY(draggable) {
	  return draggable.props.axis === 'both' || draggable.props.axis === 'y';
	}

	function isFunction(func) {
	  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]';
	}

	// @credits https://gist.github.com/rogozhnikoff/a43cfed27c41e4e68cdc
	function findInArray(array, callback) {
	  for (var i = 0, length = array.length; i < length; i++) {
	    if (callback.apply(callback, [array[i], i, array])) return array[i];
	  }
	}

	var matchesSelectorFunc = '';
	function matchesSelector(el, selector) {
	  if (!matchesSelectorFunc) {
	    matchesSelectorFunc = findInArray(['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'], function (method) {
	      return isFunction(el[method]);
	    });
	  }

	  return el[matchesSelectorFunc].call(el, selector);
	}

	/**
	 * simple abstraction for dragging events names
	 * */
	var eventsFor = {
	  touch: {
	    start: 'touchstart',
	    move: 'touchmove',
	    end: 'touchend'
	  },
	  mouse: {
	    start: 'mousedown',
	    move: 'mousemove',
	    end: 'mouseup'
	  }
	};

	// Default to mouse events
	var dragEventFor = eventsFor.mouse;

	/**
	 * get {clientX, clientY} positions of control
	 * */
	function getControlPosition(e) {
	  var position = e.targetTouches && e.targetTouches[0] || e;
	  return {
	    clientX: position.clientX,
	    clientY: position.clientY
	  };
	}

	function addEvent(el, event, handler) {
	  if (!el) {
	    return;
	  }
	  if (el.attachEvent) {
	    el.attachEvent('on' + event, handler);
	  } else if (el.addEventListener) {
	    el.addEventListener(event, handler, true);
	  } else {
	    el['on' + event] = handler;
	  }
	}

	function removeEvent(el, event, handler) {
	  if (!el) {
	    return;
	  }
	  if (el.detachEvent) {
	    el.detachEvent('on' + event, handler);
	  } else if (el.removeEventListener) {
	    el.removeEventListener(event, handler, true);
	  } else {
	    el['on' + event] = null;
	  }
	}

	function outerHeight(node) {
	  // This is deliberately excluding margin for our calculations, since we are using
	  // offsetTop which is including margin. See getBoundPosition
	  var height = node.clientHeight;
	  var computedStyle = window.getComputedStyle(node);
	  height += int(computedStyle.borderTopWidth);
	  height += int(computedStyle.borderBottomWidth);
	  return height;
	}

	function outerWidth(node) {
	  // This is deliberately excluding margin for our calculations, since we are using
	  // offsetLeft which is including margin. See getBoundPosition
	  var width = node.clientWidth;
	  var computedStyle = window.getComputedStyle(node);
	  width += int(computedStyle.borderLeftWidth);
	  width += int(computedStyle.borderRightWidth);
	  return width;
	}
	function innerHeight(node) {
	  var height = node.clientHeight;
	  var computedStyle = window.getComputedStyle(node);
	  height -= int(computedStyle.paddingTop);
	  height -= int(computedStyle.paddingBottom);
	  return height;
	}

	function innerWidth(node) {
	  var width = node.clientWidth;
	  var computedStyle = window.getComputedStyle(node);
	  width -= int(computedStyle.paddingLeft);
	  width -= int(computedStyle.paddingRight);
	  return width;
	}

	function isNum(num) {
	  return typeof num === 'number' && !isNaN(num);
	}

	function int(a) {
	  return parseInt(a, 10);
	}

	function _getBounds(draggable) {
	  var bounds = JSON.parse(JSON.stringify(draggable.props.bounds));
	  var node = draggable.getDOMNode();
	  var parent = node.parentNode;

	  if (bounds === 'parent') {
	    var nodeStyle = window.getComputedStyle(node);
	    var parentStyle = window.getComputedStyle(parent);
	    // Compute bounds. This is a pain with padding and offsets but this gets it exactly right.
	    bounds = {
	      left: -node.offsetLeft + int(parentStyle.paddingLeft) + int(nodeStyle.marginLeft),
	      top: -node.offsetTop + int(parentStyle.paddingTop) + int(nodeStyle.marginTop),
	      right: innerWidth(parent) - outerWidth(node) - node.offsetLeft,
	      bottom: innerHeight(parent) - outerHeight(node) - node.offsetTop
	    };
	  }

	  return bounds;
	}

	/**
	 * force clientX and clientY inside the boundary.
	 * @param  {object} bounds  bounds object with left,right,bottom,top
	 * @param  {number} clientX X
	 * @param  {number} clientY Y
	 * @return {array} array of clientX, clientY
	 */
	function getBoundPosition(bounds, clientX, clientY) {
	  // Keep x and y below right and bottom limits...
	  if (isNum(bounds.right)) clientX = Math.min(clientX, bounds.right);
	  if (isNum(bounds.bottom)) clientY = Math.min(clientY, bounds.bottom);

	  // But above left and top limits.
	  if (isNum(bounds.left)) clientX = Math.max(clientX, bounds.left);
	  if (isNum(bounds.top)) clientY = Math.max(clientY, bounds.top);

	  return [clientX, clientY];
	}

	// clientX and clientY must be in the form of 'xx%'
	function getStartPosition(draggable, clientX, clientY) {
	  if (typeof clientX === 'string' || typeof clientY === 'string') {
	    var bounds = _getBounds(draggable);
	    if (typeof clientX === 'string') {
	      clientX = parseFloat(clientX) / 100 * (bounds.right - bounds.left) + bounds.left;
	    }
	    if (typeof clientY === 'string') {
	      clientY = parseFloat(clientY) / 100 * (bounds.bottom - bounds.top) + bounds.top;
	    }
	    var boundPosition = getBoundPosition(bounds, clientX, clientY);
	    clientX = boundPosition[0];
	    clientY = boundPosition[1];
	  }
	  return [clientX, clientY];
	}

	function snapToGrid(grid, pendingX, pendingY) {
	  var x = Math.round(pendingX / grid[0]) * grid[0];
	  var y = Math.round(pendingY / grid[1]) * grid[1];
	  return [x, y];
	}

	// Useful for preventing blue highlights all over everything when dragging.
	var userSelectStyle = ';user-select: none;';
	if (browserPrefix) {
	  userSelectStyle += '-' + browserPrefix.toLowerCase() + '-user-select: none;';
	}

	function addUserSelectStyles(draggable) {
	  if (!draggable.props.enableUserSelectHack) return;
	  var style = document.body.getAttribute('style') || '';
	  document.body.setAttribute('style', style + userSelectStyle);
	}

	function removeUserSelectStyles(draggable) {
	  if (!draggable.props.enableUserSelectHack) return;
	  var style = document.body.getAttribute('style') || '';
	  document.body.setAttribute('style', style.replace(userSelectStyle, ''));
	}

	function createCSSTransform(style) {
	  // Replace unitless items with px
	  var x = style.x + 'px';
	  var y = style.y + 'px';
	  var out = { transform: 'translate(' + x + ',' + y + ')' };
	  // Add single prefixed property as well
	  if (browserPrefix) {
	    out[browserPrefix + 'Transform'] = out.transform;
	  }
	  return out;
	}

	//
	// End Helpers.
	//

	//
	// Define <Draggable>
	//

	module.exports = React.createClass({
	  displayName: 'Draggable',

	  propTypes: {
	    /**
	     * `axis` determines which axis the draggable can move.
	     *
	     * 'both' allows movement horizontally and vertically.
	     * 'x' limits movement to horizontal axis.
	     * 'y' limits movement to vertical axis.
	     *
	     * Defaults to 'both'.
	     */
	    axis: React.PropTypes.oneOf(['both', 'x', 'y']),

	    /**
	     * `bounds` determines the range of movement available to the element.
	     * Available values are:
	     *
	     * 'parent' restricts movement within the Draggable's parent node.
	     *
	     * Alternatively, pass an object with the following properties, all of which are optional:
	     *
	     * {left: LEFT_BOUND, right: RIGHT_BOUND, bottom: BOTTOM_BOUND, top: TOP_BOUND}
	     *
	     * All values are in px.
	     *
	     * Example:
	     *
	     * ```jsx
	     *   var App = React.createClass({
	     *       render: function () {
	     *         return (
	     *            <Draggable bounds={{right: 300, bottom: 300}}>
	     *              <div>Content</div>
	     *           </Draggable>
	     *         );
	     *       }
	     *   });
	     * ```
	     */
	    bounds: React.PropTypes.oneOfType([React.PropTypes.shape({
	      left: React.PropTypes.Number,
	      right: React.PropTypes.Number,
	      top: React.PropTypes.Number,
	      bottom: React.PropTypes.Number
	    }), React.PropTypes.oneOf(['parent', false])]),

	    /**
	     * By default, we add 'user-select:none' attributes to the document body
	     * to prevent ugly text selection during drag. If this is causing problems
	     * for your app, set this to `false`.
	     */
	    enableUserSelectHack: React.PropTypes.bool,

	    /**
	     * `handle` specifies a selector to be used as the handle that initiates drag.
	     *
	     * Example:
	     *
	     * ```jsx
	     *   var App = React.createClass({
	     *       render: function () {
	     *         return (
	     *            <Draggable handle=".handle">
	     *              <div>
	     *                  <div className="handle">Click me to drag</div>
	     *                  <div>This is some other content</div>
	     *              </div>
	     *           </Draggable>
	     *         );
	     *       }
	     *   });
	     * ```
	     */
	    handle: React.PropTypes.string,

	    /**
	     * `cancel` specifies a selector to be used to prevent drag initialization.
	     *
	     * Example:
	     *
	     * ```jsx
	     *   var App = React.createClass({
	     *       render: function () {
	     *           return(
	     *               <Draggable cancel=".cancel">
	     *                   <div>
	     *                     <div className="cancel">You can't drag from here</div>
	     *            <div>Dragging here works fine</div>
	     *                   </div>
	     *               </Draggable>
	     *           );
	     *       }
	     *   });
	     * ```
	     */
	    cancel: React.PropTypes.string,

	    /**
	     * `grid` specifies the x and y that dragging should snap to.
	     *
	     * Example:
	     *
	     * ```jsx
	     *   var App = React.createClass({
	     *       render: function () {
	     *           return (
	     *               <Draggable grid={[25, 25]}>
	     *                   <div>I snap to a 25 x 25 grid</div>
	     *               </Draggable>
	     *           );
	     *       }
	     *   });
	     * ```
	     */
	    grid: React.PropTypes.arrayOf(React.PropTypes.number),

	    /**
	     * `start` specifies the x and y that the dragged item should start at
	     * it could be number or string. When passed in as String, we treat it as
	     * percentage.
	     *
	     * Example:
	     *
	     * ```jsx
	     *      var App = React.createClass({
	     *          render: function () {
	     *              return (
	     *                  <Draggable start={{x: 25, y: 25}}>
	     *                      <div>I start with transformX: 25px and transformY: 25px;</div>
	     *                  </Draggable>
	     *              );
	     *          }
	     *      });
	     * ```
	     */
	    start: React.PropTypes.shape({
	      x: React.PropTypes.any,
	      y: React.PropTypes.any
	    }),

	    /**
	     * `moveOnStartChange`, if true (default false) will move the element if the `start`
	     * property changes.
	     */
	    moveOnStartChange: React.PropTypes.bool,

	    /**
	     * `zIndex` specifies the zIndex to use while dragging.
	     *
	     * Example:
	     *
	     * ```jsx
	     *   var App = React.createClass({
	     *       render: function () {
	     *           return (
	     *               <Draggable zIndex={100}>
	     *                   <div>I have a zIndex</div>
	     *               </Draggable>
	     *           );
	     *       }
	     *   });
	     * ```
	     */
	    zIndex: React.PropTypes.number,

	    /**
	     * Called when dragging starts.
	     * If this function returns the boolean false, dragging will be canceled.
	     *
	     * Example:
	     *
	     * ```js
	     *  function (event, ui) {}
	     * ```
	     *
	     * `event` is the Event that was triggered.
	     * `ui` is an object:
	     *
	     * ```js
	     *  {
	     *    position: {top: 0, left: 0}
	     *  }
	     * ```
	     */
	    onStart: React.PropTypes.func,

	    /**
	     * Called while dragging.
	     * If this function returns the boolean false, dragging will be canceled.
	     *
	     * Example:
	     *
	     * ```js
	     *  function (event, ui) {}
	     * ```
	     *
	     * `event` is the Event that was triggered.
	     * `ui` is an object:
	     *
	     * ```js
	     *  {
	     *    position: {top: 0, left: 0}
	     *  }
	     * ```
	     */
	    onDrag: React.PropTypes.func,

	    /**
	     * Called when dragging stops.
	     *
	     * Example:
	     *
	     * ```js
	     *  function (event, ui) {}
	     * ```
	     *
	     * `event` is the Event that was triggered.
	     * `ui` is an object:
	     *
	     * ```js
	     *  {
	     *    position: {top: 0, left: 0}
	     *  }
	     * ```
	     */
	    onStop: React.PropTypes.func,

	    /**
	     * A workaround option which can be passed if onMouseDown needs to be accessed,
	     * since it'll always be blocked (due to that there's internal use of onMouseDown)
	     */
	    onMouseDown: React.PropTypes.func
	  },

	  /**
	   * expose the getBound function for usage like slider input
	   * so that the slider can compute the value.
	   * @return {Object} bounds object with left, right, top, bottom
	   */
	  getBounds: function getBounds() {
	    return _getBounds(this);
	  },

	  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
	    // React to changes in the 'start' param.
	    if (newProps.moveOnStartChange && newProps.start) {
	      this.componentDidMount(newProps);
	    }
	  },

	  componentWillUnmount: function componentWillUnmount() {
	    // Remove any leftover event handlers
	    removeEvent(document, dragEventFor.move, this.handleDrag);
	    removeEvent(document, dragEventFor.end, this.handleDragEnd);
	    removeUserSelectStyles(this);
	  },

	  // we have to rerender the component after calculating the pixel
	  // start position. Since DOM is unavailable before first render,
	  // this is the only way to calculate the actual start position, which
	  // will result rerendering after first render.
	  componentDidMount: function componentDidMount(props) {
	    props = props || this.props;
	    var position = getStartPosition(this, props.start.x, props.start.y);
	    this.setState({
	      clientX: position[0],
	      clientY: position[1]
	    });
	  },

	  getDefaultProps: function getDefaultProps() {
	    return {
	      axis: 'both',
	      bounds: false,
	      handle: null,
	      cancel: null,
	      grid: null,
	      moveOnStartChange: false,
	      start: { x: 0, y: 0 },
	      zIndex: NaN,
	      enableUserSelectHack: true,
	      onStart: emptyFunction,
	      onDrag: emptyFunction,
	      onStop: emptyFunction,
	      onMouseDown: emptyFunction
	    };
	  },

	  getInitialState: function getInitialState(props) {
	    // Handle call from CWRP
	    props = props || this.props;
	    return {
	      // Whether or not we are currently dragging.
	      dragging: false,

	      // Offset between start top/left and mouse top/left while dragging.
	      offsetX: 0, offsetY: 0,

	      // Current transform x and y.
	      clientX: props.start.x, clientY: props.start.y
	    };
	  },
	  // abstract this so that drag can be started manually
	  // e should be an object with properties `clientX` and `clientY`
	  startDrag: function startDrag(e) {
	    // Call event handler. If it returns explicit false, cancel.
	    var shouldStart = this.props.onStart(e, createUIEvent(this));
	    if (shouldStart === false) return;

	    var dragPoint = getControlPosition(e);

	    // Add a style to the body to disable user-select. This prevents text from
	    // being selected all over the page.
	    addUserSelectStyles(this);

	    // Initiate dragging. Set the current x and y as offsets
	    // so we know how much we've moved during the drag. This allows us
	    // to drag elements around even if they have been moved, without issue.
	    this.setState({
	      dragging: true,
	      offsetX: dragPoint.clientX - this.state.clientX,
	      offsetY: dragPoint.clientY - this.state.clientY,
	      scrollX: document.body.scrollLeft,
	      scrollY: document.body.scrollTop
	    });

	    // Add event handlers
	    addEvent(document, 'scroll', this.handleScroll);
	    addEvent(document, dragEventFor.move, this.handleDrag);
	    addEvent(document, dragEventFor.end, this.handleDragEnd);
	  },
	  handleDragStart: function handleDragStart(e) {
	    // Set touch identifier in component state if this is a touch event
	    if (e.targetTouches) {
	      this.setState({ touchIdentifier: e.targetTouches[0].identifier });
	    }

	    // Make it possible to attach event handlers on top of this one
	    this.props.onMouseDown(e);

	    // Short circuit if handle or cancel prop was provided and selector doesn't match
	    if (this.props.handle && !matchesSelector(e.target, this.props.handle) || this.props.cancel && matchesSelector(e.target, this.props.cancel)) {
	      return;
	    }
	    this.startDrag(e);
	  },

	  handleDragEnd: function handleDragEnd(e) {
	    // Short circuit if not currently dragging
	    if (!this.state.dragging) {
	      return;
	    }

	    // Short circuit if this is not the correct touch event
	    if (e.changedTouches && e.changedTouches[0].identifier != this.state.touchIdentifier) {
	      return;
	    }

	    removeUserSelectStyles(this);

	    // Turn off dragging
	    this.setState({
	      dragging: false
	    });

	    // Call event handler
	    this.props.onStop(e, createUIEvent(this));

	    // Remove event handlers
	    removeEvent(document, 'scroll', this.handleScroll);
	    removeEvent(document, dragEventFor.move, this.handleDrag);
	    removeEvent(document, dragEventFor.end, this.handleDragEnd);
	  },

	  handleDrag: function handleDrag(e) {
	    // Return if this is a touch event, but not the correct one for this element
	    if (e.targetTouches && e.targetTouches[0].identifier != this.state.touchIdentifier) {
	      return;
	    }
	    var dragPoint = getControlPosition(e);

	    // Calculate X and Y
	    var clientX = dragPoint.clientX - this.state.offsetX;
	    var clientY = dragPoint.clientY - this.state.offsetY;

	    // Snap to grid if prop has been provided
	    if (Array.isArray(this.props.grid)) {
	      var coords = snapToGrid(this.props.grid, clientX, clientY);
	      clientX = coords[0];
	      clientY = coords[1];
	    }

	    if (this.props.bounds) {
	      var pos = getBoundPosition(_getBounds(this), clientX, clientY);
	      clientX = pos[0];
	      clientY = pos[1];
	    }

	    // Call event handler. If it returns explicit false, cancel.
	    var shouldUpdate = this.props.onDrag(e, createUIEvent(this));
	    if (shouldUpdate === false) return this.handleDragEnd();

	    // Update transform
	    this.setState({
	      clientX: clientX,
	      clientY: clientY
	    });
	  },

	  handleScroll: function handleScroll(e) {
	    var s = this.state,
	        x = document.body.scrollLeft,
	        y = document.body.scrollTop;
	    var offsetX = x - s.scrollX,
	        offsetY = y - s.scrollY;
	    this.setState({
	      scrollX: x,
	      scrollY: y,
	      clientX: s.clientX + offsetX,
	      clientY: s.clientY + offsetY,
	      offsetX: s.offsetX - offsetX,
	      offsetY: s.offsetY - offsetY
	    });
	  },

	  onMouseDown: function onMouseDown(ev) {
	    // Prevent 'ghost click' which happens 300ms after touchstart if the event isn't cancelled.
	    // We don't cancel the event on touchstart because of #37; we might want to make a scrollable item draggable.
	    // More on ghost clicks: http://ariatemplates.com/blog/2014/05/ghost-clicks-in-mobile-browsers/
	    if (dragEventFor === eventsFor.touch) {
	      return ev.preventDefault();
	    }

	    return this.handleDragStart.apply(this, arguments);
	  },

	  onTouchStart: function onTouchStart(ev) {
	    // We're on a touch device now, so change the event handlers
	    dragEventFor = eventsFor.touch;

	    return this.handleDragStart.apply(this, arguments);
	  },

	  // Intended for use by a parent component. Resets internal state on this component. Useful for
	  // <Resizable> and other components in case this element is manually resized and start/moveOnStartChange
	  // don't work for you.
	  resetState: function resetState() {
	    this.setState({
	      offsetX: 0, offsetY: 0, clientX: 0, clientY: 0
	    });
	  },

	  render: function render() {
	    // Create style object. We extend from existing styles so we don't
	    // remove anything already set (like background, color, etc).
	    var childStyle = this.props.children.props.style || {};

	    // Add a CSS transform to move the element around. This allows us to move the element around
	    // without worrying about whether or not it is relatively or absolutely positioned.
	    // If the item you are dragging already has a transform set, wrap it in a <span> so <Draggable>
	    // has a clean slate.
	    var transform = createCSSTransform({
	      // Set left if horizontal drag is enabled
	      x: canDragX(this) ? this.state.clientX : this.props.start.x,

	      // Set top if vertical drag is enabled
	      y: canDragY(this) ? this.state.clientY : this.props.start.y
	    });

	    // Workaround IE pointer events; see #51
	    // https://github.com/mzabriskie/react-draggable/issues/51#issuecomment-103488278
	    var touchHacks = {
	      touchAction: 'none'
	    };

	    var style = assign({}, childStyle, transform, touchHacks);

	    // Set zIndex if currently dragging and prop has been provided
	    if (this.state.dragging && !isNaN(this.props.zIndex)) {
	      style.zIndex = this.props.zIndex;
	    }

	    var className = classNames(this.props.children.props.className || '', 'react-draggable', {
	      'react-draggable-dragging': this.state.dragging,
	      'react-draggable-dragged': this.state.dragged
	    });

	    // Reuse the child provided
	    // This makes it flexible to use whatever element is wanted (div, ul, etc)
	    return React.cloneElement(React.Children.only(this.props.children), {
	      style: style,
	      className: className,

	      onMouseDown: this.onMouseDown,
	      onTouchStart: this.onTouchStart,
	      onMouseUp: this.handleDragEnd,
	      onTouchEnd: this.handleDragEnd
	    });
	  }
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var assignWith = __webpack_require__(9),
	    baseAssign = __webpack_require__(25),
	    createAssigner = __webpack_require__(27);

	/**
	 * Assigns own enumerable properties of source object(s) to the destination
	 * object. Subsequent sources overwrite property assignments of previous sources.
	 * If `customizer` is provided it's invoked to produce the assigned values.
	 * The `customizer` is bound to `thisArg` and invoked with five arguments:
	 * (objectValue, sourceValue, key, object, source).
	 *
	 * **Note:** This method mutates `object` and is based on
	 * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
	 *
	 * @static
	 * @memberOf _
	 * @alias extend
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	 * // => { 'user': 'fred', 'age': 40 }
	 *
	 * // using a customizer callback
	 * var defaults = _.partialRight(_.assign, function(value, other) {
	 *   return _.isUndefined(value) ? other : value;
	 * });
	 *
	 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	 * // => { 'user': 'barney', 'age': 36 }
	 */
	var assign = createAssigner(function(object, source, customizer) {
	  return customizer
	    ? assignWith(object, source, customizer)
	    : baseAssign(object, source);
	});

	module.exports = assign;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(10);

	/**
	 * A specialized version of `_.assign` for customizing assigned values without
	 * support for argument juggling, multiple sources, and `this` binding `customizer`
	 * functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 */
	function assignWith(object, source, customizer) {
	  var index = -1,
	      props = keys(source),
	      length = props.length;

	  while (++index < length) {
	    var key = props[index],
	        value = object[key],
	        result = customizer(value, source[key], key, object, source);

	    if ((result === result ? (result !== value) : (value === value)) ||
	        (value === undefined && !(key in object))) {
	      object[key] = result;
	    }
	  }
	  return object;
	}

	module.exports = assignWith;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    isArrayLike = __webpack_require__(16),
	    isObject = __webpack_require__(14),
	    shimKeys = __webpack_require__(20);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object != 'function' && isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};

	module.exports = keys;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(12);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(13),
	    isObjectLike = __webpack_require__(15);

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}

	module.exports = isNative;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(14);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}

	module.exports = isFunction;


/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(17),
	    isLength = __webpack_require__(19);

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	module.exports = isArrayLike;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(18);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;


/***/ },
/* 18 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(21),
	    isArray = __webpack_require__(22),
	    isIndex = __webpack_require__(23),
	    isLength = __webpack_require__(19),
	    keysIn = __webpack_require__(24);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;

	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object));

	  var index = -1,
	      result = [];

	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = shimKeys;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(16),
	    isObjectLike = __webpack_require__(15);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}

	module.exports = isArguments;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(11),
	    isLength = __webpack_require__(19),
	    isObjectLike = __webpack_require__(15);

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};

	module.exports = isArray;


/***/ },
/* 23 */
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(21),
	    isArray = __webpack_require__(22),
	    isIndex = __webpack_require__(23),
	    isLength = __webpack_require__(19),
	    isObject = __webpack_require__(14);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object)) && length) || 0;

	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;

	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keysIn;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(26),
	    keys = __webpack_require__(10);

	/**
	 * The base implementation of `_.assign` without support for argument juggling,
	 * multiple sources, and `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return source == null
	    ? object
	    : baseCopy(source, keys(source), object);
	}

	module.exports = baseAssign;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function baseCopy(source, props, object) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}

	module.exports = baseCopy;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(28),
	    isIterateeCall = __webpack_require__(30),
	    restParam = __webpack_require__(31);

	/**
	 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return restParam(function(object, sources) {
	    var index = -1,
	        length = object == null ? 0 : sources.length,
	        customizer = length > 2 ? sources[length - 2] : undefined,
	        guard = length > 2 ? sources[2] : undefined,
	        thisArg = length > 1 ? sources[length - 1] : undefined;

	    if (typeof customizer == 'function') {
	      customizer = bindCallback(customizer, thisArg, 5);
	      length -= 2;
	    } else {
	      customizer = typeof thisArg == 'function' ? thisArg : undefined;
	      length -= (customizer ? 1 : 0);
	    }
	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, customizer);
	      }
	    }
	    return object;
	  });
	}

	module.exports = createAssigner;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(29);

	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}

	module.exports = bindCallback;


/***/ },
/* 29 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(16),
	    isIndex = __webpack_require__(23),
	    isObject = __webpack_require__(14);

	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ },
/* 31 */
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);

	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}

	module.exports = restParam;


/***/ }
/******/ ]);