
const zeroPad = (num, places) => String(num).padStart(places, '0')

const userid = 'Cole_User'; //needs to be updated and gathered from login page credentials
let suggestionid = 0;

let s_input = document.querySelector('input[name="suggestionID"]');
let u_input = document.querySelector('input[name="userID"]');
let lastClickPosition = null;
const suggestionData = [];
let markerType = null;
let clicks = [];
let editingSuggestionId = null; // null = create mode, otherwise edit mode

window.addEventListener('dblclick', (event) => {
    if (editingSuggestionId !== null) return; // ⛔ BLOCK create-mode
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    clicks = [];

    raycaster.setFromCamera(mouse, camera);
    sphere.updateMatrixWorld(); // Ensure transforms are up-to-date


    s_input.value = zeroPad(suggestionid,4);
    u_input.value = userid;

    markerType = "marker";

    const target = sphereGroup || sphere;
    const intersects = raycaster.intersectObject(target, target.type === "Group");


    if (intersects.length > 0) {
        lastClickPosition = intersects[0].point.clone();
        clicks.push(lastClickPosition);
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        // Center coordinates
        const centerX = screenWidth / 5;
        const centerY = screenHeight / 10;
        showPopup(centerX, centerY);
    }
});





document.getElementById("markerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const keywords = formData.getAll("keywords");
  data.keywords = keywords;

  data.userid = userid;

  // Determine if we are in edit mode
  const isEdit = editingSuggestionId !== null;

  if (isEdit) {
    data.suggestionid = editingSuggestionId; // preserve ID
  } else {
    data.suggestionid = zeroPad(suggestionid, 4);
  }

  // Checkboxes
  data.enfys = formData.has("enfys");
  data.hrc = formData.has("HRC");
  data.wacrgb = formData.has("wacRGB");
  data.wacmulti = formData.has("wacmulti");
  data.mosaic = formData.has("mosaic");
  // Use correct click data
  const clickData = isEdit
    ? suggestionData.find(d => d.suggestionid === editingSuggestionId)?.mouse
    : clicks;

  if (!clickData || clickData.length === 0) {
    console.error("Submit aborted: no click data");
    return;
  }

  // Convert clicks to PTU
  const sphericalA = new THREE.Spherical();
  sphericalA.setFromVector3(clickData[0]);
  pant = sphericalA.theta * (180 / Math.PI) - 90;  
  tiltt = sphericalA.phi * (180 / Math.PI) - 90;   
        
  if (pant > -270 && pant < -180) pant += 360;

  let panb = null;
  let tiltb = null;

  if (clickData.length > 1) {
    console.log(clickData.length)
    const sphericalB = new THREE.Spherical();
    sphericalB.setFromVector3(clickData[1]);
    panb = sphericalB.theta * (180 / Math.PI) - 90;  
    tiltb = sphericalB.phi * (180 / Math.PI) - 90;   

    if (panb > -270 && panb < -180) panb += 360;
  }

  data.position = [pant, tiltt, panb, tiltb];

  data.mouse = clickData;

  if (isEdit) {
    // ✏️ EDIT EXISTING
    const index = suggestionData.findIndex(d => d.suggestionid === editingSuggestionId);
    if (index !== -1) {
      suggestionData[index] = { ...suggestionData[index], ...data };

      // Update marker userData
      const marker = markers.find(m => m.userData.suggestionid === editingSuggestionId);
      if (marker) marker.userData = suggestionData[index];

      // Update list row
      const rows = Array.from(document.getElementById('markerList').children);
      const row = rows.find(r => r.children[0].textContent.endsWith(editingSuggestionId));
      if (row) {
        row.children[1].textContent = data.position
          .filter(v => v != null)
          .map(v => v.toFixed(2))
          .join(' ');
      }
    }

    editingSuggestionId = null;
  } else {
    // ➕ CREATE NEW
    placeMarker(lastClickPosition, data);
    suggestionData.push(data);
    suggestionid++;

    // Add new row to the list
    const myList = document.getElementById('markerList');
    const row = document.createElement('div');

    row.style.transition = 'background-color 0.2s';
    row.style.width = '100%';
    row.style.minWidth = '0';
    row.className = 'd-flex align-items-center py-1 px-2 border-bottom border-secondary';
    row.style.width = '100%';
    row.style.minHeight = '4vh'; // Gives a consistent, small height
    attachRowHoverLogic(row);


    const left = document.createElement('div');
    left.className = 'fw-bold me-2'; // Font weight bold, margin end 2
    left.style.width = '4vw';
    left.textContent = 'S. ' + data.suggestionid;
    

    const center = document.createElement('div');
    center.className = 'flex-grow-1';
    center.textContent = data.position
      .filter(v => v != null)
      .map(v => v.toFixed(2))
      .join(' ');

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline-secondary p-1';
    editBtn.style.width = '2rem';
    editBtn.innerHTML = '&#10247;';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger p-1';
    deleteBtn.style.width = '2rem';
    deleteBtn.innerHTML = '&times;';

    [editBtn, deleteBtn].forEach(btn => {
    btn.className = 'btn btn-sm p-0 d-flex align-items-center justify-content-center';
    btn.style.width = '1.5vw';
    btn.style.height = '1.5vw';
    btn.style.fontSize = '1vh';
    btn.style.padding = '0'; 
    btn.style.margin = '0 2px';
    btn.style.lineHeight = '1';
    });

    const right = document.createElement('div');
    right.appendChild(editBtn);
    right.appendChild(deleteBtn);
    right.className = 'btn-group btn-group-sm';
    row.appendChild(left);
    row.appendChild(center);
    row.appendChild(right);
    myList.appendChild(row);

    // Add listeners
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const info = row.children[0].textContent.slice(-4);
      const d = suggestionData.find(d => d.suggestionid === info);
      if (!d) return;
      editingSuggestionId = info;
      lastClickPosition = null;
      clicks = d.mouse || [];
      populatePopup(d);
      showPopup(0.5, 0.5);
    });

    deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent triggering row click

    // Get the suggestion ID from the row
    let info = row.children[0].textContent.slice(-4);

    // Remove matching markers from the scene and the array
    markers
      .filter(m => m.userData.suggestionid === info)
      .forEach(m => {
        if (m.material) m.material.dispose();
        if (m.geometry) m.geometry.dispose();
        scene.remove(m);
      });
    markers = markers.filter(m => m.userData.suggestionid !== info);

    // Remove matching meshes from the scene and the array
    meshes
      .filter(m => m.userData === info)
      .forEach(m => {
        if (m.material) m.material.dispose();
        if (m.geometry) m.geometry.dispose();
        scene.remove(m);
      });
    meshes = meshes.filter(m => m.userData !== info);

    // Remove the suggestion data
    const index = suggestionData.findIndex(d => d.suggestionid === info);
    if (index !== -1) suggestionData.splice(index, 1);

    // Remove the row from the list
    row.remove();

    // Reindex remaining suggestions to remove gaps
    reindexSuggestions();
    });
  }

  closePopup();
  e.target.reset();
});

