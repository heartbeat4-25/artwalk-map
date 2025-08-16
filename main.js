let districtVisible = false, streetVisible = false;

const map = new AMap.Map("container", {
  zoom: 10,
  //center: [120.0936, 30.8701]
  center: [117.925, 25.125],  // 安溪县政府大约位置
  zooms: [6, 15], // 限制缩放范围为10-15之间
  resizeEnable: true, // 页面大小变化时自动适应
  dragEnable: true,   // 启用拖拽
  zoomEnable: true    // 启用缩放
});

const bounds = new AMap.Bounds([117.54, 24.77], [118.31, 25.48]);
const imageLayer = new AMap.ImageLayer({
  url: "images/maps/anxi-map.png",
  bounds: bounds,
  opacity: 1
});
map.add(imageLayer);
imageLayer.setzIndex(5);

const districtMarkers = [];
const redIcon = "images/signals/redSign.png";
const yellowIcon = "images/signals/yellowSign.png";

// 工具：由中心经纬度 + 宽高(米) 计算 bounds
function boundsFromCenterMeters(lng, lat, widthMeters, heightMeters) {
  const earthMetersPerDegLat = 111320;                         // 1°纬度 ≈ 111.32km
  const metersPerDegLng = earthMetersPerDegLat * Math.cos(lat * Math.PI / 180);

  const halfLngDeg = (widthMeters / 2) / metersPerDegLng;
  const halfLatDeg = (heightMeters / 2) / earthMetersPerDegLat;

  const sw = [lng - halfLngDeg, lat - halfLatDeg]; // 西南角
  const ne = [lng + halfLngDeg, lat + halfLatDeg]; // 东北角
  return new AMap.Bounds(sw, ne);
}

// 创建并显示额外图片图层（默认就显示，保持原图比例）
function addImageLayerKeepRatio(item) {
  const img = new Image();
  img.crossOrigin = "anonymous"; // 防止跨域问题
  img.onload = () => {
    const w = img.naturalWidth, h = img.naturalHeight;
    const widthM = item.widthMeters;                        // 只给宽度（米）
    const heightM = item.heightMeters || widthM * (h / w);  // 按比例算高度（米）

    const b = boundsFromCenterMeters(item.lng, item.lat, widthM, heightM);
    const layer = new AMap.ImageLayer({
      url: item.url,
      bounds: b,
      opacity: item.opacity ?? 1
    });
    layer.setzIndex(item.zIndex ?? 8);
    map.add(layer);
  };
  img.onerror = () => {
    console.warn("图片加载失败：", item.url);
  };
  img.src = item.url;
}

(window.extraImageLayersData || []).forEach(addImageLayerKeepRatio);


districtData.forEach(item => {
  const marker = new AMap.Marker({
    position: [item.lng, item.lat],
    title: item.name,
    zIndex: 300, // 红标在最上层
    icon: new AMap.Icon({
      image: redIcon,
      size: new AMap.Size(32, 32),
      imageSize: new AMap.Size(32, 32)
    }),
    label: {
      content: `<div class="marker-label">${item.name}</div>`,
      offset: new AMap.Pixel(0, -36)
    }
  });
  marker.on("click", () => showOverlay(item));
  marker.setMap(null);           // 默认隐藏
  districtMarkers.push(marker);  // 存起来给 showDistricts 切换
});


function showDistricts() {
  districtVisible = !districtVisible;
  districtMarkers.forEach(m => m.setMap(districtVisible ? map : null));
}


function showOverlay(data) {
  document.getElementById("overlayTitle").innerText = data.name;
  document.getElementById("overlayDesc").innerText = data.desc;

  const container = document.getElementById("overlayImages");
  container.innerHTML = "";
  const imageList = Array.isArray(data.images) ? data.images : [data.image];
  imageList.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "80%";
    img.style.borderRadius = "10px";
    container.appendChild(img);
  });

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

  const streetData = [];
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