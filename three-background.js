const scene =
new THREE.Scene();


const camera =
new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);


const renderer =
new THREE.WebGLRenderer({
alpha:true
});


renderer.setSize(
window.innerWidth,
window.innerHeight
);


renderer.domElement.style.position="fixed";
renderer.domElement.style.top="0";
renderer.domElement.style.zIndex="-1";


document.body.appendChild(
renderer.domElement
);



let particles=[];


for(let i=0;i<250;i++){


let geometry =
new THREE.SphereGeometry(
0.03,
8,
8
);



let material =
new THREE.MeshBasicMaterial({

color:0x00ffff

});



let particle =
new THREE.Mesh(
geometry,
material
);



particle.position.x =
(Math.random()-0.5)*20;


particle.position.y =
(Math.random()-0.5)*20;


particle.position.z =
(Math.random()-0.5)*20;



scene.add(particle);


particles.push(particle);


}



camera.position.z=5;




function animate(){


requestAnimationFrame(
animate
);



particles.forEach(p=>{

p.rotation.x+=0.01;

p.rotation.y+=0.01;


});


renderer.render(
scene,
camera
);


}


animate();




window.onresize=()=>{


camera.aspect=
window.innerWidth/
window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


}