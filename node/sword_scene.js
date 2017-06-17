var container;  // HTMl element container for the ThreeJS scene
var scene;      // ThreeJS Scene object
var camera;     // ThreeJS Camera object
var renderer;   // ThreeJS Renderer
var loader;     // ThreeJS JSON loader for decoding the JSON
var sword;      // ThreeJS Object3D that has the sword geometry 
var material;   // ThreeJS Material for rendering the sword mesh

// Conducts the instantiation of the variables
// and adds the ThreeJS Scene to the DOM
function init() {
    // Setup
    container = document.getElementById('scene_pane');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setSize(container.offsetWidth, window.offsetHeight);
    loader = new THREE.JSONLoader();

    // sword
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    sword = new THREE.Object3D();
    updateSwordMesh(material);
    scene.add(sword);
    
    // Adding to DOM
    document.body.appendChild(renderer.domElement);
}

// Animates the scene
function animate() {
    requestAnimationFrame(animate);
    render();
}

// Renders the scene
function render() { 
    sword.rotation.y += 0.05;
    renderer.render(scene, camera);
}

// Entry point method for starting the scene in the html
function loadForge() {
    console.log("Loading Forge");
    init();
    animate();
}

function updateSwordMesh() {
    var swordStyleSelector = document.getElementById("swordStyle");
    var swordStyle = swordStyleSelector.options[swordStyleSelector.selectedIndex].value;
    var seed = document.getElementById("seed").value;
    console.log(seed);
    console.log(swordStyle);
    var xhttp = new XMLHttpRequest();
    // Handles loading the mesh from the JSON response
    xhttp.onreadystatechange = function() {
       if(xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
            var jsonResp = xhttp.responseText;
            loader.load( jsonResp, function( geometry ) {
                var mesh = new THREE.Mesh( geometry, material );
                if (sword.children.length > 0) {
                    sword.remove( sword.children[0] );
                }
                sword.add( mesh );
            });
       } 
    };
    console.log("Updating..");
    var indexOfRoute = window.location.href.indexOf("/sandbox/");
    var fetchUrl = `${window.location.href.substring(0,indexOfRoute)}/forge/sword/${swordStyle}`
    xhttp.open("GET", fetchUrl, false);
    xhttp.send();
}

function loadSwordTemplate( style, material ) {
    loader.load( 'http://localhost:8080/json/sword.json', function( geometry ) {
            var mesh = new THREE.Mesh( geometry, material );
            sword.add( mesh );
    });
}

console.log("Loaded");

        

       