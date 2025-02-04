const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, '/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/

const loginAttempts = new Map();
const blockedUsers = new Map();
const logFilePath = path.join(__dirname, 'data', 'prijave.txt');
// Funkcija za logovanje pokušaja prijave
const logAttempt = async (username, status) => {
  const date = new Date().toISOString();
  const logMessage = `[${date}] - username: "${username}" - status: "${status}"\n`;
  try {
    //await fs.appendFile(path.join(__dirname, 'prijave.txt'), logMessage, 'utf8');
    //await fs.appendFile(path.resolve('prijave.txt'), logMessage, 'utf8');
    await fs.appendFile(logFilePath, logMessage, 'utf8');
  } catch (err) {
    console.error('Greška prilikom zapisivanja u prijave.txt:', err);
  }
};

app.post('/login', async (req, res) => {
  const jsonObj = req.body;

  try {
    // Provjera da li je korisnik blokiran
    if (blockedUsers.has(jsonObj.username)) {
      const vrijemeUnbloka = blockedUsers.get(jsonObj.username); // po kljucu daj vrijeme kada ce biti unblokiran
      const preostaliTimeout = (vrijemeUnbloka - Date.now()) / 1000; // Preostalo vrieme za blokadu u sekundama
      if (preostaliTimeout > 0) {
        return res.status(429).json({
          greska: `Previše neuspješnih pokušaja. Pokušajte ponovo za ${Math.ceil(preostaliTimeout)} sekundi.`,
        });
      } else {
        blockedUsers.delete(jsonObj.username); // Uklanjanje korisnika iz blokade nakon isteka vremena
        loginAttempts.delete(jsonObj.username); // Reset broj pokušaja
      }
    }

    const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');
    const korisnici = JSON.parse(data);
    let found = false;

    for (const korisnik of korisnici) {
      if (korisnik.username == jsonObj.username) {

        let brojPokusaja = loginAttempts.get(korisnik.username) || 1;
        if (brojPokusaja >= 3) {
          // Blokiranje korisnika na 1 minut nakon 3 neuspješna pokušaja
          blockedUsers.set(korisnik.username, Date.now() + 60000); // Dodavanje vremena blokade (1 minut)
          logAttempt(korisnik.username, 'neuspješno (blokiran)');
          return res.status(429).json({ greska: 'Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu.' });
        }

        const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);

        if (isPasswordMatched) {
          req.session.user = { username: korisnik.username, id: korisnik.id }; // Postavljanje sesije
          req.session.username = korisnik.username;
          loginAttempts.delete(korisnik.username); // Resetuje broj pokušaja nakon uspješne prijave
          blockedUsers.delete(korisnik.username); // Uklanja korisnika iz blokiranih
          logAttempt(korisnik.username, 'uspješno');
          found = true;
          break;
        }
        else{
          // Povećava broj pokušaja prijave
          loginAttempts.set(korisnik.username, brojPokusaja + 1);
          logAttempt(korisnik.username, 'neuspješno');
        }
      }
    }

    if (found) {
      //req.session.korisnik = { id: korisnik.id, username: korisnik.username };
      res.json({ poruka: 'Uspješna prijava' });
    } else {
      res.json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {
  try {
  const nekretnineData = await readJsonFile('nekretnine');
  const lokacija = req.query.lokacija;

  if (!lokacija) {
      console.log("Lokacija nije specificirana!");
      return res.status(400).json({ error: "Lokacija nije specificirana!" });
  }

    /* const filtriraneNekretnine = nekretnineData
        .filter(nekretnina => nekretnina.lokacija.toLowerCase() === lokacija.toLowerCase())
        .sort((a, b) => new Date(b.datum_objave) - new Date(a.datum_objave))
        .slice(0, 5); */
/*     let filtriraneNekretnine=nekretnineData; Console.log("prvobitne ",filtriraneNekretnine);
    filtriraneNekretnine=filtriraneNekretnine.filter(nekretnina => nekretnina.lokacija.toLowerCase() === lokacija.toLowerCase()); Console.log("filtrirane ",filtriraneNekretnine);
    filtriraneNekretnine=filtriraneNekretnine.sort((a, b) => new Date(b.datum_objave) - new Date(a.datum_objave)); Console.log("sortirane ",filtriraneNekretnine);
    filtriraneNekretnine=filtriraneNekretnine.slice(0, 5); Console.log("finalne ",filtriraneNekretnine); */

    // Funkcija za parsiranje datuma u formatu dd.mm.yyyy
    function parseDate(datum) {
      const [dan, mjesec, godina] = datum.split('.').map(Number);
      return new Date(godina, mjesec-1, dan);
  }

  // Filtriranje i sortiranje
  const filtriraneNekretnine = nekretnineData
      .filter(nekretnina => nekretnina.lokacija.toLowerCase() === lokacija.toLowerCase())
      .sort((a, b) => parseDate(b.datum_objave) - parseDate(a.datum_objave))
      .slice(0, 5);

    console.log("Filtrirane nekretnine:", filtriraneNekretnine);
    return res.status(200).json(filtriraneNekretnine);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  console.log('Sadržaj sesije:', req.session);
  // Check if the user is authenticated
  if (!req.session.user) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { nekretnina_id, tekst_upita } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Read properties data from the JSON file
    const nekretnine = await readJsonFile('nekretnine');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.user.username);

    if (!loggedInUser) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Check if the property with nekretnina_id exists
    const nekretnina = nekretnine.find((property) => property.id === nekretnina_id);

    if (!nekretnina) {
      // Property not found
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    const upitiKorisnika = nekretnina.upiti.filter(
      (upit) => upit.korisnik_id === loggedInUser.id
    );
    if (upitiKorisnika.length >= 3) {
      return res.status(429).json({ greska: 'Previse upita za istu nekretninu.' });
    }

    // Add a new query to the property's queries array
    nekretnina.upiti.push({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst_upita
    });

    // Save the updated properties data back to the JSON file
    await saveJsonFile('nekretnine', nekretnine);

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/upiti/moji', async (req, res) => {
  // Provjera da li je korisnik loginovan
  if (!req.session.user) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    // Učitavanje podataka o nekretninama
    const nekretnine = await readJsonFile('nekretnine');

    // Dohvati ID loginovanog korisnika
    const korisnikId = req.session.user.id;

    // Prikupi sve upite za loginovanog korisnika
    const upiti = nekretnine.flatMap(nekretnina => 
      nekretnina.upiti
        .filter(upit => upit.korisnik_id === korisnikId)
        .map(upit => ({
          id_nekretnine: nekretnina.id,
          tekst_upita: upit.tekst_upita
        }))
    );

    // Provjera da li ima upita
    if (upiti.length === 0) {
      return res.status(404).json([]);
    }

    // Vraćanje liste upita
    res.status(200).json(upiti);
  } catch (error) {
    console.error('Greška prilikom dobavljanja upita:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  // Dohvatanje ID-a nekretnine iz parametara rute
  const nekretninaId = parseInt(req.params.id, 10);

  try {
    // Učitavanje podataka o nekretninama
    const nekretnine = await readJsonFile('nekretnine');

    // Pronalazak nekretnine s odgovarajućim ID-em
    const nekretnina = nekretnine.find(property => property.id === nekretninaId);

    if (!nekretnina) {
      // Ako nekretnina ne postoji, vraća status 404
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} ne postoji` });
    }

    // Kreiranje kopije nekretnine sa skraćenom listom upita
    const detaljiNekretnine = {
      ...nekretnina, //sve iz nekretnine sa trazenim id-em se kopira u detaljiNekretnine
      upiti: nekretnina.upiti.slice(-3), // Uzimanje posljednja 3 upita
    };

    // Vraćanje detalja nekretnine
    res.status(200).json(detaljiNekretnine);
  } catch (error) {
    console.error('Greška prilikom dobavljanja nekretnine:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id); // Uzimanje ID nekretnine iz parametara rute
  const page = parseInt(req.query.page); // Uzimanje broja stranice iz query parametra

  if (isNaN(page) || page < 0) {
    // Ako je page negativan broj, vraća se prazan niz
    return res.status(404).json([]);
  }

  try {
    // Čitanje podataka o nekretninama
    const nekretnine = await readJsonFile('nekretnine');

    // Pronalaženje nekretnine prema ID-u
    const nekretnina = nekretnine.find((property) => property.id === nekretninaId);

    if (!nekretnina) {
      // Ako nekretnina nije pronađena, vraća se 404
      return res.status(404).json({ greska: `Nekretnina sa ID-em ${nekretninaId} nije pronađena` });
    }

    // Ukupno upita za nekretninu
    const totalUpiti = nekretnina.upiti.length;

    // Paginacija: obrnut redoslijed
    const reversedUpiti = nekretnina.upiti.slice().reverse();

    if (page === 0) {
      // Za page=0 vraća se posljednja 3 upita
      const poslednjaTri = reversedUpiti.slice(0, 3);
      return res.status(200).json(poslednjaTri.map(upit => ({
        korisnik_id: upit.korisnik_id,
        tekst_upita: upit.tekst_upita
      })));
    }

    // Računanje početnog i krajnjeg indeksa za traženu stranicu
    const startIndex = page * 3;
    const endIndex = startIndex + 3;

    // Provjera da li postoje upiti na traženoj stranici
    const upitiNaStranici = reversedUpiti.slice(startIndex, endIndex);

    if (upitiNaStranici.length === 0) {
      // Ako nema više upita na traženoj stranici, vraća se 404 i prazan niz
      return res.status(404).json([]);
    }

    // Formatiranje odgovora: samo `korisnik_id` i `tekst_upita`
    const odgovor = upitiNaStranici.map(upit => ({
      korisnik_id: upit.korisnik_id,
      tekst_upita: upit.tekst_upita
    }));

    res.status(200).json(odgovor);
  } catch (error) {
    console.error('Error fetching property queries:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});



/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile('korisnici', users);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnineData = await readJsonFile('nekretnine');
    res.json(nekretnineData);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
