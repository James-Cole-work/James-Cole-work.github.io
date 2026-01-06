//sets up the initial constraints of the graphical interface canvas.
let panMarker, tiltMarker;  // declared early

const container = document.getElementById('threejs-canvas');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.transparent=true;
    renderer.alpha=true;
    container.appendChild(renderer.domElement);

    let sphere; 
    let sphereGroup;
    let gen_radius = 1000; //general radius for spheres
    let sphereCoords;
    let mapTransform;
    let mapWidth;
    let mapHeight;

    const viewSize = gen_radius/5; // controls how much of the inside is visible
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1500);

    camera.position.set(-0.1, 0, 0);

    //const axesHelper = new THREE.AxesHelper(100);
    //axesHelper.material.transparent = true;
    //axesHelper.material.opacity = 0.5;
    //scene.add(axesHelper); 

    //controls for camera operation
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

    controls.mouseButtons = { //set up controls of mouse on camera
    LEFT: THREE.MOUSE.ROTATE  ,
    MIDDLE:null,
    RIGHT: null 
    };

//custom zoom function to better suit the needs of PASTI
function zoomCamera(delta) {

    camera.fov = THREE.MathUtils.clamp(camera.fov + delta, 20, 60);
    camera.updateProjectionMatrix();

}
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomCamera(e.deltaY * 0.05);
}, { passive: false });


//sets up a red line at 180/-180 to aid user
const radius = 750;
const curve = new THREE.CatmullRomCurve3([]);

for (let lat = -90; lat <= 90; lat += 1) {
  const theta = THREE.MathUtils.degToRad(90 - lat);
  const phi = THREE.MathUtils.degToRad(180);
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);
  curve.points.push(new THREE.Vector3(x, y, z));
}
const tubeGeometry = new THREE.TubeGeometry(curve,128, 1, 100, false);
const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const thickLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(thickLine);

//creating a hud element
const hud = document.createElement('div');
hud.id = 'hud';
hud.style.position = 'absolute';
hud.style.top = '0';
hud.style.left = '0';
hud.style.width = '100%';
hud.style.height = '100%';
hud.style.zIndex = '0'; // lower than UI elements like sidebars/buttons
hud.style.pointerEvents = 'none';
document.body.appendChild(hud);
//sets up ruler in lon and lat

const panBar = document.createElement('div');
panBar.style.position = 'absolute';
panBar.style.top = '0px';
panBar.style.left = '2vh';
panBar.style.width = '99vw';
panBar.style.height = '2vh';
panBar.style.backgroundColor = '#fff';
panBar.style.zIndex = '1';
hud.appendChild(panBar);






panMarker = document.createElement('div');
panMarker.style.position = 'absolute';
panMarker.style.top = '0px';
panMarker.style.width = '2px';
panMarker.style.height = '100%';
panMarker.style.backgroundColor = 'red';
panSpan = document.createElement('div');
panSpan.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
panSpan.style.position = 'absolute'
panSpan.style.height = '100%';
panSpan.style.width = '2vh';

panBar.appendChild(panSpan);
panBar.appendChild(panMarker);

const tiltBar = document.createElement('div');
tiltBar.style.position = 'absolute';
tiltBar.style.top = '2vh';
tiltBar.style.left = '0px';
tiltBar.style.width = '2vh';
tiltBar.style.height = '98vh';
tiltBar.style.backgroundColor = '#fff';
tiltBar.style.zIndex = '1';
hud.appendChild(tiltBar);

tiltMarker = document.createElement('div');
tiltMarker.style.position = 'absolute';
tiltMarker.style.left = '0px';
tiltMarker.style.width = '100%';
tiltMarker.style.height = '2px';
tiltMarker.style.backgroundColor = 'blue';
tiltSpan = document.createElement('div');
tiltSpan.style.backgroundColor = 'rgba(0, 242, 255, 0.15)';
tiltSpan.style.position = 'absolute'
tiltSpan.style.left = '0px';
tiltSpan.style.width = '100%';
tiltSpan.style.height = '2px';
tiltBar.appendChild(tiltSpan);
tiltBar.appendChild(tiltMarker);


