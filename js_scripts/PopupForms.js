// ===================== CONFIG & GLOBALS =====================
const zeroPad = (num, places) => String(num).padStart(places, "0");
const userid = "Cole_User"; // update this from login
let suggestionid = 0;
let markerit = 0;

let clicks = [];
let editingSuggestionId = null; // null = create mode
const suggestionData = [];
let markers = [];
let meshes = [];
let markerType = null;

// Patch drawing
let isDrawing = false;
let startPoint = null;
let currentPatch = null;
let lastDrawnPatch = null;
let lastClickPosition = null;
// ===================== HELPER FUNCTIONS =====================

function setField(form, name, value, isCheckbox = false) {
  const el = form.querySelector(`[name="${name}"]`);
  if (!el) return;
  if (isCheckbox) el.checked = !!value;
  else el.value = value ?? "";
}

function populateModal(data) {
  const form = document.getElementById("markerForm");
  form.reset();

  setField(form, "title", data.title);
  setField(form, "description", data.description);
  setField(form, "intent", data.intent);
  setField(form, "notes", data.notes);

  setField(form, "HRC", data.hrc, true);
  setField(form, "enfys", data.enfys, true);
  setField(form, "wacRGB", data.wacrgb, true);
  setField(form, "wacmulti", data.wacmulti, true);
  setField(form, "mosaic", data.mosaic, true);

  // IDs
  form.querySelector('input[name="suggestionID"]').value = data.suggestionid;
  form.querySelector('input[name="userID"]').value = data.userid;

  // Keywords
  document
    .querySelectorAll('input[name="keywords"]')
    .forEach((cb) => (cb.checked = false));
  if (Array.isArray(data.keywords)) {
    document.querySelectorAll('input[name="keywords"]').forEach((cb) => {
      cb.checked = data.keywords.includes(cb.value);
    });
  }
}

// ===================== MODAL FUNCTIONS =====================

function showMarkerModal(data = null) {
  const modalEl = document.getElementById("markerModal"); // container div
  const modal = new bootstrap.Modal(modalEl);

  if (data) {
    editingSuggestionId = data.suggestionid;
    populateModal(data);
    clicks = data.mouse || [];
  } else {
    editingSuggestionId = null;
    clicks = lastClickPosition ? [lastClickPosition] : [];
    const form = document.getElementById("markerForm");
    form.reset(); // will now work
  }

  modal.show();
}

// ===================== MARKER & PATCH =====================

function placeMarker(position, data) {
  if (!position) return;

  let marker;
  if (!clicks || clicks.length < 2) {
    const shape = createStarShape(3, 8, 8);
    marker = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
      }),
    );
  } else {
    marker = new THREE.Mesh(
      new THREE.CircleGeometry(5, 15),
      new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
      }),
    );
  }

  markerit++;
  marker.position.copy(position);
  const offset = 200 + Math.random() * 10;
  const dir = position.clone().normalize();
  marker.position.add(dir.multiplyScalar(-offset));
  marker.lookAt(new THREE.Vector3(0, 0, 0));

  marker.userData = data;
  marker.userData.id = markerit;

  scene.add(marker);
  markers.push(marker);
}

function makeSpherePatchGeo(pointA, pointB) {
  const sA = new THREE.Spherical().setFromVector3(pointA);
  const sB = new THREE.Spherical().setFromVector3(pointB);

  let phiA = (sA.phi + 2 * Math.PI) % (2 * Math.PI);
  let phiB = (sB.phi + 2 * Math.PI) % (2 * Math.PI);
  let thetaA = (sA.theta + 2 * Math.PI) % (2 * Math.PI);
  let thetaB = (sB.theta + 2 * Math.PI) % (2 * Math.PI);

  if (Math.abs(phiB - phiA) > Math.PI) {
    if (phiB > phiA) phiA += 2 * Math.PI;
    else phiB += 2 * Math.PI;
  }
  if (Math.abs(thetaB - thetaA) > Math.PI) {
    if (thetaB > thetaA) thetaA += 2 * Math.PI;
    else thetaB += 2 * Math.PI;
  }

  const geom = new THREE.SphereGeometry(
    gen_radius - (250 + 10 * markerit),
    32,
    32,
    Math.min(thetaA, thetaB) + Math.PI / 2,
    Math.abs(thetaB - thetaA),
    Math.min(phiA, phiB),
    Math.abs(phiB - phiA),
  );

  return new THREE.Mesh(
    geom,
    new THREE.MeshBasicMaterial({
      color: markerColor,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    }),
  );
}