function reindexSuggestions() {
  const myList = document.getElementById('markerList');

  suggestionData.forEach((data, idx) => {
    const oldId = data.suggestionid;
    const newId = zeroPad(idx, 4);
    data.suggestionid = newId;

    // Update marker
    const marker = markers.find(m => m.userData.suggestionid === oldId);
    if (marker) marker.userData.suggestionid = newId;

    // Update meshes
    meshes.forEach(m => {
      if (m.userData === oldId) m.userData = newId;
    });

    // Update row text
    const row = Array.from(myList.children).find(r =>
      r.children[0].textContent.endsWith(oldId)
    );
    if (row) row.children[0].textContent = 'S.  ' + newId;
  });

  // Reset next suggestion ID
  suggestionid = suggestionData.length;

  // Re-attach hover logic for all rows
  Array.from(myList.children).forEach(row => attachRowHoverLogic(row));
}
function setField(form, name, value, isCheckbox = false) {
  const el = form.querySelector(`[name="${name}"]`);
  if (!el) {
    console.warn(`populatePopup: field not found → ${name}`);
    return;
  }
  if (isCheckbox) {
    el.checked = !!value;
  } else {
    el.value = value ?? "";
  }
}

function attachRowHoverLogic(row) {
  row.addEventListener('mouseenter', () => {
    row.style.backgroundColor = '#dc1313b7';
    const info = row.children[0].textContent.slice(-4); // current suggestionid
    const marker = markers.find(m => m.userData.suggestionid === info);
    if (marker) marker.material.color.set(0x0000ff);
  });

  row.addEventListener('mouseleave', () => {
    row.style.backgroundColor = '';
    const info = row.children[0].textContent.slice(-4); // current suggestionid
    const marker = markers.find(m => m.userData.suggestionid === info);
    if (marker) marker.material.color.set(markerColor); // reset to default
  });
}
function populatePopup(data) {
  const form = document.getElementById("markerForm");

  setField(form, "title", data.title);
  setField(form, "description", data.description);
  setField(form, "intent", data.intent);
  setField(form, "keywords", data.selectedKeywords);
  setField(form, "notes", data.notes);

  setField(form, "HRC", data.hrc, true);
  setField(form, "enfys", data.enfys, true);
  setField(form, "wacRGB", data.wacrgb, true);
  setField(form, "wacmulti", data.wacmulti, true);
  setField(form, "mosaic", data.mosaic, true);
  // IDs
  s_input.value = data.suggestionid;
  u_input.value = data.userid;

    // Clear all keyword checkboxes
  document.querySelectorAll('input[name="keywords"]').forEach(cb => {
    cb.checked = false;
  });

  // Restore checked keywords
  if (Array.isArray(data.keywords)) {
    document.querySelectorAll('input[name="keywords"]').forEach(cb => {
      cb.checked = data.keywords.includes(cb.value);
    });

    // Update display field
    document.getElementById("selectedKeywords").value =
      data.keywords.join(", ");
  }
}

