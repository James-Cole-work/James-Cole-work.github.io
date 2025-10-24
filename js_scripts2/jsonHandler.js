//downloads the current local targets to a json file for the local user
function jsonDownload(){
    const a = document.querySelector('a');

    const data = JSON.stringify(suggestionData, null, 2);

    const blob = new Blob([data], {type: 'text/json'});

    const url = URL.createObjectURL(blob);

    a.href = url;
    a.download = 'example.json';
}

//uploads the local json file as markers and patches
let uploadedJson = null;
document.getElementById('jsonFile').addEventListener('change', function(event) {
            const file = event.target.files[0];
            clearMarkers();
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    uploadedJson = JSON.parse(e.target.result);
                    console.log("JSON loaded successfully:", uploadedJson);

                    // Now you can use uploadedJson anywhere in your code
                } catch (error) {
                    console.error('Invalid JSON file.', error);
                }
            };
            reader.readAsText(file);
        });

function jsonUpload() {

  if (uploadedJson) {
                console.log("Using JSON data:", uploadedJson);

                for (let i = 0; i < uploadedJson.length; i++) {
                
                const mouse = uploadedJson[i].mouse[0];

                const position = new THREE.Vector3(mouse.x, mouse.y, mouse.z);

                const data = uploadedJson[i];
                localMarker(position, data);
                }

            } else {
                console.warn("No JSON file uploaded yet.");
            }
        }

