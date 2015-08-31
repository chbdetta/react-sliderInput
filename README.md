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
- `name` the name attribute of hidden input, useful when put inside a form
- `size` the size of the slider in pixel. default: 300
- `initialProgress` the initial progress. default: 0
- `min` the minimum value. default: 0
- `max` the maximum value. default: 100
- `indicate` specify if there is an indicator. default: false
- `step` specify the step of value change. default: 1
- `editable` specify the if the indicator is editable. default: true
- `percentageMode` if set to true, the indicator will display percentage instead of the real value.
- `onChange` callback invoked each time slider's value is changed (during dragging), provided with the current value of the slider
- `onChangeStop` invoked only when value is changed and slider is not being dragged (at the end of dragging, click the track or type in indicator will trigger this)

## Use in form
since the slider has an `<input type='hidden' />`, it can be use with native `<form>` as a regular `input`.

## Develop
to develop, you should firstly run `webpack` in the root directory then `cd` into `test/` and run another `webpack-dev-server` there.