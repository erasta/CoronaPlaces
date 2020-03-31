'use strict';

const url = `https://services5.arcgis.com/dlrDjz89gx9qyfev/ArcGIS/rest/services/Corona_Exposure_View/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=`;
const map = L.map('mapid').setView([32.0813262, 34.7775611], 15);

const propToText = (prop, sep) => {
    sep = sep || "<br>";
    let text = prop.Place;
    if (prop.Comments) text += sep + prop.Comments;
    text += sep + "הגיע ב " + new Date(prop.fromTime).toLocaleString('he-IL');
    text += sep + "עזב ב " + new Date(prop.toTime).toLocaleString('he-IL');
    return text;
};

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

fetch(url)
    .then((response) => response.json())
    .then((json) => {
        var markers = L.markerClusterGroup({ chunkedLoading: true });
        json.features.forEach(loc => {
            const prop = loc.properties;
            const coord = loc.geometry.coordinates;
            const pos = L.latLng(coord[1], coord[0]);
            const marker = L.marker(pos, { title: propToText(prop, "\n") });
            marker.bindPopup(propToText(prop));
            markers.addLayer(marker);
        });
        map.addLayer(markers);
    });
