let districtVisible = false, streetVisible = false;

const map = new AMap.Map("container", {
  zoom: 9,
  //center: [120.0936, 30.8701]
  center: [118.1864, 25.0652]  // 安溪县政府大约位置
});

const bounds = new AMap.Bounds([119.26, 30.38], [120.52, 31.16]);
const imageLayer = new AMap.ImageLayer({
  url: "https://raw.githubusercontent.com/heartbeat4-25/artwalk-map/main/images/maps/artwalk-map.png",
  bounds: bounds,
  opacity: 1
});
map.add(imageLayer);

const districtMarkers = [], streetMarkers = [];
const redIcon = "https://raw.githubusercontent.com/heartbeat4-25/artwalk-map/main/images/signals/redSign.png";
const yellowIcon = "https://raw.githubusercontent.com/heartbeat4-25/artwalk-map/main/images/signals/yellowSign.png";

districtData.forEach(item => {
  const marker = new AMap.Marker({
    position: [item.lng, item.lat],
    title: item.name,
    icon: new AMap.Icon({ image: redIcon, size: new AMap.Size(32, 32), imageSize: new AMap.Size(32, 32) }),
    label: { content: item.name, offset: new AMap.Pixel(0, -30) }
  });
  marker.on("click", () => showOverlay(item));
  marker.setMap(null);
  districtMarkers.push(marker);
});

streetData.forEach(item => {
  const marker = new AMap.Marker({
    position: [item.lng, item.lat],
    title: item.name,
    icon: new AMap.Icon({ image: yellowIcon, size: new AMap.Size(32, 32), imageSize: new AMap.Size(32, 32) }),
    label: { content: item.name, offset: new AMap.Pixel(0, -30) }
  });
  marker.on("click", () => showOverlay(item));
  marker.setMap(null);
  streetMarkers.push(marker);
});

function showDistricts() {
  districtVisible = !districtVisible;
  districtMarkers.forEach(m => m.setMap(districtVisible ? map : null));
}

function showStreets() {
  streetVisible = !streetVisible;
  streetMarkers.forEach(m => m.setMap(streetVisible ? map : null));
}

function showOverlay(data) {
  document.getElementById("overlayTitle").innerText = data.name;
  document.getElementById("overlayImage").src = data.image;
  document.getElementById("overlayDesc").innerText = data.desc;
  document.getElementById("infoOverlay").style.display = "flex";
  document.getElementById("searchBar").style.display = "none";
}

function hideOverlay() {
  document.getElementById("infoOverlay").style.display = "none";
  document.getElementById("searchBar").style.display = "flex";
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return;

  const allData = [...districtData, ...streetData];
  const match = allData.find(item => item.name.includes(keyword));

  if (match) {
    map.setZoom(12);
    map.panTo([match.lng, match.lat]);
    showOverlay(match);
  } else {
    alert("未找到相关地点");
  }
}
