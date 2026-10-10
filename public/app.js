(function () {
  var REFRESH_MS = 15 * 60 * 1000;

  var placeEl = document.getElementById('place');
  var temperatureEl = document.getElementById('temperature');
  var descriptionEl = document.getElementById('description');
  var minmaxEl = document.getElementById('minmax');
  var windEl = document.getElementById('wind');
  var rainEl = document.getElementById('rain');
  var updatedEl = document.getElementById('updated');
  var pageEl = document.querySelector('.page');

  function formatUpdatedAt(iso) {
    if (!iso) {
      return '—';
    }
    try {
      var d = new Date(iso);
      var hours = d.getHours();
      var minutes = d.getMinutes();
      var mm = minutes < 10 ? '0' + minutes : String(minutes);
      return hours + ':' + mm;
    } catch (e) {
      return '—';
    }
  }

  function showError(message) {
    if (pageEl) {
      pageEl.classList.add('error');
    }
    placeEl.textContent = 'Błąd';
    temperatureEl.textContent = '—';
    descriptionEl.textContent = message || 'Nie udało się pobrać pogody';
    minmaxEl.textContent = '—';
    windEl.textContent = '—';
    rainEl.textContent = '—';
    updatedEl.textContent = 'Aktualizacja: —';
  }

  function render(data) {
    if (pageEl) {
      pageEl.classList.remove('error');
    }
    placeEl.textContent = data.place || '—';
    temperatureEl.textContent = data.display ? data.display.temperature : '—';
    descriptionEl.textContent = data.current
      ? data.current.description
      : '—';
    minmaxEl.textContent = data.display ? data.display.minMax : '—';
    windEl.textContent = data.display ? data.display.wind : '—';
    rainEl.textContent = data.display ? data.display.rain : '—';
    updatedEl.textContent =
      'Aktualizacja: ' + formatUpdatedAt(data.updatedAt);
  }

  function loadWeather() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/weather', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data.error) {
            showError(data.error);
            return;
          }
          render(data);
        } catch (e) {
          showError('Nieprawidłowa odpowiedź serwera');
        }
        return;
      }
      showError('Serwer niedostępny (' + xhr.status + ')');
    };
    xhr.send();
  }

  if (window.__WEATHER__) {
    if (window.__WEATHER__.error) {
      showError(window.__WEATHER__.error);
    } else {
      render(window.__WEATHER__);
    }
  } else {
    loadWeather();
  }

  setInterval(function () {
    window.location.reload();
  }, REFRESH_MS);
})();
