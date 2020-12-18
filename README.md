# Meta-X

Emacs-esque `M-x` commands for your entire OS.

- Uses `electron` for clipboard and global hot key interactions.
- Uses `choose` for the command picker on macOS and `dmenu` on Linux.

## Support

- [x] Ubuntu Linux
- [x] macOS
- [ ] Windows 10 (pending)

## Installation

1. `git clone https://github.com/calebmpeterson/META-x.git`
2. `cd META-x`
3. `yarn install`
4. `yarn start` (or `yarn dev` if you want devtools to open)

**An NPM package is coming soon...**

## Configuration

**Meta-x** config is kept in `~/.meta-x/` directory. This makes it easy to keep your config under source control.

### Settings

All configuration options are contained in `~/.meta-x/config.json`

#### Hotkey

The `hotkey` setting is used to map which global keyboard shortcut launches **Meta-x** on your current selection.

All available keys and modifiers can be viewed [here](https://www.electronjs.org/docs/api/accelerator#available-modifiers)

### Custom Commands

Custom commands are `commonjs` modules placed in `~/.meta-x/`.

#### Example Command

To get a calculator capable of all operations/syntax available to you in JavaScript, create `~/.meta-x/calc.js` with the following content:

```js
module.exports = (selection) => eval(selection);
```

#### Non-transforming Commands

To create a command which does not transform the current selection simply return `undefined` from the command module's exported function:

```js
module.exports = (selection) => {
  // Do something side-effect'ish here
  // ...

  // The current selection will not be transformed
  return undefined;
};
```

#### Command Not Found Fallback

If the event that your query does not match a known command, the raw query string will be passed to `~/.meta-x/fallback-handler.js` if it exists:

```js
module.exports = function (selection, query) {
  // Do something with the currently selected
  // text and/or the raw query string
};
```

#### Command Context

In addition to the `selection`, each command function is invoked with `this` bound to the current "command context".

The "command context" API includes a subset of the Electron API mapped to the following properties:

- [`shell` API](https://www.electronjs.org/docs/api/shell) ↗

#### Using NPM Packages

You can use `npm` packages by simply installing them in your `~/.meta-x/` directory.

For example:

```js
> cd ~/.meta-x/
> yarn add lodash
```

## License

**Meta-x** is released under the MIT license.

## Contributing

Issues and Pull Requests are welcome!

### Roadmap

- [x] Configurable hot-key
- [x] Document usage instructions
- [x] Add built-in commands
- [x] Document installation instructions
- [x] Improve UI performance (with `choose` on macOS and `dmenu` on Linux)
- [ ] Publish to NPM
- [ ] Test on Windows 10
