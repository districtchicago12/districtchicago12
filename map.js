const MAP_WIDTH = 2048;
const MAP_HEIGHT = 2048;
const bounds = [[0,0],[MAP_HEIGHT,MAP_WIDTH]];
const panelContent = document.getElementById('panel-content');

function escapeHtml(value) {
    return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

const osiedla = [
    {
        id: 1,
        group: 'Chicago Gangs',
        name: 'BrickSquad',
        image: 'images/bricksquad.jpg',
        description: '69th/Eggleston is where many famous rappers in the Chicago drill scene emerged from. They are known for their conflicts with the neighboring BDs and the BDs in Woodlawn.',
        points: [
            [935, 856],
            [1044, 677],
            [1012, 657],
            [922, 805]
            
        ]
    }
];

const map = L.map('map', { crs:L.CRS.Simple, zoomControl:true, maxZoom:5, maxBounds:bounds, maxBoundsViscosity:1, inertia:false });
L.imageOverlay('mapa.png', bounds, {interactive:false}).addTo(map);

function fitMap() {
    const el=document.getElementById('map');
    const scale=Math.max(el.clientWidth/MAP_WIDTH, el.clientHeight/MAP_HEIGHT);
    const zoom=Math.log2(scale);
    map.setView([MAP_HEIGHT/2,MAP_WIDTH/2],zoom,{animate:false});
}
fitMap();
window.addEventListener('resize',()=>setTimeout(()=>{map.invalidateSize();fitMap();},50));

let selectedPolygon=null;
let selectedArea=null;
const polygons=new Map();

function resetPolygon(poly) {
    poly.setStyle({color:'#e53935', fillColor:'#e53935', fillOpacity:.30, weight:2.5});
}
function selectPolygon(poly) {
    if(selectedPolygon && selectedPolygon!==poly) resetPolygon(selectedPolygon);
    poly.setStyle({color:'#ff1e1e', fillColor:'#ff3030', fillOpacity:.48, weight:4});
    selectedPolygon=poly;
}

function renderHome(activeId=null) {
    panelContent.innerHTML=`
      <div class="panel-home">
        <div class="topbar">
          <button class="icon-btn" id="menuBtn" aria-label="Menu"><span class="menu-lines">☰</span></button>
          <div class="brand">Chicago Gang Map 2012</div>
          <div class="top-actions"><button class="icon-btn" aria-label="Szukaj"><span class="search-icon"></span></button><button class="icon-btn dots" aria-label="Więcej">•••</button></div>
        </div>
        <div class="groups">
          <div class="group-title single"><span>Chicago Gangs</span></div>
          ${osiedla.map(a=>`<div class="area-row ${activeId===a.id?'active':''}" data-id="${a.id}"><span class="area-dot"></span><span class="area-text">${escapeHtml(a.name)}</span></div>`).join('')}
        </div>
      </div>`;
    panelContent.querySelectorAll('.area-row').forEach(row=>row.addEventListener('click',()=>openArea(Number(row.dataset.id),true)));
}

function openArea(id, focusMap=true) {
    const area=osiedla.find(x=>x.id===id); if(!area) return;
    selectedArea=area;
    const image=area.image ? `<img class="detail-photo" src="${escapeHtml(area.image)}" alt="${escapeHtml(area.name)}">` : `<div class="photo-placeholder">BRAK ZDJĘCIA — DODAJ image W map.js</div>`;
    panelContent.innerHTML=`
      <div class="detail-view">
        <div class="detail-topbar"><button class="detail-back" id="detailBack" aria-label="Wróć">←</button><div class="detail-title">${escapeHtml(area.name)}</div></div>
        <div class="detail-scroll">
          ${image}
          <div class="detail-content">
            <div class="detail-label">NAZWA / MIEJSCE</div>
            <h1 class="detail-name">${escapeHtml(area.name)}</h1>
            <div class="detail-section"><div class="detail-label">OPIS INFORMACYJNY</div><p>${escapeHtml(area.description)}</p></div>
          </div>
        </div>
      </div>`;
    document.getElementById('detailBack').addEventListener('click',()=>renderHome(area.id));
    if(focusMap){
        const poly=polygons.get(area.id); if(poly){selectPolygon(poly); map.flyToBounds(poly.getBounds(),{padding:[110,110],maxZoom:map.getZoom()+1.2,duration:.55});}
    }
}

renderHome();

osiedla.forEach(area=>{
    const polygon=L.polygon(area.points,{className:'area-polygon',color:'#e53935',fillColor:'#e53935',fillOpacity:.30,weight:2.5});
    polygons.set(area.id,polygon);
    polygon.on('click',()=>openArea(area.id,false));
    polygon.on('mouseover',()=>{ if(selectedArea?.id!==area.id) polygon.setStyle({fillOpacity:.43,weight:3.5}); });
    polygon.on('mouseout',()=>{ if(selectedArea?.id!==area.id) resetPolygon(polygon); });
    polygon.addTo(map);
});
