async function solSelect1() {
    const response = await fetch('ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture.tif.json');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();

    return {
        sphereCoords: data.geometry_information.sphere_center,
        mapTransform: data.map_transformation,
        mapWidth: data.image_width,
        mapHeight: data.image_height
    };
}       
solSelect1().then(({ sphereCoords, mapTransform, mapWidth, mapHeight }) => {
    // You can now use sphereCoords and mapTransform here
    console.log(sphereCoords, mapTransform, mapWidth, mapHeight);
  
});


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


let currentTexturePath = 'SelectSol';
let lastTexturePath = null;
let TextureLoad = null;
let CoordsLoad = null;
let transConst = (100/90)*(Math.PI/180)
const textureLoader = new THREE.TextureLoader();


  const loader = new THREE.TextureLoader();

  loader.load(
'mars1.png', // Path to texture
(texture) => {
  console.log('Texture loaded successfully');

  const radius = gen_radius;
  const widthSegments = 32
  const heightSegments = 64
  const phiStart = 0
  const phiLength = Math.PI*2
  const thetaStart = 0
  const thetaLength = Math.PI

  const geometry = new THREE.SphereGeometry(gen_radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,       // Blue color
    wireframe: true,       // Show only wireframe
  });

  sphere = new THREE.Mesh(geometry, material);
  sphere.name = "mySphere";
  scene.add(sphere);


  animate(); // Start animation once texture is loaded
},
undefined, // Optional callback for progress (can be omitted)
(error) => {
  console.error('Error loading texture:', error);
}
);
    

function watchTextureChange() {
  if (currentTexturePath !== lastTexturePath) {
    // Texture changed
    lastTexturePath = currentTexturePath;

    if (currentTexturePath == 'Sol1') {
      TextureLoad = 'mars1.png';
      CoordsLoad = 'mars1.json';
      resetView();
    }
    if (currentTexturePath == 'Sol2') {
      TextureLoad = 'ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture_uint8.jpg';
      CoordsLoad = 'ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture.tif.json';
      resetView();
    }

    if (currentTexturePath == 'Sol3') {
      TextureLoad = 'mars1.png';
      CoordsLoad = 'mars2.json';
      resetView();
    }

    
    if (currentTexturePath == 'Sol4') {
      TextureLoad = '2025-10-13_JR_ExoMars_GTM_Products\\PanCam\\2022-10-04_Mini-SVT-1\\S0006Q001_mosaic_left\\Mosaic\\browse\\pan_der_sc_l_mosaic_20221004t103007.137z_20221004t103123.416z.png';
      CoordsLoad = '2025-10-13_JR_ExoMars_GTM_Products\\PanCam\\2022-10-04_Mini-SVT-1\\S0006Q001_mosaic_left\\Mosaic\\browse\\pan_der_sc_l_mosaic_20221004t103007.137z_20221004t103123.416z_ValidateReport.json';
      resetView();
    }


    if (TextureLoad !== null) {
    // Load and update sphere texture
    textureLoader.load(TextureLoad, (newTexture) => {
      clearMarkers();
    
      setTimeout(() => {
        loadJsonData(CoordsLoad).then(data => {

          if (data) {
              const widthSegments = 32;
              const heightSegments = 64;
              const phiStart = data.mapTransform[0]*transConst;
              const phiLength = data.mapTransform[1]*data.mapWidth*transConst;
              const thetaStart = Math.PI - data.mapTransform[3]*transConst;
              const thetaLength = data.mapTransform[5]*data.mapHeight*transConst;

              sphere.geometry = new THREE.SphereGeometry(gen_radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
              sphere.material = new THREE.MeshBasicMaterial({ map: newTexture, side: THREE.BackSide });
              sphere.position.set(0,0,0);

              newTexture.wrapS = THREE.RepeatWrapping;
              newTexture.repeat.x = -1;
              
              currentMap.phiStart = phiStart;
              currentMap.phiLength = phiLength;
              currentMap.thetaStart = thetaStart;
              currentMap.thetaLength = thetaLength;
          }
        });
      }, 2.5);

    });
  }



  }

  requestAnimationFrame(watchTextureChange);
}

watchTextureChange();


document.getElementById('solSelect').addEventListener('change', (e) => {
  currentTexturePath = e.target.value; // triggers update on next check
});