function zoomIn() {
  camera.fov = Math.max(camera.fov * 0.95, 20);

  camera.updateProjectionMatrix();
}

function zoomOut() {
  camera.fov = Math.min(camera.fov * 1.05, 60);
  camera.updateProjectionMatrix();
}

function resetView() {
  camera.fov = 60;
  camera.position.set(-0.1, 0, 0);

  camera.updateProjectionMatrix();
}

function solSelect() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Function to create a 5-pointed star shape
function createStarShape(innerRadius, outerRadius, points) {
  const shape = new THREE.Shape();
  const step = Math.PI / points;

  shape.moveTo(Math.cos(0) * outerRadius, Math.sin(0) * outerRadius);

  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step;
    shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  shape.closePath();
  return shape;
}
