/* ==============================
   LOAD COLORS DATABASE
================================ */

let colors = [];

fetch("colors.json")
.then(res => res.json())
.then(data => {
colors = data;
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ==============================
   TOOL SWITCHING
================================ */

const buttons = document.querySelectorAll(".tool-btn");
const sections = document.querySelectorAll(".tool-section");

buttons.forEach(btn => {

btn.addEventListener("click", () => {

buttons.forEach(b => b.classList.remove("active"));
btn.classList.add("active");

sections.forEach(sec => sec.classList.remove("active"));

document
.getElementById(btn.dataset.tool)
.classList.add("active");

});

});



/* ==============================
   RGB → HSL
================================ */

function rgbToHsl(r,g,b){

r/=255;
g/=255;
b/=255;

let max=Math.max(r,g,b);
let min=Math.min(r,g,b);
let h,s,l=(max+min)/2;

if(max===min){
h=s=0;
}else{

let d=max-min;

s=l>0.5?d/(2-max-min):d/(max+min);

switch(max){

case r:
h=(g-b)/d+(g<b?6:0);
break;

case g:
h=(b-r)/d+2;
break;

case b:
h=(r-g)/d+4;
break;

}

h/=6;

}

return {
h:Math.round(h*360),
s:Math.round(s*100),
l:Math.round(l*100)
};

}


/* ==============================
   COPY
================================ */

function copy(text){
navigator.clipboard.writeText(text);
alert("Copied "+text);
}


/* ==============================
   DISPLAY COLOR
================================ */

function displayColor(color,container){

let hsl = rgbToHsl(color.r,color.g,color.b);

container.innerHTML = `

<div class="color-preview" style="background:${color.hex}"></div>

<h3>${color.name}</h3>

<p>HEX: ${color.hex}
<button onclick="copy('${color.hex}')">Copy</button>
</p>

<p>RGB: rgb(${color.r},${color.g},${color.b})
<button onclick="copy('rgb(${color.r},${color.g},${color.b})')">Copy</button>
</p>

<p>HSL: hsl(${hsl.h},${hsl.s}%,${hsl.l}%)
<button onclick="copy('hsl(${hsl.h},${hsl.s}%,${hsl.l}%)')">Copy</button>
</p>

<button onclick="addFavorite('${color.hex}')">❤ Favorite</button>

`;

}


/* ==============================
   CLOSEST COLOR
================================ */

function closestColor(r,g,b){

let min=999999;
let closest=null;

colors.forEach(c=>{

let d=
Math.pow(c.r-r,2)+
Math.pow(c.g-g,2)+
Math.pow(c.b-b,2);

if(d<min){
min=d;
closest=c;
}

});

return closest;

}


/* ==============================
   NAME → CODE
================================ */

document
.getElementById("searchColorBtn")
.onclick = ()=>{

let name=
document
.getElementById("colorNameInput")
.value
.toLowerCase();

let result=
colors.find(c=>c.name.toLowerCase()===name);

let container=
document.getElementById("nameToCodeResult");

if(result){
displayColor(result,container);
}else{
container.innerHTML="Color not found";
}

};


/* ==============================
   CODE → COLOR
================================ */

document
.getElementById("searchCodeBtn")
.onclick = ()=>{

let code=
document
.getElementById("colorCodeInput")
.value
.trim();

let r,g,b;

if(code.startsWith("#")){

let hex=code.replace("#","");

r=parseInt(hex.substring(0,2),16);
g=parseInt(hex.substring(2,4),16);
b=parseInt(hex.substring(4,6),16);

}else if(code.startsWith("rgb")){

let v=code.match(/\d+/g);

r=parseInt(v[0]);
g=parseInt(v[1]);
b=parseInt(v[2]);

}else return;

let color=closestColor(r,g,b);

displayColor(
color,
document.getElementById("codeToColorResult")
);

};


/* ==============================
   COLOR PICKER
================================ */

const picker=document.getElementById("picker");

if(picker){

picker.addEventListener("input",()=>{

let hex=picker.value;

let r=parseInt(hex.substr(1,2),16);
let g=parseInt(hex.substr(3,2),16);
let b=parseInt(hex.substr(5,2),16);

let color=closestColor(r,g,b);

displayColor(
color,
document.getElementById("pickerResult")
);

});

}


/* ==============================
   RANDOM COLOR
================================ */

document
.getElementById("generateRandom")
.onclick=()=>{

let color=
colors[Math.floor(Math.random()*colors.length)];

displayColor(
color,
document.getElementById("randomResult")
);

};


/* ==============================
   IMAGE COLOR EXTRACTOR
================================ */

const upload=document.getElementById("imageUpload");

if(upload){

upload.addEventListener("change",e=>{

let file=e.target.files[0];

let img=new Image();
let reader=new FileReader();

reader.onload=function(event){

img.src=event.target.result;

};

reader.readAsDataURL(file);

img.onload=function(){

let canvas=document.getElementById("imageCanvas");
let ctx=canvas.getContext("2d");

canvas.width=img.width;
canvas.height=img.height;

ctx.drawImage(img,0,0);

let data=
ctx.getImageData(0,0,img.width,img.height).data;

let colorsFound=[];

for(let i=0;i<data.length;i+=4000){

let r=data[i];
let g=data[i+1];
let b=data[i+2];

colorsFound.push(closestColor(r,g,b));

}

let container=document.getElementById("imageColors");

container.innerHTML="";

colorsFound.slice(0,8).forEach(c=>{

container.innerHTML+=`

<div class="color-card" style="background:${c.hex}">
${c.name}<br>${c.hex}
</div>

`;

});

};

});

}


/* ==============================
   COLOR COMBINATIONS
================================ */

const combo=document.getElementById("comboColor");

if(combo){

combo.addEventListener("input",()=>{

let hex=combo.value;

let r=parseInt(hex.substr(1,2),16);
let g=parseInt(hex.substr(3,2),16);
let b=parseInt(hex.substr(5,2),16);

let hsl=rgbToHsl(r,g,b);

let container=document.getElementById("comboResults");

container.innerHTML="";

for(let i=0;i<5;i++){

let h=(hsl.h+i*30)%360;

let hslColor=`hsl(${h},${hsl.s}%,${hsl.l}%)`;

/* convert HSL → RGB */
let temp=document.createElement("div");
temp.style.color=hslColor;
document.body.appendChild(temp);

let rgbColor=getComputedStyle(temp).color;
document.body.removeChild(temp);

let values=rgbColor.match(/\d+/g);

let cr=parseInt(values[0]);
let cg=parseInt(values[1]);
let cb=parseInt(values[2]);

let detected=closestColor(cr,cg,cb);

container.innerHTML+=`
<div class="color-card" style="background:${detected.hex}">
${detected.name}<br>
${detected.hex}
<br>
`;

}

});

}


/* ==============================
   GRADIENT GENERATOR
================================ */

const g1=document.getElementById("gradient1");
const g2=document.getElementById("gradient2");

function updateGradient(){

let c1=g1.value;
let c2=g2.value;

document
.getElementById("gradientPreview")
.style.background=`linear-gradient(90deg,${c1},${c2})`;

}

if(g1 && g2){

g1.addEventListener("input",updateGradient);
g2.addEventListener("input",updateGradient);

}


/* ==============================
   PALETTE GENERATOR
================================ */

document
.getElementById("generatePalette")
.onclick=()=>{

let container=
document.getElementById("paletteResult");

container.innerHTML="";

for(let i=0;i<5;i++){

let c=
colors[Math.floor(Math.random()*colors.length)];

container.innerHTML+=`

<div class="color-card" style="background:${c.hex}">
${c.name}<br>${c.hex}
</div>

`;

}

};


/* ==============================
   CONTRAST CHECKER
================================ */

const c1=document.getElementById("contrast1");
const c2=document.getElementById("contrast2");

function luminance(r,g,b){

let a=[r,g,b].map(v=>{

v/=255;

return v<=0.03928
? v/12.92
: Math.pow((v+0.055)/1.055,2.4);

});

return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];

}

function contrastRatio(c1,c2){

let L1=luminance(...c1);
let L2=luminance(...c2);

return (Math.max(L1,L2)+0.05)/
(Math.min(L1,L2)+0.05);

}

function updateContrast(){

let hex1=c1.value;
let hex2=c2.value;

let r1=parseInt(hex1.substr(1,2),16);
let g1=parseInt(hex1.substr(3,2),16);
let b1=parseInt(hex1.substr(5,2),16);

let r2=parseInt(hex2.substr(1,2),16);
let g2=parseInt(hex2.substr(3,2),16);
let b2=parseInt(hex2.substr(5,2),16);

let ratio=contrastRatio([r1,g1,b1],[r2,g2,b2]);

document
.getElementById("contrastResult")
.innerHTML=`Contrast Ratio: ${ratio.toFixed(2)}`;

}

if(c1 && c2){

c1.addEventListener("input",updateContrast);
c2.addEventListener("input",updateContrast);

}


/* ==============================
   COLOR MOOD DETECTOR
================================ */

const mood=document.getElementById("moodColor");

if(mood){

mood.addEventListener("input",()=>{

let hex=mood.value;

let r=parseInt(hex.substr(1,2),16);
let g=parseInt(hex.substr(3,2),16);
let b=parseInt(hex.substr(5,2),16);

let hsl=rgbToHsl(r,g,b);

let moodText="Neutral";

if(hsl.h<30) moodText="Energetic";
else if(hsl.h<90) moodText="Happy";
else if(hsl.h<150) moodText="Fresh";
else if(hsl.h<210) moodText="Calm";
else if(hsl.h<270) moodText="Creative";
else moodText="Passionate";

document
.getElementById("moodResult")
.innerHTML=`Mood: ${moodText}`;

});

}


/* ==============================
   FAVORITES
================================ */

function addFavorite(hex){

let fav=
JSON.parse(localStorage.getItem("favorites")) || [];

if(!fav.includes(hex)){

fav.push(hex);

localStorage.setItem(
"favorites",
JSON.stringify(fav)
);

showFavorites();

}

}

function showFavorites(){

let fav=
JSON.parse(localStorage.getItem("favorites")) || [];

let container=
document.getElementById("favoritesList");

container.innerHTML="";

fav.forEach(hex=>{

container.innerHTML+=`

<div class="color-card" style="background:${hex}">
${hex}
</div>

`;

});

}

showFavorites();


/* ==============================
   CLOSEST COLOR TOOL
================================ */

const closestPicker=document.getElementById("closestPicker");

if(closestPicker){

closestPicker.addEventListener("input",()=>{

let hex=closestPicker.value;

let r=parseInt(hex.substr(1,2),16);
let g=parseInt(hex.substr(3,2),16);
let b=parseInt(hex.substr(5,2),16);

let color=closestColor(r,g,b);

displayColor(
color,
document.getElementById("closestResult")
);

});

}