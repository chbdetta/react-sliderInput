
window.onload = function() {
	var containers = document.querySelectorAll('.slider');
	var valueCons = document.querySelectorAll('.value');

	React.render(<SliderInput indicate={false} max={1} step={0.01} initialProgress={0} onChange={function(val) {valueCons[0].innerText=val;}}></SliderInput>, containers[0]);
	React.render(<SliderInput indicate={false} max={100} step={1} initialProgress={50} onChange={function(val) {valueCons[1].innerText=val;}}></SliderInput>, containers[1]);
	React.render(<SliderInput indicate={true} editable={false}  onChange={function(val) {valueCons[2].innerText=val;}}></SliderInput>, containers[2]);
	React.render(<SliderInput indicate={true} initialProgress={30} onChange={function(val) {valueCons[3].innerText=val;}}></SliderInput>, containers[3]);
	React.render(<SliderInput size={300} onChange={function(val) {valueCons[4].innerText=val;}}></SliderInput>, containers[4]);

}


