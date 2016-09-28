'use strict';

angular.module('app')
	.service('IraceTools', function () {

		// Globals and dependencies
		var fs = require('fs'),
			cp = require('child_process'),
			rscripts = {},
			IraceTools = {};
		// Init
		this.setRscripts = function (p) {
			rscripts = p;
		}

		// Irace tools
		this.getEliteCandidates = function(resourcesDir, callback) {
			var cmd = cp.exec('Rscript "' + rscripts + 'getEliteCandidates.R" --irace.file "' + resourcesDir + '/irace.Rdata"');
			cmd.on('exit', function (code) {
				callback(code, 'bestConfigurations.txt');
			});
		};

		this.getIraceInfo = function (resourcesDir, callback) {
			var cmd = cp.exec('Rscript "' + rscripts + 'getIraceInfo.R" --irace.file "' + resourcesDir + '/irace.Rdata"'),
				out = "";
			cmd.stdout.on('data', function (data) {
				out += data;
			});
			cmd.stderr.on('data', function (data) {
				out += data;
			});
			cmd.on('exit', function (code) {
				callback(out);
			});
		};

		this.getTestElites = function(resourcesDir, callback) {
			var cmd = cp.exec('Rscript "' + rscripts + 'getTestElites.R" --irace.file "' + resourcesDir + '/irace.Rdata"');
			console.log('Rscript "' + rscripts + 'getTestElites.R" --irace.file "' + resourcesDir + '/irace.Rdata"');
			cmd.on('exit', function (code) {
				callback(code, 'best-tests.txt');
			});
		};

		this.getTestByIteration = function(resourcesDir, callback) {
			var cmd = cp.exec('Rscript "' + rscripts + 'getTestByIteration.R" --irace.file "' + resourcesDir + '/irace.Rdata"');
			cmd.on('exit', function (code) {
				callback(code, 'iteration-results.txt');
			});
		}

		this.getIterationCandidates = function (resourcesDir, callback) {
			var cmd = cp.exec('Rscript "' + rscripts + 'getIterationCandidates.R" --irace.file "' + resourcesDir + '/irace.Rdata"');
			cmd.on('exit', function (code) {
				callback(code, 'iterationConfigurations.txt');
			});


		}
	});
