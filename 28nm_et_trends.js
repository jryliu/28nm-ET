var dataset;
var margin = {top : 30,right : 80,bottom : 60,left : 50},
	width = $("#et-data").innerWidth() - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
//var color20 = d3.scale.category10();
var color20 = d3.scale.category10();
//var x = d3.time.scale().range([0, width - 20]); //datetime format
var x = d3.scale.ordinal().rangeRoundBands([0, width]); //date_lotid format str
var y = d3.scale.linear().range([height - 20, 0]);
var default_itemID = "RVTN_0.21/0.03x7_Vtsat";
var tooltip = d3.select("#et-data")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);
var tooltipmini = d3.select("#wrapper")
	.append("div")
	.attr("class", "tooltipmini")
	.style("opacity", 0);
var tooltipminihold = d3.select("#wrapper")
	.append("div")
	.attr("class", "tooltipminihold")
	.style("opacity", 0);
var xAxis = d3.svg.axis()
	.scale(x).orient("bottom")
	.tickFormat(d3.time.format("%m/%d"))
	.ticks(20);
var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(20);
function make_y_axis() {
	return d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(20);
}
var leftsvg = d3.select("#et-data").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("id", "leftsvg").append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.selectAll("#testlayeroption").on("change", chartQuery);
d3.selectAll("#processidoption").on("change", chartQuery);
d3.selectAll("#itemidoption").on("change", chartQuery);