// ===================== DOUBLE CLICK MARKER =====================

window.addEventListener("dblclick", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  sphere.updateMatrixWorld();

  const target = sphereGroup || sphere;
  const intersects = raycaster.intersectObject(target, target.type === "Group");
  if (!intersects.length) return;

  lastClickPosition = intersects[0].point.clone();
  clicks = [lastClickPosition];

  showMarkerModal();
});

// ===================== PATCH DRAW =====================

renderer.domElement.addEventListener("click", (event) => {
  if (!event.shiftKey) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  raycaster.setFromCamera(mouse, camera);
  const target = sphereGroup || sphere;
  const intersects = raycaster.intersectObject(target, target.type === "Group");
  if (!intersects.length) return;

  const hitPoint = intersects[0].point.clone();

  if (!isDrawing) {
    startPoint = hitPoint;
    isDrawing = true;

    // Create a patch mesh for live preview
    currentPatch = makeSpherePatchGeo(startPoint, startPoint); // zero-size initially
    scene.add(currentPatch);
  } else {
    // Finish drawing
    clicks = [startPoint, hitPoint];
    currentPatch.geometry.dispose(); // dispose old zero-size
    currentPatch.geometry = makeSpherePatchGeo(startPoint, hitPoint).geometry; // final geometry

    meshes.push(currentPatch); // save patch
    currentPatch = null; // stop preview
    startPoint = null;
    isDrawing = false;
    lastClickPosition = hitPoint.clone(); // second click = marker position

    showMarkerModal();
  }
});

renderer.domElement.addEventListener("mousemove", (event) => {
  if (!isDrawing || !startPoint || !currentPatch) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );

  raycaster.setFromCamera(mouse, camera);
  const target = sphereGroup || sphere;
  const intersects = raycaster.intersectObject(target, target.type === "Group");
  if (!intersects.length) return;

  const currentPoint = intersects[0].point.clone();

  // Update the geometry of the existing mesh
  currentPatch.geometry.dispose();
  currentPatch.geometry = makeSpherePatchGeo(startPoint, currentPoint).geometry;
});
// ===================== FORM SUBMIT =====================
document.getElementById("markerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!clicks || !clicks.length) return console.error("No click data!");

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  data.keywords = formData.getAll("keywords");
  data.userid = userid;
  data.mouse = clicks;

  data.hrc = formData.has("HRC");
  data.wac = formData.has("WAC");
  data.enfys = formData.has("Enfys");

  const isEdit = editingSuggestionId !== null;
  data.suggestionid = isEdit ? editingSuggestionId : zeroPad(suggestionid, 4);

  if (!isEdit) {
    suggestionData.push(data);
    placeMarker(lastClickPosition, data);
    addSuggestionRow(data);
    suggestionid++;
  } else {
    const idx = suggestionData.findIndex(
      (d) => d.suggestionid === editingSuggestionId,
    );
    if (idx !== -1) suggestionData[idx] = { ...suggestionData[idx], ...data };

    const marker = markers.find(
      (m) => m.userData.suggestionid === editingSuggestionId,
    );
    if (marker) marker.userData = suggestionData[idx];

    editingSuggestionId = null;
  }
  if (isEdit) {
    const row = document.querySelector(`[data-id="${data.suggestionid}"]`);
    if (row) {
      row.querySelector(".flex-grow-1").textContent = data.position
        ?.filter((v) => v != null)
        .map((v) => v.toFixed(2))
        .join(" ");
    }
  }
  // Hide the modal safely
  const modalEl = document.getElementById("markerModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();

  e.target.reset();
});

// ===================== EDIT & DELETE =====================

