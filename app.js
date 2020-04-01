'use strict';

import { downloadSingleKml } from './kml.js';

class App {
    propToText(prop, sep) {
        sep = sep || "<br>";
        let text = prop.Place;
        if (prop.Comments) text += sep + prop.Comments;
        text += sep + "הגיע ב " + new Date(prop.fromTime).toLocaleString('he-IL');
        text += sep + "עזב ב " + new Date(prop.toTime).toLocaleString('he-IL');
        return text;
    }

    filterByTime() {
        if (!this.firstTime || !this.lastTime) return;
        const curr = parseFloat(document.getElementById("slider").value);
        const currTime = this.firstTime + curr * (this.lastTime - this.firstTime);
        document.getElementById("date-to-show").textContent = new Date(currTime).toLocaleString('he-IL');
        this.markerCluster.clearLayers();
        this.markers.filter(m => m.fromTime <= currTime && m.toTime >= currTime).forEach(marker => {
            this.markerCluster.addLayer(marker);
        });
    }

    googleToLatLng(loc) {
        let lat = loc.latitudeE7;
        let lng = loc.longitudeE7;
        if (lat > 900000000) lat = lat - 4294967296;
        if (lng > 1800000000) lng = lng - 4294967296;
        return L.latLng(lat / 1e7, lng / 1e7);
    }

    processDuration(duration) {
        return {
            fromTime: new Date(parseFloat(duration.startTimestampMs)),
            toTime: new Date(parseFloat(duration.endTimestampMs))
        };
    }
    isDateBetween(check, from, to) {
        return check >= from && check <= to;
    }
    isDurationOverlap(one, two) {
        return this.isDateBetween(one.fromTime, two.fromTime, two.toTime) || this.isDateBetween(two.fromTime, one.fromTime, one.toTime + 1000 * 60 * 15);
    }
    checkLocation(myLocation) {
        const problem = this.markers.find(m => {
            return this.isDurationOverlap(m, myLocation.duration) && m.getLatLng().distanceTo(myLocation.start) < 100;
        });
        if (problem) {
            L.circleMarker(problem.getLatLng(), { color: 'red', radius: 20 }).addTo(this.map);
        }
    }
    processGoogleHistory(event) {
        event.target.files[0].text().then(text => {
            const json = JSON.parse(text);
            const places = json.timelineObjects.map(obj => {
                if (obj.activitySegment) {
                    return {
                        start: this.googleToLatLng(obj.activitySegment.startLocation),
                        end: this.googleToLatLng(obj.activitySegment.endLocation),
                        duration: this.processDuration(obj.activitySegment.duration)
                    }
                } else if (obj.placeVisit) {
                    return {
                        start: this.googleToLatLng(obj.placeVisit.location),
                        duration: this.processDuration(obj.placeVisit.duration)
                    }
                }
            });
            places.forEach(place => {
                if (place.end) {
                    L.polyline([place.start, place.end], { color: 'blue' }).addTo(this.map);
                } else {
                    L.circleMarker(place.start).addTo(this.map);
                    this.checkLocation(place);
                }
            })
        });
    }

    processJson(json) {
        this.markers = json.features.map(loc => {
            const prop = loc.properties;
            this.firstTime = this.firstTime === undefined ? prop.fromTime : Math.min(this.firstTime, prop.fromTime);
            this.lastTime = this.lastTime === undefined ? prop.toTime : Math.max(this.lastTime, prop.toTime);
            const coord = loc.geometry.coordinates;
            const pos = L.latLng(coord[1], coord[0]);
            const marker = L.marker(pos, { title: this.propToText(prop, "\n") });
            marker.fromTime = prop.fromTime;
            marker.toTime = prop.toTime;
            marker.bindPopup(this.propToText(prop));
            return marker;
        });
        this.markerCluster = L.markerClusterGroup({ chunkedLoading: true });
        this.markers.forEach(marker => {
            this.markerCluster.addLayer(marker);
        });
        this.map.addLayer(this.markerCluster);
        document.getElementById("slider").addEventListener("input", () => this.filterByTime());
        document.getElementById("file-google-json").addEventListener("change", e => this.processGoogleHistory(e));
    }

    constructor() {
        const url = `https://services5.arcgis.com/dlrDjz89gx9qyfev/ArcGIS/rest/services/Corona_Exposure_View/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=`;
        this.map = L.map('mapid').setView([32.0813262, 34.7775611], 9);

        // document.getElementById("download-my-locations").addEventListener("click", () => downloadSingleKml());

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        fetch(url)
            .then((response) => response.json())
            .then((json) => this.processJson(json));
    }
};

const app = new App();
