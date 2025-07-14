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
4. `brew install font-fira-code`
5. `brew install choose-gui`

## Running

**Meta-x** needs a hot-key launcher. [`skhd`](https://github.com/koekeishiya/skhd) is recommended for macOS.

```
brew install koekeishiya/formulae/skhd
skhd --start-service
```

### Sample `.shkdrc`

```
# ⌘SPACE to launch Meta-x on the current text selection in the active window
alt - space: EDITOR=code ~/Tools/meta-x/bin/launch
cmd - space: EDITOR=code ~/Tools/meta-x/bin/launch

# CTRL+V to launch clipboard history
ctrl - v: EDITOR=code ~/Tools/meta-x/bin/clipboard-history
```

## Configuration

**Meta-x** config is kept in `~/.meta-x/` directory. This makes it easy to keep your config under source control.

### Settings

All configuration options are contained in `~/.meta-x/config.json`

### Custom Commands

Custom commands are `commonjs` modules placed in `~/.meta-x/scripts/`.

#### Example Command

To get a calculator capable of all operations/syntax available to you in JavaScript, create `~/.meta-x/scripts/calc.js` with the following content:

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

#### macOS Shortcut Commands

To run a macOS Shortcut with the output of the command:

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

In the event that your query does not match a known command, the raw query string will be passed to `~/.meta-x/scripts/fallback-handler.js` if it exists:

```js
module.exports = function (selection, query) {
  // Do something with the currently selected
  // text and/or the raw query string
};
```

#### Command Not Found Fallback Suggestions

The `fallback-handler` can provide suggestions:

```js
module.exports = (selection, query) => {
  // Do something with the currently selected
  // text and/or the raw query string
};

module.exports.suggestions = () => {
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
- `$`/`execa` methods from [`execa`](https://www.npmjs.com/package/execa)
- `osascript` method from ['run-applescript`](https://www.npmjs.com/package/run-applescript)
- `ENV` which is loaded from the `~/.meta-x/.env` file if it exists
- `choose(['option A', 'option B', 'option C'])` which returns a `Promise` that resolves to the selected option or `undefined` if nothing was selected.
- `notify({ message: "Your message here" })` which displays an OS-level toast/notification with the given message.

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
- [x] Periodically re-build command catalog in the background rather than re-building when launched
- [x] Add shutdown/restart commands
- [x] Add support for static text snippets
- [x] Improve standard for organization of ~/.meta-x/\*
- [ ] Add support for omitting applications and system preferences
- [ ] Add a progress indicator for async commands
- [ ] Add support for directly invoking a custom command from the launch CLI (e.g. `~/Tools/meta-x/bin/launch "My Custom Command"`)
