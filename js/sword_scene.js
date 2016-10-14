var container, scene, camera, renderer, loader;
var sword, swordStyle;
var material;

var loadForge = function() {

    init();
    animate();

    function init() {

        // Setup
        container = document.getElementById( 'scene_pane' );
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.z = 6;
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        loader = new THREE.JSONLoader();

        // sword
        material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        sword = new THREE.Object3D();
        updateSwordMesh( material );
        scene.add( sword );
        

        // Adding to DOM
        //container.appendChild( render.domElement );
        document.body.appendChild( renderer.domElement );
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
    }

    function render() { 
            sword.rotation.y += 0.05;
            updateSwordMesh();
            renderer.render( scene, camera );
    }

}

var updateSwordMesh = function( ){
    loader.load( 'http://localhost:8080/json/sword.json', function( geometry ) {
            var mesh = new THREE.Mesh( geometry, material );
            sword.remove( sword.children[0] );
            sword.add( mesh );
    });
}

var loadSwordTemplate = function( style, material ){
    loader.load( 'http://localhost:8080/json/sword.json', function( geometry ) {
            var mesh = new THREE.Mesh( geometry, material );
            sword.add( mesh );
    });
}
        

       