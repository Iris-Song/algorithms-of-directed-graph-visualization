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
        .attr("markerUnits", "strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")//坐标系的区域
        .attr("refX", 32)//箭头坐标
        .attr("refY", -1)
        .attr("markerWidth", 12)//标识的大小
        .attr("markerHeight", 12)
        .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
        .attr("stroke-width", 2)//箭头宽度
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")//箭头的路径
        .attr('fill', '#000000');//箭头颜色
    force = d3.layout.force()//layout将json格式转化为力学图可用的格式
        .nodes(d3.values(nodes))//设定节点数组
        .links(links)//设定连线数组
        .size([topoWid, topoHd])//作用域的大小
        .linkDistance(180)//连接线长度
        .charge(-1500)//顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
        .on("tick", tick)//指时间间隔，隔一段时间刷新一次画面
        .start();//开始转换

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
            //根据关系的不同设置线条颜色
            if (inDegree[Number(d.source.name)] == 0) {
                lineColor = "#B43232";
            } else {
                lineColor = "#A254A2";
            }
            return lineColor;
        })
        .style("pointer-events", "none")
        .style("stroke-width", 0.5)//线条粗细
        .attr("marker-end", "url(#resolved)");//根据箭头标记的id号标记箭头

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
        .data(force.nodes())//表示使用force.nodes数据
        .enter().append("circle")
        .style("fill", function (node) {
            return inDegree[Number(node.name)] == 0 ? "#F6E8E9" : "#F9EBF9";
        })
        .style('stroke', function (node) {
            return inDegree[Number(node.name)] == 0 ? "#B43232" : "#A254A2";
        })
        .attr("r", 28)//设置圆圈半径
        .on("click", function (node) {
            //单击时让连接线加粗
            edges_line.style("stroke-width", function (line) {
                console.log(line);
                if (line.source.name == node.name || line.target.name == node.name) {
                    return 4;
                } else {
                    return 0.5;
                }
            });
        })
        .call(force.drag);//将当前选中的元素传到drag函数中，使顶点可以被拖动

    //圆圈的提示文字
    circle.append("svg:title")
        .text(function (node) {
            return "indegree : " + String(inDegree[Number(node.name)])
        });

    text = svgTopo.append("g").selectAll("text")
        .data(force.nodes())
        //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")//在圆圈中加上数据  
        .style('fill', function (node) {
            var color;//文字颜色
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

    for (let i = 1; i <= pointNum; i++) {//入度为0的点入栈
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
