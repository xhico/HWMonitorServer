/*
    @author: xhico
 */

async function loadMetricBtn() {
    // Show Loading
    await loadingScreen("show");

    let numberTime = document.querySelector("#numberTime").value;
    let unitTime = document.querySelector("#unitTime").value;
    let hwMetric = document.querySelector("#hwMetric").value;

    // Get Ambient Data
    console.log("Get " + hwMetric + " Data");
    let JSON = await $.ajax({
        method: "post", url: "/history/info", data: {numberTime: numberTime, unitTime: unitTime, hwMetric: hwMetric}, success: function (data) {
            return data;
        }
    });

    // Add metrics to select options
    let availableMetrics = JSON["availableMetrics"];
    let selectOptions = document.querySelector("#hwMetric");
    selectOptions.innerHTML = "";

    for (let key of availableMetrics) {
        let divOne = document.createElement("option");
        divOne.value = key;
        divOne.innerText = /[a-z]/.test(key) ? key.replace(/([A-Z])/g, ' $1').trim() : key;
        selectOptions.appendChild(divOne);
    }
    document.querySelector("#hwMetric").value = hwMetric;

    // Set Charts
    await initCharts(JSON["historicInfo"]);

    // Remove Loading
    await loadingScreen("remove");
}

async function initCharts(JSON) {
    // Reset Charts
    let chartsRow = document.querySelector("#charts");
    chartsRow.innerHTML = "";

    // Get chartNames
    let chartNames = Object.keys(JSON).filter(key => key !== "timestamps" && !key.endsWith("_avg"));

    // Get Charts
    let dates = JSON["timestamps"];

    // Iterate over every Chart
    for (let chartName of chartNames) {
        // Create Figure
        let divOne;
        divOne = document.createElement("figure");
        divOne.classList.add("highcharts-figure", "col-xl-6", "col-md-12", "border-top", "border-end", "border-bottom", "border-start", "margin-0");
        divOne.id = "chart_" + chartName;
        chartsRow.appendChild(divOne);

        // Set Series Data
        let seriesData = JSON[chartName];
        let avgData = JSON[chartName + "_avg"];

        // Add info to Chart
        new Highcharts.Chart({
            chart: {renderTo: "chart_" + chartName, type: "spline"},
            title: {text: chartName.replaceAll("_", " ")},
            exporting: {enabled: false},
            credits: {enabled: false},
            legend: {enabled: false},
            tooltip: {
                formatter: function () {
                    let xValue = dates[this.x];
                    let yValue = ((this.y < 100000) ? this.y : convert_size(this.y, 1));
                    return "Date: <b>" + xValue + "</b> </br> Value: <b>" + yValue + "</b>";
                }
            },
            yAxis: {
                crosshair: true,
                min: (chartName.includes("Percentage") ? 0 : Math.min(...seriesData)),
                max: (chartName.includes("Percentage") ? 100 : Math.max(...seriesData)),
                title: {text: ""}, labels: {
                    formatter: function () {
                        return ((this.value < 100000) ? this.value : convert_size(this.value, 1));
                    }
                }
            },
            xAxis: {
                crosshair: true,
                tickInterval: 3, type: "datetime", labels: {
                    enabled: true, formatter: function () {
                        return dates;
                    }
                }
            },
            series: [{
                name: "Average", data: avgData, color: "#9B9D9E", marker: {enabled: false}
            }, {
                name: chartName.replaceAll("_", " "), data: seriesData, color: "#AB2844", marker: {enabled: false}
            }]
        });
    }
}

window.addEventListener('DOMContentLoaded', async function main() {
    document.querySelector("#navbar_history").classList.add("active");

    // Init Charts
    await loadMetricBtn();
});