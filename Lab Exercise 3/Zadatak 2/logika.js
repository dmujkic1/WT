function ispisiTabelu(){
    document.write('<table>');
    for (let i=0;i<=10;i++)
    {
        document.write('<tr>');
        for (let j=0;j<=10;j++)
            {
                if (i==0 && j==0) document.write(`<th>X</th>`)
                else if (i==0) document.write(`<th>${j}</th>`)
                else if (j==0) document.write(`<th>${i}</th>`)
                else document.write(`<td>${i*j}</td>`)
            }
        document.write('</tr>');
    }
}
document.write('</table>');

ispisiTabelu();