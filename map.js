$(function() {
	queue()
		.defer(d3.json,basegrid)
		.defer(d3.json,all_businesses)
		.defer(d3.json,gridData)
    
		.await(dataDidLoad);
})

$("#topDifferences .hideTop").hide()
var scale = 100000
var center = [-87.66,41.9]
var mainToGridScale = .4
function dataDidLoad(error,basegrid,businesses,businessGrid) {
//make 1 svg for everything
    //draw each layer
  //  drawDots(business["recreation"],mapSvg)
   drawGridKey()
    drawMain(basegrid)
    for(var i in businessGrid){
        drawBuildings(basegrid,businessGrid[i],i)
    }

}
function drawCatKey(){
    
}
function drawMain(basegrid){
    var svg = d3.select("#main").append("svg").attr("width",1200).attr("height",1200)
    
    //need to generalize projection into global var later
    //d3 geo path uses projections, it is similar to regular paths in line graphs
    var projection = d3.geo.mercator().scale(scale*mainToGridScale).center(center).translate([600, 600])
	
    var path = d3.geo.path().projection(projection);
    
    var colorScale = d3.scale.linear().domain([0,10]).range(["gray","red"])
    var instagramScale = d3.scale.linear().domain([0,200]).range([.2,1])
    //push data, add path
    svg.selectAll(".main")
		.data(basegrid.features)
        .enter()
        .append("path")
		.attr("d",path)
		.style("fill",function(d){
            return "#000"
		})
	    .style("opacity",function(d){
            return(instagramScale(d.properties.COUNT_medi))
	    })
  //  var zoom = d3.behavior.zoom()
  //      .translate([0, 0])
  //      .scale(1)
  //      .scaleExtent([1, 20])
  //      .on("zoom", zoomed);
    var drag = d3.behavior.drag()
  .on('drag',dragged)
             
    
    var rect = svg.append("rect")
        .attr("class","highlight")
        .attr("x",function(){
            var lat = parseFloat(center[1])
            var lng = parseFloat(center[0])
            var projectedLng = projection([lng,lat])[0]-100*mainToGridScale
            return projectedLng
        })
        .attr("y",function(){
            var lat = parseFloat(center[1])
            var lng = parseFloat(center[0])
            var projectedLat = projection([lng,lat])[1]-100*mainToGridScale
            return projectedLat
        })
        .attr("width",200*mainToGridScale)
        .attr("height",200*mainToGridScale)
        .attr("fill","none")
        .attr("stroke","black")
 //       .attr("opacity",.4)
     //   .call(drag)
        
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
function drawBuildings(geoData,business,label){
    var svg = d3.select("#map").append("svg").attr("width",200).attr("height",200)
    var projection = d3.geo.mercator().scale(scale).center(center).translate([100, 100])
    //need to generalize projection into global var later
    //d3 geo path uses projections, it is similar to regular paths in line graphs
	var path = d3.geo.path().projection(projection);
    
    var colorScale = d3.scale.linear().domain([0,10]).range(["gray","red"])
    var instagramScale = d3.scale.linear().domain([0,200]).range([.2,1])
    //push data, add path
    //var zoom = d3.behavior.zoom()
    //    .translate([0, 0])
    //    .scale(1)
    //    .scaleExtent([1, 20])
    //    .on("zoom", zoomed);
    
    svg.selectAll(".buildings")
		.data(geoData.features)
        .enter()
        .append("path")
		.attr("class","buildings")
		.attr("d",path)
		.style("fill",function(d){
            //return "black"
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
            //return 1
            return(instagramScale(d.properties.COUNT_medi))
	    })
        .on("mouseover",function(d){
            var sId = d.properties.OBJECTID
            
            if(business[sId]!=undefined){
                var count = business[sId].length
            }
            else{
                var count = 0
            }       
            var text = d.properties.COUNT_medi +" instagrams, and "+ count +" "+label+" businesses"
            d3.select("#caption").html(text)
        })
	    //.call(zoom)
        svg.append("rect").attr("x",0).attr("y",0).attr("fill","#fff").attr("width",200).attr("height",30)
        
        svg.append("text").text(label).attr("x",20).attr("y",20)
        
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
function dragged() {
    console.log("dragged")
    console.log(d3.event.dx)
    var translate = [d3.event.dx,d3.event.dy]
    var scaledTranslate = [d3.event.dx/mainToGridScale,d3.event.dy/mainToGridScale]
    
//	//console.log("calling zoomed" + d3.event.scale + ", translate: "+ d3.event.translate )
	d3.selectAll(".highlight").attr("transform", "translate(" + translate + ")");
    
	map=d3.selectAll(".buildings").attr("transform", "translate(" + scaledTranslate + ")");
//    var invertScale = 1/d3.event.scale
//    var invertTranslate = [d3.event.translate[0]*-1,d3.event.translate[1]*-1]
//    console.log(d3.event.translate)
//    console.log(invertTranslate)
//	map=d3.selectAll(".highlight").attr("transform", "translate(" + invertTranslate + ")scale(" + invertScale + ")");
// // 	map.select(".map-item").style("stroke-width", 1.5 / d3.event.scale + "px").style("font-size",1.5 / d3.event.scale + "px");
	//var newScaleDistance = Math.round((5/d3.event.scale)* 100) / 100
	//d3.select("#scale .scale-text").text(newScaleDistance+"km")
	//window.location.hash = JSON.stringify([d3.event.translate, d3.event.scale])
}
