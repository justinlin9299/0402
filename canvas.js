var currentTool = "pen"; 
var preTool = "pen";
var penSize = 20;
var eraserSize = 20;
var textSize = 20;
var text_is_selected = false;
var selectedFont = "Arial"
var isDrawingCircle = false;
var isDrawingRectangle = false;
var isDrawingTriangle = false;
var circleCenter = {x: 0, y: 0};
var rectangleStartX, rectangleStartY;
var rectangleEndX, rectangleEndY;
var triangleStartX, triangleStartY;
var undoStack = [];
var redoStack = [];
//var canvas = document.getElementById("whiteboard");
//var context = canvas.getContext("2d");

function pushToUndoStack(flag) {
    var canvas = document.getElementById("whiteboard");
    var context = canvas.getContext("2d");
    undoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    console.log("Push to Undo Stack! UndoStack.length:" + undoStack.length);
    if (undoStack.length > 20) {
        undoStack.shift();
    }
    if (flag) redoStack = [];
}

function pushToRedoStack() {
    var canvas = document.getElementById("whiteboard");
    var context = canvas.getContext("2d");
    redoStack.push(context.getImageData(0, 0, canvas.width, canvas.height));
    console.log("Push to Redo Stack! RedoStack.length:" + redoStack.length);
    if (redoStack.length > 20) {
        redoStack.shift();
    }
}

function redo() {
    var canvas = document.getElementById("whiteboard");
    var context = canvas.getContext("2d");
    if (redoStack.length > 0) {
        pushToUndoStack(false);
        var lastImageData = redoStack.pop();
        context.putImageData(lastImageData, 0, 0);
    }
}

function undo() {
    var canvas = document.getElementById("whiteboard");
    var context = canvas.getContext("2d");
    if (undoStack.length > 0) {
        pushToRedoStack();
        var lastImageData = undoStack.pop();
        context.putImageData(lastImageData, 0, 0);
    }
}

function cursorsign() {
    var canvas = document.getElementById("whiteboard");
    var cursorStyle;
    switch (currentTool) {
        case "pen":
            cursorStyle = "url('img/cursor_pen.png'), auto";
            console.log("Change Cursor:", currentTool);
            break;
        case "eraser":  
            cursorStyle = "url('img/cursor_eraser.png'), auto";
            console.log("Change Cursor:", currentTool);
            break;
        case "text":
            cursorStyle = "text";
            break;
        case "circle":
            cursorStyle = "url('img/cursor_circle.png'), auto";
            break;
        case "rectangle":
            cursorStyle = "url('img/cursor_rectangle.png'), auto";
            break;
        case "triangle":
            cursorStyle = "url('img/cursor_triangle.png'), auto";
            break;
        case "image":
            cursorStyle = "url('img/cursor_image.png'), auto";
            break;
        case "rainbow":
            cursorStyle = "url('img/cursor_rainbow.png'), auto";
            break;
        default:
            cursorStyle = "pointer";
            break;
    }
    console.log(cursorStyle);
    canvas.style.cursor = cursorStyle;
}

