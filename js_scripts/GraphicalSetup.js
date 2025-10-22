 const container = document.getElementById('threejs-canvas');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.transparent=true;
    renderer.alpha=true;
    container.appendChild(renderer.domElement);

    
    console.log("Canvas size:", renderer.domElement.width, renderer.domElement.height);

    let sphere; // Make it accessible globally

    let gen_radius = 1000; //general radius for spheres

    //'ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture.tif.json'
    let sphereCoords;
    let mapTransform;
    let mapWidth;
    let mapHeight;

 const viewSize = gen_radius/5; // controls how much of the inside is visible
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1500
);

    camera.position.set(-0.1, 0, 0);


    const axesHelper = new THREE.AxesHelper(100);
    axesHelper.material.transparent = true;
    axesHelper.material.opacity = 0.5;
    //scene.add(axesHelper);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.enableZoom = true;
    controls.minDistance = 0.1;
    controls.maxDistance = gen_radius * 0.5;
    controls.zoomSpeed = 1;
    controls.minZoom = 0.1;
    controls.enablePan = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.rotateSpeed = -0.1; 

    controls.mouseButtons = {
  LEFT: null,
  MIDDLE:null,
  RIGHT: THREE.MOUSE.ROTATE   
};
function zoomCamera(delta) {

    camera.fov = THREE.MathUtils.clamp(camera.fov + delta, 20, 60);
    camera.updateProjectionMatrix();

}

// Example: attach to mouse wheel
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomCamera(e.deltaY * 0.05);
}, { passive: false });

const label = document.createElement('div');
label.style.position = 'absolute';
label.style.top = '95vh';
label.style.left = '10px';
label.style.padding = '5px';
label.style.background = 'rgba(0,0,0,0.5)';
label.style.color = 'white';
label.style.fontFamily = 'monospace';
label.style.zIndex = '100';
document.body.appendChild(label);






const radius = 10;
const curve = new THREE.CatmullRomCurve3([]);

for (let lat = -90; lat <= 90; lat += 1) {
  const theta = THREE.MathUtils.degToRad(90 - lat);
  const phi = THREE.MathUtils.degToRad(180);
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);
  curve.points.push(new THREE.Vector3(x, y, z));
}



// Tube geometry along the curve
const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const thickLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(thickLine);


const panBar = document.createElement('div');
panBar.style.position = 'absolute';
panBar.style.top = '0px';
panBar.style.left = '2vh';
panBar.style.width = '70vw';
panBar.style.height = '2vh';
panBar.style.backgroundColor = '#fff';
panBar.style.zIndex = '101';
document.body.appendChild(panBar);

const panMarker = document.createElement('div');
panMarker.style.position = 'absolute';
panMarker.style.top = '0px';
panMarker.style.width = '2px';
panMarker.style.height = '100%';
panMarker.style.backgroundColor = 'red';
panBar.appendChild(panMarker);

// Vertical Tilt bar (left)
const tiltBar = document.createElement('div');
tiltBar.style.position = 'absolute';
tiltBar.style.top = '2vh';
tiltBar.style.left = '0px';
tiltBar.style.width = '2vh';
tiltBar.style.height = '90vh';
tiltBar.style.backgroundColor = '#fff';
tiltBar.style.zIndex = '101';
document.body.appendChild(tiltBar);

const tiltMarker = document.createElement('div');
tiltMarker.style.position = 'absolute';
tiltMarker.style.left = '0px';
tiltMarker.style.width = '100%';
tiltMarker.style.height = '2px';
tiltMarker.style.backgroundColor = 'blue';
tiltBar.appendChild(tiltMarker);


// === Add tick labels for Pan (horizontal, top) ===
const panLabelContainer = document.createElement('div');
panLabelContainer.style.position = 'absolute';
panLabelContainer.style.top = '0.2vh';
panLabelContainer.style.left = '2.25vw';
panLabelContainer.style.width = '67.5vw';
panLabelContainer.style.height = '1.5vh';
panLabelContainer.style.zIndex = '102';
panLabelContainer.style.pointerEvents = 'none';
document.body.appendChild(panLabelContainer);

// Label every 45° from -180° to +180°
for (let angle = -180; angle <= 180; angle += 45) {
  const label = document.createElement('div');
  label.style.position = 'absolute';
  label.style.fontSize = '0.95vh';
  label.style.color = '#000';
  label.style.fontFamily = 'monospace';
  label.style.top = '0';
  label.style.transform = 'translateX(-50%)';
  label.textContent = `${angle}°`;
  const norm = (angle + 180) / 360; // map -180..180 to 0..1
  label.style.left = `${norm * 100}%`;
  panLabelContainer.appendChild(label);
}


// === Add tick labels for Tilt (vertical, left) ===
const tiltLabelContainer = document.createElement('div');
tiltLabelContainer.style.position = 'absolute';
tiltLabelContainer.style.top = '3vh';
tiltLabelContainer.style.left = '0vw';
tiltLabelContainer.style.width = '3vh';
tiltLabelContainer.style.height = '87.5vh';
tiltLabelContainer.style.zIndex = '102';
tiltLabelContainer.style.pointerEvents = 'none';
document.body.appendChild(tiltLabelContainer);

