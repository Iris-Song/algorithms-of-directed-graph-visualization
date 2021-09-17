
const upPointNum = 90;
const downPointNum = 2;

function graphInit() {

    //input pointNum
    this.pointNum = Number(document.getElementById("pointNum").value);
    if (this.pointNum < downPointNum || this.pointNum > upPointNum) {
        alert(this.pointNum + " not in the range 2-100");
        return error;
    }

    try {
        this.adjList = getTableContent("edgeInfo");
    } catch (error) {
        alert("edge information is not legal");
        return error;
    }

}

//动态表格建立参考https://www.php.cn/div-tutorial-400653.html
function add() {

    var trObj = document.createElement("tr");
    trObj.id = new Date().getTime();//取系统时间的毫秒数为id值
    trObj.innerHTML = "<td><input class='ipCt' type='number'/></td><td><input class='ipCt' type='number'/></td><td><input class='ipCt' type='number'/></td><td><input type=button value='Del' onclick='del(this)' class='buttDel buttEdg'></td>"
    //将创建好的表格行添加到表格中
    document.getElementById("tb").appendChild(trObj);
    HideBtn("BtnCP");
    HideBtn("BtnTopo");
}
function del(obj) {

    var trId = obj.parentNode.parentNode.id;
    var trObj = document.getElementById(trId);
    document.getElementById("tb").removeChild(trObj);
    HideBtn("BtnCP");
    HideBtn("BtnTopo");
}

//遍历表格方法ref：https://www.php.cn/js-tutorial-402200.html
function getTableContent(id) {

    var table = document.getElementById(id);
    var adjList = {};
    for (var i = 1; i <= pointNum; i++) {
        adjList[i] = [];
    }
    for (var i = 1, rows = table.rows.length; i < rows; i++) {
        var src = table.rows[i].cells[0].getElementsByTagName("INPUT")[0].value;
        var dst = table.rows[i].cells[1].getElementsByTagName("INPUT")[0].value;
        var weight = table.rows[i].cells[2].getElementsByTagName("INPUT")[0].value;
        if (src < 1 || src > pointNum || dst < 1 || dst > pointNum) {
            return error;
        }
        adjList[src].push(dst, weight);
    }
    return adjList;

}
