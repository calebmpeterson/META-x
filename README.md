# META-x

Emacs-esque `M-x` commands for your entire OS.

- Recommends `skhd` for hot-key bindings.
- Uses `clipboardy` for clipboard interactions.
- Uses `choose` for the command picker on macOS.

## Support

- [x] macOS
- [ ] Linux
- [ ] Windows

## Installation

1. `git clone https://github.com/calebmpeterson/META-x.git`
2. `cd META-x`
3. `yarn install`

## Running

**Meta-x** needs a hot-key launcher. [`skhd`](https://github.com/koekeishiya/skhd) is recommended for macOS.

### Sample `.shkdrc`

```
# ⌘SPACE to launch Meta-x on the current text selection in the active window
cmd - space : <meta-x-root-dir>/bin/launch
```

## Configuration

**Meta-x** config is kept in `~/.meta-x/` directory. This makes it easy to keep your config under source control.

### Settings

All configuration options are contained in `~/.meta-x/config.json`

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

#### Shortcut Commands

To run a shortcut with the output of the command:

```js
module.exports = (selection) => {
  // The current selection will not be transformed.
  //
  // Instead, "Your Shortcut" will be run with the
  // provided input.
  return {
    shortcut: "Your Shortcut",
    input: selection.toUpperCase(),
  };
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

#### Command Not Found Fallback Suggestions

The `fallback-handler` can provide suggestions:

```js
module.exports = function (selection, query) {
  // Do something with the currently selected
  // text and/or the raw query string
};

module.exports.suggestions = function () {
  // The suggestions should be an array of strings
  return ["suggestion one", "suggestion two", "suggestion three"];
};
```

#### Command Context

In addition to the `selection`, each command function is invoked within the "command context".

The "command context" API includes:

- [`_` the Lodash library](https://lodash.com/docs/)
- [`open` API](https://www.npmjs.com/package/open) ↗
- `get`/`put`/`post`/`patch`/`delete` methods from [`axios`](https://www.npmjs.com/package/axios#request-method-aliases) ↗
- `ENV` which is loaded from the `~/.meta-x/.env` file if it exists

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
- [x] Periodically re-build command catalog in the background rather than re-building when launched
- [x] Add shutdown/restart commands
