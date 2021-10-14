
var currentAlg = document.getElementById("algorithms").value;
const canvas = document.getElementById("game");
const ctx = canvas.getContext('2d');
var speed = document.getElementById("speedslider").value;
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
var finalPath;

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
    speed = document.getElementById("speedslider").value;
    document.getElementById("speedlabel").innerHTML = "Speed: " + speed;
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
    currentAlg = document.getElementById("algorithms").value;
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
                const r = (currentDist -distanceGrid[i][j])/currentDist * 256;
                const g = (currentDist - distanceGrid[i][j])/currentDist * 256;
                ctx.fillStyle = "rgb("+r+","+g+",100)";
                ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
            }
            if(currentAlg == "dijkstra" && currentNodeY == j && currentNodex == i){
                ctx.fillStyle = "yellow"
                ctx.fillRect(i*tileSize + border/2,j*tileSize + border/2,tileSize-border,tileSize-border);
            }
            if(currentAlg == "dijkstra" && !running&& finalPath[i][j] == 1){
                ctx.fillStyle = "purple"
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
    
    if(boxX == startX && boxY == startY && selected == ""&& !running){
        console.log("x" + boxX);
        console.log("y" + boxY);
        alert("Selected Start");
        selected = "start";
    }else if(boxX == endX && boxY == endY && selected == ""&& !running){
        alert("Selected End");
        selected = "end";
    }else if(selected == "start" && !(boxX == endX && boxY == endY)){
        startX = boxX;
        startY = boxY;
        refresh();
        currentNodex = boxX;
        currentNodeY = boxY;
        selected = "";
    }else if(selected == "end" && !(boxX == startX && boxY == startY)&& !running){
        endX = boxX;
        endY = boxY;
        selected = "";
    }else if((boxX == startX && boxY == startY)||(boxX == endX && boxY == endY)&& !running){
        alert("No overlapping start and finish");
    }else if(wallGrid[boxX][boxY] == 0 && !running){
        wallGrid[boxX][boxY] = 1;
    }else if(wallGrid[boxX][boxY] == 1 && !running){
        wallGrid[boxX][boxY] = 0;
    }
    
}

function refresh(){
    wallGrid = [];
    distanceGrid = wallGrid.slice();
    visitedGrid = wallGrid.slice();
    finalPath = wallGrid.slice();
    currentDist = 0;
    currentNodex = startX;
    currentNodeY = startY;
    for(let i = 0; i < tileWidth; i++){
        var temp = [];
        for(let j = 0; j < tileHeight; j++){
            temp.push(0);
        }
        wallGrid.push(temp.slice(0));
        distanceGrid.push(temp.slice(0));
        visitedGrid.push(temp.slice(0));
        finalPath.push(temp.slice(0));
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
        }
    }
    //down
    if(currentNodeY < tileHeight-1){
        if(distanceGrid[currentNodex][currentNodeY+1] > currentDist + 1 && wallGrid[currentNodex][currentNodeY+1] == 0){
            distanceGrid[currentNodex][currentNodeY+1] = currentDist + 1;
        }
    }
    //right
    if(currentNodex < tileWidth-1){
        if(distanceGrid[currentNodex+1][currentNodeY] > currentDist + 1 && wallGrid[currentNodex+1][currentNodeY] == 0){
            distanceGrid[currentNodex+1][currentNodeY] = currentDist + 1;
        }
    }
    //left
    if(currentNodex > 0){
        if(distanceGrid[currentNodex-1][currentNodeY] > currentDist + 1 && wallGrid[currentNodex-1][currentNodeY] == 0){
            distanceGrid[currentNodex-1][currentNodeY] = currentDist + 1;
        }
    }
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
    if(currentNodex == endX && currentNodeY == endY){
        running = false;
    }
    //add final path
    if(!running){
        //loop through the lowest dist and add it to final path as = 1
        var currX = currentNodex;
        var currY = currentNodeY;
        for(let dist = currentDist; dist > 0; dist--){
            //up
            var foundOne = false;
            if(currY > 0){
                if(distanceGrid[currX][currY-1] == dist && !foundOne){
                    finalPath[currX][currY-1] = 1;
                    foundOne = true;
                    currX = currX;
                    currY = currY-1;
                }
            }
            //down
            if(currY < tileHeight-1){
                if(distanceGrid[currX][currY+1] == dist && !foundOne){
                    finalPath[currX][currY+1] = 1;
                    foundOne = true;
                    currX = currX;
                    currY = currY+1;
                }
            }
            //right
            if(currX < tileWidth-1){
                if(distanceGrid[currX+1][currY] == dist && !foundOne){
                    finalPath[currX+1][currY]  = 1;
                    foundOne = true;
                    currX = currX+1;
                    currY = currY;
                }
            }
            //left
            if(currX > 0){
                if(distanceGrid[currX-1][currY] == dist && !foundOne){
                    finalPath[currX-1][currY]  = 1;
                    foundOne = true;
                    currX = currX-1;
                    currY = currY;
                }
            }
            
        }
        console.table(finalPath);
    }

}