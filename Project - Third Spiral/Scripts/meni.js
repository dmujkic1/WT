window.onload = function () {
  // Funkcija za ažuriranje menija na osnovu statusa prijave
  function updateMenuForLoginStatus(loggedIn) {
    // Pronađite HTML elemente menija koje želite ažurirati
    const profilLink = document.getElementById('profilLink');
    const nekretnineLink = document.getElementById('nekretnineLink');
    const detaljiLink = document.getElementById('detaljiLink');
    const prijavaLink = document.getElementById('prijavaLink');
    const odjavaLink = document.getElementById('odjavaLink');
    const mojiUpitiLink = document.getElementById('mojiUpitiLink');

    // Ako je korisnik prijavljen, pokažite opciju "Profil", inače pokažite opcije "Nekretnine", "Detalji" i "Prijava"
    if (loggedIn) {
      profilLink.style.display = 'block'; //prikazi
      nekretnineLink.style.display = 'block'; //prikazi
      detaljiLink.style.display = 'none'; //prikazi -- IPAK NE
      prijavaLink.style.display = 'none';
      odjavaLink.style.display = 'block'; //prikazi
      mojiUpitiLink.style.display = 'block';
    } else {
      profilLink.style.display = 'none';
      nekretnineLink.style.display = 'block'; //prikazi
      detaljiLink.style.display = 'none'; //prikazi -- IPAK NE
      prijavaLink.style.display = 'block'; //prikazi
      odjavaLink.style.display = 'none';
      mojiUpitiLink.style.display = 'none';
    }
  }

  // Pozivajte metodu za dobijanje korisnika kad se stranica učita
  PoziviAjax.getKorisnik(function (err, data) {
    // Ako postoji greška prilikom dobijanja korisnika, postavite loggedIn na false
    const loggedIn = !(err || !data || !data.username);

    // Ažurirajte meni na osnovu statusa prijave korisnika
    updateMenuForLoginStatus(loggedIn);
  });

  // Dodajte event listener za opciju "Odjava"
  const odjavaLink = document.getElementById('odjavaLink');
  odjavaLink.addEventListener('click', function () {
    PoziviAjax.postLogout(function (err, data) {
      if (err != null) {
        window.alert(err);
      } else {
        // Redirektujem se nazad na pocetnu stranicu prijava.html
        window.location.href = "http://localhost:3000/prijava.html";
      }

      // Update menu for login status inside the callback
      updateMenuForLoginStatus(false);
    });
  });
};