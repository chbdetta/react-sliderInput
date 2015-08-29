webpackJsonp([0],[
/* 0 */
/***/ function(module, exports) {

	'use strict';

	window.onload = function () {
		var containers = document.querySelectorAll('.slider');
		var valueCons = document.querySelectorAll('.value');

		React.render(React.createElement(SliderInput, { indicate: false, max: 1, step: 0.01, initialProgress: 0, onChange: function (val) {
				valueCons[0].innerText = val;
			} }), containers[0]);
		React.render(React.createElement(SliderInput, { indicate: false, max: 100, step: 1, initialProgress: 50, onChange: function (val) {
				valueCons[1].innerText = val;
			} }), containers[1]);
		React.render(React.createElement(SliderInput, { indicate: true, editable: false, onChange: function (val) {
				valueCons[2].innerText = val;
			} }), containers[2]);
		React.render(React.createElement(SliderInput, { indicate: true, initialProgress: 30, onChange: function (val) {
				valueCons[3].innerText = val;
			} }), containers[3]);
		React.render(React.createElement(SliderInput, { size: 300, onChange: function (val) {
				valueCons[4].innerText = val;
			} }), containers[4]);
	};

/***/ }
]);