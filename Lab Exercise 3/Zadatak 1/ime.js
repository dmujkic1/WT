
let tekst = prompt("Unesi neki tekst: ");
if (tekst!=null && tekst!="")
{
     alert(obrni(tekst))
}

function obrni(unos){
    let obrnuti=" "
    let i
    for (i=unos.length-1; i>=0; i--) obrnuti+=unos[i]
    return obrnuti
}