const panLabelContainer = document.createElement('div');
panLabelContainer.style.position = 'absolute';
panLabelContainer.style.top = '0.2vh';
panLabelContainer.style.left = '4vh';
panLabelContainer.style.width = '97vw';
panLabelContainer.style.height = panBar.style.height;
panLabelContainer.style.zIndex = '2';
panLabelContainer.style.pointerEvents = 'none';
hud.appendChild(panLabelContainer);

// Label every 45° from -180° to +180°
for (let angle = -180; angle <= 180; angle += 45) {
  const label = document.createElement('div');
  label.style.position = 'absolute';
    const containerHeight = panLabelContainer.clientHeight;
    label.style.fontSize = `${containerHeight * 0.03}vw`; // 80% of container height
    label.style.lineHeight = `${containerHeight * 0.03}vw`;
  label.style.color = '#000';
  label.style.fontFamily = 'monospace';
  label.style.top = '0';
  label.style.transform = 'translateX(-50%)';
  label.textContent = `${angle}°`;
  const norm = (180-angle) / 360; // map -180..180 to 0..1
  label.style.left = `${norm * 100}%`;
  panLabelContainer.appendChild(label);
}

const tiltLabelContainer = document.createElement('div');
tiltLabelContainer.style.position = 'absolute';
tiltLabelContainer.style.top = '3vh';
tiltLabelContainer.style.left = '0vw';
tiltLabelContainer.style.width = tiltBar.style.width;
tiltLabelContainer.style.height = '95vh';
tiltLabelContainer.style.zIndex = '102';
tiltLabelContainer.style.pointerEvents = 'none';
document.body.appendChild(tiltLabelContainer);

// Label every 30° from -90° to +90°
for (let angle = -90; angle <= 90; angle += 30) {
  const label = document.createElement('div');
  label.style.position = 'absolute';
  label.style.left = '0.1vh';
    const containerWidth = tiltLabelContainer.clientWidth;
    label.style.fontSize = `${containerWidth*0.03}vw`; // 80% of container height
    label.style.lineHeight = `${containerWidth*0.03}vw`;
  label.style.color = '#000';
  label.style.fontFamily = 'monospace';
  label.textContent = `${angle}°`;
  const norm = (angle+90) / 180; // map +90..-90 to 0..1
  label.style.top = `${norm * 99}%`;
  label.style.transform = 'translateX(-20%) rotate(-90deg)';
  tiltLabelContainer.appendChild(label);
}


//Update ruler marker as you pan the camera around
function updateCameraRulers() {
    if (!panMarker || !tiltMarker) return; // wait until they're ready
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction); 

    const spherical = new THREE.Spherical();
    spherical.setFromVector3(direction);

    let pan = spherical.theta * (180 / Math.PI) - 90;  
    let tilt = spherical.phi * (180 / Math.PI) - 90;   

    if (pan > -270 && pan < -180) pan += 360;

    const panNorm = (-pan + 180) / 360; 
    const panWidth = panBar.clientWidth;
    panMarker.style.left = `${panNorm * panWidth}px`;
   
   
    const fovMin = 20;
    const fovMax = 60;
    const lonMin = 37.8;
    const lonMax = 96.5;


    let t = (camera.fov - fovMin) / (fovMax - fovMin);
    let lon = lonMin + t * (lonMax - lonMin);

    const panfraction =    lon   /360; 
    const panFractionWidth = panfraction * panWidth;

    panSpan.style.width = `${panFractionWidth}px`;
    panSpan.style.left = `${panNorm * panWidth-panFractionWidth/2}px`;

    const tiltNorm = (90 + tilt) / 180; 
    const tiltHeight = tiltBar.clientHeight;
    tiltMarker.style.top = `${tiltNorm * tiltHeight}px`;


    const latMin = 19.8    ;
    const latMax = 59.2;


    let y = (camera.fov - fovMin) / (fovMax - fovMin);
    let lat = latMin + y * (latMax - latMin);
    const tiltfraction = lat/180; 
    const tiltFractionHeight = tiltfraction * tiltHeight;

    tiltSpan.style.height = `${tiltFractionHeight}px`;
    tiltSpan.style.top = `${tiltNorm * tiltHeight-tiltFractionHeight/2}px`;




}



