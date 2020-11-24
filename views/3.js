// function myFunction(e) {
//     e.preventDefault();
//     var table = document.getElementById("data");
//     var row = table.insertRow(-1);
//     var cell9 = row.insertCell(0);
//     var cell1 = row.insertCell(1);
//     var cell2 = row.insertCell(2);
//     var cell3 = row.insertCell(3);
//     var cell4 = row.insertCell(4);
//     var cell5 = row.insertCell(5);
//     var cell6 = row.insertCell(6);
//     var cell7 = row.insertCell(7);
//     var cell8 = row.insertCell(8);
//     var chkBox = document.createElement('input');
//     chkBox.type='checkbox';
//     cell9.appendChild(chkBox);
//     cell1.innerHTML=document.getElementById("Faculty_id").value;
//     cell2.innerHTML=document.getElementById("fname").value;
//     cell3.innerHTML=document.getElementById("lname").value;
//     cell4.innerHTML=document.getElementById("Email").value;
//     cell5.innerHTML=document.getElementById("DOB").value;
//     cell6.innerHTML=document.getElementById("inputState").value;

//     cell7.innerHTML=document.getElementById("phone").value;
//     cell8.innerHTML=document.getElementById("inputState1").value;
    
//     }
// function deleteRow()  {
//         var table = document.getElementById("data").tBodies[0];
//         var rowCount = table.rows.length;

//         for(var i=1; i<rowCount; i++) {
//             var row = table.rows[i];
//             var chkbox = row.cells[0].getElementsByTagName('input')[0];
//             if(null !== chkbox && true === chkbox.checked) {
//                 table.deleteRow(i);
//                 rowCount--;
//                 i--;
//              }
//         }
// }

var doc = new jsPDF();
var specialElementHandlers = {
  '#editor': function (element, renderer) {
return true;
}
};
$('#cmd').click(function () {
    doc.fromHTML($('#asdf').ejs(), 15, 15, {
        'width': 170,
            'elementHandlers': specialElementHandlers
    });
    doc.save('SurveyReport.pdf');
});