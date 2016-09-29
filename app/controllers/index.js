angular.module('app')
    .controller('IndexController', function ($scope, FileManager, FileWriter) {

        const   remote = require('electron').remote,
                {app} = require('electron').remote,
                {dialog} = require('electron').remote,
                Menu = remote.Menu,
                fs = require('fs'),
                mpath = require('path'),
                configPath = app.getPath("userData") + mpath.sep + "cfg.json";

        // Settings - later on this should be refactored in a config service or so
        let config = {
            'displayHiddenFiles': false,
            'autoSave': false,
            'workspace': '',
            'rscripts': app.getPath("userData") + mpath.sep + 'rscripts' + mpath.sep,
            'iscript': ''
        },
            getConfig = function() { return config; }

        // File Manager
        $scope.FileManager = FileManager(getConfig);

        $scope.Index = {
            'displaySettings': false,
            'config': config,
            'existsConfig': false
        }

        var existsConfig = false;
        var testConfig = function() {
            try {
                if (fs.statSync(configPath).isFile()) {
                    existsConfig = true;
                    var data;
                    if ((data = fs.readFileSync(configPath, 'utf8'))) {
                        $scope.Index.config = angular.fromJson(data);
                        // Set file explorer root node
                        $scope.FileManager.setBasePath($scope.Index.config.workspace);
                    }
                }
            }
            catch (e) {
                console.log("There isn't any config file. Error: " + e);
            }
            $scope.Index.existsConfig = existsConfig
            console.log('it exists? ' + $scope.Index.existsConfig);
        }
        testConfig();

        let saveConfig = function() {
            try {
                // write on config file, exists it or not.
                fs.writeFileSync(configPath, JSON.stringify($scope.Index.config), 'utf8');
                // Also rewrite R scripts (if cfg present, rscripts present)
                FileWriter.writeRScripts(app.getPath("userData") + mpath.sep);

                testConfig();
            }
            catch (e) {
                alert('Error: ' + e);
            }
        }

        let resetConfig = function() {
            try {
                fs.unlinkSync(configPath);
                console.log('Done');
            }
            catch (e) {
                console.log('Error resetting configuration: ' + e)
            }
        }

        $scope.Index.saveConfiguration = function() {
            saveConfig();
        }

        $scope.Index.resetConfiguration = function() {
            resetConfig();
        }

        $scope.Index.openWorkspaceDialog = function() {
            let dialog_path;
            if(dialog_path = dialog.showOpenDialog({"properties": ['openDirectory', 'createDirectory']})) {
                $scope.Index.config.workspace = dialog_path[0];
                saveConfig();
            }
        }

        // Menu
        function togglePreferences() {
            $scope.Index.displaySettings = !$scope.Index.displaySettings;
            $scope.$apply();
            resizeNav();
        }
        var template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Scenario',
                        click: function (item, focusedWindow) {
                            var path = $scope.FileManager.createSetupFile();
                            if (path) var file = $scope.FileExplorer.open(path);
                            if (file) {
                                $scope.FileManager.openFile(file);
                                $scope.FileExplorer.refresh();
                                $scope.$apply();
                            }
                        },
                        accelerator: 'CmdOrCtrl+Option+S'
                    },
                    {
                        label: 'New Exploration',
                        click: function (item, focusedWindow) {
                            var path = $scope.FileManager.createExplorationFile();
                            if (path) var file = $scope.FileManager.open(path);
                            if (file) {
                                $scope.FileManager.openFile(file);
                                $scope.FileManager.refresh();
                                $scope.$apply();
                            }
                        },
                        accelerator: 'CmdOrCtrl+Option+E'
                    },
                    {
                        label: 'Open...',
                        click: function (item, focusedWindow) {
                            $scope.FileManager.open();
                            $scope.$apply();
                        },
                        accelerator: 'CmdOrCtrl+O',
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Save',
                        click: function (item, focusedWindow) {
                            $scope.FileManager.save();
                        },
                        accelerator: 'CmdOrCtrl+S',
                    },
                    {
                        label: 'Save As...',
                        click: function (item, focusedWindow) {
                            $scope.FileManager.saveAs();
                        },
                        accelerator: 'Shift+CmdOrCtrl+S',
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    {
                        label: 'Undo',
                        accelerator: 'CmdOrCtrl+Z',
                        role: 'undo'
                    },
                    {
                        label: 'Redo',
                        accelerator: 'Shift+CmdOrCtrl+Z',
                        role: 'redo'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Cut',
                        accelerator: 'CmdOrCtrl+X',
                        role: 'cut'
                    },
                    {
                        label: 'Copy',
                        accelerator: 'CmdOrCtrl+C',
                        role: 'copy'
                    },
                    {
                        label: 'Paste',
                        accelerator: 'CmdOrCtrl+V',
                        role: 'paste'
                    },
                    {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        role: 'selectall'
                    },
                    {
                        type: 'separator'
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    {
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click: function (item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.reload();
                        }
                    }, {
                        label: 'Toggle Project Window',
                        accelerator: 'CmdOrCtrl+1',
                        click: function (item, focusedWindow) {
                            $scope.Main.displayProjectWindow = !$scope.Main.displayProjectWindow;
                            $scope.$apply();
                        }
                    },
                    {
                        label: 'Toggle Full Screen',
                        accelerator: (function () {
                            if (process.platform == 'darwin')
                                return 'Ctrl+Command+F';
                            else
                                return 'F11';
                        })(),
                        click: function (item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    },
                    {
                        label: 'Toggle Developer Tools',
                        accelerator: (function () {
                            if (process.platform == 'darwin')
                                return 'Alt+Command+I';
                            else
                                return 'Ctrl+Shift+I';
                        })(),
                        click: function (item, focusedWindow) {
                            if (focusedWindow)
                                focusedWindow.toggleDevTools();
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Preferences...',
                        accelerator: 'Cmd+,',
                        click: function(item, focusedWindow) { togglePreferences(); }
                    }
                ]
            },
            {
                label: 'Window',
                role: 'window',
                submenu: [
                    {
                        label: 'Minimize',
                        accelerator: 'CmdOrCtrl+M',
                        role: 'minimize'
                    },
                    {
                        label: 'Close',
                        accelerator: 'CmdOrCtrl+W',
                        role: 'close'
                    },
                ]
            },
            {
                label: 'Help',
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click: function () {
                            require('electron').shell.openExternal('http://electron.atom.io')
                        }
                    },
                ]
            },
        ];

        if (process.platform == 'darwin') {
            var name = "IR Studio";
            template.unshift({
                label: name,
                submenu: [
                    {
                        label: 'About ' + name,
                        role: 'about'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Preferences...',
                        accelerator: 'Cmd+,',
                        click: function(item, focusedWindow) { togglePreferences(); }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Services',
                        role: 'services',
                        submenu: []
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Hide ' + name,
                        accelerator: 'Command+H',
                        role: 'hide'
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Command+Alt+H',
                        role: 'hideothers'
                    },
                    {
                        label: 'Show All',
                        role: 'unhide'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Quit',
                        accelerator: 'Command+Q',
                        click: function () {
                            remote.app.quit();
                        }
                    },
                ]
            });
            // Window menu.
            template[3].submenu.push(
                {
                    type: 'separator'
                },
                {
                    label: 'Bring All to Front',
                    role: 'front'
                }
            );
        }

        var menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

    });
