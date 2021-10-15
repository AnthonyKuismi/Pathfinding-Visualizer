
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

var shiftDown = false;


var wallGrid;
var visitedGrid;
var distanceGrid;
var finalPath;

//console.table(wallGrid)

var startX = 0;
var startY = 0;

var endX = tileWidth-1;
var endY = tileHeight-1;

var lineStartX;
var lineStartY;

var selected = "";

var running = false;
clearAll();
updateBoard();

document.getElementById("game").addEventListener("click",click);
document.getElementById("game").addEventListener("mousedown",line);
document.getElementById("game").addEventListener("mouseup",release);
document.addEventListener("keydown",keydown);
document.addEventListener("keyup",keyup);

//updates the board
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

//clears the screen and makes boxes
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
//function that is activated when start is clicked and sets the current alg to running
function doFunction(){
    currentAlg = document.getElementById("algorithms").value;
    running = true;
}
//draws all the nodes onto the screen
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
//activated when board is clicked
function click(event){
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const boxX = Math.floor(x/tileSize);
    const boxY = Math.floor(y/tileSize);
    
    if(boxX == startX && boxY == startY && selected == ""&& !running){
        alert("Selected Start");
        selected = "start";
    }else if(boxX == endX && boxY == endY && selected == ""&& !running){
        alert("Selected End");
        selected = "end";
    }else if(selected == "start" &&  wallGrid[boxX][boxY] == 0 && !(boxX == endX && boxY == endY)){
        startX = boxX;
        startY = boxY;
        clearAll();
        currentNodex = boxX;
        currentNodeY = boxY;
        selected = "";
    }else if(selected == "end" && wallGrid[boxX][boxY] == 0 &&!(boxX == startX && boxY == startY)&& !running){
        endX = boxX;
        endY = boxY;
        selected = "";
    }else if((selected == "end" || selected == "start") && wallGrid[boxX][boxY]==1){
        alert("Can't place start or finish on wall");
    }else if((boxX == startX && boxY == startY)||(boxX == endX && boxY == endY)&& !running){
        alert("No overlapping start and finish");
    }else if(wallGrid[boxX][boxY] == 0 && !running){
        wallGrid[boxX][boxY] = 1;
    }else if(wallGrid[boxX][boxY] == 1 && !running){
        wallGrid[boxX][boxY] = 0;
    }
    
}
//activated when the wall line starts
function line(event){ 
    if(event.button == 1){
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const boxX = Math.floor(x/tileSize);
        const boxY = Math.floor(y/tileSize);
        lineStartX = boxX;
        lineStartY = boxY;
    }
    
}
//activated when the wall line ends
function release(event){
    if(event.button == 1){
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const boxX = Math.floor(x/tileSize);
        const boxY = Math.floor(y/tileSize);
        //check each box that it goes through
        const slope = (boxY-lineStartY)/(boxX-lineStartX);
        var defined = true;
        if(boxX - lineStartX == 0){
           defined = false; 
        }      
        console.log(slope);
        if(Math.abs(slope) <= 1){
            const b = boxY -slope*boxX;
            var iStart = lineStartX;
            var iEnd = boxX;
            if (iStart > iEnd){
                iStart = boxX;
                iEnd = lineStartX;
            }
            for(let i = iStart; i <= iEnd; i ++){
                const yBox = Math.round(slope*i + b);
                if(wallGrid[i][yBox] == 0 && !running && !shiftDown && !(i == startX && yBox == startY) && !(i == endX && yBox == endY)){
                    wallGrid[i][yBox] = 1;
                }else if(wallGrid[i][yBox] == 1 && !running && shiftDown){
                    wallGrid[i][yBox] = 0;
                }
            }
        }else if(defined){
            const b = boxY -slope*boxX;
            var iStart = lineStartY;
            var iEnd = boxY;
            if (iStart > iEnd){
                iStart = boxY;
                iEnd = lineStartY;
            }
            for(let i = iStart; i <= iEnd; i ++){
                const xBox = Math.round((i-b)/slope);
                if(wallGrid[xBox][i] == 0 && !running && !shiftDown && !(xBox == startX && i == startY) && !(xBox == endX && i == endY)){
                    wallGrid[xBox][i] = 1;
                }else if(wallGrid[xBox][i] == 1 && !running && shiftDown){
                    wallGrid[xBox][i] = 0;
                }
            }
        }else{
            const b = boxY -slope*boxX;
            var iStart = lineStartY;
            var iEnd = boxY;
            if (iStart > iEnd){
                iStart = boxY;
                iEnd = lineStartY;
            }
            for(let i = iStart; i <= iEnd; i ++){
                const xBox = boxX;
                if(wallGrid[xBox][i] == 0 && !running && !shiftDown && !(xBox == startX && i == startY) && !(xBox == endX && i == endY)){
                    wallGrid[xBox][i] = 1;
                }else if(wallGrid[xBox][i] == 1 && !running && shiftDown){
                    wallGrid[xBox][i] = 0;
                }
            }
        }
        
        
    }
    
}
//activated when key is pressed down
function keydown(event){
    const key = event.key;
    if(key == "Shift"){
        shiftDown = true;
    }
}
//activated when key is let go of
function keyup(event){
    const key = event.key;
    if(key == "Shift"){
        shiftDown = false;
    }
}
//function to resetart the current alg
function restart(){
    distanceGrid = [];
    visitedGrid = distanceGrid.slice();
    finalPath = distanceGrid.slice();
    currentDist = 0;
    currentNodex = startX;
    currentNodeY = startY;
    for(let i = 0; i < tileWidth; i++){
        var temp = [];
        for(let j = 0; j < tileHeight; j++){
            temp.push(0);
        }
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
//alerts with basic help
function help(){
    alert("Left click on the start or the end to change the position of them.");
    alert("Left click on cells to toggle walls in respective cell.");
    alert("Middle click and move mouse to make a line of walls.");
    alert("Middle click + shift and move mouse to delete a line of walls.");
}
//funcition to clear the board
function clearAll(){
    console.log("clear");
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
//dijkstra alg
function dijkstra(){
    //unvisited = 0
    //visited = 1

    //calculate neighbors and distances. If distance is shorter than current distance set it to new

    //up
    if(currentNodeY > 0){
        if(distanceGrid[currentNodex][currentNodeY-1] > currentDist + 1 && wallGrid[currentNodex][currentNodeY-1] == 0){
            distanceGrid[currentNodex][currentNodeY-1] = currentDist + 1;
            //check if found end node
            if(currentNodex == endX && currentNodeY - 1 == endY){
                running = false;
            }
        }
    }
    //down
    if(currentNodeY < tileHeight-1){
        if(distanceGrid[currentNodex][currentNodeY+1] > currentDist + 1 && wallGrid[currentNodex][currentNodeY+1] == 0){
            distanceGrid[currentNodex][currentNodeY+1] = currentDist + 1;
            //check if found end node
            if(currentNodex == endX && currentNodeY + 1 == endY){
                running = false;
            }
        }
    }
    //right
    if(currentNodex < tileWidth-1){
        if(distanceGrid[currentNodex+1][currentNodeY] > currentDist + 1 && wallGrid[currentNodex+1][currentNodeY] == 0){
            distanceGrid[currentNodex+1][currentNodeY] = currentDist + 1;
            //check if found end node
            if(currentNodex + 1 == endX&& currentNodeY == endY){
                running = false;
            }
        }
    }
    //left
    if(currentNodex > 0){
        if(distanceGrid[currentNodex-1][currentNodeY] > currentDist + 1 && wallGrid[currentNodex-1][currentNodeY] == 0){
            distanceGrid[currentNodex-1][currentNodeY] = currentDist + 1;
            //check if found end node
            if(currentNodex -1== endX && currentNodeY == endY){
                running = false;
            }
        }
    }
    visitedGrid[currentNodex][currentNodeY] = 1;
    //find next node
    smallestDist = 999;
    if(running){
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
    }

    //add final path
    if(!running){
        //loop through the lowest dist and add it to final path as = 1
        var currX = endX;
        var currY = endY;
        currentNodex = currX;
        currentNodeY = currY;
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