//tracking the drawing ofa patch on the sphere
renderer.domElement.addEventListener("click", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const target = sphereGroup || sphere; // fallback to sphere if group is null/undefined
  const intersects = raycaster.intersectObject(target, target.type === "Group");
  if (intersects.length === 0) return;

  const hitPoint = intersects[0].point.clone();
  if (event.shiftKey) { //must click shift first to draw
  
  if (!isDrawing) {
    // First click — start drawing
    startPoint = hitPoint;
    isDrawing = true;
  } else {
    // Second click — finish drawing
    clicks = [];
    if (currentPatch) {
      // Finalize and store all useful information
      markerType = 'patch';
      s_input.value = zeroPad(suggestionid,4);
      u_input.value = userid;
      lastDrawnPatch = currentPatch;
      currentPatch.userData = zeroPad(suggestionid,4);
      meshes.push(currentPatch);
      lastDrawnPatch.name = 'currentPatch';
      
      if (intersects.length > 0) {
        lastClickPosition = intersects[0].point.clone();
        clicks.push(startPoint);
        clicks.push(lastClickPosition);
        showPopup(mouse.x, mouse.y);
      }
      currentPatch = null;
    }
    isDrawing = false;

    // Optional: log world-space bounds
    const sA = new THREE.Spherical().setFromVector3(startPoint);
    const sB = new THREE.Spherical().setFromVector3(hitPoint);
    let lonMin= THREE.MathUtils.radToDeg(Math.min(sA.theta, sB.theta));
    let lonMax= THREE.MathUtils.radToDeg(Math.max(sA.theta, sB.theta));
    let latMin= 90 - THREE.MathUtils.radToDeg(Math.max(sA.phi, sB.phi));
    let latMax= 90 - THREE.MathUtils.radToDeg(Math.min(sA.phi, sB.phi));
    //console.log("Patch bounds (deg):", {lonMin,lonMax, latMin,latMax});

  }}

});

