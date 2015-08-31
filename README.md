# react-sliderInput
A slider (range) input React.js module

[demo](http://chbdetta.github.io)

## Usage
to build, simply do this in node:
```
npm install
webpack
```
and now the bundled js is available at `build/slider-input.js`.

to run the demo locally, make sure you've done step above and already built it:
```
cd test
webpack
```
and then just open `test/index.html` to see the demo.

## Props
- `size` the size of the slider in pixel. default: 300
- `initialProgress` the initial progress. default: 0
- `min` the minimum value. default: 0
- `max` the maximum value. default: 100
- `indicate` specify if there is an indicator. default: false
- `step` specify the step of value change. default: 1
- `editable` specify the if the indicator is editable. default: true
- `onChange` callback invoked each time slider's value is changed (during dragging), provided with the current value of the slider
- `onChangeStop` invoked only when value is changed and slider is not being dragged 

## Develop
to develop, you should firstly run `webpack` in the root directory then `cd` into `test/` and run another `webpack-dev-server` there.