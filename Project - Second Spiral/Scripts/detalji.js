window.appData = {
    glavniElement: null,
    sviElementi: Object.freeze([]),
    carousel: null,
    lijevoDugmeListener: null,
    desnoDugmeListener: null,
};

window.onload = function () {
    const glavniElement = document.querySelector('#upiti'); // Div koji sadrži sve upite
    const sviElementi = Array.from(document.querySelectorAll('#upiti .upit')); // Svi upiti

    function inicijalizirajCarouselAkoJePotrebno() {
        const carouselNavigation = document.querySelector("#carousel-navigation");

        if (window.innerWidth <= 599) {
            if (!window.appData.glavniElement) window.appData.glavniElement = glavniElement;
            if (window.appData.sviElementi.length === 0) window.appData.sviElementi = sviElementi;

            if (carouselNavigation) {
                // Ako carousel još nije inicijalizovan
                if (!window.appData.carousel) {
                    window.appData.carousel = postaviCarousel(window.appData.glavniElement, window.appData.sviElementi);
                    console.log("Inicijalizovan carousel:", window.appData.carousel);
                }

                const lijevoDugme = carouselNavigation.querySelector("button:nth-child(1)");
                const desnoDugme = carouselNavigation.querySelector("button:nth-child(2)");

                // Ukloni prethodne event listenere (ako postoje)
                // Ukloni carousel i sve event listenere (inace bih imao npr 20klikova desnog dugmeta ako resizeam prozor za 20px, umjesto jednog klika)
                if (window.appData.lijevoDugmeListener) {
                    lijevoDugme.removeEventListener("click", window.appData.lijevoDugmeListener);
                }
                if (window.appData.desnoDugmeListener) {
                    desnoDugme.removeEventListener("click", window.appData.desnoDugmeListener);
                }

                // Dodaj nove event listenere
                window.appData.lijevoDugmeListener = function () {
                    console.log("Lijevo dugme kliknuto!");
                    window.appData.carousel.fnLijevo();
                };
                window.appData.desnoDugmeListener = function () {
                    console.log("Desno dugme kliknuto!");
                    window.appData.carousel.fnDesno();
                };

                lijevoDugme.addEventListener("click", window.appData.lijevoDugmeListener);
                desnoDugme.addEventListener("click", window.appData.desnoDugmeListener);
            }
        }
        else {
           if (window.appData.sviElementi.length > 0 && window.appData.glavniElement) {
                const trenutniHTML = window.appData.glavniElement.innerHTML;
                const sviElementiHTML = window.appData.sviElementi.map(el => el.outerHTML).join('');

                if (trenutniHTML !== sviElementiHTML) {
                    window.appData.glavniElement.innerHTML = ''; // Čisti prethodni sadržaj
                    window.appData.sviElementi.forEach(el => {
                        window.appData.glavniElement.appendChild(el); // Dodaj sve inicijalne elemente
                    });
                }
            }

            if (window.appData.carousel) {
                window.appData.carousel = null;
                console.log("Carousel uklonjen jer nije potreban.");
            }

            if (carouselNavigation) {
                const lijevoDugme = carouselNavigation.querySelector("button:nth-child(1)");
                const desnoDugme = carouselNavigation.querySelector("button:nth-child(2)");

                if (window.appData.lijevoDugmeListener) {
                    lijevoDugme.removeEventListener("click", window.appData.lijevoDugmeListener);
                    window.appData.lijevoDugmeListener = null;
                }
                if (window.appData.desnoDugmeListener) {
                    desnoDugme.removeEventListener("click", window.appData.desnoDugmeListener);
                    window.appData.desnoDugmeListener = null;
                }
            }
        }
    }

    // Inicijalizacija carousela odmah nakon učitavanja stranice
    inicijalizirajCarouselAkoJePotrebno();

    // Dodavanje event listener-a za promenu veličine ekrana
    window.addEventListener("resize", () => {
        inicijalizirajCarouselAkoJePotrebno();
    });
};