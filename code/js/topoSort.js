// try to draw process frame by frame

var delay = 2000;//animate delay ms
var topoWid = 1200;
var topoHd = 500;
var topoResultWid = 768;
var topoResultHd = 200;
var svgTopo;
var svgTopoResult;
var defsTopo;
var marker;

var force;
var links = [];
var nodes = {};
var edges_line;
var edges_text;
var circle;
var text;

var inDegree = [];
var topoSorted = [];//sorted node, to draw in result

function initLinks(turn, pointNum, adjList) {
    links = [];
    for (var i = 1; i <= pointNum; i++) {
        let pushFlag = true;
        for (let k = 0; k < topoSorted.length && k < turn; k++) {
            if (topoSorted[k] == i) {
                pushFlag = false;
                break;
            }
        }
        if (pushFlag) {
            for (var j = 0; j < adjList[i].length; j += 2) {
                links.push(
                    { source: String(i), target: String(adjList[i][j]), type: "resolved", rela: String(adjList[i][j + 1]) });
            }
        }
    }
    try {
        links.forEach(function (link) {
            link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
            link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
        });
    } catch (error) {
        alert("chart is empty");
    }
}

function initInDegree(turn, pointNum, adjList) {
    for (var i = 1; i <= pointNum; i++) {
        inDegree[i] = 0;
    }
    for (var i = 1; i <= pointNum; i++) {
        let countFlag = true;
        for (let k = 0; k < topoSorted.length && k < turn; k++) {
            if (topoSorted[k] == i) {
                countFlag = false;
                break;
            }
        }
        if (countFlag) {
            for (var j = 0; j < adjList[i].length; j += 2) {
                inDegree[adjList[i][j]]++;
            }
        }
    }
}

function showForce() {

    defsTopo = svgTopo.append("defs");
    marker = defsTopo.append("marker")
        .attr("id", "resolved")
        .attr("markerUnits", "strokeWidth")//?????????strokeWidth???????????????????????????????????????
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")//??????????????????
        .attr("refX", 32)//????????????
        .attr("refY", -1)
        .attr("markerWidth", 12)//???????????????
        .attr("markerHeight", 12)
        .attr("orient", "auto")//??????????????????????????????auto??????????????????????????? ?????????
        .attr("stroke-width", 2)//????????????
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")//???????????????
        .attr('fill', '#000000');//????????????
    force = d3.layout.force()//layout???json???????????????????????????????????????
        .nodes(d3.values(nodes))//??????????????????
        .links(links)//??????????????????
        .size([topoWid, topoHd])//??????????????????
        .linkDistance(180)//???????????????
        .charge(-1500)//???????????????????????????????????????????????????????????????????????????????????????
        .on("tick", tick)//???????????????????????????????????????????????????
        .start();//????????????

    edges_line = svgTopo.selectAll(".edgepath")
        .data(force.links())
        .enter()
        .append("path")
        .attr({
            'd': function (d) { return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y },
            'id': function (d, i) { return 'edgepath' + i; }
        })
        .style("stroke", function (d) {
            var lineColor;
            //???????????????????????????????????????
            if (inDegree[Number(d.source.name)] == 0) {
                lineColor = "#B43232";
            } else {
                lineColor = "#A254A2";
            }
            return lineColor;
        })
        .style("pointer-events", "none")
        .style("stroke-width", 0.5)//????????????
        .attr("marker-end", "url(#resolved)");//?????????????????????id???????????????

    edges_text = svgTopo.append("g").selectAll(".edgelabel")
        .data(force.links())
        .enter()
        .append("text")
        .style("pointer-events", "none")
        .attr({
            'class': 'edgelabel',
            'id': function (d, i) { return 'edgepath' + i; },
            'dx': 80,
            'dy': 0
        });

    edges_text.append('textPath')
        .attr('xlink:href', function (d, i) { return '#edgepath' + i })
        .style("pointer-events", "none")
        .text(function (d) { return d.rela; });

    circle = svgTopo.append("g").selectAll("circle")
        .data(force.nodes())//????????????force.nodes??????
        .enter().append("circle")
        .style("fill", function (node) {
            return inDegree[Number(node.name)] == 0 ? "#F6E8E9" : "#F9EBF9";
        })
        .style('stroke', function (node) {
            return inDegree[Number(node.name)] == 0 ? "#B43232" : "#A254A2";
        })
        .attr("r", 28)//??????????????????
        .on("click", function (node) {
            //???????????????????????????
            edges_line.style("stroke-width", function (line) {
                console.log(line);
                if (line.source.name == node.name || line.target.name == node.name) {
                    return 4;
                } else {
                    return 0.5;
                }
            });
        })
        .call(force.drag);//??????????????????????????????drag????????????????????????????????????

    //?????????????????????
    circle.append("svg:title")
        .text(function (node) {
            return "indegree : " + String(inDegree[Number(node.name)])
        });

    text = svgTopo.append("g").selectAll("text")
        .data(force.nodes())
        //????????????????????????????????????placeholder???????????????????????????????????????????????????????????????????????????
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")//????????????????????????  
        .style('fill', function (node) {
            var color;//????????????
            var link = links[node.index];
            if (inDegree[Number(node.name)] == 0) {
                color = "#B43232";
            } else {
                color = "#A254A2";
            }
            return color;
        }).attr('x', function (d) {
            if (d.name.length <= 4) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 2)
                    .text(function () { return d.name; });
            }
        });

}

