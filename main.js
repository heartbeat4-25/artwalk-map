let districtVisible = false, streetVisible = false;

const map = new AMap.Map("container", {
  zoom: 12,
  //center: [120.0936, 30.8701]
  center: [118.1864, 25.0652],  // 安溪县政府大约位置
  zooms: [10, 15], // 限制缩放范围为10-15之间
  resizeEnable: true, // 页面大小变化时自动适应
  dragEnable: true,   // 启用拖拽
  zoomEnable: true    // 启用缩放
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

function openChat() {
  document.getElementById("chatModal").style.display = "flex";
}

function closeChat() {
  document.getElementById("chatModal").style.display = "none";
  document.getElementById("chatResponse").innerText = "";
}

async function sendQuestion() {
  const question = document.getElementById("chatInput").value.trim();
  if (!question) {
    alert("请输入问题");
    return;
  }

  document.getElementById("chatResponse").innerText = "🤖 正在思考中，请稍候...";

  try {
    const response = await fetch("http://127.0.0.1:5000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: question })
    });

    const data = await response.json();
    if (data.answer) {
      document.getElementById("chatResponse").innerText = data.answer;
    } else if (data.error) {
      document.getElementById("chatResponse").innerText = "错误：" + data.error;
    }
  } catch (err) {
    document.getElementById("chatResponse").innerText = "请求失败：" + err.message;
  }
}

