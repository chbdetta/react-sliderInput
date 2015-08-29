require(['react', 'sliderInput'], function(React, SliderInput) {
	
	React.render(<SliderInput indicate={true} max={5} step={0.1} initialProgress={3}></SliderInput>, document.getElementById('slider'))
	React.render(<SliderInput indicate={true} max={19} step={0.1} initialProgress={3}></SliderInput>, document.getElementById('slider'))
	React.render(<SliderInput indicate={true} min={6} step={0.1} initialProgress={3}></SliderInput>, document.getElementById('slider'))
});
