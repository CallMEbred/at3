var kml = "";
var coords = "";
var file = "";
var filedispay = "";
var polygonCount = 0;
let polygonData = {};

// Toggle the help popup display
function toggleHelp() {
  var popup = document.getElementById("helpPopup");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
  document.querySelector('.help-button').classList.remove('attention');
}

// Add new polygon data to the file
function addToFile() {
  const coordsData = setCoords();
  if (!coordsData) return;

  const newId = getNextPolygonId();
  polygonData[newId] = {
    kml: coordsData,
    name: document.getElementById('name').value,
    sides: document.getElementById('sides').value,
    radius: document.getElementById('radius').value,
    origin: document.getElementById('origin').value,
    rotation: document.getElementById('rotation').value
  };

  updateKMLFile();
  renderDisplay();
}

// Remove a polygon by its ID
function removePoly(polyid) {
  delete polygonData[polyid];
  document.getElementById("poly" + polyid).remove();
  updateKMLFile();
  renderDisplay();
}

// Update file string with current KML data
function updateKMLFile() {
  file = Object.values(polygonData).map(poly => poly.kml).join("\n");
}

// Generate the next available polygon ID
function getNextPolygonId() {
  let id = 1;
  while (polygonData.hasOwnProperty(id)) {
    id++;
  }
  return id;
}

// Generate coordinates and return KML markup for polygon
function setCoords() {
  var name = document.getElementById('name').value;
  var sides = parseInt(document.getElementById('sides').value);
  var radius = parseFloat(document.getElementById('radius').value);
  var origin = document.getElementById('origin').value;
  var rotation = parseFloat(document.getElementById('rotation').value);

  // Validate input
  if (isNaN(sides) || isNaN(radius) || !origin.includes(",")) {
    alert("Please enter valid values. Origin must be in 'lat,lng' format.");
    return;
  }

  var [lat, lng] = origin.split(",").map(Number);
  if (isNaN(lat) || isNaN(lng)) {
    alert("Invalid origin format. Use 'lat,lng'");
    return;
  }

  if (sides < 3) {
    alert("Please enter a valid number of sides");
    return;
  }

  // Generate polygon vertices
  var coords = "";
  for (let i = 0; i <= sides; i++) {
    var angle = ((i * 2 * Math.PI) / sides) + (rotation * Math.PI / 180);
    var dy = radius * Math.cos(angle) / 110540;
    var dx = radius * Math.sin(angle) / (111320 * Math.cos(lat * Math.PI / 180));
    var x = lng + dx;
    var y = lat + dy;
    coords += `${x},${y},0 `;
    console.log(coords);
  }

  // Return KML Placemark for the polygon
  return `<Placemark>
    <name>${name}</name>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            ${coords.trim()}
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>`;
}

// Clear all form fields and data
function clearFile() {
  file = "";
  filedispay = "";
  document.getElementById('FileDisplay').textContent = '';

  document.getElementById('name').value = '';
  document.getElementById('origin').value = '';
  document.getElementById('sides').value = '';
  document.getElementById('radius').value = '';
  document.getElementById('rotation').value = '';
}

// Render polygon data to the page
function renderDisplay() {
  const container = document.getElementById('FileDisplay');
  container.innerHTML = "";

  for (let id in polygonData) {
    const poly = polygonData[id];

    const div = document.createElement("div");
    div.className = "filediv";
    div.id = "poly" + id;
    div.innerHTML = `
      <p>${poly.name}</p>
      <p>Sides: ${poly.sides}</p>
      <p>Radius: ${poly.radius}</p>
      <p>Origin: ${poly.origin}</p>
      <p>Rotation: ${poly.rotation}</p>
      <button class='removebutton' onclick='removePoly(${id})'>Remove</button>
    `;
    container.appendChild(div);
  }
}

// Generate full KML and trigger download
function download() {
  if (!file) {
    alert("Please add a polygon to the file before attempting to download");
    return;
  }

  var kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Folder>
    <name>My Polygons</name>
    ${file}
  </Folder>
</kml>`;

  console.log(kml);

  // Create downloadable file
  const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "polygon.kml";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
