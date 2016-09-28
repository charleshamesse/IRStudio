angular.module('app')
	.factory('d3', [function () {
		var d3 = require('d3');// paste in a version of d3.min.js here
		return d3;
	}])
	.directive('d3Bars', ['d3', function (d3) {
		return {
			restrict: 'EA',
			scope: {
				data: "=",
				label: "@",
			},
			link: function (scope, iElement, iAttrs) {
				// create the svg to contain our visualization
				var svg = d3.select(iElement[0])
					.append("svg")
					.attr("width", "100%");

				// make the visualization responsive by watching for changes in window size
				window.onresize = function () {
					return scope.$apply();
				};
				scope.$watch(function () {
					return angular.element(window)[0].innerWidth;
				}, function () {
					return scope.render(scope.data);
				});

				// watch the data source for changes to dynamically update the visualization
				scope.$watch('data', function (newData, oldData) {
					return scope.render(newData);
				}, true);

				scope.render = function (data) {
					// clear out everything in the svg to render a fresh version
					svg.selectAll("*").remove();

					// set up variables
					var width, height, max;
					width = d3.select(iElement[0])[0][0].offsetWidth;
					height = scope.data.length * 40;
					max = 100;
					svg.attr('height', height);

					// SVG rectangles for the bar chart
					svg.selectAll("rect")
						.data(data)
						.enter()
						.append("rect")
						// color for bars. set to random. It can be changed to other gradients or solid colors.
						.style({
							fill: '#333'
						})
						// set initial dimensions of the bar
						.attr("height", 30)
						.attr("width", 0)
						// position bar
						.attr("x", 10)
						.attr("y", function (d, i) {
							return i * 35;
						})
						// set up transition animations
						.transition()
						.duration(1250)
						// finally, set the width of the bar based on the datapoint
						.attr("width", function (d) {
							return d.score / (max / width);
						});

					// add labels to the chart
					svg.selectAll("text")
						.data(data)
						.enter()
						.append("text")
						.attr("fill", "white")
						// position labels over their bars
						.attr("y", function (d, i) {
							return i * 35 + 22;
						})
						.attr("x", 15)
						// get the label text from the datapoint
						.text(function (d) {
							return d[scope.label];
						});
				};
			}
		};
	}])
	.directive('d3Line', ['d3', function (d3) {
		return {
			restrict: 'EA',
			scope: {
				data: "=",
				label: "@",
			},
			link: function (scope, iElement, iAttrs) {
				// create the svg to contain our visualization
				var svg = d3.select(iElement[0])
					.append("svg")
					.attr("width", "100%");

				// make the visualization responsive by watching for changes in window size
				window.onresize = function () {
					return scope.$apply();
				};
				scope.$watch(function () {
					return angular.element(window)[0].innerWidth;
				}, function () {
					return scope.render(scope.data);
				});

				// watch the data source for changes to dynamically update the visualization
				scope.$watch('data', function (newData, oldData) {
					return scope.render(newData);
				}, true);

				scope.render = function (data) {
					// clear out everything in the svg to render a fresh version
					svg.selectAll("*").remove();

					// set up variables
					var width, height, max;
					width = d3.select(iElement[0])[0][0].offsetWidth;
					height = scope.data.length * 40;
					max = 100;
					svg.attr('height', height);

					var
						MARGINS = {
							top: 50,
							right: 50,
							bottom: 50,
							left: 50
						},
						xScale = d3.scale.linear().range([MARGINS.left, width - MARGINS.right]).domain([2000, 2010]),
						yScale = d3.scale.linear().range([height - MARGINS.top, MARGINS.bottom]).domain([0, 250]),
						xAxis = d3.svg.axis()
							.scale(xScale),
						yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left");

					svg.append("svg:g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + (height - MARGINS.bottom) + ")")
						.call(xAxis);
					svg.append("svg:g")
						.attr("class", "y axis")
						.attr("transform", "translate(" + (MARGINS.left) + ",0)")
						.call(yAxis);
					var lineGen = d3.svg.line()
						.x(function (d) {
							return xScale(d.year);
						})
						.y(function (d) {
							return yScale(d.sale);
						});
					svg.append('svg:path')
						.attr('d', lineGen(data))
						.attr('stroke', 'rgb(82, 154, 189)')
						.attr('stroke-width', 1)
						.attr('fill', 'none');

				};
			}
		};
	}])
	.directive('d3OrdinalLine', ['d3', function (d3) {
		return {
			restrict: 'EA',
			scope: {
				data: "=",
				label: "@",
			},
			link: function (scope, iElement, iAttrs) {
				// create the svg to contain our visualization
				var svg = d3.select(iElement[0])
					.append("svg")
					.attr("width", "100%");

				// make the visualization responsive by watching for changes in window size
				window.onresize = function () {
					return scope.$apply();
				};
				scope.$watch(function () {
					return angular.element(window)[0].innerWidth;
				}, function () {
					return scope.render(scope.data);
				});

				// watch the data source for changes to dynamically update the visualization
				scope.$watch('data', function (newData, oldData) {
					return scope.render(newData);
				}, true);

				scope.render = function (data) {
					// clear out everything in the svg to render a fresh version
					svg.selectAll("*").remove();

					// set up variables
					var width, height, max;
					width = d3.select(iElement[0])[0][0].offsetWidth;
					height = 600;
					max = 100;
					svg.attr('height', height);

					var yMax = d3.max(data, function (d) {
						return d.y;
					});
					var xValues = [];
					data.forEach(function (d) {
						xValues.push(d.x);
					});
					var
						MARGINS = {
							top: 50,
							right: 50,
							bottom: 200,
							left: 50
						},
						yScale = d3.scale.linear().range([height - MARGINS.top, MARGINS.bottom])
							.domain([0, yMax]),
						yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left"),
						xScale = d3.scale.ordinal()
							.domain(xValues)
							.rangePoints([MARGINS.left, width - MARGINS.right]),
						xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom");

					// Axis
					svg.append("svg:g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + (height - MARGINS.bottom) + ")")
						.call(xAxis)
						.selectAll("text")
						.style("text-anchor", "end")
						.attr("dx", "-.8em")
						.attr("dy", ".15em")
						.attr("transform", "rotate(-65)")
					svg.append("svg:g")
						.attr("class", "y axis")
						.attr("transform", "translate(" + (MARGINS.left) + "," + (MARGINS.top - MARGINS.bottom) + ")")
						.call(yAxis);

					var irsBlue = 'rgb(82, 154, 189)';

					// Grid
					svg.append("g")
						.attr("class", "grid")
						.attr("transform", "translate(0," + (height - MARGINS.bottom) + ")")
						.call(xAxis
							.tickSize(-(height - MARGINS.top - MARGINS.bottom), 0, 0)
							.tickFormat(""));

					svg.append("g")
						.attr("class", "grid")
						.attr("transform", "translate(" + MARGINS.left + "," + (MARGINS.top - MARGINS.bottom) + ")")
						.call(yAxis
							.tickSize(-(width - MARGINS.left - MARGINS.right), 0, 0)
							.tickFormat(""));

					//Line and dots
					var lineGen = d3.svg.line()
						.x(function (d) {
							return xScale(d.x);
						})
						.y(function (d) {
							return yScale(d.y);
						});
					svg.append('svg:path')
						.attr('d', lineGen(data))
						.attr('stroke', irsBlue)
						.attr('stroke-width', 1)
						.attr('fill', 'none')
						.attr("transform", "translate(0," + (MARGINS.top - MARGINS.bottom) + ")");

					svg.selectAll(".point")
						.data(data)
						.enter().append("svg:circle")
						.attr("stroke", irsBlue)
						.attr("fill", function (d, i) {
							return "white"
						})
						.attr("cx", function (d, i) {
							return xScale(d.x)
						})
						.attr("cy", function (d, i) {
							return yScale(d.y)
						})
						.attr("r", function (d, i) {
							return 3
						})
						.attr("transform", "translate(0," + (MARGINS.top - MARGINS.bottom) + ")")
						.on("mouseover", handleMouseOver)
						.on("mouseout", handleMouseOut);

					function handleMouseOver(d, i) {
						// Specify where to put label of text
						d3.select(this).attr({
							r: 5
						});

						var text = svg.append("text").attr({
							id: "t-" + parseInt(d.y) + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
							x: function () {
								return xScale(d.x) + 15;
							},
							y: function () {
								return yScale(d.y) - 15;
							}
						})
							.attr("transform", "translate(0," + (MARGINS.top - MARGINS.bottom) + ")");

						text.append("svg:tspan").style("fill", irsBlue).text("Performance: ");
						text.append("svg:tspan").attr({x: xScale(d.x) + 15, dy: 15}).style("fill", "black").text(d.y);


					}

					function handleMouseOut(d, i) {
						// Use D3 to select element, change color back to normal
						d3.select(this).attr({r: 3});

						// Select text by id and then remove
						d3.select("#t-" + parseInt(d.y) + "-" + i).remove();  // Remove text location
					}

				};
			}
		};
	}])
	.directive('d3HorizontalTree', ['d3', function (d3) {
		return {
			restrict: 'EA',
			scope: {
				data: "=",
				label: "@",
			},
			link: function (scope, iElement, iAttrs) {
				// create the svg to contain our visualization
				var svg = d3.select(iElement[0])
					.append("svg")
					.attr("width", "100%");

				// make the visualization responsive by watching for changes in window size
				window.onresize = function () {
					return scope.$apply();
				};
				scope.$watch(function () {
					return angular.element(window)[0].innerWidth;
				}, function () {
					var newDataCopy = JSON.parse(JSON.stringify(scope.data));
					return scope.render(newDataCopy);
				});

				// watch the data source for changes to dynamically update the visualization
				scope.$watch('data', function (newData, oldData) {
					var newDataCopy = JSON.parse(JSON.stringify(newData));
					return scope.render(newDataCopy);
				}, true);

				getDepth = function (data, depth) {
					var node = data;
					var max = 0;
					if (node.children.length != 0) {
						++depth;
						var rootDepth = depth;
						angular.forEach(node.children, function (child) {
							if (child.children) {
								var m = getDepth(child, rootDepth);
								if (m > depth) depth = m;
							}
						});
					}
					return depth;
				};

				scope.render = function (data) {
					// clear out everything in the svg to render a fresh version
					svg.selectAll("*").remove();

					// set up variables
					var width, height, max, dataDepth;
					dataDepth = getDepth(data[0], 1);//getDepth(data);
					width = 180 * dataDepth;  //d3.select(iElement[0])[0][0].offsetWidth;
					height = 500;
					svg.attr('height', height);
					svg.attr('width', width);

					// Data management
					var treeData = data;

					// ************** Generate the tree diagram	 *****************
					var margin = {top: 0, right: 120, bottom: 0, left: 120},
						width = 180 * dataDepth - margin.right - margin.left, //groups.length
						height = 500 - margin.top - margin.bottom;

					var i = 0,
						duration = 750,
						root;

					var tree = d3.layout.tree()
						.size([height, width]);

					var xOffset = 30;
					var diagonal = d3.svg.diagonal()
						.projection(function (d) {
							return [d.y, d.x];
						});

					root = treeData[0];
					root.x0 = height / 2;
					root.y0 = 100;

					update(root);


					function update(source) {

						// Compute the new tree layout.
						var nodes = tree.nodes(root).reverse(),
							links = tree.links(nodes);

						// Normalize for fixed-depth.
						nodes.forEach(function (d) {
							d.y = d.depth * 180 + xOffset;
						});

						// Update the nodes…
						var node = svg.selectAll("g.node")
							.data(nodes, function (d) {
								return d.id || (d.id = ++i);
							});

						// Enter any new nodes at the parent's previous position.
						var nodeEnter = node.enter().append("g")
							.attr("class", "node")
							.attr("transform", function (d) {
								return "translate(" + source.y0 + "," + source.x0 + ")";
							})
							.on("click", click);

						nodeEnter.append("circle")
							.attr("r", function (d) {
								return "20px"
							})
							.style("fill", function (d) {
								return d._children ? "lightsteelblue" : "#fff";
							});

						nodeEnter.append("text")
							.attr("x", function (d) {
								return 0; //d.children || d._children ? -13 : 13;
							})
							.attr("dy", function (d) {
								return -(d.score / 30000 * 20 + 3) + "px"
							})//".35em")
							.attr("text-anchor", function (d) {
								return "middle"; //return d.children || d._children ? "end" : "start";
							})
							.text(function (d) {
								return d.name;
							})
							.style("fill-opacity", 1e-6);

						// Transition nodes to their new position.
						var nodeUpdate = node.transition()
							.duration(duration)
							.attr("transform", function (d) {
								return "translate(" + d.y + "," + d.x + ")";
							});

						nodeUpdate.select("circle")
							.attr("r", function (d) {
								return (d.score / 30000 * 20) + "px"
							})
							.style("fill", function (d) {
								return d._children ? "lightsteelblue" : "#fff";
							});

						nodeUpdate.select("text")
							.style("fill-opacity", 1);

						// Transition exiting nodes to the parent's new position.
						var nodeExit = node.exit().transition()
							.duration(duration)
							.attr("transform", function (d) {
								return "translate(" + source.y + "," + source.x + ")";
							})
							.remove();

						nodeExit.select("circle")
							.attr("r", "20px");

						nodeExit.select("text")
							.style("fill-opacity", 1e-6);

						// Update the links…
						var link = svg.selectAll("path.link")
							.data(links, function (d) {
								return d.target.id;
							});

						// Enter any new links at the parent's previous position.
						link.enter().insert("path", "g")
							.attr("class", "link")
							.attr("d", function (d) {
								var o = {x: source.x0, y: source.y0};
								return diagonal({source: o, target: o});
							});

						// Transition links to their new position.
						link.transition()
							.duration(duration)
							.attr("d", diagonal);

						// Transition exiting nodes to the parent's new position.
						link.exit().transition()
							.duration(duration)
							.attr("d", function (d) {
								var o = {x: source.x, y: source.y};
								return diagonal({source: o, target: o});
							})
							.remove();

						// Stash the old positions for transition.
						nodes.forEach(function (d) {
							d.x0 = d.x;
							d.y0 = d.y;
						});
					}

					// Toggle children on click.
					function click(d) {
						if (d.children) {
							d._children = d.children;
							d.children = null;
						} else {
							d.children = d._children;
							d._children = null;
						}
						update(d);
					}
				};
			}
		};
	}]).directive('d3VerticalTree', ['d3', function (d3) {
	return {
		restrict: 'EA',
		scope: {
			data: "=",
			label: "@",
		},
		link: function (scope, iElement, iAttrs) {
			// create the svg to contain our visualization
			var svg = d3.select(iElement[0])
				.append("svg")
				.attr("width", "100%");

			// make the visualization responsive by watching for changes in window size
			window.onresize = function () {
				return scope.$apply();
			};
			scope.$watch(function () {
				return angular.element(window)[0].innerWidth;
			}, function () {
				var newDataCopy = JSON.parse(JSON.stringify(scope.data));
				return scope.render(newDataCopy);
			});

			// watch the data source for changes to dynamically update the visualization
			scope.$watch('data', function (newData, oldData) {
				var newDataCopy = JSON.parse(JSON.stringify(newData));
				return scope.render(newDataCopy);
			}, true);


			getDepth = function (data, depth) {
				var node = data;
				var max = 0;
				if (node.children.length != 0) {
					++depth;
					var rootDepth = depth;
					angular.forEach(node.children, function (child) {
						if (child.children) {
							var m = getDepth(child, rootDepth);
							if (m > depth) depth = m;
						}
					});
				}
				return depth;
			};

			scope.render = function (data) {
				// clear out everything in the svg to render a fresh version
				svg.selectAll("*").remove();

				// set up variables
				var width, height, max;
				width = data[0].children.length * 60;
				height = getDepth(data[0], 1) * 100;
				svg.attr('height', height);
				svg.attr('width', width);

				// Data management
				var treeData = data;

				// ************** Generate the tree diagram	 *****************
				var margin = {top: 10, right: 10, bottom: 10, left: 10},
					width = width - margin.right - margin.left, //groups.length
					height = height - margin.top - margin.bottom;

				var i = 0,
					duration = 750,
					root;

				var tree = d3.layout.tree()
					.size([width, height]);

				var xOffset = 30;
				var diagonal = d3.svg.diagonal()
					.projection(function (d) {
						return [d.x, d.y];
					});

				root = treeData[0];
				root.x0 = width / 2;
				root.y0 = 0;
				update(root);


				function update(source) {
					// Compute the new tree layout.
					var nodes = tree.nodes(root).reverse(),
						links = tree.links(nodes);

					// Normalize for fixed-depth.
					nodes.forEach(function (d) {
						d.y = d.depth * 100 + xOffset;
					});

					// Update the nodes…
					var node = svg.selectAll("g.node")
						.data(nodes, function (d) {
							return d.id || (d.id = ++i);
						});

					// Enter any new nodes at the parent's previous position.
					var nodeEnter = node.enter().append("g")
						.attr("class", "node")
						.attr("transform", function (d) {
							return "translate(" + source.x0 + "," + source.y0 + ")";
						})
						.on("click", click);

					nodeEnter.append("circle")
						.attr("r", function (d) {
							return "20px"
						})
						.style("fill", function (d) {
							return d._children ? "lightsteelblue" : "#fff";
						});

					nodeEnter.append("text")
						.attr("y", function (d) {
							return 0;
						})
						.attr("dy", function (d) {
							return ((source.children.indexOf(d) % 2) == 0 ? -(d.score / 40000 * 20 + 15) : (d.score / 40000 * 20 + 15)) + "px"
						})//".35em")
						.attr("text-anchor", "middle")
						.text(function (d) {
							return d.name;
						})
						.style("fill-opacity", 1e-6);

					// Transition nodes to their new position.

					var nodeUpdate = node.transition()
						.duration(duration)
						.attr("transform", function (d) {
							return "translate(" + d.x + "," + d.y + ")";
						});

					nodeUpdate.select("circle")
						.attr("r", function (d) {
							return (d.score / 30000 * 20) + "px"
						})
						.style("fill", function (d) {
							return d._children ? "lightsteelblue" : "#fff";
						});

					nodeUpdate.select("text")
						.style("fill-opacity", 1);

					// Transition exiting nodes to the parent's new position.
					var nodeExit = node.exit().transition()
						.duration(duration)
						.attr("transform", function (d) {
							return "translate(" + source.x + "," + source.y + ")";
						})
						.remove();

					nodeExit.select("circle")
						.attr("r", "0px");

					nodeExit.select("text")
						.style("fill-opacity", 1e-6);

					// Update the links…
					var link = svg.selectAll("path.link")
						.data(links, function (d) {
							return d.target.id;
						});

					// Enter any new links at the parent's previous position.
					link.enter().insert("path", "g")
						.attr("class", "link")
						.attr("d", function (d) {
							var o = {x: source.x0, y: source.y0};
							return diagonal({source: o, target: o});
						});

					// Transition links to their new position.
					link.transition()
						.duration(duration)
						.attr("d", diagonal);

					// Transition exiting nodes to the parent's new position.
					link.exit().transition()
						.duration(duration)
						.attr("d", function (d) {
							var o = {x: source.x, y: source.y};
							return diagonal({source: o, target: o});
						})
						.remove();

					// Stash the old positions for transition.
					nodes.forEach(function (d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});

				}

				// Toggle children on click.
				function click(d) {
					if (d.children) {
						d._children = d.children;
						d.children = null;
					} else {
						d.children = d._children;
						d._children = null;
					}
					update(d);
				}
			};
		}
	};
}]).directive('d3RadialTree', ['d3', function (d3) {
	return {
		restrict: 'EA',
		scope: {
			data: "=",
			label: "@",
		},
		link: function (scope, iElement, iAttrs) {
			// create the svg to contain our visualization
			var svg = d3.select(iElement[0])
				.append("svg")
				.attr("width", "100%");

			// make the visualization responsive by watching for changes in window size
			window.onresize = function () {
				return scope.$apply();
			};
			scope.$watch(function () {
				return angular.element(window)[0].innerWidth;
			}, function () {
				var newDataCopy = JSON.parse(JSON.stringify(scope.data));
				return scope.render(newDataCopy);
			});

			// watch the data source for changes to dynamically update the visualization
			scope.$watch('data', function (newData, oldData) {
				var newDataCopy = JSON.parse(JSON.stringify(newData));
				return scope.render(newDataCopy);
			}, true);

			scope.render = function (data) {
				// clear out everything in the svg to render a fresh version
				svg.selectAll("*").remove();

				// set up variables
				var diameter = 960;
				svg.attr("width", diameter)
					.attr("height", diameter - 150)
					.append("g")
					.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

				// Data management
				var treeData = data;

				var i = 0,
					duration = 750,
					root;

				var tree = d3.layout.tree()
					.size([360, diameter / 2 - 120])
					.separation(function (a, b) {
						return (a.parent == b.parent ? 1 : 2) / a.depth;
					});

				var diagonal = d3.svg.diagonal.radial()
					.projection(function (d) {
						return [d.y, d.x / 180 * Math.PI];
					});

				root = treeData[0];
				root.x0 = diameter / 2;
				root.y0 = diameter / 2;

				update(root);

				function update(source) {
					var nodes = tree.nodes(root),
						links = tree.links(nodes);

					var link = svg.selectAll(".link")
						.data(links)
						.enter().append("path")
						.attr("class", "link")
						.attr("d", diagonal)
						.attr("transform", function (d) {
							return "translate(" + root.x0 + ", " + root.y0 + ")";
						});

					var node = svg.selectAll(".node")
						.data(nodes)
						.enter().append("g")
						.attr("class", "node")
						.attr("transform", function (d) {
							return "translate(" + root.x0 + ", " + root.y0 + ")rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
						})

					node.append("circle")
						.attr("r", function (d) {
							return (d.score / 40000 * 20) + "px"
						})

					node.append("text")
						.attr("dy", ".31em")
						.attr("text-anchor", function (d) {
							return d.x < 180 ? "start" : "end";
						})
						.attr("transform", function (d) {
							return (d.x < 180 ? "translate(20)" : "rotate(180)translate(-20)");
						})
						.text(function (d) {
							return d.name;
						});

					d3.select(self.frameElement).style("height", diameter - 150 + "px");

				}
			};
		}
	};
}]).directive('d3BoxPlot', ['d3', function (d3) {
	return {
		restrict: 'EA',
		scope: {
			data: "=",
			label: "@",
		},
		link: function (scope, iElement, iAttrs) {
			// create the svg to contain our visualization
			var svg = d3.select(iElement[0])
				.append("svg")
				.attr("width", "100%");

			// make the visualization responsive by watching for changes in window size
			window.onresize = function () {
				return scope.$apply();
			};
			scope.$watch(function () {
				return angular.element(window)[0].innerWidth;
			}, function () {
				return scope.render(scope.data);
			});

			// watch the data source for changes to dynamically update the visualization
			scope.$watch('data', function (newData, oldData) {
				return scope.render(newData);
			}, true);


			scope.render = function (data) {
				// clear out everything in the svg to render a fresh version
				svg.selectAll("*").remove();

				// set up variables
				var width, height, max;
				width = d3.select(iElement[0])[0][0].offsetWidth;
				height = 400;
				svg.attr('height', height);
				svg.attr('width', width);

				var irsBlue = 'rgb(82, 154, 189)';

				var yMax = -Infinity,
					yMin = Infinity;
				var xValues = [];
				xValues.push(' ');
				data.forEach(function (d, index) {
					xValues.push(index+1);
					d.forEach(function(p) {
						if(p > yMax) yMax = p;
						if(p < yMin) yMin = p;
					})
				});
				xValues.push('\t');

				var margins = {top: 50, right: 100, bottom: 50, left: 100 },
					yScale = d3.scale.linear().range([height - margins.top, margins.bottom])
						.domain([yMin*0.998, yMax*1.002]),
					yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left"),
					xScale = d3.scale.ordinal()
						.domain(xValues)
						.rangePoints([margins.left, width - margins.right]),
					xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom");

				// Axis
				svg.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + (height - margins.bottom) + ")")
					.call(xAxis)
					.selectAll("text")
					.style("text-anchor", "end")
				svg.append("svg:g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + (margins.left) + "," + (margins.top - margins.bottom) + ")")
					.call(yAxis);

				var bar_width = 40;


				// Grid

				svg.append("g")
					.attr("class", "grid")
					.attr("transform", "translate(" + margins.left + "," + (margins.top - margins.bottom) + ")")
					.call(yAxis
						.tickSize(-(width - margins.left - margins.right), 0, 0)
						.tickFormat(""));


				function computeValues(iteration) {
					var min,
						max,
						mid,
						value = Number,
						n = iteration.length;

					iteration = iteration.map(value).sort(d3.ascending);// d3.entries(iteration).sort(function(x) { return d3.ascending(x); });
					max = iteration[n-1];
					min = iteration[0];
					mid = iteration[Math.round(n/2)];
					q25 = iteration[Math.round(n/4)];
					q75 = iteration[Math.round(3*n/4)];
					return [min, max, mid, q25, q75];
				}

				data.forEach(function(iteration, index) {
					var val = yScale(iteration[0]);
					var bar_x = xScale(index+1) - bar_width/2;
					var values = computeValues(iteration);
					min = values[0];
					max = values[1];
					mid = values[2];
					q25 = values[3];
					q75 = values[4];

					// Center line
					svg.append("line")
						.attr("x1", xScale(index+1))
						.attr("y1", yScale(min))
						.attr("x2", xScale(index+1))
						.attr("y2", yScale(max))
						.attr("stroke-width", 1)
						.attr("stroke", irsBlue);

					// IQR
					svg.append("rect")
						.style({
							fill: "#f1f1f1"
						})
						// set initial dimensions of the bar
						.attr("width", bar_width)
						// position bar
						.attr("x", bar_x)
						.attr("y", yScale(q75)) // (height-margins.bottom) - val
						// finally, set the width of the bar based on the datapoint
						.attr("height", yScale(q25) - yScale(q75))
						.attr("stroke", irsBlue);
					svg.append("line")
						.attr("x1", bar_x)
						.attr("y1", yScale(q75))
						.attr("x2", bar_x+bar_width)
						.attr("y2", yScale(q75))
						.attr("stroke-width", 1)
						.attr("stroke", "black");
					svg.append("line")
						.attr("x1", bar_x)
						.attr("y1", yScale(q25))
						.attr("x2", bar_x+bar_width)
						.attr("y2", yScale(q25))
						.attr("stroke-width", 1)
						.attr("stroke", "black");

					// Min, mid and max
					svg.append("line")
						.attr("x1", bar_x)
						.attr("y1", yScale(min))
						.attr("x2", bar_x+bar_width)
						.attr("y2", yScale(min))
						.attr("stroke-width", 1)
						.attr("stroke", "black");
					svg.append("line")
						.attr("x1", bar_x)
						.attr("y1", yScale(mid))
						.attr("x2", bar_x+bar_width)
						.attr("y2", yScale(mid))
						.attr("stroke-width", 1)
						.attr("stroke", "black");
					svg.append("line")
						.attr("x1", bar_x)
						.attr("y1", yScale(max))
						.attr("x2", bar_x+bar_width)
						.attr("y2", yScale(max))
						.attr("stroke-width", 1)
						.attr("stroke", "black");



				});



			};
		}
	};
}]).directive('d3ParallelCoordinatesPlot', ['d3', function (d3) {
	return {
		restrict: 'EA',
		scope: {
			data: "=",
			label: "@",
		},
		link: function (scope, iElement, iAttrs) {
			// create the svg to contain our visualization
			var svg = d3.select(iElement[0])
				.append("svg")
				.attr("width", "100%");

			// make the visualization responsive by watching for changes in window size
			window.onresize = function () {
				return scope.$apply();
			};
			scope.$watch(function () {
				return angular.element(window)[0].innerWidth;
			}, function () {
				return scope.render(scope.data);
			});

			// watch the data source for changes to dynamically update the visualization
			scope.$watch('data', function (newData, oldData) {
				return scope.render(newData);
			}, true);


			scope.render = function (data) {
				// clear out everything in the svg to render a fresh version
				svg.selectAll("*").remove();

				// set up variables
				var width, height, max;
				width = d3.select(iElement[0])[0][0].offsetWidth;
				height = 400;
				var margins = {top: 50, right: 100, bottom: 50, left: 100 };
				svg.attr('height', height)
					.attr('width', width)
					.append("g")
					.attr("transform", "translate(" + margins.left + "," + margins.top + ")");

				var x = d3.scale.ordinal().rangePoints([0, width], 1),
					y = {},
					dragging = {};

				var line = d3.svg.line(),
					axis = d3.svg.axis().orient("left"),
					background,
					foreground,
					irsBlue = 'rgb(82, 154, 189)';

				if(data != '') {
					d3.csv(data, function (error, cars) {

						// Extract the list of dimensions and create a scale for each.
						x.domain(dimensions = d3.keys(cars[0]).filter(function (d, index) {
							var isNumerical = true;
							d3.extent(cars, function (p) {
								if(isNaN(p[d]))
									isNumerical = false;
							})
							if(isNumerical) {
								return d != "name" && (y[d] = d3.scale.linear()
										.domain(d3.extent(cars, function (p) {
											return +p[d];
										}))
										.range([height - margins.bottom, margins.top]));
							}
							else {

								return y[d] = d3.scale.ordinal()
									.domain(cars.map(function(p) { return p[d]; }))
									.rangePoints([height - margins.bottom, margins.top]);

							}
						}));

						// Add grey background lines for context.
						background = svg.append("g")
							.attr("class", "background")
							.selectAll("path")
							.data(cars)
							.enter().append("path")
							.attr("d", path);

						// Add blue foreground lines for focus.
						foreground = svg.append("g")
							.attr("class", "foreground")
							.selectAll("path")
							.data(cars)
							.enter().append("path")
							.attr("d", path);

						// Add a group element for each dimension.
						var g = svg.selectAll(".dimension")
							.data(dimensions)
							.enter().append("g")
							.attr("class", "dimension")
							.attr("transform", function (d) {
								return "translate(" + x(d) + ")";
							})
							.call(d3.behavior.drag()
								.origin(function (d) {
									return {x: x(d)};
								})
								.on("dragstart", function (d) {
									dragging[d] = x(d);
									background.attr("visibility", "hidden");
								})
								.on("drag", function (d) {
									dragging[d] = Math.min(width, Math.max(0, d3.event.x));
									foreground.attr("d", path);
									dimensions.sort(function (a, b) {
										return position(a) - position(b);
									});
									x.domain(dimensions);
									g.attr("transform", function (d) {
										return "translate(" + position(d) + ")";
									})
								})
								.on("dragend", function (d) {
									delete dragging[d];
									transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
									transition(foreground).attr("d", path);
									background
										.attr("d", path)
										.transition()
										.delay(500)
										.duration(0)
										.attr("visibility", null);
								}));

						// Add an axis and title.
						g.append("g")
							.attr("class", "axis")
							.each(function (d) {
								d3.select(this).call(axis.scale(y[d]));
							})
							.append("text")
							.style("text-anchor", "middle")
							.attr("y", margins.top-9)
							.text(function (d) {
								return d;
							});

						// Add and store a brush for each axis.
						g.append("g")
							.attr("class", "brush")
							.each(function (d) {
								d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
							})
							.selectAll("rect")
							.attr("x", -8)
							.attr("width", 16);
					});
				}

				function position(d) {
					var v = dragging[d];
					return v == null ? x(d) : v;
				}

				function transition(g) {
					return g.transition().duration(500);
				}

// Returns the path for a given data point.
				function path(d) {
					return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
				}

				function brushstart() {
					d3.event.sourceEvent.stopPropagation();
				}

// Handles a brush event, toggling the display of foreground lines.
				function brush() {
					var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
						extents = actives.map(function(p) { return y[p].brush.extent(); });
					foreground.style("display", function(d) {
						return actives.every(function(p, i) {
							return extents[i][0] <= d[p] && d[p] <= extents[i][1];
						}) ? null : "none";
					});
				}



			};
		}
	};
}]);
