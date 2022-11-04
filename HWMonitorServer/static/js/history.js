/*
    @author: xhico
 */

async function goBtn() {
    let numberTime = document.getElementById("numberTime").value;
    let unitTime = document.getElementById("unitTime").value;
    let hwMetric = document.getElementById("hwMetric").value;

    // Get Ambient Data
    console.log("Get " + hwMetric + " Data");
    let JSON = await $.ajax({
        method: "post", url: "/history/info", data: {numberTime: numberTime, unitTime: unitTime, hwMetric: hwMetric}, success: function (data) {
            return data;
        }
    });

    initCharts(JSON, numberTime, unitTime, hwMetric);
}

async function initCharts(JSON) {
    // Reset Charts
    let chartsRow = document.getElementById("charts");
    chartsRow.innerHTML = "";

    // Get Charts
    let dates = JSON["Date"];
    delete JSON["Date"];
    let chartNames = Object.keys(JSON);

    // Iterate over every Chart
    for (let chartName of chartNames) {

        // Create Figure
        let divOne;
        divOne = document.createElement("figure");
        divOne.classList.add("highcharts-figure", "col-xl-6", "col-md-12", "border-top", "border-end", "border-bottom", "border-start", "margin-0");
        divOne.id = "chart_" + chartName;
        chartsRow.appendChild(divOne);

        // Add info to Chart
        let seriesData = JSON[chartName][0].map(function (e, i) {
            return [dates[i], e];
        });
        let avgData = JSON[chartName][1].map(function (e, i) {
            return [dates[i], e];
        });

        new Highcharts.Chart({
            chart: {renderTo: "chart_" + chartName, type: "spline"},
            title: {text: chartName},
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
                title: {text: ""}, labels: {
                    formatter: function () {
                        return ((this.value < 100000) ? this.value : convert_size(this.value, 1));
                    }
                }
            },
            xAxis: {
                crosshair: true,
                tickInterval: 3, type: 'datetime', labels: {
                    enabled: true, formatter: function () {
                        return seriesData[this.value][0];
                    }
                }
            },
            series: [{
                name: "Average", data: avgData, color: "#AED6F1", marker: {enabled: false}
            }, {
                name: chartName, data: seriesData, color: "#1B4F72", marker: {enabled: false}
            }]
        });
    }
}

window.addEventListener('DOMContentLoaded', async function main() {
    console.log("---------------------");
    document.getElementById("navbar_history").classList.add("active");

    // Build HW Selector
    let hwMetricSelect = document.getElementById("hwMetric");

    // Get Hostname
    let hostname = await getHostname();
    if (hostname === "RPI4") {
        let divOne;
        divOne = document.createElement("option");
        divOne.value = "AmbientHumidityTemperature";
        divOne.innerText = "Ambient";
        hwMetricSelect.appendChild(divOne);

        divOne = document.createElement("option");
        divOne.value = "918";
        divOne.innerText = "918";
        hwMetricSelect.appendChild(divOne);
    } else if (hostname === "RPI3A") {
    }

    // Init Charts
    await goBtn();
});