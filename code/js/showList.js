var redis = 18;
var rowDis = 40;
var colDis = 40;
var height = 100000;   //画布的高度
var width = 100000;      //画布的宽度
var recWid = 40;
var recHt = 30;
var svgAdj;

//箭头 ref:https://www.cnblogs.com/xcxcxcxc/p/5900444.html
//添加defs标签
var defsAdj //= svg.append("defs");
//添加marker标签及其属性
var arrowMarker
//show adjList
function showList(pointNum, adjList) {
    svgAdj.append('text')
        .attr("x", String(100) + "px")
        .attr("y", String(15) + "px")
        .attr("front-size", 40)
        .style("fill", "black")
        .text('adjacency list:');
    for (var i = 1; i <= pointNum; i++) {
        svgAdj.append("circle")//circle--represent src
            .attr("cx", String(100) + "px")
            .attr("cy", String(i * rowDis + 30) + "px")
            .attr("r", String(redis) + "px")
            .attr("fill", "gray")
            .attr("stroke", "black");
        svgAdj.append("text")//text on circle
            .attr("x", String(100) + "px")
            .attr("y", String(i * rowDis + 35) + "px")
            .attr("front-size", 30)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .text(String(i));
        for (var j = 0; j < adjList[i].length; j += 2) {
            if (j == 0) {
                svgAdj.append("line")  //stright arrow
                    .attr("x1", String(100 + redis) + "px")
                    .attr("y1", String(i * rowDis + 30) + "px")
                    .attr("x2", String(95 + colDis) + "px")
                    .attr("y2", String(i * rowDis + 30) + "px")
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrow)");
            }
            svgAdj.append("text")//text on arrow
                .attr("x", String(100 + redis + j / 2 * colDis + recWid * j / 2 + 5 * (!j)) + "px")
                .attr("y", String(i * rowDis - 3 + 30) + "px")
                .attr("front-size", 20)
                .attr("text-anchor", "middle")
                .style("fill", "black")
                .text(String(adjList[i][j + 1]));
            svgAdj.append("rect")//rect,represent dst
                .attr("x", String(100 + (j + 1) * colDis) + "px")
                .attr("y", String(i * rowDis - redis * 0.8 + 30) + "px")
                .attr("width", String(recWid) + "px")
                .attr("height", String(recHt) + "px")
                .attr("fill", "gray")
                .attr("stroke", "black");
            svgAdj.append("text")//text on rect
                .attr("x", 100 + (j + 1) * colDis + recWid * 0.4)
                .attr("y", String(i * rowDis - redis * 0.8 + recHt * 0.7 + 30) + "px")
                .attr("front-size", 30)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .text(String(adjList[i][j]));
            if (j != adjList[i].length - 2) {
                svgAdj.append("line")  //stright arrow
                    .attr("x1", String(100 + recWid * (j * 0.5 + 1) + (j * 0.5 + 1) * colDis) + "px")
                    .attr("y1", String(i * rowDis + 30) + "px")
                    .attr("x2", String(95 + recWid * (j * 0.5 + 1) + (j * 0.5 + 2) * colDis) + "px")
                    .attr("y2", String(i * rowDis + 30) + "px")
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)
                    .attr("marker-end", "url(#arrow)");
            }
        }

    }
}

function resetAdjList() {
    d3.select("#rside").selectAll("svg").remove();
    svgAdj = d3.select("#rside").append("svg").attr("width", 100 * (pointNum + 1)).attr("height", 42 * (pointNum + 1));//bulid
    defsAdj = svgAdj.append("defs");
    arrowMarker = defsAdj.append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M2,2 L10,6 L2,10 L2,2")//箭头的路径
        .attr('fill', 'black');//箭头颜色 
}