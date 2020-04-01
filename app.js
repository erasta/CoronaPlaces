'use strict';

class App {
    propToText(prop, sep) {
        sep = sep || "<br>";
        let text = prop.Place;
        if (prop.Comments) text += sep + prop.Comments;
        text += sep + "הגיע ב " + new Date(prop.fromTime).toLocaleString('he-IL');
        text += sep + "עזב ב " + new Date(prop.toTime).toLocaleString('he-IL');
        return text;
    }

    processJson(json) {
        this.markers = json.features.map(loc => {
            const prop = loc.properties;
            const coord = loc.geometry.coordinates;
            const pos = L.latLng(coord[1], coord[0]);
            const marker = L.marker(pos, { title: this.propToText(prop, "\n") });
            marker.bindPopup(this.propToText(prop));
            return marker;
        });
        this.markerCluster = L.markerClusterGroup({ chunkedLoading: true });
        this.markers.forEach(marker => {
            this.markerCluster.addLayer(marker);
        });
        this.map.addLayer(this.markerCluster);
    }

    constructor() {
        const url = `https://services5.arcgis.com/dlrDjz89gx9qyfev/ArcGIS/rest/services/Corona_Exposure_View/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=`;
        this.map = L.map('mapid').setView([32.0813262, 34.7775611], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        fetch(url)
            .then((response) => response.json())
            .then((json) => this.processJson(json));
    }
};

const app = new App();
