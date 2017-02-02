var margin = {top : 30,right : 80,bottom : 60,left : 50},
	width = $("#et-data").innerWidth() - - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
//var color20 = d3.scale.category10();
var color20 = d3.scale.category10();
var x = d3.time.scale()
	.range([0, width - 20]);
var y = d3.scale.linear()
	.range([height - 20, 0]);
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
//TRYING TO FORM VARIABLE FORM-CONTROL TO GET DEVICE TYPES ONLY LISTED IN DATA
/* d3.csv("../RAWDATA/28nmET.csv", type, function (error, data) {
	if(error){
		console.log(error);
		throw error;
	} else{
		d3.select()
	}
} */
var leftsvg = d3.select("#et-data")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("id", "leftsvg").append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function alertBadQuery(layer, device, option){
	if( layer == null){
		$("#testlayeroption").css("border-color", "red");
		$("#formAlert").removeClass("hide");
		$("#formAlert").slideDown(400);
	}
	if( device == null){
		$("#processidoption").css("border-color", "red");
		$("#formAlert").removeClass("hide");
		$("#formAlert").slideDown(400);
	}
	if( option == null){
		$("#itemidoption").css("border-color", "red");
		$("#formAlert").removeClass("hide");
		$("#formAlert").slideDown(400);
	}
}
function resetBadQuery(layer, device, option){
	$("#formAlert").addClass("hide");
	$("#testlayeroption").css("border-color", "#ccc");
	$("#processidoption").css("border-color", "#ccc");
	$("#itemidoption").css("border-color", "#ccc");
}
function chartQuery() {
	//Resized
	width = $("#et-data").innerWidth() - margin.left - margin.right;
	height = 500 - margin.top - margin.bottom;
	x = d3.time.scale().range([0,width-20]);
	xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%m/%d")).ticks(20);
	d3.select("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "leftsvg").append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var layer = $("#testlayeroption").val();
	var device = $("#processidoption").val();
	var option = $("#itemidoption").val();
	var optionName = $("#itemidoption :selected").text();
	resetBadQuery(layer, device, option);
	if (layer == "MF" && device != null && option != null) {
		d3.csv("../RAWDATA/28nmET.csv", type, function(error, data) {
			if (error) {
				console.log(error);
				throw error;
			} else {
				x.domain(d3.extent(data, function (d) {	return d.time;	})).nice();
				y.domain(d3.extent(data, function (d) { return ((device == "ALL" || device == d.PROCESS_ID) && d[option] != 0)? d[option]: null;})).nice();

				leftsvg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.append("text")
					.attr("class", "label")
					.attr("x", width)
					.attr("y", -6)
					.style("text-anchor", "end")
					.text("ET TKOut Time");

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
							return d.PROCESS_ID_ZA991000_PROCESS_ID_MAX == legenddevice;
						}).transition().duration(600).style("opacity",function(){
							return this.style.opacity != 0 ? 1 : this.style.opacity;
						});
						d3.selectAll("circle").filter(function(d){
							return !(d.PROCESS_ID_ZA991000_PROCESS_ID_MAX == legenddevice);
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
							return d.PROCESS_ID_ZA991000_PROCESS_ID_MAX == legenddevice;
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
		leftsvg.selectAll("*").remove();
	}
	else if (layer == "M1" && device != null && option != null){
		d3.csv("../RAWDATA/28nmET_inline.csv", type_inline, function (error, data) {
			if (error) {
				console.log(error);
				throw error;
			} else {
				x.domain(d3.extent(data, function (d) {	return d.time;	})).nice();
				y.domain(d3.extent(data, function (d) {
					if ((device == "ALL" || device == d.PROCESS_ID) && d[option] != 0)
						return d[option];
					else
						return null;
				})).nice();
				leftsvg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.append("text")
					.attr("class", "label")
					.attr("x", width)
					.attr("y", -6)
					.style("text-anchor", "end")
					.text("ET TKOut Time");

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
						.tickFormat(""))

				leftsvg.selectAll(".dot")
					.data(data)
					.enter().append("circle")
					.filter(function (d) {
						if (device == "ALL" || device == d.PROCESS_ID)
							return d[option];
						else
							return null;
					})
					.attr("class", "dot")
					.attr("r", 4.5)
					.attr("cx", function (d) {
						return x(d.time);
					})
					.attr("cy", function (d) {
						return y(d[option]);
					})
					.style("fill", function (d) {
						return color20(d.PROCESS_ID);
					})
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
						//d3.select(this).style("opacity",1).style("stroke","black");
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
					d3.select(this).transition().duration(600).style("opacity",0);
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
					.style("fill", color20);
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
		leftsvg.selectAll("*").remove();
	}
	else {
		alertBadQuery(layer, device, option);
	}
}
$(document).ready(function(){
	$(".alert").find(".close").on("click", function(e){
		e.stopPropagation();
		e.preventDefault();
		$(this).closest(".alert").slideUp(400);
	});
});
function type(d, _, columns) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_ZA991000_TKOUT_TIME_MAX);
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat;
	d.D120_PD_Idsat = +d.ET_D120_M1_4b_ult_PD_Idsat;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat;
	d.D120_PG_Idsat = +d.ET_D120_M1_4b_ult_PG_Idsat;
	d.D120_PG_Vtsat = +d.ET_D120_M1_4b_ult_PG_Vtsat;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat;
	d.RVTN_COV = +d.ET_RVTN_Covdd;
	d.RVTP_COV = +d.ET_RVTP_Covdd;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat"];
	d.Leff_N = +d.ET_Leff_N;
	d.Leff_P = +d.ET_Leff_P;
	d.LPoly_N = +d.ET_Lpoly_RVTN;
	d.LPoly_P = +d.ET_Lpoly_RVTP;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum;
	d.SGN_TOX = +d.ET_SGN_Tox_inv;
	d.SGP_TOX = +d.ET_SGP_Tox_inv;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin"];
	d.VPNP_BETA = +d.ET_VPNP_Beta;
	d.WAFER_ID = +d.WAFER_ID;
	return d;
}
function type_DDI(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_LX856900_TKOUT_TIME_MAX);
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR_VALUE_MEDIAN;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L_VALUE_MEDIAN;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat_VALUE_MEDIAN;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.RVTN_COV = +d.ET_RVTN_Covdd_VALUE_MEDIAN;
	d.RVTP_COV = +d.ET_RVTP_Covdd_VALUE_MEDIAN;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat_VALUE_MEDIAN"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat_VALUE_MEDIAN"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin_VALUE_MEDIAN"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin_VALUE_MEDIAN"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.Leff_N = +d.ET_Leff_N_VALUE_MEDIAN;
	d.Leff_P = +d.ET_Leff_P_VALUE_MEDIAN;
	d.LPoly_N = +d.ET_Lpoly_RVTN_VALUE_MEDIAN;
	d.LPoly_P = +d.ET_Lpoly_RVTP_VALUE_MEDIAN;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30_VALUE_MEDIAN"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30_VALUE_MEDIAN"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum_VALUE_MEDIAN;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum_VALUE_MEDIAN;
	d.SGN_TOX = +d.ET_SGN_Tox_inv_VALUE_MEDIAN;
	d.SGP_TOX = +d.ET_SGP_Tox_inv_VALUE_MEDIAN;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.VPNP_BETA = +d.ET_VPNP_Beta_VALUE_MEDIAN;
	d.WAFER_ID = +d.WAFER_ID;
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	return d;
}
function type_CIS(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_Q05900_TKOUT_TIME_MAX);
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR_VALUE_MEDIAN;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L_VALUE_MEDIAN;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat_VALUE_MEDIAN;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.RVTN_COV = +d.ET_RVTN_Covdd_VALUE_MEDIAN;
	d.RVTP_COV = +d.ET_RVTP_Covdd_VALUE_MEDIAN;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat_VALUE_MEDIAN"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat_VALUE_MEDIAN"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin_VALUE_MEDIAN"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin_VALUE_MEDIAN"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.Leff_N = +d.ET_Leff_N_VALUE_MEDIAN;
	d.Leff_P = +d.ET_Leff_P_VALUE_MEDIAN;
	d.LPoly_N = +d.ET_Lpoly_RVTN_VALUE_MEDIAN;
	d.LPoly_P = +d.ET_Lpoly_RVTP_VALUE_MEDIAN;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30_VALUE_MEDIAN"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30_VALUE_MEDIAN"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum_VALUE_MEDIAN;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum_VALUE_MEDIAN;
	d.SGN_TOX = +d.ET_SGN_Tox_inv_VALUE_MEDIAN;
	d.SGP_TOX = +d.ET_SGP_Tox_inv_VALUE_MEDIAN;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.VPNP_BETA = +d.ET_VPNP_Beta_VALUE_MEDIAN;
	d.WAFER_ID = +d.WAFER_ID;
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	return d;
}
function type_inline(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_ZA522600_TKOUT_TIME_MAX);
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR_VALUE_MEDIAN;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L_VALUE_MEDIAN;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat_VALUE_MEDIAN;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.D120_PD_Idsat = +d.ET_D120_M1_4b_ult_PD_Idsat_VALUE_MEDIAN;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.D120_PG_Idsat = +d.ET_D120_M1_4b_ult_PG_Idsat_VALUE_MEDIAN;
	d.D120_PG_Vtsat = +d.ET_D120_M1_4b_ult_PG_Vtsat_VALUE_MEDIAN;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.RVTN_COV = +d.ET_RVTN_Covdd_VALUE_MEDIAN;
	d.RVTP_COV = +d.ET_RVTP_Covdd_VALUE_MEDIAN;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat_VALUE_MEDIAN"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat_VALUE_MEDIAN"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin_VALUE_MEDIAN"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin_VALUE_MEDIAN"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.Leff_N = +d.ET_Leff_N_VALUE_MEDIAN;
	d.Leff_P = +d.ET_Leff_P_VALUE_MEDIAN;
	d.LPoly_N = +d.ET_Lpoly_RVTN_VALUE_MEDIAN;
	d.LPoly_P = +d.ET_Lpoly_RVTP_VALUE_MEDIAN;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30_VALUE_MEDIAN"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30_VALUE_MEDIAN"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum_VALUE_MEDIAN;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum_VALUE_MEDIAN;
	d.SGN_TOX = +d.ET_SGN_Tox_inv_VALUE_MEDIAN;
	d.SGP_TOX = +d.ET_SGP_Tox_inv_VALUE_MEDIAN;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.VPNP_BETA = +d.ET_VPNP_Beta_VALUE_MEDIAN;
	d.WAFER_ID = +d.WAFER_ID;
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	return d;
}
function type_DDI_inline(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_LX602410_TKOUT_TIME_MAX);
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR_VALUE_MEDIAN;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L_VALUE_MEDIAN;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat_VALUE_MEDIAN;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.RVTN_COV = +d.ET_RVTN_Covdd_VALUE_MEDIAN;
	d.RVTP_COV = +d.ET_RVTP_Covdd_VALUE_MEDIAN;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat_VALUE_MEDIAN"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat_VALUE_MEDIAN"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin_VALUE_MEDIAN"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin_VALUE_MEDIAN"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.Leff_N = +d.ET_Leff_N_VALUE_MEDIAN;
	d.Leff_P = +d.ET_Leff_P_VALUE_MEDIAN;
	d.LPoly_N = +d.ET_Lpoly_RVTN_VALUE_MEDIAN;
	d.LPoly_P = +d.ET_Lpoly_RVTP_VALUE_MEDIAN;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30_VALUE_MEDIAN"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30_VALUE_MEDIAN"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum_VALUE_MEDIAN;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum_VALUE_MEDIAN;
	d.SGN_TOX = +d.ET_SGN_Tox_inv_VALUE_MEDIAN;
	d.SGP_TOX = +d.ET_SGP_Tox_inv_VALUE_MEDIAN;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.VPNP_BETA = +d.ET_VPNP_Beta_VALUE_MEDIAN;
	d.WAFER_ID = +d.WAFER_ID;
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	return d;
}
function type_CIS_inline(d) {
	d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.ET_TIME_LE522600_TKOUT_TIME_MAX);
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR_VALUE_MEDIAN;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L_VALUE_MEDIAN;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat_VALUE_MEDIAN;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.RVTN_COV = +d.ET_RVTN_Covdd_VALUE_MEDIAN;
	d.RVTP_COV = +d.ET_RVTP_Covdd_VALUE_MEDIAN;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat_VALUE_MEDIAN"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat_VALUE_MEDIAN"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin_VALUE_MEDIAN"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin_VALUE_MEDIAN"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.Leff_N = +d.ET_Leff_N_VALUE_MEDIAN;
	d.Leff_P = +d.ET_Leff_P_VALUE_MEDIAN;
	d.LPoly_N = +d.ET_Lpoly_RVTN_VALUE_MEDIAN;
	d.LPoly_P = +d.ET_Lpoly_RVTP_VALUE_MEDIAN;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30_VALUE_MEDIAN"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30_VALUE_MEDIAN"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum_VALUE_MEDIAN;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum_VALUE_MEDIAN;
	d.SGN_TOX = +d.ET_SGN_Tox_inv_VALUE_MEDIAN;
	d.SGP_TOX = +d.ET_SGP_Tox_inv_VALUE_MEDIAN;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.VPNP_BETA = +d.ET_VPNP_Beta_VALUE_MEDIAN;
	d.WAFER_ID = +d.WAFER_ID;
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	return d;
}
function type_median(d) {
	d.PROCESS_ID = d.PROCESS_ID_ZA991000_PROCESS_ID_MAX;
	d.time = d3.time.format("%Y-%m-%d").parse(d.ET_TIME_ZA991000_TKOUT_TIME_MAX);
	d.D120_SNMR = +d.ET_D120_M1_1b_lat_100BCR;
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat;
	d.D120_PD_Idsat = +d.ET_D120_M1_4b_ult_PD_Idsat;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat;
	d.D120_PG_Idsat = +d.ET_D120_M1_4b_ult_PG_Idsat;
	d.D120_PG_Vtsat = +d.ET_D120_M1_4b_ult_PG_Vtsat;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat;
	d.RVTN_COV = +d.ET_RVTN_Covdd;
	d.RVTP_COV = +d.ET_RVTP_Covdd;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat"];
	d.Leff_N = +d.ET_Leff_N;
	d.Leff_P = +d.ET_Leff_P;
	d.LPoly_N = +d.ET_Lpoly_RVTN;
	d.LPoly_P = +d.ET_Lpoly_RVTP;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum;
	d.SGN_TOX = +d.ET_SGN_Tox_inv;
	d.SGP_TOX = +d.ET_SGP_Tox_inv;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin"];
	d.VPNP_BETA = +d.ET_VPNP_Beta;
	return d;
}
function type_inline_median(d) {
	d.PROCESS_ID = d.PROCESS_ID_ZA522600_PROCESS_ID_MAX;
	d.time = d3.time.format("%Y-%m-%d").parse(d.ET_TIME_ZA522600_TKOUT_TIME_MAX);
	d.D120_lat_IRD_L = +d.ET_D120_M1_1b_lat_100IRD_L_VALUE_MEDIAN;
	d.D120_PU_Idsat = +d.ET_D120_M1_4b_ult_PU_Idsat_VALUE_MEDIAN;
	d.D120_PU_Vtsat = +d.ET_D120_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.D120_PD_Vtsat = +d.ET_D120_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.H152_PU_Vtsat = +d.ET_H152_M1_4b_ult_PU_Vtsat_VALUE_MEDIAN;
	d.H152_PD_Vtsat = +d.ET_H152_M1_4b_ult_PD_Vtsat_VALUE_MEDIAN;
	d.RVTN_COV = +d.ET_RVTN_Covdd_VALUE_MEDIAN;
	d.RVTP_COV = +d.ET_RVTP_Covdd_VALUE_MEDIAN;
	d.EGN_Sh_Ch_Vtsat = +d["ET_EGN_2/0.15_Vtsat_VALUE_MEDIAN"];
	d.EGP_Sh_Ch_Vtsat = +d["ET_EGP_2/0.45_Vtsat_VALUE_MEDIAN"];
	d.EGN_Long_Ch_Vtlin = +d["ET_EGN_2/2_Vtlin_VALUE_MEDIAN"];
	d.EGP_Long_Ch_Vtlin = +d["ET_EGP_2/2_Vtlin_VALUE_MEDIAN"];
	d.LVTN_Short_Ch_Vtsat = +d["ET_LVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.LVTP_Short_Ch_Vtsat = +d["ET_LVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.Leff_N = +d.ET_Leff_N_VALUE_MEDIAN;
	d.Leff_P = +d.ET_Leff_P_VALUE_MEDIAN;
	d.LPoly_N = +d.ET_Lpoly_RVTN_VALUE_MEDIAN;
	d.LPoly_P = +d.ET_Lpoly_RVTP_VALUE_MEDIAN;
	d.OP_NRX = +d["ET_OP_NRX_Res_10X30_VALUE_MEDIAN"];
	d.OP_PPC = +d["ET_OP_PPC_Res_10X30_VALUE_MEDIAN"];
	d.RVTN_Short_Ch_Vtsat = +d["ET_RVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.RVTN_Long_Ch_Vtlin = +d["ET_RVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.RVTP_Short_Ch_Vtsat = +d["ET_RVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.RVTP_Long_Ch_Vtlin = +d["ET_RVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.LVT_SUM = +d.ET_LVT_Vt_sum_VALUE_MEDIAN;
	d.RVT_SUM = +d.ET_RVT_Vt_Sum_VALUE_MEDIAN;
	d.SGN_TOX = +d.ET_SGN_Tox_inv_VALUE_MEDIAN;
	d.SGP_TOX = +d.ET_SGP_Tox_inv_VALUE_MEDIAN;
	d.SLVTN_Short_Ch_Vtsat = +d["ET_SLVTN_0.21/0.03x7_Vtsat_VALUE_MEDIAN"];
	d.SLVTN_Long_Ch_Vtlin = +d["ET_SLVTN_1/1_Vtlin_VALUE_MEDIAN"];
	d.SLVTP_Short_Ch_Vtsat = +d["ET_SLVTP_0.3/0.03x5_Vtsat_VALUE_MEDIAN"];
	d.SLVTP_Long_Ch_Vtlin = +d["ET_SLVTP_1/1_Vtlin_VALUE_MEDIAN"];
	d.VPNP_BETA = +d.ET_VPNP_Beta_VALUE_MEDIAN;
	return d;
}
