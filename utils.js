export const lerp = (a, b, t) => {
    return a * (1-t) + b * t;
}

export const lerpPos = (a, b, t) => {
    return L.latLng(lerp(a.lat, b.lat, t), lerp(a.lng, b.lng, t));
}