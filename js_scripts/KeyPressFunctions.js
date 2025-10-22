let wacPreview = null;
let wPressed = false;

let hrcPreview = null;
let hPressed = false;

let enfysPreview = null;
let ePressed = false;

function onMouseMove1(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    const intersectPoint = intersects[0].point.clone();

    // Convert intersection point to spherical coordinates
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(intersectPoint);

    if (wacPreview) {
      scene.remove(wacPreview);
      wacPreview.geometry.dispose();
      wacPreview.material.dispose();
      wacPreview = null;
    }

    const wacangle = 38.3/2 * (Math.PI / 180);

    wacPreview = new THREE.Mesh(
      new THREE.SphereGeometry(
        gen_radius - 0.2,
        16,
        16,
        spherical.theta + Math.PI / 2 - wacangle,
        wacangle * 2,
        spherical.phi - wacangle,
        wacangle * 2
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
        depthTest: false,
      }))

    wacPreview.position.set(0, 0, 0);
    scene.add(wacPreview);
  
  }
}
function onMouseMove2(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    const intersectPoint = intersects[0].point.clone();

    // Convert intersection point to spherical coordinates
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(intersectPoint);

    if (hrcPreview) {
      scene.remove(hrcPreview);
      hrcPreview.geometry.dispose();
      hrcPreview.material.dispose();
      hrcPreview = null;
    }

    const hrcangle = 4.88/2 * (Math.PI / 180);

    hrcPreview = new THREE.Mesh(
      new THREE.SphereGeometry(
        gen_radius - 0.2,
        16,
        16,
        spherical.theta + Math.PI / 2 - hrcangle,
        hrcangle * 2,
        spherical.phi - hrcangle,
        hrcangle * 2
      ),
      new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
        depthTest: false,
      }))

    hrcPreview.position.set(0, 0, 0);
    scene.add(hrcPreview);
  
  }
}

function onMouseMove3(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    const intersectPoint = intersects[0].point.clone();

    // Convert intersection point to spherical coordinates
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(intersectPoint);

    if (enfysPreview) {
      scene.remove(enfysPreview);
      enfysPreview.geometry.dispose();
      enfysPreview.material.dispose();
      enfysPreview = null;
    }

    const enfysangle = 0.5 * (Math.PI / 180);

    enfysPreview = new THREE.Mesh(
      new THREE.SphereGeometry(
        gen_radius - 0.2,
        16,
        16,
        spherical.theta + Math.PI / 2 - enfysangle,
        enfysangle * 2,
        spherical.phi - enfysangle,
        enfysangle * 2
      ),
      new THREE.MeshBasicMaterial({
        color: 0x00FF00,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
        depthTest: false,
      })
    );

    enfysPreview.position.set(0, 0, 0);
    scene.add(enfysPreview);
  }
}


function onKeyDownWac(event) {
  if (event.key === "w" && !wPressed) {
    wPressed = true;
    renderer.domElement.addEventListener("mousemove", onMouseMove1);
  }
}

function onKeyUpWac(event) {
  if (event.key === "w") {
    wPressed = false;
    renderer.domElement.removeEventListener("mousemove", onMouseMove1);

    if (wacPreview) {
      scene.remove(wacPreview);
      wacPreview.geometry.dispose();
      wacPreview.material.dispose();
      wacPreview = null;
    }
  }
}


function onKeyDownHrc(event) {
  if (event.key === "h" && !hPressed) {
    hPressed = true;
    renderer.domElement.addEventListener("mousemove", onMouseMove2);
  }
}

function onKeyUpHrc(event) {
  if (event.key === "h") {
    hPressed = false;
    renderer.domElement.removeEventListener("mousemove", onMouseMove2);

    if (hrcPreview) {
      scene.remove(hrcPreview);
      hrcPreview.geometry.dispose();
      hrcPreview.material.dispose();
      hrcPreview = null;
    }
  }
}

function onKeyDownEnfys(event) {
  if (event.key === "e" && !ePressed) {
    ePressed = true;
    renderer.domElement.addEventListener("mousemove", onMouseMove3);
  }
}

function onKeyUpEnfys(event) {
  if (event.key === "e") {
    ePressed = false;
    renderer.domElement.removeEventListener("mousemove", onMouseMove3);

    if (enfysPreview) {
      scene.remove(enfysPreview);
      enfysPreview.geometry.dispose();
      enfysPreview.material.dispose();
      enfysPreview = null;
    }
  }
}

window.addEventListener("keydown", onKeyDownWac);
window.addEventListener("keyup", onKeyUpWac);

window.addEventListener("keydown", onKeyDownHrc);
window.addEventListener("keyup", onKeyUpHrc);

window.addEventListener("keydown", onKeyDownEnfys);
window.addEventListener("keyup", onKeyUpEnfys);
