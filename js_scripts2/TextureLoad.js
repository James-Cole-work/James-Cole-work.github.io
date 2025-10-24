
//Gathers the data from the outputted json files, may need different inputs in the future
async function loadJsonData(jsonPath) {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return {
                sphereCoords: data.geometry_information.sphere_center,
                mapTransform: data.map_transformation,
                mapWidth: data.image_width,
                mapHeight: data.image_height



    };
  } catch (error) {
    console.error(`Failed to load ${jsonPath}:`, error);
    return null;
  }
}



let markerit  = 0;


window.currentTexturePath = 'SelectSol';
window.lastTexturePath = null;
let TextureLoad = null;
let CoordsLoad = null;
let transConst = (100/90)*(Math.PI/180)
const textureLoader = new THREE.TextureLoader();

//Loads the selected texture depending on the user selection, will need to be updated in the future to gather from server
  const loader = new THREE.TextureLoader();
  loader.load(
'mars1.png', // Path to texture
(texture) => {

  const radius = gen_radius;
  const widthSegments = 32
  const heightSegments = 64
  const phiStart = 0
  const phiLength = Math.PI*2
  const thetaStart = 0
  const thetaLength = Math.PI

  const geometry = new THREE.SphereGeometry(gen_radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,       wireframe: true,         });

  sphere = new THREE.Mesh(geometry, material);
  sphere.name = "mySphere";
  scene.add(sphere);

  animate(); // Start animation once texture is loaded
},
undefined, 
(error) => {
  console.error('Error loading texture:', error);
}
);
    
// keeps open for when texture may be changed to a different sol, will need to update to work with server rather than these manual inputs

let image_i = 0;

document.getElementById('solSelect').addEventListener('change', (e) => {
  currentTexturePath = e.target.innerHTML;
  clearMarkers();
  let str = currentTexturePath;
  let result = str.split(/\s+/).slice(0, 2).join(" ");

  loadSelectedTexture(result); // NEW: triggers texture loading immediately
  console.log('Sol Initialised:', result);
});

async function loadSelectedTexture(solName) {
  clearMarkers();
  if (sphereGroup) {
    scene.remove(sphereGroup);
    sphereGroup.children.forEach(child => {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
      child.geometry.dispose();
    });
    sphereGroup = null;
  }

  if (sphere) {
    sphere.visible = false;
  }
  // --- Fetch lists of textures and coordinate files ---
  const textures = textureFilesMap[solName] || [];
  const coords = coordsFilesMap[solName] || [];

  // --- MULTI-TEXTURE CASE ---
  if (textures.length > 1) {
    sphere.visible = false;
    sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Load all textures + JSONs in parallel but preserve order  - stops incorrect layering
    const results = await Promise.all(
      textures.map((file, i) =>
        new Promise(resolve => {
          textureLoader.load(file, tex => {
            loadJsonData(coords[i]).then(data => resolve({ tex, data }));
          });
        })
      )
    );

    results.forEach(({ tex, data }, i) => {
      if (!data) return;

      const widthSegments = 32;
      const heightSegments = 64;
      const phiStart = data.mapTransform[0] * transConst;
      const phiLength = data.mapTransform[1] * data.mapWidth * transConst;
      const thetaStart = Math.PI - data.mapTransform[3] * transConst;
      const thetaLength = data.mapTransform[5] * data.mapHeight * transConst;

      const radiusOffset = Math.random() * 50 * i;
      const radius = gen_radius - radiusOffset;

      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide
      });

      const geo = new THREE.SphereGeometry(
        radius,
        widthSegments,
        heightSegments,
        phiStart,
        phiLength,
        thetaStart,
        thetaLength
      );

      const mesh = new THREE.Mesh(geo, mat);
      sphereGroup.add(mesh);
    });

    console.log(`Multi-texture load complete for ${solName}`);

  // --- SINGLE TEXTURE CASE ---
  } else if (textures.length === 1) {
    console.log(`Loading single texture for ${solName}: ${textures[0]}`);
    sphere.visible = true;

    const tex = await new Promise(resolve => textureLoader.load(textures[0], resolve));
    const data = await loadJsonData(coords[0]);
    if (!data) return;

    const widthSegments = 32;
    const heightSegments = 64;
    const phiStart = data.mapTransform[0] * transConst;
    const phiLength = data.mapTransform[1] * data.mapWidth * transConst;
    const thetaStart = Math.PI - data.mapTransform[3] * transConst;
    const thetaLength = data.mapTransform[5] * data.mapHeight * transConst;

    if (sphere.material) sphere.material.dispose();
    sphere.geometry.dispose();

    sphere.geometry = new THREE.SphereGeometry(
      gen_radius,
      widthSegments,
      heightSegments,
      phiStart,
      phiLength,
      thetaStart,
      thetaLength
    );

    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;

    sphere.material = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide
    });

    console.log(`Single-texture load complete for ${solName}`);

  } else {
    console.warn(`No textures found for ${solName}`);
    sphere.visible = false;
  }
}
