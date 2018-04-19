$(document).ready(function() {
  //d3.text("RAWDATA/28nmET_PLY_pareto.csv", function(data){});
  $("input[name=pareto_select]:radio").on('change', function(){
    pareto_select = $("input[name=pareto_select]:checked").val();
    week_select = $("#paretoweekoption").val();
    update_pareto();
  });
  $("#paretoweekoption").on('change', function(){
    pareto_select = $("input[name=pareto_select]:checked").val();
    week_select = $("#paretoweekoption").val();
    update_pareto();
  });
  update_pareto();
});

var chart = c3.generate({
    bindto: '#c3-chart',
    data: {
			x: 'EDS_TKOUT_TIME',
			/* url: "\\sas-stargate\DEVICE TEAM\new_site\RAWDATA\28nm_SLIM_45_DAYS.json", */
			url: "RAWDATA/28nmET_SLIM_45_DAYS.csv"
      /* url: "RAWDATA/28nm_SLIM_45_DAYS.json",
			mimeType: 'json' */
    },
		tooltip:{
			format: {
				title: function (x) {return 'WW' + x;},
				value: function(value, ratio, id){return d3.format(".2f")(value);}
			},
			grouped: false
		},
		grid:{
			x:{show:true},
			y:{show:true}
		}
});


// test();

var chart_month = c3.generate({
    bindto: '#c3-chart-month',
    data: {
			x: 'EDS_TKOUT_TIME',
			/* url: "\\sas-stargate\DEVICE TEAM\new_site\RAWDATA\28nm_SLIM_45_DAYS.json", */
			url: "RAWDATA/28nmET_SLIM_45_DAYS_month.csv"
      /* url: "RAWDATA/28nm_SLIM_45_DAYS.json",
			mimeType: 'json' */
    },
		tooltip:{
			format: {
				title: function (x) {return 'MO' + x;},
				value: function(value, ratio, id){return d3.format(".2f")(value);}
			},
			grouped: false
		},
		grid:{
			x:{show:true},
			y:{show:true}
		}
});

d3.text("RAWDATA/28nmET_SLIM_45_DAYS.csv", function(data) {
//d3.text("RAWDATA/28nmET_SLIM_45_DAYS_table.csv", function(data) {
		var rows = d3.csv.parseRows(data);
		var tbl = d3.select("#table-d3")
			.append("table").attr("class", "table table-striped table-bordered table-hover");

		//header
		tbl.append("thead").append("tr")
			.selectAll("th")
			.data(rows[0]).enter().append("th").text(function (d) {return d;});

		// tbl.append("tbody") //Append devices (OLD)
		// 	.selectAll("tr").data(rows.slice(1,2)).enter().append("tr")
		// 	.selectAll("td")
		// 		.data(function(d) { return d; }).enter()
		// 		.append("td")
		// 		.text(function(d) { return d;});
    //
		// tbl.append("tbody")   //Append data, slice from 3 due to space in data, format properly
		// 	.selectAll("tr").data(rows.slice(3)).enter().append("tr")
		// 	.selectAll("td")
		// 		.data(function(d) { return d; }).enter()
		// 		.append("td")
    //     .text(function(d,i){ //format with old PLY/count
    //       if(isNaN(d)) return "";
    //       else if(i%2==0) return d3.format(".0f")(d);
    //       else return d3.format(".2f")(d);
    //     });
    tbl.append("tbody").selectAll("tr").data(rows.slice(1)).enter().append("tr").selectAll("td")
      .data(function(d) { return d; }).enter()
      .append("td")
      .text(function(d) {
        if(isNaN(d)) return "";
        else return d3.format(".2f")(d);
      }); //format without PLY/count
});

