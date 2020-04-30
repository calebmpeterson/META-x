# Meta-X

Emacs-esque `M-x` commands for your entire OS

## Installation

_TODO_

## Configuration

**Meta-x** config is kept in `~/.meta-x/` directory. This makes it easy to keep your config under source control.

### Settings

All configuration options are contained in `~/.meta-x/config.json`

#### Hotkey

The `hotkey` setting is used to map which global keyboard shortcut launches **Meta-x** on your current selection.

All available keys and modifiers can be viewed [here](https://www.electronjs.org/docs/api/accelerator#available-modifiers)

### Custom Commands

Custom commands are `common.js` modules placed in `~/.meta-x/`. For example

#### Example Command

Create `~/.meta-x/calc.js` with the following content:

```js
module.exports = (selection) => eval(selection);
```

To get a calculator capable of all operations/syntax available to you in JavaScript.

#### Using NPM Packages

You can use `npm` packages by simply installing them in your `~/.meta-x/`

## TODO

- [x] autocomplete labels
- [x] name (and adjust .directory references)
- [x] GitHub repo
- [x] license
- [x] close the window on `ESC` key press
- [x] configurable hot-key
- [x] usage instructions
- [ ] built-in commands
- [ ] publish to NPM
- [ ] installation instructions