// shows the patch as you move mosue before finalising patch
renderer.domElement.addEventListener("mousemove", (event) => {
  if (!isDrawing || !startPoint) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const target = sphereGroup || sphere; // fallback to sphere if group is null/undefined
  const intersects = raycaster.intersectObject(target, target.type === "Group");
  if (intersects.length === 0) return;
  const currentPoint = intersects[0].point.clone();
  // Remove previous preview
  if (currentPatch) {
    scene.remove(currentPatch);
    currentPatch.geometry.dispose();
    currentPatch.material.dispose();
  }
  // Draw preview
  currentPatch = makeSpherePatchGeo(startPoint, currentPoint);
  scene.add(currentPatch);
});


// Tooltip on hover -  shows suggestion info
const dom = renderer.domElement;

dom.addEventListener("mousemove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;


  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);
  const tooltip = document.getElementById("tooltip");

if (intersects.length > 0) {
    const marker = intersects[0].object;
    const data = marker.userData;

    tooltip.style.display = "block";

    // Set content first
    tooltip.innerHTML = `
      <strong>Suggestion Title: ${data.title|| "Untitled"}</strong><br>
      <em>User ID: ${data.userid || "No description"}</em><br>
      <em>Suggestion ID: ${data.suggestionid || "No description"}</em><br>
      <em>Suggestion Description: ${data.description || "No description"}</em><br>
      <em>Science Intent: ${data.intent || "No description"}</em><br>
      <label>HRC: <input type="checkbox" disabled ${data.hrc ? "checked" : ""} /></label>
      <label>Enfys: <input type="checkbox" disabled ${data.enfys ? "checked" : ""} /></label><br>
      <label>WAC RGB: <input type="checkbox" disabled ${data.wacrgb ? "checked" : ""} /></label>
      <label>WAC Multi: <input type="checkbox" disabled ${data.wacmulti ? "checked" : ""} /></label><br>
      <label>Mosaic: <input type="checkbox" disabled ${data.mosaic ? "checked" : ""} /></label><br>
      <em>Keywords: ${data.selectedKeywords || "No description"}</em><br>
      <em>Other Notes: ${data.notes || "No description"}</em><br>
    `;

    // Force reflow by reading offsetHeight
    tooltip.offsetHeight;

    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 10;

    let left = event.clientX + padding;
    let top = event.clientY + padding;

    // Flip horizontally if it goes past right edge
    if (left + tooltipRect.width > window.innerWidth) {
        left = event.clientX - tooltipRect.width - padding;
    }

    // Flip vertically if it goes past bottom edge
    if (top + tooltipRect.height > window.innerHeight) {
        top = event.clientY - tooltipRect.height - padding;
    }

    // Prevent tooltip from going off the top/left edges
    left = Math.max(padding, left);
    top = Math.max(padding, top);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
} else {
    tooltip.style.display = "none";
}

});


function showPopup(x, y) {  //gives form to fill out by user about target
  const popup = document.getElementById("popupForm");
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.display = "block";
}

function closePopup() { //closes form when done
  const popup = document.getElementById("popupForm");
  popup.style.display = "none";
  editingSuggestionId = null;


}

function cancelPopup() { //closes form when done
  const popup = document.getElementById("popupForm");
  popup.style.display = "none";
  editingSuggestionId = null;
    currentPatch = lastDrawnPatch;

    scene.remove(currentPatch);
  }