d3.text("RAWDATA/28nmET_SLIM_45_DAYS_month.csv", function(data) {
//d3.text("RAWDATA/28nmET_SLIM_45_DAYS_table_month.csv", function(data) {
		var rows = d3.csv.parseRows(data);
		var tbl = d3.select("#table-d3-month")
			.append("table").attr("class", "table table-striped table-bordered table-hover");

		//header
		tbl.append("thead").append("tr")
			.selectAll("th")
			.data(rows[0]).enter().append("th").text(function (d) {return d;});

		// tbl.append("tbody") //Append devices (OLD)
		// 	.selectAll("tr").data(rows.slice(1,2)).enter().append("tr")
		// 	.selectAll("td")
		// 		.data(function(d) { return d; }).enter()
		// 		.append("td")
		// 		.text(function(d) { return d;});
    //
		// tbl.append("tbody") //Append data, slice from 3 due to space in data, format properly
		// 	.selectAll("tr").data(rows.slice(3)).enter().append("tr")
		// 	.selectAll("td")
		// 		.data(function(d) { return d; }).enter()
		// 		.append("td")
    //     .text(function(d,i){ //format with old PLY/count
    //       if(isNaN(d)) return "";
    //       else if(i%2==0) return d3.format(".0f")(d);
    //       else return d3.format(".2f")(d);
    //     }); // .text(function(d) { return d3.format(".2f")(d);});
    tbl.append("tbody").selectAll("tr").data(rows.slice(1)).enter().append("tr").selectAll("td")
      .data(function(d) { return d; }).enter()
      .append("td")
      .text(function(d) {
        if(isNaN(d)) return "";
        else return d3.format(".2f")(d);
      }); //format without PLY/count
});
var margin = {top : 30,right : 80,bottom : 60,left : 50},
  width = 1080 - margin.left - margin.right,
  //width = $("#pareto-chart").innerWidth() - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  barWidth = 1;
  //console.log($("#pareto-chart").innerWidth());
var tooltip_pareto = d3.select("#wrapper")
  .append("div")
  .attr("class", "tooltip_pareto")
  .style("opacity", 0);
var tooltip_paretohold = d3.select("#wrapper")
  .append("div")
  .attr("class", "tooltip_paretohold")
  .style("opacity", 0);
