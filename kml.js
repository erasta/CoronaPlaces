export const downloadSingleKml = () => {
    const now = new Date();
    const back = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60);
    downloadAllKml(back, now);
}

export const downloadAllKml = (fromDate, toDate) => {
    console.log(fromDate, toDate);
    //    "https://www.google.com/maps/timeline/kml?authuser=0&pb=!1m8!1m3!1i2019!2i6!3i1!2m3!1i2019!2i7!3i28"
    let download_url = "https://www.google.com/maps/timeline/kml?authuser=0&pb=!1m8!1m3!1i"
        + fromDate.getFullYear() + "!2i" + fromDate.getMonth() + "!3i" + fromDate.getDate() + "!2m3!1i"
        + toDate.getFullYear() + "!2i" + toDate.getMonth() + "!3i" + toDate.getDate();

    console.log(download_url);
    let anchor = document.createElement('a');
    anchor.href = download_url;
    anchor.target = "_blank";
    anchor.setAttribute('rel', 'noreferrer');
    const str_month = `0${fromDate.getMonth() + 1}`.slice(-2);  // starts from 0
    const str_day = `0${fromDate.getDate()}`.slice(-2);
    anchor.download = `history-${fromDate.getFullYear()}-${str_month}-${str_day}.kml`;

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
    });
    anchor.dispatchEvent(evt);

    (window.URL || window.webkitURL).revokeObjectURL(anchor.href);
}
