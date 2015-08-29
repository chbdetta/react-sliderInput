require('./index.less');
var $ = require('jquery');
var React = require('react');
var Draggable = require('./react-draggable.js');

var rValidNum = /^[0-9\.]+$/;

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
	return value.toFixed(fixture);
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
		}
	},
	propTypes: {
		initialProgress: React.PropTypes.any,
		size: React.PropTypes.number,
		min: React.PropTypes.number,
		max: React.PropTypes.number,
		indicate: React.PropTypes.bool,
		step: React.PropTypes.number,
		editable: React.PropTypes.bool,
	},
	// to break the React controlled input limit, we have to manually
	// update its value.
	componentDidUpdate: function() {
		this.refs.input.getDOMNode().value = snap(this.val(), this.props.step);
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
		this.val(e.target.value);
	},
	_onInputClick: function(e) {
		e.stopPropagation();
	},
	_onInputKeypress: function(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	},
	val: function(value) {
		if (value === '' || rValidNum.test(value)) {
			var ratio = value / (this.props.max - this.props.min);
			ratio = between(ratio, 0, 1);
			return this.setState({
				progress: ratio
			});
		}
		return this.state.progress * (this.props.max - this.props.min) + this.props.min;
	},
	render: function() {
		var bgcolor = this.state.dragging ? "#9CD2FF" : "#6bb5f2";
		var style = {
					width: this.props.size,
					position: 'relative',
					backgroundImage: '-webkit-linear-gradient(left, ' + bgcolor + ' ' + this.state.progress * 100 + '%, transparent 0%)'
				},
				badgeStyle = {
					position: 'absolute',
					background: bgcolor,
					borderColor: this.state.dragging ? "#78AEF5" : "#5B9DF4"
				},
				inidicateStyle = {
					position: 'absolute',
					top: '100%',
					marginTop: 5,
					width: '200%',
					left: '-50%',
					textAlign: 'center',
					overflow: 'hidden',
					lineHeight: '20px',
				};
		var value = snap(this.val(), this.props.step);
		return (
			<div className="slider-input" onClick={this._onClick}>
				<input type="hidden" name={this.props.name} value={value} />
				<div className="slider-track" style={style} ref="track">
					<Draggable
						axis='x'
						handle='.slider-badge'
						start={{x: (this.state.progress * 100) + '%', y:0}}
						moveOnStartChange={!this.state.dragging} 
						bounds='parent'
						zIndex={100}
						onDrag={this._onDrag}
						onStart={this._onDragStart}
						onStop={this._onDragStop}
						ref="draggable">
						<div className="slider-badge" ref="badge" style={badgeStyle} onClick={stopEvent}>
							{ this.props.indicate &&
									<input className="slider-indicate" type="text"
										readOnly={this.state.dragging}
										defaultValue={value}
										ref='input'
										style={inidicateStyle}
										onKeyPress={this._onInputKeypress}
										onBlur={this._onInputBlur}
										onClick={this._onInputClick}/>}
						</div>
					</Draggable>
				</div>
			</div>
		);
	}
});

module.exports = SliderInput;

