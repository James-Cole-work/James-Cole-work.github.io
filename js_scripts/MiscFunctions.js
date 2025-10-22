
    function zoomIn() {
      camera.zoom *= 1.5;
      camera.updateProjectionMatrix();
    }

    function zoomOut() {
      camera.zoom /= 1.5;
      camera.updateProjectionMatrix();
    }

    function resetView() {
      camera.zoom = 1;
      camera.position.set(-0.1, 0, 0
        );


      camera.updateProjectionMatrix();
    }
function solSelect() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);


  
}

// Listen for resize events
window.addEventListener('resize', onWindowResize, false);