document.addEventListener("DOMContentLoaded", function() {
    var canvas = document.getElementById("whiteboard");
    var context = canvas.getContext("2d");
    var textInput = document.getElementById("textInput");
    var currentImage;
    //text
    function texting(point) {
        var text = textInput.value;
        if (text.trim() !== "") {
            context.fillStyle = currentColor;
            context.save();
            context.beginPath();
            context.font = textSize + "px " + selectedFont;
            context.fillText(text, parseInt(textInput.style.left) - 90, parseInt(textInput.style.top) - 60);
            context.restore();
            context.closePath();
        }
    }

    //circle------------------------------------------------------------------
    function drawCircle(centerX, centerY, r) {
        //context.beginPath();
        context.strokeStyle = currentColor;     
        context.arc(centerX, centerY, r, 0, 2 * Math.PI);
        context.lineWidth = penSize;
        context.stroke();
        context.closePath();
        context.beginPath();
    }

    function circleClearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.putImageData(currentImage, 0, 0);
    }

    function circleMouseDown(event) {
        if (currentTool === "circle") {
            pushToUndoStack(true);
            isDrawingCircle = true;
            circleCenter.x = event.clientX - canvas.offsetLeft;
            circleCenter.y = event.clientY - canvas.offsetTop;
            currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    function circleMouseMove(event) {
        if (isDrawingCircle && currentTool === "circle") {
            circleClearCanvas();
            var radius = Math.sqrt(
                Math.pow(event.clientX - canvas.offsetLeft - circleCenter.x, 2) -
                Math.pow(event.clientY - canvas.offsetTop - circleCenter.y, 2)
            );
            drawCircle(circleCenter.x, circleCenter.y, radius);
        }
    }

    function circleMouseUp(event) {
        if (isDrawingCircle && currentTool === "circle") {
            isDrawingCircle = false;
            var radius = Math.sqrt(
                Math.pow(event.clientX - canvas.offsetLeft - circleCenter.x, 2) -
                Math.pow(event.clientY - canvas.offsetTop - circleCenter.y, 2)
            );
            drawCircle(circleCenter.x, circleCenter.y, radius);
        }
    }
    //--------------------------------------------------------------------------------
    //rectangle-----------------------------------------------------------------------
    function drawRectangle(startX, startY, endX, endY) {
        console.log("drawRectangle");
        context.strokeStyle = currentColor;
        context.rect(startX, startY, endX - startX, endY - startY);
        context.lineWidth = penSize;
        context.stroke();
        context.closePath();
        context.beginPath();
    }

    function rectangleMouseDown(event) {
        console.log("rectangleMouseDown")
        if (currentTool === "rectangle") {
            pushToUndoStack(true);
            isDrawingRectangle = true;
            rectangleStartX = event.clientX - canvas.offsetLeft;
            rectangleStartY = event.clientY - canvas.offsetTop;
            currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    function rectangleMouseMove(event) {
        console.log("rectangleMouseMove");
        if (isDrawingRectangle && currentTool === "rectangle") {
            circleClearCanvas();
            drawRectangle(rectangleStartX, rectangleStartY, event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        }
    }

    function rectangleMouseUp(event) {
        console.log("rectangleMouseUp");
        if (isDrawingRectangle && currentTool === "rectangle") {
            isDrawingRectangle = false;
            rectangleEndX = event.clientX - canvas.offsetLeft;
            rectangleEndY = event.clientY - canvas.offsetTop;
            drawRectangle(rectangleStartX, rectangleStartY, rectangleEndX, rectangleEndY);
        }
    }
    //-------------------------------------------------------------------------------
    //triangle-----------------------------------------------------------------------
    function drawTriangle(startX, startY, endX, endY) {
        context.strokeStyle = currentColor;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.lineTo(triangleStartX - (endX - triangleStartX), endY);
        context.lineTo(startX, startY);
        context.lineWidth = penSize;
        context.stroke();
        context.closePath();
        context.beginPath();
    }

    function triangleMouseDown(event) {
        if (currentTool === "triangle") {
            pushToUndoStack(true);
            isDrawingTriangle = true;
            triangleStartX = event.clientX - canvas.offsetLeft;
            triangleStartY = event.clientY - canvas.offsetTop;
            currentImage = context.getImageData(0, 0, canvas.width, canvas.height);
        }
    }

    function triangleMouseMove(event) {
        if (isDrawingTriangle && currentTool === "triangle") {
            circleClearCanvas();
            drawTriangle(triangleStartX, triangleStartY, event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        }
    }

    function triangleMouseUp(event) {
        if (isDrawingTriangle && currentTool === "triangle") {
            isDrawingTriangle = false;
            drawTriangle(triangleStartX, triangleStartY, event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        }
    }
    //---------------------------------------------------------------------------------
    //image----------------------------------------------------------------------------
    var imageInput = document.getElementById("ImageInput");
    var selectedImage;
    imageInput.addEventListener('change', function(event) {
        selectedImage = event.target.files[0];
        console.log(selectedImage);
    });

    canvas.addEventListener('click', function(event) {
        console.log("ImageOpen");
        if (currentTool === "image" && selectedImage) {
            pushToUndoStack(true);
            var img = new Image();
            var mouseX = event.clientX - canvas.offsetLeft;
            var mouseY = event.clientY - canvas.offsetTop;
            img.onload = function() {
                var imgX = mouseX - img.width / 2; 
                var imgY = mouseY - img.height / 2; 
                context.drawImage(img, imgX, imgY);
            };
            img.src = URL.createObjectURL(selectedImage);
        }
    });
    //---------------------------------------------------------------------------------
    let painting = false;

    function startpos(point) {
        if (currentTool !== "pen" && currentTool !== "eraser" && currentTool !== "rainbow") return;
        painting = true;
        pushToUndoStack(true);
        draw(point);
    }

    function endpos() {
        painting = false;
        context.beginPath();
    }

    let hue = 0;

    function draw(point) {
        if (!painting) return;
        context.lineWidth = (currentTool === "eraser" )? eraserSize : penSize ;
        context.lineCap = "round";

        if (currentTool === "pen" || currentTool === "rainbow") {
            if (currentTool === "rainbow") {
                context.strokeStyle = `hsl(${hue}, 100%, 50%)`;
                hue = (hue + 1) % 360;
            }
            else {
                context.strokeStyle = currentColor;
            }
            context.lineTo(point.clientX - canvas.offsetLeft, point.clientY - canvas.offsetTop);
            context.stroke();
            context.beginPath();
            context.moveTo(point.clientX - canvas.offsetLeft, point.clientY - canvas.offsetTop);
        } else if (currentTool === "eraser") {
            context.clearRect(point.clientX - canvas.offsetLeft - eraserSize / 2, point.clientY - canvas.offsetTop - eraserSize / 2, eraserSize, eraserSize);
        }
    }

    canvas.addEventListener("click", function(event) {
        if (currentTool === "text") {
            pushToUndoStack(true);
            // Set the position of the text input box based on the click event
            textInput.style.left = event.clientX + "px";
            textInput.style.top = event.clientY + "px";
            textInput.style.display = "block"; // Show the text input box
            textInput.focus(); // Focus on the text input box
            textInput.addEventListener("keydown", function(event) {
                if (event.keyCode === 13) { // If Enter key is pressed
                    console.log("Press Enter");
                    texting(event); // Draw text on canvas
                    textInput.value = ''
                    textInput.style.display = "none"; // Hide the text input box
                    canvas.style.cursor = "crosshair"; // Restore cursor to crosshair
                }
            });
            canvas.style.cursor = "text"; // Change cursor to text input
        }
    });
    canvas.addEventListener("mousedown", startpos);
    canvas.addEventListener("mouseup", endpos);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mousedown", circleMouseDown);
    canvas.addEventListener("mousemove", circleMouseMove);
    canvas.addEventListener("mouseup", circleMouseUp);
    canvas.addEventListener("mousedown", rectangleMouseDown);
    canvas.addEventListener("mousemove", rectangleMouseMove);
    canvas.addEventListener("mouseup", rectangleMouseUp);
    canvas.addEventListener("mousedown", triangleMouseDown);
    canvas.addEventListener("mousemove", triangleMouseMove);
    canvas.addEventListener("mouseup", triangleMouseUp);
    canvas.addEventListener('click', function(event) {
        if (currentTool === "image") {
            imageInput.click();
        }
    });
});

function selectTool(toolName) {
    console.log("Selected tool:", toolName);
    preTool = currentTool;
    currentTool = toolName;

    if (toolName === 'reset') {
        pushToUndoStack(true);
        clearCanvas(); 
        currentTool = preTool;
        return;
    }
    if (toolName === 'undo') {
        undo();
        currentTool = preTool;
        return;
    }
    if (toolName === 'redo') {
        redo(); 
        currentTool = preTool;
        return;
    }
    
    cursorsign();
    console.log("Current Tool:", currentTool);
}

function changeColor(color) {
    currentColor = color;
    console.log("Selected color:", currentColor);
    
}

var currentColor = "#000"; 

function brushSize(size) {
    penSize = size;
    eraserSize = size;
}

function TextSize(size) {
    textSize = size;
}

function changeFont() {
    var fontSelect = document.getElementById("fontSelect");
    selectedFont = fontSelect.value;
}

function clearCanvas() {
    var canvas = document.getElementById("whiteboard");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function downloadCanvas() {
    var canvas = document.getElementById("whiteboard");
    var link = document.createElement('a');
    link.download = 'canvas_image.png';
    link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    link.click();
}