var dataset = null;
var pareto_select = null;
var week_select = null;
var weeklist = null;
var xScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
var yhist = d3.scale.linear();
var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
var yAxis = d3.svg.axis().scale(yhist).orient('left');
var svg = d3.select("#pareto-chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("id", "paretosvg").append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
    .selectAll("text")
      .attr("y",0)
      .attr("x",9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");
svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("class","labe")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Loss");

function update_pareto(){
  d3.csv("RAWDATA/28nmET_PLY_pareto.csv", type, function(error, data){
    if(error){
      console.log(error);
      throw error;
    }
    else{
      var pareto_lot;
      d3.csv("RAWDATA/28nmET_PLY_pareto_lot.csv", function(error, data){
        pareto_lot = data;
      });
      //Adding dynamic weeks to dropdown - e.g. pareto_select = "UXIL"
      //Attempting filter to see if it will pare down weeks by filtered processID so weeks without data won't show up
      weeklist = d3.select('#paretoweekoption').selectAll("option")
        .data(d3.map(data,function(d){ return d.EDS_TKOUT_TIME_QUERY1;}).keys());
        // .filter(function(d){
        //   return d.PROCESS_ID == pareto_select ? d.PROCESS_ID: null;
        // })
      weeklist.text(function(d){return d;})   //update options
        .attr("value", function(d){return d;});
      weeklist.enter().append('option').text(function(d){return d;})  //enter new options
        .attr("value", function(d){return d;});
      weeklist.exit().remove(); //exit unneeded options

      dataset = data; //can help access raw "dataset" from console

      //Axes and scales
      xScale.domain(data.map(function(d) { return d.PROCESSID == pareto_select && d.EDS_TKOUT_TIME_QUERY1 == week_select? d.EDS_ITEM_ID_QUERY1 : null; }));
      yhist.domain([0, d3.max(data, function(d) { return d.PROCESSID == pareto_select && d.EDS_TKOUT_TIME_QUERY1 == week_select? d.BIN_VALUE_QUERY1 : null; })])
        .range([height, 0]);

      //var join_data = svg.selectAll(".bar").data(data.filter(function(d){return pareto_select == d.PROCESSID ? d.EDS_ITEM_ID_QUERY1 : null;}), function(d){return d.PROCESSID.concat(d.EDS_ITEM_ID_QUERY1);});
      var bar = svg.selectAll(".bar").data(data.filter(function(d){return (d.PROCESSID == pareto_select && d.EDS_TKOUT_TIME_QUERY1 == week_select)? d.BIN_VALUE_QUERY1: null;}), function(d){return d.PROCESSID.concat(d.EDS_ITEM_ID_QUERY1);})
      //exit() selection
      //console.log(data.filter(function(d){return (d.PROCESSID == pareto_select && d.EDS_TKOUT_TIME_QUERY1 == week_select)? d.BIN_VALUE_QUERY1: null;}));
      bar.exit().transition().duration(700).ease("cubicInOut").style("opacity",0).remove();

      //update() selection
      bar.transition().duration(700).ease("cubicInOut")
        .attr("x", function(d) { return d.PROCESSID == pareto_select ? xScale(d.EDS_ITEM_ID_QUERY1) : null; })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return d.PROCESSID == pareto_select ? yhist(d.BIN_VALUE_QUERY1):null; })
        .attr("height", function(d) { return d.PROCESSID == pareto_select ? height - yhist(d.BIN_VALUE_QUERY1):null; });
        // .style("fill", function (d) {	return color20(d.PROCESSID);	});

      //enter() selection
      bar.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return d.PROCESSID == pareto_select ? xScale(d.EDS_ITEM_ID_QUERY1) : null; })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return d.PROCESSID == pareto_select ? yhist(d.BIN_VALUE_QUERY1):null; })
        .attr("height", function(d) { return d.PROCESSID == pareto_select ? height - yhist(d.BIN_VALUE_QUERY1):null; })
        .style("opacity", 0.9)
        .on("mouseover", function(d) {
          tooltip_pareto.style("visibility", "visible");
          d3.select(this).transition()
            .duration(600).style("opacity", 1)
            .style("stroke", "black");
          tooltip_pareto.transition()
            .duration(600).style("opacity", .8)
            .style("background", "steelblue");
          tooltip_pareto.html(d.EDS_ITEM_ID_QUERY1)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 10) + "px");})
        .on("mouseout", function(d){
          d3.select(this).transition()
            .delay(200).duration(600).style("opacity", 0.9)
            .style("stroke", "white");
          tooltip_pareto.transition()
            .delay(200).duration(600)
            .style("opacity", 0)
            .style("pointer-events", 'none');

            // d3.select(this).transition()
            //   .delay(200).duration(600)
            //   .style("opacity", .65).style("stroke", "white");
            // tooltip_pareto.transition()
            //   .delay(200).duration(600)
            //   .style("opacity", 0)
            //   .style("pointer-events", 'none');})

        });
      yAxis = d3.svg.axis().scale(yhist).orient('left');

      svg.selectAll(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis).selectAll("text")
          .attr("y",0)
          .attr("x",-5)
          .attr("dy", ".35em")
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "end");
      svg.selectAll(".y.axis")
        .call(yAxis).append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .selectAll(".label").text("Loss");
    }
  });
}
function type(d){
  d.EDS_TKOUT_TIME_QUERY1 = +d.EDS_TKOUT_TIME_QUERY1;
  d.BIN_VALUE_QUERY1 = +d.BIN_VALUE_QUERY1;
  return d;
}

function test(){
  $.ajax({
    type: "GET",
    url: "RAWDATA/28nmET_SLIM_45_DAYS.json",
    contentType: "application/json",
    dataType: "json",
    success: function(response) {
        alert()
    }
  })
};
