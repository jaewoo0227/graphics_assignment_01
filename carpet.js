"use strict";

var canvas;
var gl;
var points = [];
var NumTimesToSubdivide = 3;
var bufferId;
var colors = [
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 0.8, 0.0, 1.0),
    vec4(0.0, 0.3, 1.0, 1.0)
];
var colorindex = 0;
var uColorLocation;
var vertices = [
    vec2(-1, -1),
    vec2(1, -1),
    vec2(1, 1),
    vec2(-1, 1)
];

window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl){
        alert("WebGL isn't available");
    }

    divide(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    uColorLocation = gl.getUniformLocation(program, "uColor");

    document.getElementById("depthSlider").addEventListener("input", function(e){
        NumTimesToSubdivide = parseInt(e.target.value);
        document.getElementById("depthVal").innerText = NumTimesToSubdivide;
        render();
    });

    document.getElementById("colorbtn").addEventListener("click", function() {
        colorindex = (colorindex + 1) % colors.length;
        render();
    });

    render();
}

function square(a, b, c, d){
    points.push(a, b, c);
    points.push(a, c, d);
}

function divide(a, b, c, d, count){
    if(count == 0){
        square(a, b, c, d);
    }
    else{
        var ab1 = mix(a, b, 1/3);
        var ab2 = mix(a, b, 2/3);

        var bc1 = mix(b, c, 1/3);
        var bc2 = mix(b, c, 2/3);

        var dc1 = mix(d, c, 1/3);
        var dc2 = mix(d, c, 2/3);

        var ad1 = mix(a, d, 1/3);
        var ad2 = mix(a, d, 2/3);

        var p1 = mix(ad1, bc1, 1/3);
        var p2 = mix(ad1, bc1, 2/3);
        var p3 = mix(ad2, bc2, 1/3);
        var p4 = mix(ad2, bc2, 2/3);

        --count;

        divide(a, ab1, p1, ad1, count);
        divide(ab1, ab2, p2, p1, count);
        divide(ab2, b, bc1, p2, count);

        divide(ad1, p1, p3, ad2, count);
        divide(p2, bc1, bc2, p4, count);

        divide(ad2, p3, dc1, d, count);
        divide(p3, p4, dc2, dc1, count);
        divide(p4, bc2, c, dc2, count);
    }
}

function render(){
    points = [];

    divide(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    gl.uniform4fv(uColorLocation, flatten(colors[colorindex]));

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}