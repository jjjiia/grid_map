//TODO: make color key by category
//combine category jsons using square id as key
//change code to color square using most prominent business for each square
//make side bar chart to show distribution of businesses
//start adding hour data
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
var colorDictionary = {
    "beauty":"#2fa8c6",
    "health":"#6ac5dc",
    "recreation":"#acdfec",
    "culture":"#891a1a",
    "education":"#ce2727",
    "public":"#e26565",
    "religious":"#efa959",
    "office":"#4d673c",
    "finance":"#749a5b",
    "service":"#9ebb8b",
    "retail":"#c9d9bf",
    "other":"#939598",
    "food":"#e7520d",
    "restaurant_and_cafe":"#f58551",
    "entertainment":"#cdd61f",
    "nightclub":"#e1e85e"
}
function dataDidLoad(error,basegrid,businesses,businessGrid) {
//make 1 svg for everything
    //draw each layer
  //  drawDots(business["recreation"],mapSvg)
    drawMain(basegrid,businessGrid)
    drawCatKey()
}
function drawCatKey(){
    var colorArray = []
    for(var color in colorDictionary){
        colorArray.push([color,colorDictionary[color]])
    }
    var keySvg = d3.select("#key").append("svg").attr("width",200).attr("height",300)
    var squareSize = 20
    keySvg.selectAll("rect")
    .data(colorArray)
    .enter()
    .append("rect")
    .attr("x",function(d,i){return 0 })
    .attr("y",function(d,i){return i*squareSize})
    .attr("width",squareSize-2)
    .attr("height",squareSize-2)
    .attr("fill",function(d,i){return d[1];})
   // .on("mouseover",function(d){
   //     console.log(d[0])
   //     d3.selectAll("path").attr("opacity",0)
   //     d3.selectAll("#main ."+d[0]).attr("opacity",.1)
   // })
    
    keySvg.selectAll("text")
    .data(colorArray)
    .enter()
    .append("text")
    .attr("class",function(d,i){return d[0]})
    .attr("x",function(d,i){return squareSize+2})
    .attr("y",function(d,i){return i*squareSize+squareSize/2})
    .text(function(d,i){return d[0];})
    .attr("fill",function(d,i){return d[1];})
    
}
function sortByValue(dictionary){
    var unsorted = []
    for(var key in dictionary){
        if(key != "ids"){
            unsorted.push({"key":key,"value":dictionary[key]})            
        }
    }
    var sorted = unsorted.sort(function(a,b){
        return a.value-b.value
    })
    return sorted
}
function drawMain(basegrid,businessGrid){
    var svg = d3.select("#main").append("svg").attr("width",1200).attr("height",1200)
    
    //need to generalize projection into global var later
    //d3 geo path uses projections, it is similar to regular paths in line graphs
    var projection = d3.geo.mercator().scale(scale*mainToGridScale).center(center).translate([600, 600])
	
    var path = d3.geo.path().projection(projection);
    
    var colorScale = d3.scale.linear().domain([0,10]).range(["gray","red"])
    var instagramScale = d3.scale.linear().domain([0,200]).range([.2,1])
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 20])
        .on("zoom", zoomed);
 
    svg.selectAll(".main")
		.data(basegrid.features)
        .enter()
        .append("path")
		.attr("d",path)
		.style("fill",function(d){
            var pid = d.properties.OBJECTID
            if(businessGrid[pid]!=undefined){
                var values = businessGrid[pid]
                var dominant = sortByValue(values)[sortByValue(values).length-1]
                return colorDictionary[dominant.key]
            }else{
                return "#aaa"
            }
		})
	    .style("opacity",function(d){
            return 1
            return(instagramScale(d.properties.COUNT_medi))
	    })
        .attr("class",function(d){
            var pid = d.properties.OBJECTID
            if(businessGrid[pid]!=undefined){
                var values = businessGrid[pid]
                var dominant = sortByValue(values)[sortByValue(values).length-1]
                return dominant.key
            }else{
                return "noBusinesses"
            }
		})
	    .style("opacity",function(d){
            return 1
            return(instagramScale(d.properties.COUNT_medi))
	    })
        .call(zoom)
        .on("click",function(d){
            d3.selectAll("path").attr("stroke","none")
            
            d3.select(this).attr("stroke","black")
            var pid = d.properties.OBJECTID
            var instagramCount = d.properties.COUNT_medi
            if(businessGrid[pid]!=undefined){
                var values = businessGrid[pid]
                d3.select("#bar").html("")
                
                drawBarGraph(values,pid,instagramCount)
            }else{
                d3.select("#bar").html("There are "+instagramCount+" instagrams, but no businesses in the area.")
            }
        })
}
function drawBarGraph(data,pid,instagramCount){
    var array = sortByValue(data)
//    array.push({"key":"instagramCount","value":instagramCount})
    var barWidth = 30
    var height = 600
    var barGraph = d3.select("#bar").append("svg").attr("width",700).attr("height",600)
    var heightScale = d3.scale.linear().domain([0,70]).range([20,height-20])
        
    barGraph.selectAll("rect")
    .data(array)
    .enter()
    .append("rect")
    .attr("y",function(d,i){return i*barWidth})
    .attr("x",function(d,i){return 0})
    .attr("width",function(d,i){return heightScale(d.value)})
    .attr("height",function(d,i){return barWidth-5})
    .attr("fill",function(d,i){
        return colorDictionary[d.key]
    })
    
    barGraph.selectAll("text")
    .data(array)
    .enter()
    .append("text")
    .text(function(d){return d.key+":"+d.value})
    .attr("y",function(d,i){return i*barWidth+barWidth/2})
    .attr("x",function(d,i){return heightScale(d.value)+2})
    .attr("fill",function(d,i){
        return colorDictionary[d.key]
    })
    
    barGraph.append("text").text("this is grid id "+pid+" with "+instagramCount +" instagrams").attr("y",height-10).attr("x",10)
    
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
function zoomed() {
	//console.log("calling zoomed" + d3.event.scale + ", translate: "+ d3.event.translate )
	map=d3.selectAll("path").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  	map.select(".map-item").style("stroke-width", 1.5 / d3.event.scale + "px").style("font-size",1.5 / d3.event.scale + "px");
	var newScaleDistance = Math.round((5/d3.event.scale)* 100) / 100
	//d3.select("#scale .scale-text").text(newScaleDistance+"km")
	//window.location.hash = JSON.stringify([d3.event.translate, d3.event.scale])
}