function attachRowButtons(row, data) {
  const editBtn = row.querySelector(".edit-btn");
  const deleteBtn = row.querySelector(".delete-btn");

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showMarkerModal(data);
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    markers = markers.filter((m) => {
      if (m.userData.suggestionid === data.suggestionid) {
        scene.remove(m);
        return false;
      }
      return true;
    });

    meshes = meshes.filter((m) => {
      if (m.userData === data.suggestionid) {
        scene.remove(m);
        return false;
      }
      return true;
    });

    const idx = suggestionData.findIndex(
      (d) => d.suggestionid === data.suggestionid,
    );
    if (idx !== -1) suggestionData.splice(idx, 1);

    row.remove();
  });
}
// ===================== CLEAR MARKERS =====================

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

// ===================== MARKER LIST =====================

function addSuggestionRow(data) {
  const list = document.getElementById("markerList");

  const row = document.createElement("div");
  row.className =
    "list-group-item d-flex align-items-center justify-content-between py-1";

  row.dataset.id = data.suggestionid;

  // LEFT: ID
  const left = document.createElement("div");
  left.className = "fw-bold";
  left.textContent = `S. ${data.suggestionid}`;

  // CENTER: PTU / summary
  const center = document.createElement("div");
  center.className = "flex-grow-1 text-center small";
  center.textContent = data.position
    ? data.position
        .filter((v) => v != null)
        .map((v) => v.toFixed(2))
        .join(" ")
    : "";

  // RIGHT: buttons
  const btnGroup = document.createElement("div");
  btnGroup.className = "btn-group btn-group-sm";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-outline-secondary";
  editBtn.innerHTML = "✏️";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-outline-danger";
  deleteBtn.innerHTML = "✖";

  btnGroup.append(editBtn, deleteBtn);
  row.append(left, center, btnGroup);
  list.appendChild(row);

  // ===== EVENTS =====

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showMarkerModal(data);
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteSuggestion(data.suggestionid);
  });

  attachRowHover(row);
}

function attachRowHover(row) {
  row.addEventListener("mouseenter", () => {
    const id = row.dataset.id;
    const marker = markers.find((m) => m.userData.suggestionid === id);
    if (marker) marker.material.color.set(0x0000ff);
    row.style.background = "#dc1313b7";
  });

  row.addEventListener("mouseleave", () => {
    const id = row.dataset.id;
    const marker = markers.find((m) => m.userData.suggestionid === id);
    if (marker) marker.material.color.set(markerColor);
    row.style.background = "";
  });
}

function deleteSuggestion(id) {
  // Remove marker
  markers = markers.filter((m) => {
    if (m.userData.suggestionid === id) {
      scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose();
      return false;
    }
    return true;
  });

  // Remove patch mesh
  meshes = meshes.filter((mesh) => {
    if (mesh.userData === id) {
      scene.remove(mesh);
      mesh.geometry?.dispose();
      mesh.material?.dispose();
      return false;
    }
    return true;
  });

  // Remove data
  const idx = suggestionData.findIndex((d) => d.suggestionid === id);
  if (idx !== -1) suggestionData.splice(idx, 1);

  // Remove row
  const row = document.querySelector(`[data-id="${id}"]`);
  row?.remove();
}

// ===================== SHOW TOOLTIP =====================
const tooltip = document.getElementById("markerTooltip");

renderer.domElement.addEventListener("mousemove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Only raycast markers (IMPORTANT for performance)
  const intersects = raycaster.intersectObjects(markers, false);

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    const data = marker.userData;

    tooltip.style.display = "block";
    tooltip.style.left = event.clientX + 12 + "px";
    tooltip.style.top = event.clientY + 12 + "px";

    tooltip.innerHTML = `
      <strong>${data.title || "Untitled"}</strong><br/>
      ${data.description || ""}<br/>
      ${data.hrc ? "HRC: Yes" : "HRC: No"}
      ${data.wac ? "WAC: Yes" : "WAC: No"}
      ${data.enfys ? "Enfys: Yes" : "Enfys: No"}
    `;
  } else {
    tooltip.style.display = "none";
  }
});