document.getElementById('openDaySelector').addEventListener('click', () => {
    const width = screen.availWidth * 0.35;   // 50% of available screen width
    const height = screen.availHeight * 0.35; // 50% of available screen height

    // Calculate coordinates to center the popup
    const right = (screen.availWidth - width) / 2;
    const top  = (screen.availHeight - height) / 2;


    const popup = window.open(
      "",
      "DaySelector",
      `width=${width},height=${height}, left = ${right}, top = ${top}, resizable=yes`
    );

    if (!popup) {
        alert('Popup blocked! Please allow popups for this site.');
        return;
    }

    const doc = popup.document;
    doc.body.innerHTML = ""; // Clear
    doc.head.innerHTML = `
        <title>Select Day</title>
        <style>
            body { font-family: Arial; font-size: 1.5vw; padding: 5px;}
            select { width: 50vw; padding: 3px; margin-bottom: 10px; font-size:1.5vw; border-size: 1px}
            .preview-grid { display: flex; flex-wrap: wrap; gap: 5px; font-size:1vw;}
            .preview-grid img { width: 30vw; height: 30vh; object-fit: cover; border: 1px solid #ccc; cursor: pointer; }
            button {  width: 20vw;  height: 3vw;  padding: 0;  display: flex;align-items: center; justify-content: center; font-size: 1.5vw;}
        </style>
    `;
    const solSelectLabel = document.getElementById('solSelectLabel');
    const h2 = doc.createElement('h2');
    h2.textContent = 'Current Sol: '+solSelectLabel.innerText;
    doc.body.appendChild(h2);

    const daySelect = doc.createElement('select');
    daySelect.id = 'daySelect';
    daySelect.innerText = 'asdd';
    doc.body.appendChild(daySelect);

    const previewDiv = doc.createElement('div');
    previewDiv.id = 'preview';
    previewDiv.className = 'preview-grid';
    doc.body.appendChild(previewDiv);

    const confirmBtn = doc.createElement('button');
    confirmBtn.id = 'confirmSol';
    confirmBtn.textContent = 'Confirm';
    doc.body.appendChild(confirmBtn);

    const dayImages = {
        'No Sol Selected': [''],
        'Sol 1': ['mars1.png', 'mars1_extra.png'],
        'Sol 2': ['ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture_uint8.jpg'],
        'Sol 3': ['mars1.png'],
        'Sol 4': ['pan_der_sc_l_mosaic_20221004t103007.png','pan_der_sc_l_mosaic_20221004t103123.png'],
        'Sol Multiple': [    'mars1.png','ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture_uint8.jpg','mars_test.jpg']
    };

    Object.keys(dayImages).forEach(day => {
        const opt = doc.createElement('option');
        opt.value = day;
        opt.textContent = day;
        daySelect.appendChild(opt);
    });

    // Preview update
    daySelect.addEventListener('change', () => {
    const selectedDay = daySelect.value;
    const images = dayImages[selectedDay] || [];
    previewDiv.innerHTML = '';

    images.forEach((img, index) => {
        const container = document.createElement('div');
        container.style.display = 'inline-block';
        container.style.position = 'relative';
        container.style.margin = '5px';

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = false;  // default: selected
        checkbox.style.position = 'absolute';
        checkbox.style.top = '5px';
        checkbox.style.left = '5px';
        checkbox.style.zIndex = '10';

        // Image
        const el = document.createElement('img');
        el.src = img;
        el.alt = img;
        el.style.width = '30vw';
        el.style.height = '30vh';
        el.style.objectFit = 'cover';
        el.style.border = '1px solid #ccc';
        el.style.cursor = 'pointer';

        container.appendChild(checkbox);
        container.appendChild(el);
        previewDiv.appendChild(container);
    });


    });


      // Function to update button state
      function updateConfirmButton() {
        // Check if any checkbox in the preview is checked
        const anyChecked = Array.from(previewDiv.querySelectorAll('input[type="checkbox"]'))
          .some(cb => cb.checked);
        
        confirmBtn.disabled = !anyChecked; // disable if none checked
      }

      // Listen for changes on checkboxes inside the preview
      previewDiv.addEventListener('change', updateConfirmButton);

      // Initial check when modal opens or images are loaded
      updateConfirmButton();

          confirmBtn.addEventListener('click', () => {
              const selectedDay = daySelect.value;





          // Called in modal confirm button
          const selectedTexturesWithIndex = [];
          const containers = previewDiv.children;
          for (let i = 0; i < containers.length; i++) {
              const checkbox = containers[i].querySelector('input[type="checkbox"]');
              if (checkbox.checked) {
                  const img = containers[i].querySelector('img');
                  selectedTexturesWithIndex.push({ file: img.src, index: i });
              }
          }

          // Pass to loader
          loadSelectedTexture(selectedDay, selectedTexturesWithIndex);
          solSelectLabel.innerText = selectedDay +  ' Selected';
          popup.close();
          
          });
});

