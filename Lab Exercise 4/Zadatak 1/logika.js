window.onload = function () {
    // Dohvati sve elemente s klasom "toggle"
    const toggles = document.getElementsByClassName("toggle");
    for (let i = 0; i < toggles.length; i++) toggles[i].onclick = function (){ toggleSubtree(this); };
  }
  
  function toggleSubtree(toggleElement) {
    const toggleId = toggleElement.id; // Dohvati ID kliknutog elementa
  
    let podstablo;
    if (toggleId === "prva-godina") podstablo = document.getElementById("prva-predmeti");
    else if (toggleId === "druga-godina") podstablo = document.getElementById("druga-predmeti");
  
    if (podstablo.style.display === "none" || podstablo.style.display === "")
    {
      podstablo.style.display = "block"; // Prikaži podstablo
      toggleElement.textContent = "- " + toggleElement.textContent.substring(2); // Ažuriraj tekst
    }
    else
    {
      podstablo.style.display = "none"; // Sakrij podstablo
      toggleElement.textContent = "+ " + toggleElement.textContent.substring(2); // Ažuriraj tekst
    }
  }
  