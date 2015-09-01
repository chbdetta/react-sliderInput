require('./index.less');

var React = require('react');
var Draggable = require('./react-draggable.js');
			
var rValidNum = /^[0-9\.]+%?$/;

var nullfn = function() {};


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
	var fixture = Math.abs(~~Math.log10(step));
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
	canSlide: false,
	getInitialState: function() {
		return {
			progress: this.props.initialProgress / (this.props.max - this.props.min),
			dragging: false
		}
	},
	getDefaultProps: function() {
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
		}
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
		onChangeStop: React.PropTypes.function,
		onChange: React.PropTypes.function,
	},
	componentDidUpdate: function() {
		// @TODO: a bit bad here.
		this.props.onChange(this.val());
		if (!this.state.dragging) {
			this.props.onChangeStop(this.val());
		}
	},
	_onMouseDown: function(e) {
		stopEvent(e);

		var bounds = this.refs.draggable.getBounds();
		var badgeHalfWidth = this.refs.badge.getDOMNode().getBoundingClientRect().width / 2;
		var clientX = e.clientX, clientY = e.clientY;

		bounds.left += badgeHalfWidth;
		bounds.right += badgeHalfWidth;
		this.setState({
			// Attention: the range of click event isn't the same as drag event
			progress: computeProgress(bounds, e.clientX - e.target.getBoundingClientRect().left)
		}, function() {
			this.refs.draggable.startDrag({
				clientX: clientX,
				clientY: clientY
			});
		});
	},

	// convert touch start event to click event.
	_onTouchStart: function(e) {
		e.clientX = e.touches[0].clientX;
		this._onMouseDown(e);
	},
	_onDrag: function(e, ui) {
		e.stopPropagation();
		this.setState({
			progress: computeProgress(this.refs.draggable.getBounds(), ui.position.left)
		});
	},
	_onDragStart: function(e, ui) {
		// prevent the editable div to be selected when mouse enter it.
		stopEvent(e);
		this.setState({
			dragging: true,
		});
	},
	_onDragStop: function(e, ui) {
		e.stopPropagation();
		this.setState({
			dragging: false,
			progress: computeProgress(this.refs.draggable.getBounds(), ui.position.left)
		});
	},
	_onInputBlur: function(e) {
		if (this.val(e.target.innerHTML) !== true) {
			e.target.innerHTML = this.formatIndicate();
		}
	},
	_onInputMouseDown: function(e) {
		e.stopPropagation();
		if(!this.props.editable) {
			e.preventDefault();
			return false;
		}
	},
	_onInputKeypress: function(e) {
		if (e.key === 'Enter') {
			e.target.blur();
			// Workaround for webkit's bug
			// http://stackoverflow.com/questions/4878713/how-can-i-blur-a-div-where-contenteditable-true
      window.getSelection().removeAllRanges();
		}
	},
	// return the true value of current state.
	val: function(value) {
		if (typeof value !== 'undefined') {
			value = this.parseInput(value);
			if (typeof value !== 'undefined' && value !== snap(this.state.progress, 0.01)) {
				this.setState({
					progress: value
				});
				return true;
			} else if(typeof value === 'undefined') {
				this.forceUpdate();
			}
		}
		return snap(this.state.progress * (this.props.max - this.props.min) + this.props.min, this.props.step);
	},
	// parse the input according to `precentageMode`
	parseInput: function(value) {
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
	formatIndicate: function() {
		var value ;
		if (this.props.percentageMode) {
			value = snap(this.state.progress * 100, 1) + '%';
		} else {
			value = this.val();
		}
		return value;
	},
	render: function() {
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
					lineHeight: '20px',
				};

		return (
			<div className="slider-input" onTouchStart={this._onTouchStart} onMouseDown={this._onMouseDown}
				style={{
					height: this.props.indicate ? badgeSize * 2 : badgeSize
				}}>
				<input type="hidden" name={this.props.name} value={this.val()} />
				<div className={"slider-track" + className} style={style} ref="track">
					<Draggable
						axis='x'
						handle='.slider-badge'
						start={{x: (this.state.progress * 100) + '%', y:0}}
						moveOnStartChange={!this.state.dragging}
						bounds={{
							left: -badgeSize / 2,
							right: this.props.size - badgeSize / 2
						}}
						zIndex={100}
						onDrag={this._onDrag}
						onStart={this._onDragStart}
						onStop={this._onDragStop}
						ref="draggable">
						<div className={"slider-badge" + className} ref="badge" style={badgeStyle}>
							{ this.props.indicate &&
									<div
										contentEditable='true'
										className="slider-indicate"
										ref='indicate'
										style={inidicateStyle}
										onKeyPress={this._onInputKeypress}
										onBlur={this._onInputBlur}
										onMouseDown={this._onInputMouseDown}>{this.formatIndicate()}</div>
							}
						</div>
					</Draggable>
				</div>
			</div>
		);
	}
});

module.exports = SliderInput;

