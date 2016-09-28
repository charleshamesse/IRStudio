angular.module('app')
    .controller('ResultsController', function ($scope, $filter, ResultParser, FileWriter, FileParser, IraceTools) {
            // Globals
            $scope.Results = {
                "file": $scope.file,
                "scenarioExportType": "long"
            };
            //require('svgtopng');
            const   {dialog} = require('electron').remote,
                    mpath = require('path'),
                    fs = require("fs");
            let stdout = "";
            IraceTools.setRscripts($scope.Index.config.rscripts);

            $scope.Results.prepare = function () {
                // Full Exploration or Ablation
                if ($scope.file.content.content.command.type != 'irace') {
                    $scope.Results.file = $scope.file;
                    var outputLines = $scope.Results.file.content.content.stdout;
                    angular.forEach(outputLines, function (line) {
                        stdout += line.trim() + '\n';
                    });
                    stdout.slice(0, -2);
                    stdout = stdout.trim();
                    makePlots(stdout);
                }
                // Irace
                else {
                    buildIraceReport($scope.Results.file.content.content.command.logFile);
                }
            }
            // Irace
            var buildIraceReport = function (rdata_file) {
                // Init
                $scope.d3BoxPlotData = [];
                $scope.d3ParallelCoordinatesPlotData = '';
                $scope.d3BoxPlotData2 = [];

                var path = mpath.dirname(rdata_file);

                // 1. Info
                var infoCallback = function (data) {
                    $scope.iraceInfo = [];
                    data.split('\n').forEach(function (line) {
                        $scope.iraceInfo.push(line.capitalizeFirstLetter());
                    });
                    $scope.$apply();
                };
                IraceTools.getIraceInfo(path, infoCallback);

                // 2. Elite candidates performance
                var eliteCandidatesCallback = function (code, path) {
                    $scope.d3BoxPlotData = FileParser.parseIraceTestElitesFile(path);
                    $scope.$apply();
                };
                IraceTools.getTestElites(path, eliteCandidatesCallback);

                // 3. Best candidates comparison
                var bestCandidatesCallback = function (code, path) {
                    var csv_content = FileParser.getCSVFromIraceIterationsConfigurationsFile(path);
                    var csv_path = 'bestCandidates.csv';
                    FileWriter.write(csv_path, csv_content)
                    $scope.d3ParallelCoordinatesPlotData = csv_path; //'bestCandidates.csv';
                    $scope.$apply();

                };
                IraceTools.getIterationCandidates(path, bestCandidatesCallback);

                // 4. Iteration elites
                var iterationElitesCallback = function (code, path) {
                    $scope.d3BoxPlotData2 = FileParser.parseIraceTestElitesFile(path);
                    $scope.$apply();
                };
                IraceTools.getTestByIteration(path, iterationElitesCallback);
            };

            // Full Exploration and Ablation
            var makePlots = function (stdout) {
                console.log(stdout);
                var parameters = FileParser.parseParameterFile($scope.Results.file.content.content.command.parameterFile);


                $scope.d3Data = ResultParser.parseFullExploration(stdout);
                $scope.d3TreeData = ResultParser.parseForTree(stdout, parameters);
            };

            var getScenarioInfo = function (type) {
                var parameters = FileParser.parseParameterFile($scope.Results.file.content.content.command.parameterFile),
                    candidates = FileParser.parseCandidateFile($scope.Results.file.content.content.command.candidatesFile)[1]
                parameterSelection = FileParser.parseParameterSelectionFile($scope.Results.file.content.content.command.selectionFile);
                var ret = {
                    "type": type,
                    "parameters": {
                        "list": parameters,
                        "numbers": {
                            "i": $filter('filter')(parameters, {type: 'i'}, true).length,
                            "c": $filter('filter')(parameters, {type: 'c'}, true).length,
                            "r": $filter('filter')(parameters, {type: 'r'}, true).length,
                            "o": $filter('filter')(parameters, {type: 'o'}, true).length
                        }
                    },
                    "candidates": candidates,
                    "parameterSelection": parameterSelection
                };
                return ret;
            };


            // Export to LaTeX
            $scope.Results.exportToLatex = function () {
                // Make resource dir
                var options = {
                    "title": "Output directory",
                    "defaultPath": mpath.dirname($scope.Results.file.path),
                    "properties": ['openDirectory', 'createDirectory']
                };
                var fpath = dialog.showOpenDialog(options);

                if (fpath == null)
                    return 0;

                fpath += mpath.sep;
                // Full Exploration or Ablation
                if ($scope.file.content.content.command.type != 'irace') {
                    // Export plots, added name in the ID to avoid conflicts when several results editor are open
                    svgtopng.applyCssInline('linePlot-' + $scope.Results.file.name);
                    svgtopng.applyCssInline('treePlot-' + $scope.Results.file.name);
                    var linePlotBase64Data = svgtopng.getCanvasImg('linePlot-' + $scope.Results.file.name).replace(/^data:image\/png;base64,/, "");
                    var treePlotBase64Data = svgtopng.getCanvasImg('treePlot-' + $scope.Results.file.name).replace(/^data:image\/png;base64,/, "");
                    fs.writeFile(fpath + "line-plot.png", linePlotBase64Data, 'base64', function (err) {
                        if (err) console.log(err);
                    });
                    fs.writeFile(fpath + "tree-plot.png", treePlotBase64Data, 'base64', function (err) {
                        if (err) console.log(err);
                    });	// Hand it to writer
                    FileWriter.writeSingleExplorationTeXFile(fpath, $scope.Results.file.content.content.text, $scope.Results.file.content.content.dates, $scope.Results.file.content.content.command, getScenarioInfo($scope.Results.scenarioExportType), ["line-plot.png", "tree-plot.png"], true);

                }
                else {
                    // Export plots, added name in the ID to avoid conflicts when several results editor are open
                    svgtopng.applyCssInline('boxPlot-' + $scope.Results.file.name);
                    svgtopng.applyCssInline('parallelCoordinatesPlot-' + $scope.Results.file.name);
                    var linePlotBase64Data = svgtopng.getCanvasImg('boxPlot-' + $scope.Results.file.name).replace(/^data:image\/png;base64,/, "");
                    var treePlotBase64Data = svgtopng.getCanvasImg('parallelCoordinatesPlot-' + $scope.Results.file.name).replace(/^data:image\/png;base64,/, "");
                    fs.writeFile(fpath + "box-plot.png", linePlotBase64Data, 'base64', function (err) {
                        if (err) console.log(err);
                    });
                    fs.writeFile(fpath + "parallel-plot.png", treePlotBase64Data, 'base64', function (err) {
                        if (err) console.log(err);
                    });
                    // Hand it to writer
                    FileWriter.writeSingleExplorationTeXFile(fpath, $scope.Results.file.content.content.text, $scope.Results.file.content.content.dates, $scope.Results.file.content.content.command, getScenarioInfo($scope.Results.scenarioExportType), ["box-plot.png", "parallel-plot.png"], true);

                }


            }
            ;

            // Needs refactoring
            String.prototype.capitalizeFirstLetter = function () {
                return this.charAt(0).toUpperCase() + this.slice(1);
            }
        }
    );
