

const zeroPad = (num, places) => String(num).padStart(places, '0')

const userid = 'Cole_User'; //needs to be updated and gathered from login page credentials
let suggestionid = 0;

let s_input = document.querySelector('input[name="suggestionID"]');
let u_input = document.querySelector('input[name="userID"]');
let lastClickPosition = null;
const suggestionData = [];
let markerType = null;
let clicks = [];


window.addEventListener('dblclick', (event) => {

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
        showPopup(mouse.x, mouse.y);
    }
});




document.getElementById("markerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  data.userid = userid;
  data.suggestionid = zeroPad(suggestionid, 4);

  data.enfys = formData.has("enfys");
  data.hrc = formData.has("HRC");
  data.wacrgb = formData.has("wacRGB");
  data.wacmulti = formData.has("wacmulti");
  data.mosaic = formData.has("mosaic");


  const spherical = new THREE.Spherical();
  spherical.setFromVector3(clicks[0]);
  var pant = -spherical.theta * (180/Math.PI) + 90; 
  var tiltt = - spherical.phi * (180/Math.PI) + 90 ;  
  if (pant > 180) {
    pant  = pant - 360;
  }
  
  if (clicks.length >1){
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(clicks[1]);
      var panb = -spherical.theta * (180/Math.PI) + 90;
      var tiltb = - spherical.phi * (180/Math.PI) + 90 ;  
      if (panb > 180) {
      panb  = panb - 360;
      }
  }
  else  {
  var panb = null;
  var tiltb =null; 
  }  

  placeMarker(lastClickPosition,data);

  const PTU = [pant, tiltt, panb, tiltb];

  data.position  = PTU;
  data.mouse = clicks;
  suggestionid = suggestionid +1;

  suggestionData.push(data);
  closePopup();

  e.target.reset();
});



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
renderer.domElement.addEventListener("mousemove", (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;


  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);
  const tooltip = document.getElementById("tooltip");

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    const data = marker.userData;
  
    if (data.position[2]){
          TLPan = data.position[0].toFixed(2)
          TLTilt = data.position[1].toFixed(2)
          BRPan = data.position[2].toFixed(2)
          BRTilt = data.position[3].toFixed(2)
    }
    else{           
          TLPan = data.position[0].toFixed(2)
          TLTilt = data.position[1].toFixed(2)
          BRPan = data.position[2]
          BRTilt = data.position[3]
    }

    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
    tooltip.style.display = "block";
    tooltip.width = 'width: 35vw';
    tooltip.innerHTML = `
      <strong>Suggestion Title: ${data.title|| "Untitled"}</strong><br>
      <em>User ID: ${data.userid || "No description"}</em><br>
      <em>Suggestion ID: ${data.suggestionid || "No description"}</em><br>
      <em>Suggestion Description: ${data.description || "No description"}</em><br>
      <em>Science Intent: ${data.intent || "No description"}</em><br>
      <em>TL Pan Angle: ${TLPan},</em>
      <em>TL Tilt Angle: ${TLTilt}</em><br>
      <em>BR Pan Angle: ${BRPan},</em>
      <em>BR Tilt Angle: ${BRTilt}</em><br>
      <label>HRC: <input type="checkbox" disabled ${data.hrc ? "checked" : ""} />
      </label>
      <label>Enfys: <input type="checkbox" disabled ${data.enfys ? "checked" : ""} />
      </label><br>
      <label>WAC RGB: <input type="checkbox" disabled ${data.wacrgb ? "checked" : ""} />
      </label>
      <label>WAC Multi: <input type="checkbox" disabled ${data.wacmulti ? "checked" : ""} />
      </label><br>
      <label>Mosaic: <input type="checkbox" disabled ${data.mosaic ? "checked" : ""} />
      </label><br>
      <em>Keywords: ${data.keywords || "No description"}</em><br>
      <em>Other Notes: ${data.notes || "No description"}</em><br>
    `;
    // Tooltip position adjustment
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 10; // gap between cursor and tooltip

    let left = event.clientX + padding;
    let top = event.clientY + padding;

    // Flip horizontally if going past the right edge
    if (left + tooltipRect.width > window.innerWidth) {
      left = event.clientX - tooltipRect.width - padding;
    }
// Flip vertically if going past the bottom edge
if (top + tooltipRect.height > window.innerHeight) {
  top = event.clientY - tooltipRect.height - padding;
}

tooltip.style.left = `${left}px`;
tooltip.style.top = `${top}px`;
tooltip.style.display = "block";
   
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
}

document.getElementById('openDaySelector').addEventListener('click', () => {
    const popup = window.open("", "DaySelector", "width=1000,height=800,resizable=yes");

    if (!popup) {
        alert('Popup blocked! Please allow popups for this site.');
        return;
    }

    const doc = popup.document;
    doc.body.innerHTML = ""; // Clear
    doc.head.innerHTML = `
        <title>Select Day</title>
        <style>
            body { font-family: Arial; font-size: 5px; padding: 5px; }
            select { width: 100%; padding: 5px; height: 3vh; margin-bottom: 10px; font-size:5px;}
            .preview-grid { display: flex; flex-wrap: wrap; gap: 5px; font-size:5px;}
            .preview-grid img { width: 100px; height: 100px; object-fit: cover; border: 1px solid #ccc; cursor: pointer; }
            button { padding: 5px ; margin-top: 5px; width: 100%; height: 3vh; font-size: 5px;}
        </style>
    `;

    const h2 = doc.createElement('h2');
    h2.textContent = 'Current Sol:';
    doc.body.appendChild(h2);

    const h3 = doc.createElement('h3');
    h3.textContent = 'Change Sol:';
    doc.body.appendChild(h3);

    const daySelect = doc.createElement('select');
    daySelect.id = 'daySelect';
    daySelect.innerHTML = 'asdd';
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
        'Sol 1': ['mars1.png', 'mars1_extra.png'],
        'Sol 2': ['ZCAM-0360-ZCAM08390-L-RAD-ALL-79-MOSAIC-SPHR-20250430Texture_uint8.jpg'],
        'Sol 3': ['mars1.png'],
        'Sol 4': ['pan_der_sc_l_mosaic_20221004t103007.png','pan_der_sc_l_mosaic_20221004t103123.png'],
        'Sol Multiple': ['pan_der_sc_l_mosaic_20221004t103007.png','pan_der_sc_l_mosaic_20221004t103123.png']
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
        images.forEach(img => {
            const el = doc.createElement('img');
            el.src = img;
            el.alt = img;
            previewDiv.appendChild(el);
        });
        h2.textContent = 'Current Sol: '+daySelect.value;
    });

    // Confirm button
    confirmBtn.addEventListener('click', () => {
        const selectedDay = daySelect.value;

        const solSelect = window.document.getElementById('solSelect');
        if (solSelect) {
            solSelect.innerHTML = selectedDay+' Loaded';
            solSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        popup.close();
    });

    // Trigger initial preview
    daySelect.dispatchEvent(new Event('change'));
});

