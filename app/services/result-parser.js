'use strict';

angular.module('app')
.service('ResultParser', function ($filter) {
  var result = {};

  this.parseIrace = function(stdout) {
    result.topline = "Hi! Here's your result";
    result.stdout = stdout;
    result.bottomline = "Done. :)";
    return result;
  };

  this.parseFullExploration = function(stdout) {
    var lines = stdout.match(/[^\r\n]+/g),
    k = 1;
    result.plotData = [];
    result.lines = lines;
    lines.forEach(function(l) {
      var kvPair = l.split(" ");
      var pair = {
        "x": kvPair[0] + " (" + k + ")",
        "y": parseFloat(kvPair[1])
      };
      result.plotData.push(pair);
      ++k;
    });
    return result.plotData;
  };

  function getParameterSpace(lines) {
    var parameters = [];
    lines.forEach(function(l) {
      l = l.trim();
      var kv = l.split(' '),
      name = kv[0],
      parameter = name.split('=')[0];
      if(parameters.indexOf(parameter) == -1) parameters.push(parameter);

    });
    return parameters;
  }



  function augmentWithDependecies(parameters) {
    angular.forEach(parameters, function(p1) {
      var hasDependencies = false;
      angular.forEach(parameters, function(p2) {
        if(!p2.childrenNames) p2.childrenNames = [];
        // Look in p1 conditions if there exists occurences of p2
        // If p1 has dependencies
        var re = new RegExp("\\b" + p2.name, 'g'); //" +p2.name
        var match = p1.conditions.match(re);
        if(match != null) {
          hasDependencies = true;
          p2.childrenNames.push(p1.name);
          p1.parentName = p2.name;
        }
      });
    });
    return parameters;
  };

  function augmentWithAllChildren(parameters, parameter) {

    angular.forEach(parameters, function(p) {
      p.allChildrenNames = visitAllChildren(parameters, p);
    });

    return parameters;
  }

  function visitAllChildren(parameters, parameter) {
    var list = [];
    if(parameter.childrenNames.length > 0) {
      //parameter.allChildrenNames = [];
      // children
      angular.forEach(parameter.childrenNames, function(child) {
        list.push(child);
        var childP = $filter('filter')(parameters, {name: child})[0];
        list = list.concat(visitAllChildren(parameters, childP));
      });
    }
    return list;
  }

  var makeSections = function(stdout, parameters) {
    parameters = augmentWithAllChildren(parameters);
    var lines = stdout.trim().split('\n'),
    sectionParameter = "",
    parameter = "",
    sectionId = 0,
    sections = [];
    lines.shift(); // remove Initial

    angular.forEach(lines, function(line) {
      line = line.trim();
      var kv = line.split(' '),
      name = kv[0],
      score = kv[1],
      parameterName = name.split('=')[0];

      // First
      if(sectionParameter == "") {
        sectionParameter = parameterName;
        sections.push([]);
      }


      var sectionParameterData = $filter('filter')(parameters, {name: sectionParameter})[0];

      // New section
      if(sectionParameterData.allChildrenNames.indexOf(parameterName) == -1 && sectionParameter != parameterName) {
        sectionParameter = parameterName;
        sections.push([]);
      }

      sections[sections.length-1].push(line);
    });
    var joinedSections = [];
    angular.forEach(sections, function(section) {
      var joinedSection = section.join('\n');
      joinedSections.push(joinedSection);
    });
    return joinedSections;
  }

  var getChildByLine = function(treeData, line) {
    var found = false;
    var child = {};
    if(treeData.children != []) {
      if(!found) {
        treeData.children.forEach(function(c) {
          if(c.line == line) {
            found = true;
            child = c;
          }
          else {
            var others = getChildByLine(c, line);
            if(others) {
              child = others;
              found = true;
            }
          }
        });
      }
    }
    if(found) return child;
    else return false;
  }

  this.parseForTree = function(stdout, parameters) {
    // Init
    var treeData = {
      "name": "Initial",
      "parent": "null",
      "score": stdout.trim().split('\n')[0].trim().split(' ')[1], // sort of a hack for the first score
      "parameterName": "Initial",
      "children": []
    },
    previousSectionTree = treeData,
    parameters = augmentWithDependecies(parameters);
    var sections = makeSections(stdout, parameters);

    // For each section
    angular.forEach(sections, function(section) {

      var lines = section.split('\n'),
      sectionParameter = "",
      previousNode = {},
      count = 0,
      bestNode = {},
      bestScore = 0;

      angular.forEach(lines, function(line) {
        line = line.trim();
        var kv = line.split(' '),
        name = kv[0],
        score = kv[1],
        parameterName = name.split('=')[0];

        if(count == 0) sectionParameter = parameterName;

        var node = {
          "name": name,
          "line": line,
          "score": score,
          "children": [],
          "parent": previousSectionTree.name,
          "parameterName": parameterName,
          "parentLine": previousSectionTree.line,
          "previousNodeLine": previousNode.line
        };

        if(parseFloat(score) > parseFloat(bestScore)) {
          bestScore = score;
          bestNode = node;
        }

        if(parameterName != sectionParameter) {
          var parentParamName = $filter('filter')(parameters, {name: parameterName})[0].parentName,
          testNode = getChildByLine(treeData, node.previousNodeLine);

          // Loop in parents, grand-parents, etc
          while(testNode.parameterName != parentParamName) {
            testNode = getChildByLine(treeData, testNode.previousNodeLine);
          }

          if(testNode.parameterName == parentParamName) addToParent(testNode, node);

        }
        else {
          treeData.children.push(node);
        }

        previousNode = node;
        ++count;
      });
      previousSectionTree = bestNode;
    });
    return [treeData];
  };

  function addToParent(parent, child) {
    child.parent = parent.name;
    parent.children.push(child);
  }


});