const label = document.createElement('div');
label.style.position = 'absolute';
label.style.bottom = '0.05rem';
label.style.left = '40vw';
label.style.width = '20vw';
label.style.textAlign = 'center';
label.style.padding = '1px';
label.style.background = 'rgba(0,0,0,0.5)';
label.style.color = 'white';
label.style.fontFamily = 'monospace';
label.style.zIndex = '100';
label.style.fontSize = '1vw'
document.body.appendChild(label);

//Update Pan Tilt
renderer.domElement.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();

    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const target = sphereGroup || sphere; // fallback to sphere if group is null/undefined
    if (target) {
    const intersects = raycaster.intersectObject(target, target.type === "Group");
    
    if (intersects.length > 0) {
        const point = intersects[0].point;
        const spherical = new THREE.Spherical().setFromVector3(point);

        let pan = spherical.theta * (180 / Math.PI) - 90;  
        let tilt = spherical.phi * (180 / Math.PI) - 90;   

        if (pan > -270 && pan < -180) pan += 360;
        
        function fmt(num, width = 7, decimals = 2) {
        const space = "\u2007"; // figure space (same width as digits)
        
        // Round and fix decimal places
        const str = Math.abs(num).toFixed(decimals); 
        
        // Add either a minus or a placeholder space for the sign
        const signed = num < 0 ? `-${str}` : `${space}${str}`;
        
        // Pad to fixed width (ensures numbers like 0.00 and 180.00 align)
        return signed.padStart(width, space);
        }

        label.textContent = `Pan: ${fmt(pan)}, Tilt: ${fmt(tilt)}`; // space in place of "+"

    } else {
        label.textContent = `Pan: --, Tilt: --`;
    }}
});

//Make Gridlines on sphere if required, optional tickbox
let grid_status = true;
function coordGrid() {
    if (grid_status === true) {
        const existingGrid = scene.getObjectByName('gridlines');
        if (existingGrid) scene.remove(existingGrid);
        const radius = gen_radius*0.99;
        const segments = 360/45;
        const rings = 180/30;
        const material = new THREE.LineBasicMaterial({  color: 0x00FF00});
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
            function makeLabel(text, position) {
                const canvas = document.createElement('canvas');
                canvas.width = 1024; 
                canvas.height = 512;
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

                const labelSize = gen_radius * 0.5; 
                sprite.scale.set(labelSize, labelSize / 2, 1);

                sprite.name = 'gridlabels';
                sprite.position.copy(position.clone().multiplyScalar(1.1));

                const labelGroup = scene.getObjectByName('gridlabels');
                if (labelGroup) labelGroup.add(sprite);
            }

            // Add labels for latitude (horizontal)
            [ -90, -60, -30, 0, 30, 60, 90 ].forEach(lat => {
                const theta = THREE.MathUtils.degToRad(90 - lat);
                const phi = 0;                 
                const x = (radius) * Math.sin(theta) * Math.cos(phi);
                const y = (radius) * Math.cos(theta);
                const z = (radius) * Math.sin(theta) * Math.sin(phi);
                makeLabel(`${-lat}°`, new THREE.Vector3(x, y, z));
            });

            // Add labels for longitude (vertical arcs)
            [ 0, 45, 90, 135, 180, -45, -90, -135 ].forEach(lon => {
                const theta = Math.PI / 2;
                const phi = THREE.MathUtils.degToRad(lon);
                const x = (radius) * Math.sin(theta) * Math.cos(phi);
                const y = (radius) * Math.cos(theta);
                const z = (radius) * Math.sin(theta) * Math.sin(phi);
                makeLabel(`${-lon}°`, new THREE.Vector3(x, y, z));
            });

        gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const grid = new THREE.LineSegments(gridGeometry, material);

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


//logos and images and such

const panCamLogo = document.createElement('img');
panCamLogo.id = 'PanCamLogo';
panCamLogo.src = 'PanCamLogo.png'
hud.appendChild(panCamLogo);
