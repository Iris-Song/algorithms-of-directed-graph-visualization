var CPWid = 1000;
var CPHd = 500;
var CPTiltleWid = 768;
var CPTiltleHd = 40;
var svgCP;
var svgCPTiltle;
var defsCP;
var marker;

var links = [];
var nodes = {};
var edges_line;
var edges_text;
var circle;
var text;

var ve = [];
var vl = [];
var criticalNode = [];
var inDegree = [];
var topoSorted = [];


function InitVar(PointNum, adjList) {

    for (let i = 1; i <= PointNum; i++) {
        inDegree[i] = 0;
        ve[i] = 0;
        vl[i] = 0;
        criticalNode[i] = 0;
    }

    links = [];
    for (let i = 1; i <= PointNum; i++) {
        for (var j = 0; j < adjList[i].length; j += 2) {
            inDegree[adjList[i][j]]++;
            links.push(
                { source: String(i), target: String(adjList[i][j]), type: "resolved", rela: String(adjList[i][j + 1]) });
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

    //topoSort & calc ve
    let pointStack = [];
    topoSorted = [];
    for (let i = 1; i <= pointNum; i++) {
        if (!inDegree[i])
            pointStack.push(i);
    }
    let count = 0;         //number of already sorted vex
    while (pointStack.length > 0) {
        let currentVex = pointStack.pop();
        topoSorted.push(currentVex);
        //console.log(currentVex);      
        count++;

        for (let i = 0; i < adjList[currentVex].length; i += 2) {

            let nextPoint = Number(adjList[currentVex][i]);
            let weight = Number(adjList[currentVex][i + 1]);
            ve[nextPoint] = Math.max(ve[currentVex] + weight, ve[nextPoint]);
            console.log("ve "+nextPoint+" "+ve[nextPoint]);  
            if (!(--inDegree[nextPoint]))
                pointStack.push(nextPoint);
        }

    }
    if (count < pointNum) {
        alert("find loops! cannot topological sort");
        return error;
    }

    //calculate vl
    for (let i = 1; i <= pointNum; i++) {   //vex latest time
        vl[i] = ve[topoSorted[pointNum - 1]];
    }
    while (topoSorted.length > 0) {
        nowPoint = topoSorted.pop();
        for (let j = 0; j < adjList[nowPoint].length; j += 2) {
            vl[nowPoint] = Math.min(vl[nowPoint], Number(vl[adjList[nowPoint][j]]) - Number(adjList[nowPoint][j + 1]));
            console.log("vl " + nowPoint + " " + vl[nowPoint]);
        }
    }

    //find critical vertex on path
    for (let i = 1; i <= pointNum; i++) {
        for (let j = 0; j < adjList[i].length; j += 2) {
            let nextPoint = adjList[i][j];
            let weight = adjList[i][j + 1];
            if (ve[i] == vl[nextPoint] - weight) {
                criticalNode[i] = criticalNode[nextPoint] = 1;
            }
        }
    }
    /* console.log("ve");
    for (let i = 1; i <= pointNum; i++) {
        console.log(ve[i]);
    }
    console.log("vl");
    for (let i = 1; i <= pointNum; i++) {
        console.log(vl[i]);
    } */
}

function clearCPSvg() {

    d3.select("#CP").selectAll("svg").remove();
    svgCPTiltle = d3.select("#CP").append("svg").attr("width", CPTiltleWid).attr("height", CPTiltleHd);
    svgCP = d3.select("#CP").append("svg").attr("width", CPWid).attr("height", CPHd);//bulid svg of DG
}

function CriticalPath(PointNum, adjList) {

    try {
        InitVar(PointNum, adjList);
    } catch (error) {
        return;
    }
    clearCPSvg();
    showCPTitle();
    showCPForce();
}

function showCPTitle() {
    svgCPTiltle.append("text")
        .attr("x", 200)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("stroke-width", 1.5)
        .text("Result of Critical path :");
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

function showCPForce() {

    defsCP = svgCP.append("defs");
    //箭头
    marker = defsCP.append("marker")
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
        .size([CPWid, CPHd])//作用域的大小
        .linkDistance(180)//连接线长度
        .charge(-1500)//顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
        .on("tick", tick)//指时间间隔，隔一段时间刷新一次画面
        .start();//开始转换

    edges_line = svgCP.selectAll(".edgepath")
        .data(force.links())
        .enter()
        .append("path")
        .attr({
            'd': function (d) { return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y },
            'id': function (d, i) { return 'edgepath' + i; }
        })
        .style("stroke", function (d) {
            return criticalNode[Number(d.source.name)] == 1 && criticalNode[Number(d.target.name)] == 1 ?
                "#B43232" : "#A254A2";
        })
        .style("stroke-width", 0.5)
        .attr("marker-end", "url(#resolved)");//根据箭头标记的id号标记箭头

    edges_text = svgCP.append("g").selectAll(".edgelabel")
        .data(force.links())
        .enter()
        .append("text")
        .attr("class", "linetext")
        .on('mouseover', function (d) {
            return "hello";
        })
        .attr({
            'class': 'edgelabel',
            'id': function (d, i) { return 'edgepath' + i; },
        });

    edges_text.append('textPath')
        .attr('xlink:href', function (d, i) { return '#edgepath' + i })
        .style("text-anchor", "middle")
        .attr("startOffset", "45%")
        .text(function (d) {
            return d.rela;
        })

    circle = svgCP.append("g").selectAll("circle")
        .data(force.nodes())//表示使用force.nodes数据
        .enter().append("circle")
        .style("fill", function (node) {
            return criticalNode[Number(node.name)] == 1 ? "#F6E8E9" : "#F9EBF9";
        })
        .style('stroke', function (node) {
            return criticalNode[Number(node.name)] == 1 ? "#B43232" : "#A254A2";
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
            return "ve:" + String(ve[Number(node.name)]) + " vl:" + String(vl[Number(node.name)])
        });

    //线的提示文字
    edges_line.append("svg:title")
        .text(function (d) {
            return "w:" + d.rela + " E:" + ve[d.source.name] +
                " L:" + String(Number(vl[d.target.name] - d.rela)) + " L-E:" + String(Number(ve[d.target.name] - vl[d.source.name] - d.rela));
        });

    text = svgCP.append("g").selectAll("text")
        .data(force.nodes())
        //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")//在圆圈中加上数据  
        .style('fill', function (node) {
            return criticalNode[Number(node.name)] == 1 ? "#B43232" : "#A254A2";
        }).attr('x', function (d) {
            if (d.name.length <= 4) {
                d3.select(this).append('tspan')
                    .attr('x', 0)
                    .attr('y', 2)
                    .text(function () { return d.name; });
            }
        });

}
