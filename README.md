# IR Studio
Optimization studio application based on Electron.

## To Use
To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/charleshamesse/IRStudio
# Go into the repository
cd IRStudio
# Install dependencies and run the app
npm install && npm start
```

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

## Example Files
To get started, you can find example scenarios and explorations in the `examples` folder.

## Contribute
The application structure is the following:
```
app: contains the AngularJS controllers and other utilities
- controllers: each screen has at its own controller
- factories
- services
assets: contains the html views and other visual features
- templates: jade templates and generated html files
- img
- css
- js
- fonts
```
