$(function() {
	queue()
		.defer(d3.json,basegrid)
		.defer(d3.json,all_businesses)
		.defer(d3.json,recreation)
		.defer(d3.json,retail)
    
		.await(dataDidLoad);
})

$("#topDifferences .hideTop").hide()
	var projection = d3.geo.mercator().scale(40000).center([-87.4,42])

function dataDidLoad(error,basegrid,business,recreation,retail) {
//make 1 svg for everything
    //draw each layer
  //  drawDots(business["recreation"],mapSvg)
   drawGridKey()
     drawBuildings(basegrid,recreation)
    drawBuildings(basegrid,retail)

}
function drawGridKey(){
    var keySvg = d3.select("#key").append("svg").attr("width",100).attr("height",100)
    var gridNumber = 6  
    var instagramScale = d3.scale.linear().domain([0,gridNumber]).range([.2,1])    
    var colorScale = d3.scale.linear().domain([0,gridNumber]).range(["gray","red"])
    var size = 15
    
    var fakeArray = new Array(gridNumber*gridNumber)
    keySvg.selectAll("rect")
    .data(fakeArray)
    .enter()
    .append("rect")
    .attr("x",function(d,i){return i%gridNumber*size})
    .attr("y",function(d,i){
        return Math.floor(i/gridNumber)*size})
    .attr("width",size-2)
    .attr("height",size-2)
    .attr("fill",function(d,i){
        return colorScale(Math.floor(i/gridNumber))
    })
    .attr("opacity",function(d,i){
      return instagramScale(i%gridNumber)
    })
    
}
function drawBuildings(geoData,business){
    var svg = d3.select("#map").append("svg").attr("width",400).attr("height",400)
    
    //need to generalize projection into global var later
    //d3 geo path uses projections, it is similar to regular paths in line graphs
	var path = d3.geo.path().projection(projection);
    
    var colorScale = d3.scale.linear().domain([0,10]).range(["gray","red"])
    var instagramScale = d3.scale.linear().domain([0,200]).range([.2,1])
    //push data, add path
var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 20])
    .on("zoom", zoomed);
    
    svg.selectAll(".buildings")
		.data(geoData.features)
        .enter()
        .append("path")
		.attr("class","buildings")
		.attr("d",path)
		.style("fill",function(d){
            var sId = d.properties.OBJECTID
            if(business[sId]!=undefined){
                var count = business[sId].length
            }
            else{
                var count = 0
            }            
            return colorScale(count)
		})
	    .style("opacity",function(d){
            return(instagramScale(d.properties.COUNT_medi))
	    })
	    .call(zoom)
        
}
function drawDots(data,svg){
	var projection = d3.geo.mercator().scale(80000).center([-87.8,42])
    
    svg.selectAll(".dots")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","dots")
        .attr("r",2)
        .attr("cx",function(d){
            var lat = parseFloat(d[0])
            var lng = parseFloat(d[1])
            var projectedLng = projection([lng,lat])[0]
            return projectedLng
        })
        .attr("cy",function(d){
            var lat = parseFloat(d[0])
            var lng = parseFloat(d[1])
            var projectedLat = projection([lng,lat])[1]
            return projectedLat
        })
        .attr("fill",function(d){
            return "red"         
        })
	    .style("opacity",1)
}
function zoomed() {
	//console.log("calling zoomed" + d3.event.scale + ", translate: "+ d3.event.translate )
	map=d3.selectAll("path").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
 // 	map.select(".map-item").style("stroke-width", 1.5 / d3.event.scale + "px").style("font-size",1.5 / d3.event.scale + "px");
	var newScaleDistance = Math.round((5/d3.event.scale)* 100) / 100
	//d3.select("#scale .scale-text").text(newScaleDistance+"km")
	window.location.hash = JSON.stringify([d3.event.translate, d3.event.scale])
}
