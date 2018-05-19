# Electron UI

## Building

From the main CKAN project root directory:

```
./build electron-ui
```

or

```
.\build.ps1 electron-ui
```

Unlike all other CKAN projects, intermediate build products are saved within the `ElectronUI` folder because the build tools are not smart enough to conform to this requirement.

Built files will be copied to `_build`.

## Running during development

First build the core CKAN .NET DLL.
From the main CKAN project root directory:

```
./build --configuration=Release
```

or

```
.\build.ps --configuration=Release
```

From the `ElectronUI` directory:

```
npm start
```

Note that Mono will crash if you save changes or otherwise try to reload; close the app properly and restart instead.

## Techologies

Tech          | Creators        | Description
:------------ | :-------------- | :----------
[Javascript]  | Netscape        | Toy form-validation language grown into fully-scoped monstrosity
[Chromium]    | Google          | Browser with fast Javascript engine called V8
[Node.js]     | Ryan Dahl       | Standalone Javascript runtime built on V8
[NPM]         | Isaac Schleuter | Package manager for Node.js
[Edge.js]     | Tomasz Janczuk  | Allows Node.js code to talk to .NET
[React]       | Facebook        | Javascript library for making components
[Material UI] | Google          | React library implementing [Material Design]
[Electron]    | GitHub          | Runs Chromium in Node.js for standalone apps

[Javascript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[Chromium]: https://www.chromium.org/Home/
[Node.js]: https://nodejs.org/en/docs/
[NPM]: https://docs.npmjs.com/
[Edge.js]: https://www.npmjs.com/package/edge-js
[React]: https://reactjs.org/docs/getting-started.html
[Material UI]: https://mui.com/material-ui/getting-started/overview/
[Material Design]: https://material.io/design
[Electron]: https://www.electronjs.org/docs/latest
