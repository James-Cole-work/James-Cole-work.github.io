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
      mapHeight: data.image_height,
    };
  } catch (error) {
    console.error(`Failed to load ${jsonPath}:`, error);
    return null;
  }
}

window.currentTexturePath = "SelectSol";
window.lastTexturePath = null;
let TextureLoad = null;
let CoordsLoad = null;
let transConst = (90 / 100) * (Math.PI / 180);
const textureLoader = new THREE.TextureLoader();

//Loads the selected texture depending on the user selection, will need to be updated in the future to gather from server
const loader = new THREE.TextureLoader();
loader.load(
  "PlaceHolderData/mars1.png", // Path to texture
  (texture) => {
    const radius = gen_radius;
    const widthSegments = 32;
    const heightSegments = 64;
    const phiStart = 0;
    const phiLength = Math.PI * 2;
    const thetaStart = 0;
    const thetaLength = Math.PI;

    const geometry = new THREE.SphereGeometry(
      gen_radius,
      widthSegments,
      heightSegments,
      phiStart,
      phiLength,
      thetaStart,
      thetaLength,
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0xd3d3d3,
      wireframe: true,
    });

    sphere = new THREE.Mesh(geometry, material);
    sphere.name = "mySphere";
    scene.add(sphere);

    animate(); // Start animation once texture is loaded
  },
  undefined,
  (error) => {
    console.error("Error loading texture:", error);
  },
);

// keeps open for when texture may be changed to a different sol, will need to update to work with server rather than these manual inputs

let image_i = 0;

async function loadSelectedTexture(solName, selectedTexturesWithIndex = null) {
  if (sphereGroup) {
    scene.remove(sphereGroup);
    sphereGroup.children.forEach((child) => {
      if (child.material.map) child.material.map.dispose();
      child.material.dispose();
      child.geometry.dispose();
    });
    sphereGroup = null;
  }

  if (sphere) sphere.visible = false;

  const texturesArray =
    selectedTexturesWithIndex ||
    textureFilesMap[solName]?.map((file, i) => ({ file, index: i })) ||
    [];
  const coords = coordsFilesMap[solName] || [];

  if (texturesArray.length === 0) {
    console.warn(`No textures found for ${solName}`);
    sphere.visible = false;
    return;
  }

  // MULTI-TEXTURE CASE
  if (texturesArray.length > 1) {
    sphere.visible = false;
    sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    const results = await Promise.all(
      texturesArray.map(
        ({ file, index }) =>
          new Promise((resolve) => {
            textureLoader.load(file, (tex) => {
              loadJsonData(coords[index]).then((data) =>
                resolve({ tex, data }),
              );
            });
          }),
      ),
    );

    results.forEach(({ tex, data }, i) => {
      if (!data) return;

      const widthSegments = 32;
      const heightSegments = 64;
      const phiStart = data.mapTransform[0] * transConst;
      const phiLength = data.mapTransform[1] * data.mapWidth * transConst;
      const thetaStart = Math.PI - data.mapTransform[3] * transConst;
      const thetaLength = data.mapTransform[5] * data.mapHeight * transConst;

      const radius = gen_radius - Math.random() * 15 * i; // keep consistent radius

      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.BackSide,
      });

      const geo = new THREE.SphereGeometry(
        radius,
        widthSegments,
        heightSegments,
        phiStart,
        phiLength,
        thetaStart,
        thetaLength,
      );

      const mesh = new THREE.Mesh(geo, mat);
      sphereGroup.add(mesh);
    });

    console.log(`Multi-texture load complete for ${solName}`);

    // SINGLE TEXTURE CASE
  } else {
    console.log(
      `Loading single texture for ${solName}: ${texturesArray[0].file}`,
    );
    sphere.visible = true;

    const { file, index } = texturesArray[0];

    const tex = await new Promise((resolve) =>
      textureLoader.load(file, resolve),
    );
    const data = await loadJsonData(coords[index]);
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
      thetaLength,
    );

    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;

    sphere.material = new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.BackSide,
    });

    console.log(`Single-texture load complete for ${solName}`);
  }
}
