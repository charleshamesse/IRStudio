'use strict';

angular.module('app')
    .factory('FileManager', function(){

        return function(config) {
        const   {dialog} = require('electron').remote,
                fs = require('fs'),
                path = require("path"),
                homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']

        let FileManager = {},
            basePath

        // On Windows and Linux, an open dialog can't be both file selector and directory selector at once,
        // if you set properties to ['openFile', 'openDirectory'] on these platforms, it will be a directory selector.


        // Tree
        FileManager.tree = {}
        // List of open files
        FileManager.filesOpened = []
        // Config
        FileManager.config = {}

        // Init
        FileManager.setBasePath = function(path) {
            basePath = path;
            FileManager.refresh();
        }
        FileManager.setConfig = function(callback) {
            FileManager.getConfig = callback;
        }
        FileManager.setConfig(config);

        // Create file
        FileManager.createSetupFile = function() {
            var fpath = dialog.showSaveDialog(optionsCreate);
            if(fpath != null) {
                FileWriter.createSetupFile(fpath);
                return fpath;
            }
        }
        FileManager.createExplorationFile = function() {
            var fpath = dialog.showSaveDialog(optionsCreate);
            if(fpath != null) {
                FileWriter.createExplorationFile(fpath);
                return fpath;
            }
        }

        FileManager.refresh = function() {
            if(!basePath) basePath = homeDir;
            FileManager.rootNode = {
                "type": "dir",
                "name": path.basename(basePath),
                "angle": "right",
                "path": basePath,
                "nodes": []
            };
            FileManager.tree = [];
            FileManager.openDir(FileManager.rootNode);
            FileManager.tree = FileManager.rootNode.nodes;
        }
        var options = {
            "defaultPath": basePath,
            "properties": ['openFile', 'openDirectory', 'createDirectory']
        };

        // Open file or directory
        FileManager.open = function(attr_path) {
            var dialog_path, f, final_path;
            if(!attr_path) {
                if(dialog_path = dialog.showOpenDialog(options)) {
                    final_path = dialog_path[0];
                }
            }
            else {
                if(attr_path == "-r") {
                    final_path = basePath;
                }
                else {
                    final_path = attr_path;
                }
            }
            if(final_path != undefined) {
                if(!fs.statSync(final_path).isFile()) { // directory
                    FileManager.rootNode = {
                        "type": "dir",
                        "name": path.basename(final_path),
                        "angle": "right",
                        "path": final_path,
                        "nodes": []
                    };

                    f = {type: "dir"};

                    // Init
                    FileManager.openDir(FileManager.rootNode);
                    FileManager.tree = FileManager.rootNode.nodes;
                }
                else { // file
                    f = {
                        type: "file",
                        name: path.basename(final_path),
                        path: final_path,
                        isOpened: false
                    };

                    FileManager.openFile(f);
                }
            }
        }

        // Open directory
        FileManager.openDir = function(f) {
            let dir = f.path,
                currentTree = []

            if(f.angle == "down") { // close it
                f.nodes = []
                f.angle = "right"
                return 0
            }
            f.angle = "down"

            let files = fs.readdirSync(dir)
            files.map(function (file) {
                return path.join(dir, file)
            }).forEach(function (file) {
                if(!fs.statSync(file).isFile()) {
                    if(FileManager.getConfig().displayHiddenFiles || path.basename(file).charAt(0) != '.') {
                        f.nodes.push({
                            "type": "dir",
                            "name": path.basename(file),
                            "angle": "right",
                            "path": file,
                            "nodes": []
                        })
                    }
                }
                else if(path.basename(file).charAt(0) != '.'){
                    f.nodes.push({
                        "type": "file",
                        "name": path.basename(file),
                        "path": file,
                        "isOpened": false
                    })
                }
            })
            return f
        };


        FileManager.openFile = function(file) {
            // If file is already open
            if(file.isOpened) {
                FileManager.viewFile(file);
            }

            // Check extension
            var ext = file.name.split(".").pop();

            // Open file
            var data = fs.readFileSync(file.path, 'utf8');
            var valid = false;
            try {
                file.content = JSON.parse(data);
                valid = true;
            } catch(e) {
                file.content = data;
                alert('IR Studio can\'t find an editor for this file (' + e + ').');
            }

            file.isOpened = true;
            file.active = false;
            file.textonly = true;
            file.textmode = true;

            // Load editor if valid
            if(valid) {
                file.textonly = false;
                file.textmode = false;
                switch(file.content.type) {
                    case "setup":
                        file.editor = "assets/templates/setup.html";
                        break;
                    case "launch":
                        file.editor = "assets/templates/launch.html";
                        break;
                    case "results":
                        file.editor = "assets/templates/results.html";
                        break;
                    case "results-multiple":
                        file.editor = "assets/templates/results-multiple.html";
                        break;
                    default:
                        file.content = data;
                        file.textonly = true;
                        file.editor = "assets/templates/text.html";
                        valid = false;
                        file.textmode = true;
                        break;
                }

            }

            FileManager.filesOpened.push(file);
            FileManager.viewFile(file);

        };

        // View
        FileManager.viewFile = function(file) {
            FileManager.filesOpened.forEach(function(f) {
                f.active = false;
            });
            file.active = true;
        };




        // Save
        FileManager.save = function() {
            var currentFile;
            if((currentFile = $filter('filter')(FileManager.filesOpened, {active: true}, true)[0]) == null) {
                return 0;
            }
            console.log(currentFile);
            fs.writeFile(currentFile.path, JSON.stringify(currentFile.content), 'utf8', (err) => {
                if (err) throw err;
            });
        }
        // Save as
        FileManager.saveAs = function() {
            var currentFile;
            if((currentFile = $filter('filter')(FileManager.filesOpened, {active: true}, true)[0]) == null) {
                return 0;
            }
            var options = {filters: [{ name: 'IR Studio files', extensions: ['ir'] }]};
            dialog.showSaveDialog(options, function(path) {
                fs.writeFile(path, JSON.stringify(currentFile.content), 'utf8', (err) => {
                    if (err) throw err;
                });
            });
        }

        // Close
        FileManager.close = function(index) {
            // Ask for saving - or save
            var f = FileManager.filesOpened[index];
            //FileManager.save(f);

            // Switch view if needed
            if(f.active == true) {
                if(index > 0)
                    FileManager.viewFile(FileManager.filesOpened[index-1]);
                else if(FileManager.filesOpened.length > 1)
                    FileManager.viewFile(FileManager.filesOpened[index+1]);
            }
            // Close file
            f.isOpened = false;
            FileManager.filesOpened.splice(index, 1);
        };


        FileManager.refresh();
            return FileManager;
        }
    });
