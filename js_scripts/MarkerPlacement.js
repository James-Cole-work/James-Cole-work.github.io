function placeMarker(position, data) {


if (clicks.length < 2){
  textureLoader.load('Flag.png', (markerTexture) => {

  const marker = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshBasicMaterial({ map: markerTexture, side: THREE.DoubleSide,   transparent: true})
  )


  markerit += 1;
  marker.position.copy(position);

  const offset = gen_radius*0.01;

  const direction = position.clone().normalize(); 
  marker.position.add(direction.multiplyScalar(-offset));
  const center = new THREE.Vector3(0, 0, 0); 
  marker.lookAt(center);

  marker.userData = data;
  marker.userData.id = markerit;

  scene.add(marker);
  markers.push(marker);

  });
  }
else{
  
  //const marker = scene.getObjectByName('currentPatch');



  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(5, 15),
    new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide,   transparent: true, opacity : 1})
  )

  markerit += 1;
  marker.position.copy(position);

  const offset = gen_radius/10;

  const direction = position.clone().normalize(); 
  marker.position.add(direction.multiplyScalar(-offset));
  const center = new THREE.Vector3(0, 0, 0); 
  marker.lookAt(center);

  marker.userData = data;
  marker.userData.id = markerit;

  scene.add(marker);
  markers.push(marker);

}
}






function clearMarkers() {
  // 1. Remove each marker from scene and dispose resources
  markers.forEach(marker => {
    scene.remove(marker);

    // dispose geometry
    if (marker.geometry) {
      marker.geometry.dispose();
    }
    // dispose material
    if (marker.material) {
      marker.material.dispose();
    }
  });

  // 2. Clear the markers array
  markers.length = 0;

  // 3. (Optional) Reset the ID counter
  markerit = 0;

  markers.clear;
}

let isDrawing = false;
let startPoint = null;
let currentPatch = null;
let patchIt = 0;
let lastDrawnPatch = null;

let currentMap = {
  phiStart: 0,
  phiLength: 2 * Math.PI,
  thetaStart: 0,
  thetaLength: Math.PI
};

var phiA = null;
var phiB = null;
var thetaA = null;
var thetaB = null;
// Rectangle generator that respects map transform
function makeSpherePatchGeo(pointA, pointB, patchIt) {


  const sphericalA = new THREE.Spherical().setFromVector3(pointA);
  const sphericalB = new THREE.Spherical().setFromVector3(pointB);

  // Normalize angles to [0, 2π)
  phiA = (sphericalA.phi + 2*Math.PI) % (2*Math.PI);
  phiB = (sphericalB.phi + 2*Math.PI) % (2*Math.PI);
  thetaA = (sphericalA.theta + 2*Math.PI) % (2*Math.PI);
  thetaB = (sphericalB.theta + 2*Math.PI) % (2*Math.PI);

  // Compute minimal angular difference
  let dPhi = phiB - phiA;
  if (Math.abs(dPhi) > Math.PI) {
    // cross 0°/360° seam — go the shorter way
    if (dPhi > 0) phiA += 2*Math.PI;
    else phiB += 2*Math.PI;
  }

  let dTheta = thetaB - thetaA;
  if (Math.abs(dTheta) > Math.PI) {
    if (dTheta > 0) thetaA += 2*Math.PI;
    else thetaB += 2*Math.PI;
  }

  // Sort corrected ranges
  const phiMin = Math.min(phiA, phiB);
  const phiMax = Math.max(phiA, phiB);
  const thetaMin = Math.min(thetaA, thetaB);
  const thetaMax = Math.max(thetaA, thetaB)
  const phiStart = phiMin;
  const phiLength = phiMax - phiMin;
  const thetaStart = thetaMin;
  const thetaLength = thetaMax - thetaMin;

  const geom = new THREE.SphereGeometry(
    gen_radius*0.95- 200*Math.random(),
    32, 32,
    thetaStart + Math.PI/2,
    thetaLength,
    phiStart,
    phiLength
  );

  patchIt = patchIt +1;

  const mat = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = "drawnPatch";
  return mesh;
}



//Marker Functions
    
let marker_status = true;

function markerShow() {

    if (marker_status === true) {
    markers.forEach(marker => {
        scene.remove(marker);

    });
    marker_status = false;
    } else {
        markers.forEach(marker => {
        scene.add(marker);
    });
    marker_status = true;

    }
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
        }
    }
    }
}