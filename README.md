# Meta-X

Emacs-esque `M-x` commands for your entire OS.

Built on Electron and Vanilla JavaScript; I know, I know "Electron!?" Well, it's Fast Enough&trade; and it works.

## Support

- [x] Ubuntu Linux
- [ ] Windows 10
- [ ] macOS

## Installation

1. `git clone https://github.com/calebmpeterson/META-x.git`
2. `cd META-x`
3. `yarn install`
4. `yarn start` (or `yarn dev` if you want devtools to open)

**An NPM package is comming soon...**

## Configuration

**Meta-x** config is kept in `~/.meta-x/` directory. This makes it easy to keep your config under source control.

### Settings

All configuration options are contained in `~/.meta-x/config.json`

#### Hotkey

The `hotkey` setting is used to map which global keyboard shortcut launches **Meta-x** on your current selection.

All available keys and modifiers can be viewed [here](https://www.electronjs.org/docs/api/accelerator#available-modifiers)

### Custom Commands

Custom commands are `common.js` modules placed in `~/.meta-x/`.

#### Example Command

To get a calculator capable of all operations/syntax available to you in JavaScript, create `~/.meta-x/calc.js` with the following content:

```js
module.exports = (selection) => eval(selection);
```

#### Using NPM Packages

You can use `npm` packages by simply installing them in your `~/.meta-x/`

For example:

```js
> cd ~/.meta-x/
> yarn add lodash
```

## License

**Meta-x** is released under the MIT license.

## Contributing

### TODO

- [x] autocomplete labels
- [x] name (and adjust .directory references)
- [x] GitHub repo
- [x] license
- [x] close the window on `ESC` key press
- [x] configurable hot-key
- [x] usage instructions
- [ ] built-in commands
- [x] installation instructions
- [ ] publish to NPM
- [ ] Test on Windows 10
- [ ] Test on macOS