// Label every 30° from -90° to +90°
for (let angle = -90; angle <= 90; angle += 30) {
  const label = document.createElement('div');
  label.style.position = 'absolute';
  label.style.left = '0.1vh';
  label.style.fontSize = '0.95vh';
  label.style.color = '#000';
  label.style.fontFamily = 'monospace';
  label.textContent = `${angle}°`;
  const norm = (90 - angle) / 180; // map +90..-90 to 0..1
  label.style.top = `${norm * 100}%`;
  label.style.transform = 'translateY(-50%)';
  tiltLabelContainer.appendChild(label);
}


//Update Ruler Markers
function updateCameraRulers() {

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction); 

    const spherical = new THREE.Spherical();
    spherical.setFromVector3(direction);

    let pan = -spherical.theta * (180/Math.PI) + 90;  
    let tilt = -spherical.phi * (180/Math.PI) + 90;   
    if(pan > 180) pan -= 360;

    const panNorm = (pan + 180) / 360; 
    const panWidth = panBar.clientWidth;
    panMarker.style.left = `${panNorm * panWidth}px`;

    const tiltNorm = (90 - tilt) / 180; 
    const tiltHeight = tiltBar.clientHeight;
    tiltMarker.style.top = `${tiltNorm * tiltHeight}px`;

}



//Update Pan Tilt
renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();

    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast from camera through mouse
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(sphere);
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        const spherical = new THREE.Spherical().setFromVector3(point);

        let pan = -spherical.theta * (180 / Math.PI) + 90;   // Azimuth
        let tilt = -spherical.phi * (180 / Math.PI) + 90;    // Polar
        if (pan > 180) pan -= 360;
        label.textContent = `Pan: ${pan.toFixed(2)}, Tilt: ${tilt.toFixed(2)}`;
    } else {
        label.textContent = `Pan: --, Tilt: --`;
    }
});

//Make Grid
let grid_status = true;
function coordGrid() {
    if (grid_status === true) {

        const radius = gen_radius*0.99;
        const segments = 360/45;
        const rings = 180/30;
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const gridGeometry = new THREE.BufferGeometry();
                
        const positions = [];
        // Latitude lines
        for (let i = 1; i < rings; i++) {
            const theta = (i * Math.PI) / rings;
            const ring = [];
            for (let j = 0; j <= segments; j++) {
            const phi = (j * 2 * Math.PI) / segments;
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            ring.push(x, y, z);
            }
            for (let k = 0; k < ring.length - 3; k += 3) {
            positions.push(
                ring[k], ring[k + 1], ring[k + 2],
                ring[k + 3], ring[k + 4], ring[k + 5]
            );
            }
        }
        // Longitude lines
        for (let i = 0; i < segments; i++) {
            const phi = (i * 2 * Math.PI) / segments;
            const line = [];
            for (let j = 0; j <= rings; j++) {
            const theta = (j * Math.PI) / rings;
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            line.push(x, y, z);
            }
            for (let k = 0; k < line.length - 3; k += 3) {
            positions.push(
                line[k], line[k + 1], line[k + 2],
                line[k + 3], line[k + 4], line[k + 5]
            );
            }
        }
            const labelGroup = new THREE.Group();
            labelGroup.name = 'gridlabels';
            scene.add(labelGroup);
                // Function to create text sprite
            function makeLabel(text, position) {
                console.log('help');
                const canvas = document.createElement('canvas');
                canvas.width = 1024; // 2x width
                canvas.height = 512; // 2x height
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white';
                ctx.font = '80px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false});
                const sprite = new THREE.Sprite(material);

                const labelSize = gen_radius * 0.5; // adjust this multiplier
                sprite.scale.set(labelSize, labelSize / 2, 1);

                // Position the label slightly off the surface of the sphere
                sprite.position.copy(position.clone().multiplyScalar(1.05));
                sprite.name = 'gridlabels';
                sprite.position.copy(position.clone().multiplyScalar(1.1));

                const labelGroup = scene.getObjectByName('gridlabels');
                if (labelGroup) labelGroup.add(sprite);
            }

            // Add labels for latitude (horizontal)
            [ -90, -60, -30, 0, 30, 60, 90 ].forEach(lat => {
                const theta = THREE.MathUtils.degToRad(90 - lat);
                const phi = 0; // Prime meridian
                const x = (radius) * Math.sin(theta) * Math.cos(phi);
                const y = (radius) * Math.cos(theta);
                const z = (radius) * Math.sin(theta) * Math.sin(phi);
                makeLabel(`${lat}°`, new THREE.Vector3(x, y, z));
            });

            // Add labels for longitude (vertical arcs)
            [ 0, 45, 90, 135, 180, -45, -90, -135 ].forEach(lon => {
                const theta = Math.PI / 2; // Equator
                const phi = THREE.MathUtils.degToRad(lon);
                const x = (radius) * Math.sin(theta) * Math.cos(phi);
                const y = (radius) * Math.cos(theta);
                const z = (radius) * Math.sin(theta) * Math.sin(phi);
                makeLabel(`${lon}°`, new THREE.Vector3(x, y, z));
            });

        gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const grid = new THREE.LineSegments(gridGeometry, material);
        scene.add(grid);


        grid.position.set(0, 0, 0);
        grid.name = 'gridlines';
        scene.add(grid);
        grid_status = false;

    } else {
        const grid = scene.getObjectByName('gridlines');
        if (grid) scene.remove(grid);
        const gridlabels = scene.getObjectByName('gridlabels');
        if (gridlabels) scene.remove(gridlabels);
        grid_status = true;
    }
}