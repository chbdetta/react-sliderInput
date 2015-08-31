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

function stopEvent(e) {
	e.stopPropagation();
	e.preventDefault();
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
			badgeSize: 20,
			percentageMode: false
		}
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
		onChange: React.PropTypes.function,
	},
	// to break the React controlled input limit, we have to manually
	// update its value.
	componentDidUpdate: function() {
		this.refs.indicate && (this.refs.indicate.getDOMNode().value = this.formatIndicate());
		// @TODO: a bit bad here.
		this.props.onChange(this.val());
	},
	_onClick: function(e) {
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
	_onDrag: function(e, ui) {
		e.stopPropagation();
		this.setState({
			progress: computeProgress(this.refs.draggable.getBounds(), ui.position.left)
		});
	},
	_onDragStart: function(e, ui) {
		e.stopPropagation();
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
		if (this.val(e.target.value) !== true) {
			this.refs.indicate && (this.refs.indicate.getDOMNode().value = this.formatIndicate());
		}
	},
	_onInputClick: function(e) {
		e.stopPropagation();
		if(!this.props.editable) {
			e.preventDefault();
			return false;
		}
	},
	_onInputKeypress: function(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	},
	// return the true value of current state.
	val: function(value) {
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
					lineHeight: '20px',
				};

		return (
			<div className="slider-input" onClick={this._onClick}
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
						<div className={"slider-badge" + className} ref="badge" style={badgeStyle} onClick={stopEvent}>
							{ this.props.indicate &&
									<input
										className="slider-indicate"
										type="text"
										disabled={!this.props.editable || this.state.dragging}
										defaultValue={this.formatIndicate()}
										ref='indicate'
										style={inidicateStyle}
										onKeyPress={this._onInputKeypress}
										onBlur={this._onInputBlur}
										onClick={this._onInputClick}/>
							}
						</div>
					</Draggable>
				</div>
			</div>
		);
	}
});

module.exports = SliderInput;

