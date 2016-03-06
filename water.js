// https://29a.ch/2010/10/23/html5-water-ripples-demo

var floor = Math.floor;
function clamp(x, min, max) {
    if(x < min) return min;
    if(x > max) return max-1;
    return x;
}

function getDataFromImage(img) {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0 ,0);
    return ctx.getImageData(0, 0, img.width, img.height);
}

function loadImage(src, callback) {
    var img = document.createElement('img');
    img.onload = function(){callback(img);};
    img.src = src;
}

function disturb(x, y, z){
    console.log('disturb', x, y, z);
    if(x < 2 || x > width-2 || y < 1 || y > height-2)
        return;
    var i = x+y*width;
    buffer0[i][0] += z;
    buffer0[i][1] += z;
    buffer0[i][2] += z;
    buffer0[i-1][0] -= z;
    buffer0[i-1][1] -= z;
    buffer0[i-1][2] -= z;
}

function process(){
    var img = ctx.getImageData(0, 0, width, height),
        data = img.data,
        i, x;

    // average cells to make the surface more even
    // this kind of for loop pattern lets us go over all the inner pixels,
    // none of the edges. row by row
    for(i=width+1;i<size-width-1;i+=2){
        for(x=1;x<width-1;x++,i++){
            buffer0[i][0] = (buffer0[i][0]+buffer0[i+1][0]+buffer0[i-1][0]+buffer0[i-width][0]+buffer0[i+width][0])/5;
            buffer0[i][1] = (buffer0[i][1]+buffer0[i+1][1]+buffer0[i-1][1]+buffer0[i-width][1]+buffer0[i+width][1])/5;
            buffer0[i][2] = (buffer0[i][2]+buffer0[i+1][2]+buffer0[i-1][2]+buffer0[i-width][2]+buffer0[i+width][2])/5;
        }
    }

    for(i=width+1;i<size-width-1;i+=2){
        for(x=1;x<width-1;x++,i++){
            // wave propagation
            // why do we divide by 2? what is buffer0 vs. buffer1 ?
            //var waveHeight = (buffer0[i-1] + buffer0[i+1] + buffer0[i+width] + buffer0[i-width])/2-buffer1[i]; // buffer1 is the old value
            buffer1[i][0] = 0.99*(buffer0[i-1][0] + buffer0[i+1][0] + buffer0[i+width][0] + buffer0[i-width][0])/2-buffer1[i][0]; // buffer1 is the old value
            buffer1[i][1] = 0.99*(buffer0[i-1][1] + buffer0[i+1][1] + buffer0[i+width][1] + buffer0[i-width][1])/2.01-buffer1[i][1]; // buffer1 is the old value
            buffer1[i][2] = 0.99*(buffer0[i-1][2] + buffer0[i+1][2] + buffer0[i+width][2] + buffer0[i-width][2])/2.02-buffer1[i][2]; // buffer1 is the old value
            //buffer1[i] = waveHeight; // buffer1 gets updated to be the new val
            // calculate index in the texture with some fake referaction
            //var ti = i+floor((buffer1[i-2]-waveHeight)*0.08)+floor((buffer1[i-width]-waveHeight)*0.08)*width;
            // clamping
            //ti = ti < 0 ? 0 : ti > size ? size : ti;
            // some very fake lighting and caustics based on the wave height
            // and angle
            //var light = waveHeight*2.0-buffer1[i-2]*0.6,
            var    i4 = i*4;
            //    ti4 = ti*4;
            // clamping
            //light = light < -10 ? -10 : light > 100 ? 100 : light;
            // i * 4 is how we get to the image data stored as R,G,B,A vals
            // consecutively in array
            /*
            data[i4] = texture.data[ti4]+light; // R
            data[i4+1] = texture.data[ti4+1]+light; // G
            data[i4+2] = texture.data[ti4+2]+light; // B
            */
            /*
            data[i4] = buffer1[i][0]*0.9;
            data[i4+1] = buffer1[i][1];
            data[i4+2] = buffer1[i][2];
            */
            data[i4] = .6*buffer1[i][0] + .5*buffer1[i][1] + .1*buffer1[i][2];
            data[i4+1] = .2*buffer1[i][0] + .6*buffer1[i][1] + .6*buffer1[i][2];
            data[i4+2] = .1*buffer1[i][0] + .1*buffer1[i][1] + .1*buffer1[i][2];
        }
    }
    // rain
    //disturb(floor(Math.random()*width), floor(Math.random()*height), Math.random()*10000);
    aux = buffer0;
    buffer0 = buffer1;
    buffer1 = aux;
    ctx.putImageData(img, 0, 0);
}
var canvas = document.getElementById('c'),
    ctx = canvas.getContext('2d'),
    width = 320,
    height = 240,
    size = width*height,
    buffer0 = [],
    buffer1 = [],
    aux, i, texture;

for(i=0;i<size;i++){
    buffer0.push([0,0,0]); // R, G, B
    buffer1.push([0,0,0]); // R, G, B
}

loadImage("black.png", function(img){
    texture = getDataFromImage(img);
    canvas.width = width;
    canvas.height = height;
    ctx.fillRect(0, 0, width, height);
    setInterval(process, 1000/60);
    resizeBy(width-innerWidth, height-innerHeight);
});

canvas.onmousemove = function(e){
    disturb(
            floor(e.clientX/innerWidth*width),
            floor(e.clientY/innerHeight*height),
            15000);
}
