# react-sliderInput
A slider(range) input React.js module

## Usage
to build, simply do this in node:
```
npm install
webpack
```
then just open `build/index.html` to see the demo.

## Options
#### `size`
- Number
- Default: 400

the size of the slider in pixel

#### `initialProgress`
- Number
- Default: 0

the initial progress

#### `min`
- Number
- Default: 0

#### `max`
- Number
- Default: 100

#### `indicate`
- Bool
- Default: false

specify if there is an indicator.

#### `step`
- Number
- Default: 1

specify the step of value change.

#### `editable`
- Bool
- Default: true

specify the if the indicator is editable.

#### `onChange`
- Function

callback invoked each time slider's value is changed
