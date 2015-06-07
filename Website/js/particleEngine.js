/**
 * Created by Ryan Berg on 6/5/15.
 * rberg2@hotmail.com
 */





if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color, sprite, size;
var sinGrowth = 0;
var currentTime = Date.now();
var deltaTime = currentTime;
var cameraDistance = 700;
var id;


var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

var target = $("#animationPauseTarget").offset().top - 101;
var timeout = null;
var animationIsOn = true;

var particleEngineContainer = document.getElementById('particleEngineContainer');

$(window).scroll(function () {
    if (!timeout) {
        timeout = setTimeout(function () {
            clearTimeout(timeout);
            timeout = null;


            if ($(window).scrollTop() >= target && animationIsOn)
            {
                cancelAnimationFrame(id);
                particleEngineContainer.className = "";
                animationIsOn = false;

                if(!wifiMapIsInitialized && !userIsOnPhone)
                {
                    $('body').css('overflow', 'hidden');

                    setTimeout(function()
                    {
                        $('body').css('overflow', 'auto');
                    }, 500);

                    wifiMapIsInitialized = true;
                    $("#wifiSearchContainer").css("background", "");
                    $("#wifiSearchContainer").html('<iframe id="wifiSearchFrame" height="500px" width="500px" frameBorder="0" src="../html/wifi_search.html"></iframe>');
                }
            }
            else if($(window).scrollTop() < target && !animationIsOn)
            {
                animate();
                particleEngineContainer.className = "runParallax";
                animationIsOn = true;
            }
        }, 150);
    }
});

$("#seeMyWorkLink").click(function()
{
    $('body').css('overflow', 'hidden');

    setTimeout(function()
    {
        $('body').css('overflow', 'auto');
    }, 2500);

    $('html, body').animate({
        scrollTop: $("#animationPauseTarget").offset().top - 100
}, 2500);

});

function init() {

    container = document.createElement( 'div' );
    document.getElementById('particleEngineContainer').appendChild(container);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.z = cameraDistance;
    camera.rotation.y = -30;

    scene = new THREE.Scene();

    geometry = new THREE.Geometry();

    sprite = THREE.ImageUtils.loadTexture( "../images/particle.png" );

    for ( i = 0; i < 1000; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2000 - 1000;
        vertex.y = Math.random() * 2000 - 1000;
        vertex.z = Math.random() * 2000 - 1000;



        geometry.vertices.push( vertex );

    }

    parameters = [
        [ [.34  ,1, 1], 15 ],
        [[.59  , 1, 1], 14 ],
        [[.78 , 1, 1], 13 ],
        [ [1.1, 1, 1], 12 ],
        [ [1.6, 1, 0.5], 11 ]
    ];

    for ( i = 0; i < parameters.length; i ++ ) {

        color = parameters[i][0];
        size  = parameters[i][1];

        materials[i] = new THREE.PointCloudMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );

        materials[i].color.setHex(0x4d90fe);

        particles = new THREE.PointCloud( geometry, materials[i] );

        scene.add( particles );

    }

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );


    if(!userIsOnPhone)
    {
        window.addEventListener( 'resize', onWindowResize, false );
    }
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}



function animate() {


    id = requestAnimationFrame( animate );
    render();


}

function render()
{
    currentTime = Date.now();
    deltaTime = deltaTime - currentTime;

    sinGrowth += .0003;


    camera.position.x = cameraDistance * Math.sin(sinGrowth);
    camera.position.z =  cameraDistance * Math.cos(sinGrowth);
    camera.rotation.y = -Math.atan2(camera.position.z, camera.position.x) + Math.PI/2;


    deltaTime = currentTime;


    renderer.render( scene, camera );

}


