exports["slider-input"] =
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

	function stopEvent(e) {
		e.stopPropagation();
		e.preventDefault();
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
				badgeSize: 20,
				percentageMode: false
			};
		},
		propTypes: {
			initialProgress: React.PropTypes.any,
			size: React.PropTypes.number,
			badgeSize: React.PropTypes.number,
			min: React.PropTypes.number,
			max: React.PropTypes.number,
			indicate: React.PropTypes.bool,
			step: React.PropTypes.number,
			editable: React.PropTypes.bool,
			percentageMode: React.PropTypes.bool,
			onChange: React.PropTypes['function']
		},
		// to break the React controlled input limit, we have to manually
		// update its value.
		componentDidUpdate: function componentDidUpdate() {
			this.refs.indicate && (this.refs.indicate.getDOMNode().value = this.formatIndicate());
			// @TODO: a bit bad here.
			this.props.onChange(this.val());
		},
		_onClick: function _onClick(e) {
			e.stopPropagation();
			var bounds = this.refs.draggable.getBounds();
			var badgeHalfWidth = this.refs.badge.getDOMNode().getBoundingClientRect().width / 2;
			bounds.left += badgeHalfWidth;
			bounds.right += badgeHalfWidth;
			this.setState({
				// Attention: the range of click event isn't the same as drag event
				progress: computeProgress(bounds, e.clientX - e.target.getBoundingClientRect().left)
			});
		},
		_onDrag: function _onDrag(e, ui) {
			e.stopPropagation();
			this.setState({
				progress: computeProgress(this.refs.draggable.getBounds(), ui.position.left)
			});
		},
		_onDragStart: function _onDragStart(e, ui) {
			e.stopPropagation();
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
			if (this.val(e.target.value) !== true) {
				this.refs.indicate && (this.refs.indicate.getDOMNode().value = this.formatIndicate());
			}
		},
		_onInputClick: function _onInputClick(e) {
			e.stopPropagation();
			if (!this.props.editable) {
				e.preventDefault();
				return false;
			}
		},
		_onInputKeypress: function _onInputKeypress(e) {
			if (e.key === 'Enter') {
				e.target.blur();
			}
		},
		// return the true value of current state.
		val: function val(value) {
			value = this.parseInput(value);
			if (typeof value !== 'undefined' && value !== snap(this.state.progress, 0.01)) {
				this.setState({
					progress: value
				});
				return true;
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
				backgroundImage: '-webkit-linear-gradient(left, transparent ' + this.state.progress * 100 + '%, #aaa 0%)'
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
				textAlign: 'center',
				overflow: 'hidden',
				lineHeight: '20px'
			};

			return React.createElement(
				'div',
				{ className: 'slider-input', onClick: this._onClick,
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
							{ className: "slider-badge" + className, ref: 'badge', style: badgeStyle, onClick: stopEvent },
							this.props.indicate && React.createElement('input', {
								className: 'slider-indicate',
								type: 'text',
								disabled: !this.props.editable || this.state.dragging,
								defaultValue: this.formatIndicate(),
								ref: 'indicate',
								style: inidicateStyle,
								onKeyPress: this._onInputKeypress,
								onBlur: this._onInputBlur,
								onClick: this._onInputClick })
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
	exports.push([module.id, ".clearfix:before,\n.clearfix:after {\n  content: '';\n  display: table;\n}\n.clearfix:after {\n  clear: both;\n}\n.slider-input {\n  font-family: Helvetica;\n}\n.slider-input:before,\n.slider-input:after {\n  content: '';\n  display: table;\n}\n.slider-input:after {\n  clear: both;\n}\n.slider-track {\n  background-color: #6bb5f2;\n  height: 4px;\n  margin-top: 8px;\n}\n.slider-track:before,\n.slider-track:after {\n  content: '';\n  display: table;\n}\n.slider-track:after {\n  clear: both;\n}\n.slider-track.active {\n  background-color: #9FD4FF;\n}\n.slider-track .slider-badge {\n  border-radius: 50%;\n  background-color: #6bb5f2;\n  width: 12px;\n  height: 12px;\n  position: absolute;\n  top: -8px;\n  cursor: default;\n  border: 3px solid #fff;\n  transition: border 140ms;\n}\n.slider-track .slider-badge.active {\n  background-color: #9FD4FF;\n  border-color: #9FD4FF;\n}\n.slider-track .slider-badge .slider-indicate {\n  color: rgba(0, 0, 0, 0.47);\n  padding: 0;\n  margin: 0;\n  outline: 0;\n  border: 0;\n  text-align: center;\n  width: 300%;\n  left: -100%;\n}\n.slider-track .slider-badge .slider-indicate:focus {\n  border-bottom: 1px solid #6bb5f2;\n  box-shadow: none;\n}\n.range-input {\n  width: 400px;\n  display: table;\n}\n.range-input > span {\n  width: 1%;\n}\n.range-input > span:first-child {\n  padding-right: 7px;\n}\n.range-input > span:last-child {\n  padding-left: 7px;\n}\n.range-input input[type=\"range\"] {\n  width: 100%;\n  vertical-align: middle;\n}\n", ""]);

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

	module.exports = require("react");

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
/***/ function(module, exports) {

	module.exports = require("lodash/object/assign");

/***/ }
/******/ ]);