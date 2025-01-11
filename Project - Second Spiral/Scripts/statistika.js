document.addEventListener('DOMContentLoaded', () => {
    const yearRangesSection = document.getElementById('year-ranges-section');
    const priceRangesSection = document.getElementById('price-ranges-section');
    const drawHistogramButton = document.getElementById('draw-histogram');
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');
    let currentChart = null;
    let yearCount = 0;
    let priceCount = 0;
  
    // Funkcija za postavljanje event listener-a za uklanjanje
    function addRemoveEventListeners() {
      document.querySelectorAll('.remove-range').forEach(button => {
        button.removeEventListener('click', removeRange);
        button.addEventListener('click', removeRange);
      });
    }
  
    // Dodavanje novog raspona godina
    document.getElementById('add-year-range').addEventListener('click', () => {
      yearCount++;
      const rangeInput = createRangeInput('year-from', 'year-to', 'year-range-' + yearCount);
      yearRangesSection.insertBefore(rangeInput, yearRangesSection.querySelector('#add-year-range'));
      addRemoveEventListeners();
    });
  
    // Dodavanje novog raspona cijena
    document.getElementById('add-price-range').addEventListener('click', () => {
      priceCount++;
      const rangeInput = createRangeInput('price-from', 'price-to', 'price-range-' + priceCount);
      priceRangesSection.insertBefore(rangeInput, priceRangesSection.querySelector('#add-price-range'));
      addRemoveEventListeners();
    });

    drawHistogramButton.addEventListener('click', () => {
      const yearRanges = getRanges('year-from', 'year-to');
      const priceRanges = getRanges('price-from', 'price-to');
  
      if (yearRanges.length === 0 || priceRanges.length === 0) {
        alert('Molimo unesite barem jedan raspon za godine i cijene.');
        return;
      }

      if (currentChart) {
        currentChart.destroy();
      }
  
      const histogramData = StatistikaNekretnina.histogramCijena(yearRanges, priceRanges);
  
      const priceLabels = priceRanges.map(range => `${range.od} - ${range.do}`);
      const periodLabels = yearRanges.map(range => `${range.od} - ${range.do}`);
  
      const data = priceRanges.map((_, priceIndex) => {
        return yearRanges.map((_, yearIndex) => {
          const match = histogramData.find(hist => hist.rasponIndex === priceIndex && hist.periodIndex === yearIndex);
          return match ? match.brojNekretnina : 0;
        });
      });
  
      const chartData = {
        labels: priceLabels,
        datasets: yearRanges.map((yearRange, index) => ({
          label: `${yearRange.od} - ${yearRange.do}`,
          data: data.map(d => d[index]),
          backgroundColor: `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, 200, 0.6)`,
          borderColor: `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, 200, 1)`,
          borderWidth: 1
        }))
      };
  
      const config = {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: 'Rasponi cijena' } },
            y: { beginAtZero: true, title: { display: true, text: 'Broj nekretnina' } }
          },
          plugins: {
            legend: { position: 'top' },
            tooltip: { callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.raw} nekretnina`;
              }
            }}
          }
        }
      };
  
      currentChart = new Chart(ctx, config);
    });
  
    function createRangeInput(fromClass, toClass, uniqueId) {
      const div = document.createElement('div');
      div.classList.add('range-input');
      div.id = uniqueId;
  
      const fromInput = document.createElement('input');
      fromInput.type = 'number';
      fromInput.classList.add(fromClass);
      fromInput.placeholder = 'Od';
  
      const toInput = document.createElement('input');
      toInput.type = 'number';
      toInput.classList.add(toClass);
      toInput.placeholder = 'Do';
  
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Ukloni';
      removeButton.classList.add('remove-range');
      removeButton.addEventListener('click', removeRange);
  
      div.appendChild(fromInput);
      div.appendChild(toInput);
      div.appendChild(removeButton);
  
      return div;
    }
  
    function removeRange(event) {
      const rangeDiv = event.target.parentElement;
      rangeDiv.remove();
    }
  
    function getRanges(fromClass, toClass) {
      const ranges = [];
      document.querySelectorAll(`.${fromClass}`).forEach((fromInput, index) => {
        const toInput = document.querySelectorAll(`.${toClass}`)[index];
        const fromValue = Number(fromInput.value);
        const toValue = Number(toInput.value);
  
        if (!isNaN(fromValue) && !isNaN(toValue) && fromValue < toValue) {
          ranges.push({ od: fromValue, do: toValue });
        }
      });
      return ranges;
    }
    // Odmah dodaj event listener-e za već postojeće rasponе
    addRemoveEventListeners();

    document.getElementById('calculateAvgBtn').addEventListener('click', function () {
        const tipNekretnine = document.getElementById('tipNekretnine').value;
        const minKvadratura = parseInt(document.getElementById('minKvadratura').value) || 0;
        const maxKvadratura = parseInt(document.getElementById('maxKvadratura').value) || Infinity;
        const tipGrijanja = document.getElementById('tipGrijanja').value;
        const lokacija = document.getElementById('lokacija').value;
        const godinaIzgradnje = parseInt(document.getElementById('godinaIzgradnje').value) || 0;
    
        // Kriteriji za prosječnu kvadraturu
        const kriterij = {};
        if (tipNekretnine) kriterij.tip_nekretnine = tipNekretnine;
        if (minKvadratura > 0) kriterij.min_kvadratura = minKvadratura;
        if (maxKvadratura < Infinity) kriterij.max_kvadratura = maxKvadratura;
        if (tipGrijanja) kriterij.tip_grijanja = tipGrijanja;
        if (lokacija) kriterij.lokacija = lokacija;
        if (godinaIzgradnje > 0) kriterij.godina_izgradnje = godinaIzgradnje;
    
        const avgKvadratura = StatistikaNekretnina.prosjecnaKvadratura(kriterij);
        document.getElementById('result').textContent = avgKvadratura !== "Nema takvih nekretnina!" ? avgKvadratura : "Nema takvih nekretnina!";
    });

    // Dugme za pronalazak outlier-a
    document.getElementById('calculateOutlierBtn').addEventListener('click', function () {
        const tipNekretnine = document.getElementById('tipNekretnine').value;
        const minKvadratura = parseInt(document.getElementById('minKvadratura').value) || 0;
        const maxKvadratura = parseInt(document.getElementById('maxKvadratura').value) || Infinity;
        const tipGrijanja = document.getElementById('tipGrijanja').value;
        const lokacija = document.getElementById('lokacija').value;
        const godinaIzgradnje = parseInt(document.getElementById('godinaIzgradnje').value) || 0;

        const nazivSvojstva = document.getElementById('nazivSvojstva').value;
        if (!nazivSvojstva) {
            alert("Molimo odaberite svojstvo za outlier.");
            return;
        }

        // Kriteriji za outlier
        const kriterij = {};
        if (tipNekretnine) kriterij.tip_nekretnine = tipNekretnine;
        if (minKvadratura > 0) kriterij.min_kvadratura = minKvadratura;
        if (maxKvadratura < Infinity) kriterij.max_kvadratura = maxKvadratura;
        if (tipGrijanja) kriterij.tip_grijanja = tipGrijanja;
        if (lokacija) kriterij.lokacija = lokacija;
        if (godinaIzgradnje > 0) kriterij.godina_izgradnje = godinaIzgradnje;

        const outlier = StatistikaNekretnina.outlier(kriterij, nazivSvojstva);
        const outlierDetails = document.getElementById('outlierDetails');
        if (outlier) {
            outlierDetails.innerHTML = `
                Tip nekretnine: ${outlier.tip_nekretnine || "N/A"}<br>
                Naziv: ${outlier.naziv || "N/A"}<br>
                Kvadratura: ${outlier.kvadratura || "N/A"}<br>
                Cijena: ${outlier.cijena || "N/A"}<br>
                Tip grijanja: ${outlier.tip_grijanja || "N/A"}<br>
                Godina izgradnje: ${outlier.godina_izgradnje || "N/A"}<br>
                Lokacija: ${outlier.lokacija || "N/A"}<br>
                Datum objave: ${outlier.datum_objave || "N/A"}<br>
                Opis: ${outlier.opis || "N/A"}<br>
            `;
        } else {
            outlierDetails.textContent = "Nema nekretnine koja zadovoljava kriterije.";
        }
    });

    document.getElementById('findMyProperties').addEventListener('click', function () {
        const korisnikId = parseInt(document.getElementById('korisnik-id').value);
    
        if (isNaN(korisnikId) || korisnikId <= 0) {
            alert('Molimo unesite validan ID korisnika.');
            return;
        }
    
        const mojeNekretnine = StatistikaNekretnina.mojeNekretnine(korisnikId);
    
        const table = document.getElementById('propertiesTable');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
    
        if (mojeNekretnine.length === 0) {
            alert('Nema nekretnina za ovog korisnika.');
            table.style.display = 'none';
            return;
        }
    
        // Dodavanje novih redova u tabelu
        mojeNekretnine.forEach(nekretnina => {
            const row = document.createElement('tr');
            
            // Naziv nekretnine
            const nameCell = document.createElement('td');
            nameCell.textContent = nekretnina.naziv || 'Nepoznato';
            row.appendChild(nameCell);

            // ID nekretnine
            const idCell = document.createElement('td');
            idCell.textContent = nekretnina.id || 'Nepoznato';
            row.appendChild(idCell);
    
            // Broj upita
            const queriesCell = document.createElement('td');
            queriesCell.textContent = nekretnina.brojUpita || 0;
            row.appendChild(queriesCell);

            // Datum izgradnje
            const dateCell = document.createElement('td');
            dateCell.textContent = nekretnina.godina_izgradnje || 0;
            row.appendChild(dateCell);
    
            // Lokacija
            const locationCell = document.createElement('td');
            locationCell.textContent = nekretnina.lokacija || 'Nepoznato';
            row.appendChild(locationCell);
    
            tbody.appendChild(row);
        });
    
        table.style.display = 'table';
    });

  });
  