$(document).ready(function(){
	//SETS INITIAL DEFAULT
	d3.csv("../RAWDATA/28nmET.csv", type, function(error, data) {
		if (error) {
			console.log(error);
			throw error;
		} else {
			d3.select("#processidoption").selectAll("g")
				.append('option').data(d3.map(data, function(d){return d.PROCESS_ID;}).keys())
				.enter().append('option').text(function(d){return d;})
				.attr("value", function(d){return d;});
			d3.select("#itemidoption").selectAll("g")
				.append('option').data(d3.keys(data[0]).filter(function (d) {
					return (d != "LOTID5" && d != "WAFER_ID" && d != "time" && d != "PROCESS_ID" && d != "PROCESS_ID_ZA991000_PROCESS_ID_MAX" && d != "ET_TIME_ZA991000_TKOUT_TIME_MAX") ? d : null;}))
				.enter().append('option')
				.text(function(d){return d;})
				.attr("value", function(d){return d;});
		}
		$("#itemidoption").val(default_itemID);
		width = $("#et-data").innerWidth() - margin.left - margin.right;
		height = 500 - margin.top - margin.bottom;
		x = d3.scale.ordinal().rangePoints([0, width], 5); //date_lotid better format, whats the diff vs. above?
		xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(30);
		d3.select("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("id", "leftsvg").append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var layer = $("#testlayeroption").val();
		var device = $("#processidoption").val();
		var option = $("#itemidoption").val();
		var optionName = $("#itemidoption :selected").text();
		x.domain(data.filter(function(d){return (device == "ALL" || device == d.PROCESS_ID)  ? d.time: null;} ).map(function(d){return d.time;}));
		y.domain(d3.extent(data, function (d) { return ((device == "ALL" || device == d.PROCESS_ID) && d[option] != 0)? d[option]: null;})).nice();

		leftsvg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
				.attr("y",0)
				.attr("x",9)
				.attr("dy", ".35em")
				.attr("transform", "rotate(-90)")
				.style("text-anchor", "end");

		leftsvg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr("y", -15)
			.attr("dy", ".71em")
			.style("text-anchor", "start")
			.style("font-size", 14)
			.text(optionName);

		leftsvg.append("g").attr("class", "grid")
			.call(make_y_axis()
				.tickSize(-width, 0, 0)
				.tickFormat(""));

		leftsvg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.filter(function (d) {return (device == "ALL" || device == d.PROCESS_ID) ? d[option] : null;})
			.attr("class", "dot")
			.attr("r", 4.5)
			.attr("cx", function (d) {return x(d.time);})
			.attr("cy", function (d) {return y(d[option]);})
			.style("fill", function (d) {	return color20(d.PROCESS_ID);	})
			//.attr("data-species", function (d){return d.species;})
			.style("opacity", .65)
			.on("mouseover", function (d) {
				tooltipmini.style("visibility", "visible");
				d3.select(this).transition()
					.duration(600).style("opacity", 1)
					.style("stroke", "black");
				tooltipmini.transition()
					.duration(600).style("opacity", .8)
					.style("background", color20(d.PROCESS_ID));
				tooltipmini.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
					+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
					+ "ET_TKOUT_TIME: " + d.time + "<br/>"
					+option + ": " + d3.round(d[option], 3))
					.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 10) + "px");
			}).on("mouseout", function (d) {
				d3.select(this).transition()
					.delay(200).duration(600)
					.style("opacity", .65).style("stroke", "white");
				tooltipmini.transition()
					.delay(200).duration(600)
					.style("opacity", 0)
					.style("pointer-events", 'none');
			}).on("click", function (d) {
				tooltipminihold.style("opacity", .8)
					.style("background", color20(d.PROCESS_ID))
					.style("visibility", "visible");
				tooltipminihold.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
					+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
					+ "ET_TKOUT_TIME: " + d.time + "<br/>"
					+option + ": " + d3.round(d[option], 3))
					.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 10) + "px");
				tooltipmini.style("visibility", "hidden");
			});
		tooltipminihold.on("click", function(d){
			d3.select(this).transition().duration(600).style("opacity",0).ease();
			d3.select(this).transition().delay(600).style("visibility", "hidden");
		});

		var legend = leftsvg.selectAll(".legend")
			.data(color20.domain())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function (d, i) {
				return "translate(0," + i * 18 + ")";
			});
		legend.append("rect")
			.attr("x", width - 22)
			.attr("width", 14)
			.attr("height", 14)
			.style("fill", color20)
			.style("stroke","white")
			.style("opacity", .8)

			//Legend highlight
			.on("mouseover", function (d) {
				legenddevice = d;
				d3.selectAll("circle").filter(function(d){	//circle highlight by PROCESS ID
					return d.PROCESS_ID_LX856900_PROCESS_ID_MAX == legenddevice;
				}).transition().duration(600).style("opacity",function(){
					return this.style.opacity != 0 ? 1 : this.style.opacity;
				});
				d3.selectAll("circle").filter(function(d){
					return !(d.PROCESS_ID_LX856900_PROCESS_ID_MAX == legenddevice);
				}).transition().duration(600).style("opacity",function(){
					return this.style.opacity != 0? .075: this.style.opacity;
				});
				d3.select(this).transition()	//Legend Box
					.duration(600).style("opacity", 1)
					.style("stroke", "#999");
			})
			.on("mouseout", function (d) {
				d3.selectAll("circle").transition().duration(600).style("opacity",function(){
					return this.style.opacity != 0 ? .65 : this.style.opacity;
				}); //reset circle
				d3.select(this).transition()	//Legend box
					.delay(200).duration(600)
					.style("opacity", .8).style("stroke", "white");
			})
			.on("click", function (d) {
				legenddevice = d;
				d3.selectAll("circle").filter(function(d){
					return d.PROCESS_ID_LX856900_PROCESS_ID_MAX == legenddevice;
				}).transition().delay(200).duration(600).style("opacity",function(){
					return (parseInt(this.style.opacity))? 0 :1;
				});
			});
		legend.append("text")
			.attr("x", width - 8)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "start")
			.text(function (d) {
				return d;
			});
	});

	//ON CHANGE FUNCTIONS
	$("#testlayeroption").change(function(){
		if($(this).find("option:selected").attr("value")=="MF"){
			d3.csv("../RAWDATA/28nmET.csv", type, function(error, data) {
				if (error) {
					console.log(error);
					throw error;
				} else {
					var processidlist = d3.select("#processidoption").selectAll("option")
						.data(d3.map(data, function(d){return d.PROCESS_ID;}).keys());

					processidlist.text(function(d){return d;}) //update() process id
						.attr("value", function(d){return d;});
					processidlist.enter().append('option').text(function(d){return d;}) //enter() process id
						.attr("value", function(d){return d;});
					processidlist.exit().remove();  //exit() process id
					//Add the 'ALL' option to the list
					$("#processidoption").prepend("<option value = 'ALL' selected = 'selected'>All</option>");
					d3.select("#itemidoption").selectAll("g")  //no need to select 'option' elements as only 1 time on testlayer change
						.append('option').data(d3.keys(data[0]).filter(function (d) {
							return (d != "LOTID5" && d != "WAFER_ID" && d != "time" && d != "PROCESS_ID" && d != "PROCESS_ID_ZA991000_PROCESS_ID_MAX" && d != "ET_TIME_ZA991000_TKOUT_TIME_MAX") ? d : null;}))
						.append('option').text(function(d){return d;})
							.attr("value", function(d){return d;});
				}
			});
		}
		else if ($(this).find("option:selected").attr("value")=="M1"){
			d3.csv("../RAWDATA/28nmET_inline.csv", type_inline, function(error, data) {
				if (error) {
					console.log(error);
					throw error;
				} else {
					var processidlist = d3.select("#processidoption").selectAll("option")
						.data(d3.map(data, function(d){return d.PROCESS_ID;}).keys());

					processidlist.text(function(d){return d;})
						.attr("value", function(d){return d;});
					processidlist.enter().append('option').text(function(d){return d;})
						.attr("value", function(d){return d;});
					processidlist.exit().remove();
					$("#processidoption").prepend("<option value = 'ALL' selected = 'selected'>All</option>");
					d3.select("#itemidoption").selectAll("g")
						.append('option').data(d3.keys(data[0]).filter(function (d) {
							return (d != "LOTID5" && d != "WAFER_ID" && d != "time" && d != "PROCESS_ID" && d != "PROCESS_ID_ZA522600_PROCESS_ID_MAX" && d != "ET_TIME_ZA522600_TKOUT_TIME_MAX") ? d : null;}))
						.append('option')
						.text(function(d){return d;})
						.attr("value", function(d){return d;});
				}
			});
		}
		else { console.log(error); throw error;}
	});
});
function chartQuery() {
	//Resized
	width = $("#et-data").innerWidth() - margin.left - margin.right;
	height = 500 - margin.top - margin.bottom;
	//x = d3.time.scale().range([0,width-20]); //datetime format
	//xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%m/%d")).ticks(20);
	///x = d3.scale.ordinal().rangeRoundBands([0, width]); //date_lotid format str
	x = d3.scale.ordinal().rangePoints([0, width], 5); //date_lotid better format
	xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(30);
	d3.select("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "leftsvg").append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var layer = $("#testlayeroption").val();
	var device = $("#processidoption").val();
	var option = $("#itemidoption").val();
	var optionName = $("#itemidoption :selected").text();
	if (layer == "MF" && device != null && option != null) {
		d3.csv("../RAWDATA/28nmET.csv", type, function(error, data) {
			if (error) {
				console.log(error);
				throw error;
			} else {
				//x.domain(d3.extent(data, function (d) {	return d.time;	})).nice(); //datetime
				x.domain(data.filter(function(d){return (device == "ALL" || device == d.PROCESS_ID)  ? d.time: null;}).map(function(d){return d.time;}));
				y.domain(d3.extent(data, function (d) { return ((device == "ALL" || device == d.PROCESS_ID) && d[option] != 0)? +d[option]: null;})).nice();

				dataset = data;
				leftsvg.selectAll(".x.axis").call(xAxis)
					.selectAll("text")
						.attr("y",0)
						.attr("x",9)
						.attr("dy", ".35em")
						.attr("transform", "rotate(-90)")
						.style("text-anchor", "end");

				leftsvg.selectAll(".y.axis").call(yAxis).selectAll(".label").text(optionName);

				var join_data = leftsvg.selectAll(".dot").data(data.filter(function(d){return (device == "ALL" || device == d.PROCESS_ID)  ? d.time: null;}), function(d){return d.date_lot.concat(d.WAFER_ID);});
				//exit() selection
				join_data.exit().transition().duration(600).ease("cubicInOut").style("opacity",0).remove();
				/*d3.transition().duration(600).each(function(){
					join_data.exit()
						.transition().style("opacity",0).remove();
				});*/
				//update() section
				join_data.attr("cx", function(d){return x(d.time);})
					.attr("cy", function (d) {return y(d[option]);})
					.style("fill", function (d) {	return color20(d.PROCESS_ID);	})
					.on("mouseover", function (d) {
						tooltipmini.style("visibility", "visible");
						d3.select(this).transition()
							.duration(600).style("opacity", 1)
							.style("stroke", "black");
						tooltipmini.transition()
							.duration(600).style("opacity", .8)
							.style("background", color20(d.PROCESS_ID));
						tooltipmini.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
					}).on("mouseout", function (d) {
						d3.select(this).transition()
							.delay(200).duration(600)
							.style("opacity", .65).style("stroke", "white");
						tooltipmini.transition()
							.delay(200).duration(600)
							.style("opacity", 0)
							.style("pointer-events", 'none');
					}).on("click", function (d) {
						tooltipminihold.style("opacity", .8)
							.style("background", color20(d.PROCESS_ID))
							.style("visibility", "visible");
						tooltipminihold.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
						tooltipmini.style("visibility", "hidden");
					})
					.transition().duration(600).ease("cubicInOut");
				//enter() selection
				join_data.enter().append("circle")
					.filter(function (d) {return (device == "ALL" || device == d.PROCESS_ID) ? d[option] : null;})
					//.transition().duration(600)
					.attr("class", "dot")
					.attr("r", 4.5)
					.attr("cx", function (d) {return x(d.time);})
					.attr("cy", function (d) {return y(d[option]);})
					.style("fill", function (d) {	return color20(d.PROCESS_ID);	})
					//.attr("data-species", function (d){return d.species;})
					.style("opacity", 0)
					.on("mouseover", function (d) {
						tooltipmini.style("visibility", "visible");
						d3.select(this).transition()
							.duration(600).style("opacity", 1)
							.style("stroke", "black");
						tooltipmini.transition()
							.duration(600).style("opacity", .8)
							.style("background", color20(d.PROCESS_ID));
						tooltipmini.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
					}).on("mouseout", function (d) {
						d3.select(this).transition()
							.delay(200).duration(600)
							.style("opacity", .65).style("stroke", "white");
						tooltipmini.transition()
							.delay(200).duration(600)
							.style("opacity", 0)
							.style("pointer-events", 'none');
					}).on("click", function (d) {
						tooltipminihold.style("opacity", .8)
							.style("background", color20(d.PROCESS_ID))
							.style("visibility", "visible");
						tooltipminihold.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
						tooltipmini.style("visibility", "hidden");
					})
					.transition().duration(600).style("opacity",.65);
				tooltipminihold.on("click", function(d){
					d3.select(this).transition().duration(600).style("opacity",0).ease();
					d3.select(this).transition().delay(600).style("visibility", "hidden");
				});

				//LEGEND SETUP
				var legend = leftsvg.selectAll(".legend")
					.data(color20.domain())
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function (d, i) {
						return "translate(0," + i * 18 + ")";
					});
				legend.append("rect")
					.attr("x", width - 22)
					.attr("width", 14)
					.attr("height", 14)
					.style("fill", color20)
					.style("stroke","white")
					.style("opacity", .8)

					//Legend highlight
					.on("mouseover", function (d) {
						legenddevice = d;
						d3.selectAll("circle").filter(function(d){	//circle highlight by PROCESS ID
							return d.PROCESS_ID_LE522600_PROCESS_ID_MAX == legenddevice;
						}).transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0 ? 1 : this.style.opacity;
						});
						d3.selectAll("circle").filter(function(d){
							return !(d.PROCESS_ID_LE522600_PROCESS_ID_MAX == legenddevice);
						}).transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0? .075: this.style.opacity;
						});
						d3.select(this).transition()	//Legend Box
							.duration(600).style("opacity", 1)
							.style("stroke", "#999");
					}).on("mouseout", function (d) {
						d3.selectAll("circle").transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0 ? .65 : this.style.opacity;
						}); //reset circle
						d3.select(this).transition()	//Legend box
							.delay(200).duration(600)
							.style("opacity", .8).style("stroke", "white");
					}).on("click", function (d) {
						legenddevice = d;
						d3.selectAll("circle").filter(function(d){
							return d.PROCESS_ID_LE522600_PROCESS_ID_MAX == legenddevice;
						}).transition().delay(200).duration(600).style("opacity",function(){
							return (parseInt(this.style.opacity))? 0 :1;
						});
					});
				legend.append("text")
					.attr("x", width - 8)
					.attr("y", 9)
					.attr("dy", ".35em")
					.style("text-anchor", "start")
					.text(function (d) {
						return d;
					});
				/* d3.csv("../RAWDATA/28nmET_day_median.csv", type_median, function (error, data) {
					if (error) {	console.log(error); throw error;}
					else {
						console.log(data);

						var line = d3.svg.line()
							.interpolate("cardinal")
							.x(function (d) { return x(d.time);})
							.y(function (d) { return y(d[option]);});

						//EXPERIMENTAL SECTION
													leftsvg.selectAll('path')
							.data(data.filter(function (d){
								if (device == d.PROCESS_ID)
									return d[option];
								else
									return null;
							}))
							.enter().append('path')
							.attr('d', function(d){return d[option]})
							.attr('stroke', function(d){return color20(d.PROCESS_ID)});

						leftsvg.append("path")
							.datum(data.filter(function (d) {
								if (device == d.PROCESS_ID)
									return d[option];
								else
									return null;
							}))
							.attr("class", "line")
							.attr("d", line)
							.style("stroke", function(d){ return color20(d.PROCESS_ID)});
					}
				}); */
			}
		});
	}
	else if (layer == "M1" && device != null && option != null){
		d3.csv("../RAWDATA/28nmET_inline.csv", type_inline, function (error, data) {
			if (error) {
				console.log(error);
				throw error;
			} else {
				//x.domain(d3.extent(data, function (d) {	return d.time;	})).nice();
				x.domain(data.filter(function(d){return (device == "ALL" || device == d.PROCESS_ID)  ? d.time: null;} ).map(function(d){return d.time;}));
				y.domain(d3.extent(data, function (d) { return ((device == "ALL" || device == d.PROCESS_ID) && d[option] != 0)? +d[option]: null;})).nice();

				leftsvg.selectAll(".x.axis").call(xAxis)
					.selectAll("text")
						.attr("y",0)
						.attr("x",9)
						.attr("dy", ".35em")
						.attr("transform", "rotate(-90)")
						.style("text-anchor", "end");

				leftsvg.selectAll(".y.axis").call(yAxis).selectAll(".label").text(optionName);

				var join_data = leftsvg.selectAll(".dot").data(data.filter(function(d){return (device == "ALL" || device == d.PROCESS_ID)  ? d.time: null;}), function(d){return d.date_lot.concat(d.WAFER_ID);});
				//exit() selection
				join_data.exit().transition().duration(600).ease("cubicInOut").style("opacity",0).remove();
				/*d3.transition().duration(600).each(function(){
					join_data.exit()
						.transition().style("opacity",0).remove();
				});*/
				//update() section
				leftsvg.selectAll(".dot").transition().duration(600).ease("cubicInOut")
					.attr("cx", function(d){return x(d.time);})
					.attr("cy", function (d) {return y(d[option]);})
					.style("fill", function (d) {	return color20(d.PROCESS_ID);	});
				join_data.on("mouseover", function (d) {
						tooltipmini.style("visibility", "visible");
						d3.select(this).transition()
							.duration(600).style("opacity", 1)
							.style("stroke", "black");
						tooltipmini.transition()
							.duration(600).style("opacity", .8)
							.style("background", color20(d.PROCESS_ID));
						tooltipmini.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");})
					.on("mouseout", function (d) {
						d3.select(this).transition()
							.delay(200).duration(600)
							.style("opacity", .65).style("stroke", "white");
						tooltipmini.transition()
							.delay(200).duration(600)
							.style("opacity", 0)
							.style("pointer-events", 'none');})
					.on("click", function (d) {
						tooltipminihold.style("opacity", .8)
							.style("background", color20(d.PROCESS_ID))
							.style("visibility", "visible");
						tooltipminihold.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
						tooltipmini.style("visibility", "hidden");});
				//enter() selection
				join_data.enter().append("circle")
					.filter(function (d) {return (device == "ALL" || device == d.PROCESS_ID) ? d[option] : null;})
					//.transition().duration(600)
					.attr("class", "dot")
					.attr("r", 4.5)
					.attr("cx", function (d) {return x(d.time);})
					.attr("cy", function (d) {return y(d[option]);})
					.style("fill", function (d) {	return color20(d.PROCESS_ID);	})
					//.attr("data-species", function (d){return d.species;})
					.style("opacity", 0)
					.on("mouseover", function (d) {
						tooltipmini.style("visibility", "visible");
						d3.select(this).transition()
							.duration(600).style("opacity", 1)
							.style("stroke", "black");
						tooltipmini.transition()
							.duration(600).style("opacity", .8)
							.style("background", color20(d.PROCESS_ID));
						tooltipmini.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
					}).on("mouseout", function (d) {
						d3.select(this).transition()
							.delay(200).duration(600)
							.style("opacity", .65).style("stroke", "white");
						tooltipmini.transition()
							.delay(200).duration(600)
							.style("opacity", 0)
							.style("pointer-events", 'none');
					}).on("click", function (d) {
						tooltipminihold.style("opacity", .8)
							.style("background", color20(d.PROCESS_ID))
							.style("visibility", "visible");
						tooltipminihold.html("LOTID:" + d.LOTID5 + " WAFER: " + d.WAFER_ID + "<br/>"
							+ "PROCESS_ID: " + d.PROCESS_ID + "<br/>"
							+ "ET_TKOUT_TIME: " + d.time + "<br/>"
							+option + ": " + d3.round(d[option], 3))
							.style("left", (d3.event.pageX + 15) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
						tooltipmini.style("visibility", "hidden");
					})
					.transition().duration(600).style("opacity",.65);
				tooltipminihold.on("click", function(d){
					d3.select(this).transition().duration(600).style("opacity",0).ease();
					d3.select(this).transition().delay(600).style("visibility", "hidden");
				});

				//LEGEND SETUP
				var legend = leftsvg.selectAll(".legend")
					.data(color20.domain())
					.enter().append("g")
					.attr("class", "legend")
					.attr("transform", function (d, i) {
						return "translate(0," + i * 18 + ")";
					});
				legend.append("rect")
					.attr("x", width - 22)
					.attr("width", 14)
					.attr("height", 14)
					.style("fill", color20)
					.style("stroke","white")
					.style("opacity", .8)

					//Legend highlight
					.on("mouseover", function (d) {
						legenddevice = d;
						d3.selectAll("circle").filter(function(d){	//circle highlight by PROCESS ID
							return d.PROCESS_ID_LE522600_PROCESS_ID_MAX == legenddevice;
						}).transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0 ? 1 : this.style.opacity;
						});
						d3.selectAll("circle").filter(function(d){
							return !(d.PROCESS_ID_LE522600_PROCESS_ID_MAX == legenddevice);
						}).transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0? .075: this.style.opacity;
						});
						d3.select(this).transition()	//Legend Box
							.duration(600).style("opacity", 1)
							.style("stroke", "#999");
					}).on("mouseout", function (d) {
						d3.selectAll("circle").transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0 ? .65 : this.style.opacity;
						}); //reset circle
						d3.select(this).transition()	//Legend box
							.delay(200).duration(600)
							.style("opacity", .8).style("stroke", "white");
					}).on("click", function (d) {
						legenddevice = d;
						d3.selectAll("circle").filter(function(d){
							return d.PROCESS_ID_LE522600_PROCESS_ID_MAX == legenddevice;
						}).transition().delay(200).duration(600).style("opacity",function(){
							return (parseInt(this.style.opacity))? 0 :1;
						});
					});
				legend.append("text")
					.attr("x", width - 8)
					.attr("y", 9)
					.attr("dy", ".35em")
					.style("text-anchor", "start")
					.text(function (d) {
						return d;
					});
			}
		});
	}
	else {
		alertBadQuery(layer, device, option);
	}
}
function type(d) {
	//d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_ZA991000_TKOUT_TIME_MAX);
	d.time = d.date_lot;
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	return d;
}
function type_inline(d) {
	//d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_ZA522600_TKOUT_TIME_MAX);
	d.time = d.date_lot;
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	return d;
}
function type_DDI(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_LX856900_TKOUT_TIME_MAX);
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	return d;
}
function type_CIS(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_Q05900_TKOUT_TIME_MAX);
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	return d;
}
function type_DDI_inline(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_LX602410_TKOUT_TIME_MAX);
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	return d;
}
function type_CIS_inline(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_LE522600_TKOUT_TIME_MAX);
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	return d;
}
function type_median(d) {
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	d.time = d3.time.format("%Y-%m-%d").parse(d.ET_TIME_ZA991000_TKOUT_TIME_MAX);
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	return d;
}
function type_inline_median(d) {
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	d.time = d3.time.format("%Y-%m-%d").parse(d.ET_TIME_ZA522600_TKOUT_TIME_MAX);
	d3.keys(d).forEach(function(orig){	//Real numberify for all the rest of the columns, orig is col header name
		if(orig != "time" || orig != "PROCESS_ID")
			orig.value = +orig.value;
	});
	return d;
}
