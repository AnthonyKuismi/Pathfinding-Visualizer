var currentAlg = document.getElementById("algorithms").value;
const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');
var speed = 10;
const tileSize = 20;
const border = 2;
const tileWidth = Math.floor(canvas.width/tileSize);
const tileHeight = Math.floor(canvas.height/tileSize);

var currentNodex = 0;
var currentNodeY = 0;
var smallestDist = 999;
var currentDist = 0;


var wallGrid;
var visitedGrid;
var distanceGrid;

//console.table(wallGrid)

var startX = 0;
var startY = 0;

var endX = tileWidth-1;
var endY = tileHeight-1;

var selected = "";

var running = false;
refresh();
updateBoard();

document.getElementById("game").addEventListener("click",click);

function updateBoard(){
    clearScreen();
    drawNodes();
    if(running){
        if(currentAlg == "dijkstra"){
            dijkstra();
        }
    }
    setTimeout(updateBoard, 1000/speed);
}

function clearScreen(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "white";
    for(let i = 0; i < tileWidth; i++){
        for(let j = 0; j < tileHeight; j++){
            ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
        }
    }
}

function doFunction(){
    currentAlg = document.getElementById("algorithms").value
    running = true;
}

function drawNodes(){
    
    
    ctx.fillStyle = "green";
    ctx.fillRect(endX*tileSize + border/2,endY*tileSize + border/2,tileSize-border,tileSize-border);
    for(let i = 0; i < tileWidth; i++){
        for(let j = 0; j < tileHeight; j++){
            if(wallGrid[i][j] == 1){
                ctx.fillStyle = "black"
                ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
            }
            if(currentAlg == "dijkstra" && distanceGrid[i][j] !=999){
                ctx.fillStyle = "blue"
                ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
            }
            if(currentAlg == "dijkstra" && visitedGrid[i][j] == 1){
                ctx.fillStyle = "rgb(100,100,100)";
                ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
            }
            if(currentAlg == "dijkstra" && currentNodeY == j && currentNodex == i){
                ctx.fillStyle = "yellow"
                ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
            }

        }
    }
    ctx.fillStyle = "red";
    ctx.fillRect(startX*tileSize + border/2,startY*tileSize + border/2,tileSize-border,tileSize-border);
}

function click(event){
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const boxX = Math.floor(x/tileSize);
    const boxY = Math.floor(y/tileSize);
    
    if(Math.abs(startX*tileSize-x) < tileSize && Math.abs(startY*tileSize-y) < tileSize && selected == ""){
        alert("Selected Start");
        selected = "start";
    }else if(Math.abs(endX*tileSize-x) < tileSize && Math.abs(endY*tileSize-y) < tileSize && selected == ""){
        alert("Selected End");
        selected = "end";
    }else if(selected == "start" && !(boxX == endX && boxY == endY)){
        startX = boxX;
        startY = boxY;
        refresh();
        currentNodex = boxX;
        currentNodeY = boxY;
        selected = "";
    }else if(selected == "end" && !(boxX == startX && boxY == startY)){
        endX = boxX;
        endY = boxY;
        selected = "";
    }else if((boxX == startX && boxY == startY)||(boxX == endX && boxY == endY)){
        alert("No overlapping start and finish");
    }else if(wallGrid[boxX][boxY] == 0){
        wallGrid[boxX][boxY] = 1;
    }else if(wallGrid[boxX][boxY] == 1){
        wallGrid[boxX][boxY] = 0;
    }
    
}

function refresh(){
    wallGrid = [];
    distanceGrid = wallGrid.slice();
    visitedGrid = wallGrid.slice();
    currentDist = 0;
    currentNodex = startX;
    currentNodey = startY;
    for(let i = 0; i < tileWidth; i++){
        var temp = [];
        for(let j = 0; j < tileHeight; j++){
            temp.push(0);
        }
        wallGrid.push(temp.slice(0));
        distanceGrid.push(temp.slice(0));
        visitedGrid.push(temp.slice(0));
    }
    
    for(let i = 0; i < tileWidth; i++){
        for(let j = 0; j < tileHeight; j++){
            if(!(i==startX && j==startY)){
                distanceGrid[i][j] = 999;
            }
        }
    }
    running = false;
}

function dijkstra(){
    //unvisited = 0
    //visited = 1

    //calculate neighbors and distances. If distance is shorter than current distance set it to new

    //up
    if(currentNodeY > 0){
        if(distanceGrid[currentNodex][currentNodeY-1] > currentDist + 1 && wallGrid[currentNodex][currentNodeY-1] == 0){
            distanceGrid[currentNodex][currentNodeY-1] = currentDist + 1;
            console.log("up");
        }
    }
    //down
    if(currentNodeY < tileHeight-1){
        if(distanceGrid[currentNodex][currentNodeY+1] > currentDist + 1 && wallGrid[currentNodex][currentNodeY+1] == 0){
            distanceGrid[currentNodex][currentNodeY+1] = currentDist + 1;
            console.log("down");
        }
    }
    //right
    if(currentNodex < tileWidth-1){
        console.log("distance:"+distanceGrid[currentNodex+1][currentNodeY]);
        console.log("x:" + currentNodex);
        console.log("y:" + currentNodeY);
        console.log("cur" + currentDist);
        if(distanceGrid[currentNodex+1][currentNodeY] > currentDist + 1 && wallGrid[currentNodex+1][currentNodeY] == 0){
            distanceGrid[currentNodex+1][currentNodeY] = currentDist + 1;
            console.log("right");
        }
    }
    //left
    if(currentNodex > 0){
        if(distanceGrid[currentNodex-1][currentNodeY] > currentDist + 1 && wallGrid[currentNodex-1][currentNodeY] == 0){
            distanceGrid[currentNodex-1][currentNodeY] = currentDist + 1;
            console.log("left");
        }
    }
    console.table(visitedGrid);
    visitedGrid[currentNodex][currentNodeY] = 1;
    //find next node
    smallestDist = 999;
    for(let i = 0; i < tileWidth; i++){
        for(let j = 0; j < tileHeight; j++){
            if(distanceGrid[i][j] < smallestDist && visitedGrid[i][j] == 0){
                smallestDist = distanceGrid[i][j];
                currentNodex = i;
                currentNodeY = j;
                currentDist = smallestDist;
            }
        }
    }
    //check if done
    //add final path
}