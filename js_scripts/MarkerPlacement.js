//places markers or patches placed by the user
function placeMarker(position, data) {
  if (clicks.length < 2) {
    const starShape = createStarShape(3, 8, 8);
    const geometry = new THREE.ShapeGeometry(starShape);
    const material = new THREE.MeshBasicMaterial({
      color: markerColor,
      side: THREE.DoubleSide,
    });
    const marker = new THREE.Mesh(geometry, material);
    markerit += 1;
    marker.position.copy(position);
    const offset = 200 + Math.random() * 10;
    const direction = position.clone().normalize();
    marker.position.add(direction.multiplyScalar(-offset));
    const center = new THREE.Vector3(0, 0, 0);
    marker.lookAt(center);
    marker.userData = data;
    marker.userData.id = markerit;
    scene.add(marker);
    markers.push(marker);
  } else {
    const marker = new THREE.Mesh(
      new THREE.CircleGeometry(5, 15),
      new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      }),
    );

    markerit += 1;
    marker.position.copy(position);
    const offset = 250 + Math.random() * 10;

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
//draws markers and patches from a local uploaded json file
function localMarker(position, data) {
  if (data && data.mouse) {
    if (data.mouse.length < 2) {
      console.log("marker");
      const starShape = createStarShape(3, 8, 8);
      const geometry = new THREE.ShapeGeometry(starShape);
      const material = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
      });
      const marker = new THREE.Mesh(geometry, material);
      markerit += 1;
      marker.position.copy(position);
      const offset = 200 + Math.random() * 10;
      const direction = position.clone().normalize();
      marker.position.add(direction.multiplyScalar(-offset));
      const center = new THREE.Vector3(0, 0, 0);
      marker.lookAt(center);
      marker.userData = data;
      marker.userData.id = markerit;
      marker.push(markerColor);
      scene.add(marker);
      markers.push(marker);
    } else {
      const pointA = data.mouse[0];
      const pointB = data.mouse[1];
      console.log("patch", pointA, data.mouse);
      const mesh = makeSpherePatchGeo(pointA, pointB);
      meshes.push(mesh);
      scene.add(mesh);
      const marker = new THREE.Mesh(
        new THREE.CircleGeometry(5, 15),
        new THREE.MeshBasicMaterial({
          color: 0xff0000,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1,
        }),
      );
      markerit += 1;
      marker.position.copy(position);
      const offset = 250 + 10 * markerit;
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
}

//allows user to clear all markers and patches currently drawn by user
function clearMarkers() {
  markers.forEach((marker) => {
    scene.remove(marker);
    if (marker.geometry) {
      marker.geometry.dispose();
    }
    if (marker.material) {
      marker.material.dispose();
    }
  });

  meshes.forEach((mesh) => {
    scene.remove(mesh);
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      mesh.material.dispose();
    }
  });
  markers.length = 0;
  markerit = 0;
  markers.clear;
  suggestionid = 0;
}

//patch drawing functions
let isDrawing = false;
let startPoint = null;
let currentPatch = null;
let lastDrawnPatch = null;

let currentMap = {
  phiStart: 0,
  phiLength: 2 * Math.PI,
  thetaStart: 0,
  thetaLength: Math.PI,
};

var phiA = null;
var phiB = null;
var thetaA = null;
var thetaB = null;
//draws the spherically transposed patches
function makeSpherePatchGeo(pointA, pointB) {
  const sphericalA = new THREE.Spherical().setFromVector3(pointA);
  const sphericalB = new THREE.Spherical().setFromVector3(pointB);

  phiA = (sphericalA.phi + 2 * Math.PI) % (2 * Math.PI);
  phiB = (sphericalB.phi + 2 * Math.PI) % (2 * Math.PI);
  thetaA = (sphericalA.theta + 2 * Math.PI) % (2 * Math.PI);
  thetaB = (sphericalB.theta + 2 * Math.PI) % (2 * Math.PI);

  let dPhi = phiB - phiA;
  if (Math.abs(dPhi) > Math.PI) {
    if (dPhi > 0) phiA += 2 * Math.PI;
    else phiB += 2 * Math.PI;
  }

  let dTheta = thetaB - thetaA;
  if (Math.abs(dTheta) > Math.PI) {
    if (dTheta > 0) thetaA += 2 * Math.PI;
    else thetaB += 2 * Math.PI;
  }

  const phiMin = Math.min(phiA, phiB);
  const phiMax = Math.max(phiA, phiB);
  const thetaMin = Math.min(thetaA, thetaB);
  const thetaMax = Math.max(thetaA, thetaB);
  const phiStart = phiMin;
  const phiLength = phiMax - phiMin;
  const thetaStart = thetaMin;
  const thetaLength = thetaMax - thetaMin;

  const geom = new THREE.SphereGeometry(
    gen_radius - (250 + 10 * markerit),
    32,
    32,
    thetaStart + Math.PI / 2,
    thetaLength,
    phiStart,
    phiLength,
  );

  const mat = new THREE.MeshBasicMaterial({
    color: markerColor,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = "drawnPatch";

  return mesh;
}

//Marker Functions

let marker_status = true;

function markerShow() {
  if (marker_status === true) {
    markers.forEach((marker) => {
      scene.remove(marker);
    });
    meshes.forEach((mesh) => {
      scene.remove(mesh);
    });
    marker_status = false;
  } else {
    markers.forEach((marker) => {
      scene.add(marker);
    });
    meshes.forEach((mesh) => {
      scene.add(mesh);
    });
    marker_status = true;
  }
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};