function tick() {

    circle.attr("transform", transform1);
    text.attr("transform", transform2);

    edges_line.attr('d', function (d) {
        var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        return path;
    });

    edges_text.attr('transform', function (d, i) {
        if (d.target.x < d.source.x) {
            bbox = this.getBBox();
            rx = bbox.x + bbox.width / 2;
            ry = bbox.y + bbox.height / 2;
            return 'rotate(180 ' + rx + ' ' + ry + ')';
        }
        else {
            return 'rotate(0)';
        }
    });
}

function transform1(d) {
    return "translate(" + d.x + "," + d.y + ")";
}
function transform2(d) {
    return "translate(" + (d.x) + "," + d.y + ")";
}

function resetTopo(pointNum, adjList) {

    clearTopoSvg();
    initLinks(0, pointNum, adjList);
    initInDegree(0, pointNum, adjList);

}

function TopologicalSort(pointNum, adjList, type) {
    //type==0 :animation type==1 :click else judge if there is a loop
    topoSorted = [];
    let pointStack = [];

    for (let i = 1; i <= pointNum; i++) {//?????????0????????????
        if (!inDegree[i]) {
            pointStack.push(i);
        }
    }

    let count = 0;
    while (pointStack.length > 0) {
        let currentVex = pointStack.pop();
        topoSorted.push(currentVex);
        //console.log(currentVex);      
        count++;
        for (let i = 0; i < adjList[currentVex].length; i += 2) {
            let nextPoint = adjList[currentVex][i];
            if (!(--inDegree[nextPoint]))
                pointStack.push(nextPoint);
        }
    }

    if (count < pointNum) {
        alert("find loops! cannot topological sort");
        return error;
    }
    else {
        if (type == 0) {
            for (let i = 0; i < pointNum; i++) {
                setTimeout(function () {
                    drawFrame(i, pointNum, adjList)
                }, 2000 * i);
                if (i == pointNum - 1)
                    setTimeout(function () {
                        ShowBtn("BtnSt"); ShowBtn("BtnCP"); ShowBtn("BtnTopo");
                    }, delay * i);
            }
        }
        else if (type == 1) {
            document.getElementById("BtnNext").innerHTML = 'start';
            ShowBtn("BtnNext");
            var clickNum = 0;
            document.getElementById("BtnNext")
                .addEventListener("click", function () {
                    drawFrame(clickNum, pointNum, adjList);
                    clickNum++;
                    if (clickNum == 1)
                        document.getElementById("BtnNext").innerHTML = 'next';
                    if (clickNum == pointNum) {
                        HideBtn("BtnNext");
                        ShowBtn("BtnSt"); ShowBtn("BtnCP"); ShowBtn("BtnTopo");
                    }
                });
        }
    }
}

function drawSorted(count) {
    for (let i = 0; i <= count; i++) {
        console.log(topoSorted[i]);
        svgTopoResult.append("circle")
            .attr("cx", String(100 + 70 * i) + "px")
            .attr("cy", String(100) + "px")
            .attr("r", 28)
            .attr("fill", "#F6E8E9")
            .style('stroke', "#B43232");
        svgTopoResult.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style('fill', "#B43232")
            .text(String(topoSorted[i]))
            .attr("x", String(100 + 70 * i) + "px")
            .attr("y", String(100) + "px")
    }
}

function clearTopoSvg() {

    d3.select("#topo").selectAll("svg").remove();
    svgTopo = d3.select("#topo").append("svg").attr("width", topoWid).attr("height", topoHd);//bulid svg of DG
    svgTopoResult = d3.select("#topo").append("svg").attr("width", Math.max(150 + 70 * pointNum, 600)).attr("height", topoResultHd);

}

function showTitle() {
    svgTopoResult.append("text")
        .attr("x", 200)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("stroke-width", 1.5)
        .text("Result of topological Sort :");
}

function drawFrame(turn, pointNum, adjList) {

    clearTopoSvg();
    initLinks(turn, pointNum, adjList);
    initInDegree(turn, pointNum, adjList);
    showTitle();
    showForce();
    drawSorted(turn)
}
