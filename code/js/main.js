document.write(" <script language=\"javascript\" src=\"showList.js\" > <\/script>");
document.write(" <script language=\"javascript\" src=\"init.js\" > <\/script>");
document.write(" <script language=\"javascript\" src=\"topoSort.js\" > <\/script>");

function ShowBtn(Btn) {
    document.getElementById(String(Btn)).style.display = "inline";
}
function HideBtn(Btn) {
    document.getElementById(String(Btn)).style.display = "none";
}

function moveSvg(divName) {
    d3.select("#" + divName).selectAll("svg").remove();
}

function graph() {

    try {
        graphInit();
        resetAdjList();
        moveSvg("topo")
        moveSvg("CP")
    } catch (error) {
        HideBtn("BtnTopo");
        HideBtn("BtnCP");
        return;
    }
    try {
        showList(pointNum, adjList);
    } catch (error) {
        HideBtn("BtnTopo");
        HideBtn("BtnCP");
        alert("showList err");
        return;
    }
    ShowBtn("BtnTopo");
    ShowBtn("BtnCP");
}

function topoDisplay(type) {

    HideBtn("BtnSt");
    HideBtn("BtnCP");
    HideBtn("BtnTopo");
    moveSvg("topo")
    moveSvg("CP")
    try {
        resetTopo(pointNum, adjList);
        TopologicalSort(pointNum, adjList, type);
    } catch (error) {
        ShowBtn("BtnSt");
        return;
    }

}

function CrtPthDisplay() {

    HideBtn("BtnSt");
    HideBtn("BtnCP");
    HideBtn("BtnTopo");
    moveSvg("topo")
    moveSvg("CP")
    try {
        CriticalPath(pointNum, adjList);
    } catch (error) {
        ShowBtn("BtnSt");
        alert("CP err");
        return;
    }
    ShowBtn("BtnTopo");
    ShowBtn("BtnSt");

}

