const API_URL = 'https://www.metaweather.com/api'
const htmlResponse = document.querySelector('#app')

let currentLat, currentLong;
let currentPanel = 'main'

const weekDays = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
]

window.onload = () => {
    getCurrentLocation()
    document.querySelector('#search-location-input').addEventListener('keyup', (e) => {
        if (e.keyCode == 13) {
            showSearchResults(document.querySelector('#search-location-input').value)
        }
    })

    document.querySelector('#search-action-button').addEventListener('click', () => {
        showSearchResults(document.querySelector('#search-location-input').value)
    })

    document.querySelector('#search-button').addEventListener('click', () => {
        document.querySelector('#search-panel').style.visibility = 'visible'
        document.querySelector('#search-panel').style.opacity = '1'
        document.querySelector('#search-blur-bg').style.visibility = 'visible'
    })
}

var id = 0

function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
        //success
        (pos) => {
            currentLat = pos.coords.latitude
            currentLong = pos.coords.longitude
            getLocation(`lat=${pos.coords.latitude} lon=${pos.coords.longitude}`)
        },

        //Error
        (err) => {
            console.error('No se ha podido obtener la ubicación')
        }
    );
}

function getLocation(location) {
    fetch(`http://api.weatherapi.com/v1/current.json?key=c81431d21f094e0da6191356222104&q=${location} &lang=es`)
        .then((response) => {
            return response.json()
        })
        .then((cities) => {
            updateInfoPanel(cities)
        })
        .catch(e => console.log(e));


    document.querySelector('#search-panel').style.visibility = 'hidden'
    document.querySelector('#search-panel').style.opacity = '0'
    document.querySelector('#search-blur-bg').style.visibility = 'hidden'

    get5DayWeather(location)
}

function get5DayWeather(location) {
    fetch(`http://api.weatherapi.com/v1/forecast.json?key=c81431d21f094e0da6191356222104&q=${location} &lang=es&days=3`)
        .then((response) => {
            return response.json()
        })
        .then(days => {
            let container = document.querySelector('#forecast-container')
            container.innerHTML = ''
            let i = 0
            let dayIndex = new Date().getDay() - 1
            setChart(days['forecast']['forecastday'][0]['hour'])
            days['forecast']['forecastday'].forEach(day => {
                console.log(day)
                container.innerHTML += `<div id="forecast-${i}" class="forecast-element" onclick="showExtraForecastInfo('#forecast-${i}-extra','#forecast-${i}')">
                                            <div class="forecast-main-info">
                                                <span class="forecast-date">${i==0?'Hoy':weekDays[dayIndex]}</span>
                                                <div class="forecast-icon" style="background-image: url('${day['day']['condition']['icon']}')"></div>
                                                <span class="forecast-temperature">${Math.floor(day['day']['avgtemp_c'])}</span>
                                            </div>
                                            <div id="forecast-${i}-extra" class="forecast-extra-info">
                                                <div class="temperature-panel">
                                                    <span class="max-tmp">${Math.floor(day['day']['maxtemp_c'])}</span>
                                                    <span class="min-tmp">${Math.floor(day['day']['mintemp_c'])}</span>
                                                </div>
                                                <div class="sun-panel">
                                                    <div class="horizontal-layout">
                                                        <div class="sunrise-icon"></div>
                                                        <span class="sunrise">${day['astro']['sunrise']}</span>
                                                    </div>
                                                    <div class="horizontal-layout">
                                                        <div class="sunset-icon"></div>
                                                        <span class="sunset">${day['astro']['sunset']}</span>
                                                    </div>
                                                </div>
                                                <div class="wind-panel">
                                                        <div></div>
                                                        <span>${day['day']['maxwind_kph']}km/h</span>
                                                </div>
                                            </div>
                                        </div>`
                i++
                dayIndex++
                if (dayIndex >= 7)
                    dayIndex = 0
            });

            let firstForecast = document.querySelector('#forecast-0-extra')
            let firstForecastParent = document.querySelector('#forecast-0')
            firstForecastParent.classList.add('forecast-element-active')

            firstForecast.style.visibility = 'visible'
            firstForecast.style.display = 'flex'
        })
}

function showExtraForecastInfo(element, parent) {
    document.querySelectorAll('.forecast-element').forEach(element => {
        element.classList.remove('forecast-element-active')
        element.querySelector('.forecast-extra-info').style.visibility = 'hidden'
        element.querySelector('.forecast-extra-info').style.display = 'none'
    })

    let div = document.querySelector(element)
    let parentDiv = div.parentNode;

    parentDiv.classList.add('forecast-element-active')

    div.style.visibility = 'visible'
    div.style.display = 'flex'
}

function updateInfoPanel(data) {
    document.querySelector('#location-text').innerHTML = data.location.name;
    document.querySelector('#temperature-text').innerHTML = `${data['current']['temp_c']}<span>ºC</span>`
    document.querySelector('.weather-condition-text').innerHTML = `${data['current']['condition']['text']}`
    document.querySelector('.weather-icon').style.backgroundImage = `url(${data['current']['condition']['icon']})`
    document.querySelector('#extra-data-container > div > p').innerHTML = `${data['current']['wind_kph']}km/h`
    setBackground(document.querySelector('.current-location-container'), `${data['current']['condition']['text']}`)
}

function setBackground(element, value) {
    if (value == 'Soleado') {
        element.style.backgroundImage = `url(./img/sunny.webp)`
    } else if (value == 'Parcialmente nublado') {
        element.style.backgroundImage = `url(./img/partly-cloudy.webp)`
    } else if (value.toLowerCase().includes('lluvi') || value.toLowerCase().includes('precipi') || value.toLowerCase().includes('llov')) {
        element.style.backgroundImage = `url(./img/rainning.webp)`
    } else if (value.toLowerCase().includes('nublado')) {
        element.style.backgroundImage = `url(./img/cloudy.jfif)`
    } else if (value == 'Despejado') {
        element.style.backgroundImage = `url(./img/night.jfif)`
    }
}

function showSearchResults(value) {
    let container = document.querySelector('#search-results-container')
    fetch(`http://api.weatherapi.com/v1/search.json?key=c81431d21f094e0da6191356222104&q=${value}&lang=es`)
        .then((response) => {
            return response.json()
        })
        .then((locations) => {
            console.log(locations)
            container.innerHTML = ''
            let i = 0;
            locations.forEach(location => {
                container.innerHTML += `<div class="location-result" onclick="getLocation('${location['name']}')" style="animation-delay:${i * 0.05}s; opacity:0">
                                            <span>${location['name']}</span>
                                            <span>${location['region']}, ${location['country']}</span>
                                            <span>${location['lat']}, ${location['lon']}</span>
                                        </div>`
                i++
            });
        })
}

let chart;

function setChart(hoursData) {
    const ctx = document.getElementById('weather-chart').getContext('2d');
    const datapoints = [];
    for (let i = 0; i < 24; i++) {
        datapoints.push(hoursData[i]['temp_c'])
    }
    if (chart != undefined)
        chart.destroy()
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
            datasets: [{
                label: 'Temperatura',
                data: datapoints,
                borderColor: '#90CAF9',
                backgroundColor: 'rgba(207, 216, 220, 0.5)',
                fill: true,
                cubicInterpolationMode: 'monotone',
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            interaction: {
                intersect: false,
                mode: 'index',
            },
            layout: {
                padding: {
                    left: 50
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label = context.parsed.y + 'ºC'
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: false,
                    suggestedMin: 0,
                    suggestedMax: 40
                }
            }
        }
    });
}