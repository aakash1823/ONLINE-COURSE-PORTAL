function myFunction(e) {
    e.preventDefault();
    var table = document.getElementById("data");
    var row = table.insertRow(-1);
    var cell9 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);
   
    
    var chkBox = document.createElement('input');
    chkBox.type='checkbox';
    cell9.appendChild(chkBox);
    
    cell1.innerHTML=document.getElementById("fname").value;
    cell2.innerHTML=document.getElementById("lname").value;
    cell3.innerHTML=document.getElementById("HODname").value;
    cell4.innerHTML=document.getElementById("Dept_CAPACITY").value;
    
    }
function deleteRow()  {
        var table = document.getElementById("data").tBodies[0];
        var rowCount = table.rows.length;

        for(var i=1; i<rowCount; i++) {
            var row = table.rows[i];
            var chkbox = row.cells[0].getElementsByTagName('input')[0];
            if(null !== chkbox && true === chkbox.checked) {
                table.deleteRow(i);
                rowCount--;
                i--;
             }
        }
}