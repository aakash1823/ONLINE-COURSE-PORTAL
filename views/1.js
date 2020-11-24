$(document).ready(function() {
    $(".submit").click(function() {

        var fname = $("#fname").val();
        var lname = $("#lname").val();
        var Rollno = $("#Rollno").val();
        var DOB = $("#DOB").val();
        var Email = $("#Email").val();
        var Address = $("#Address").val();
        var Gender = $("#inputState").val();
        var Phoneno=$("#phone").val();
        if (fname != "" && lname != "" && Rollno != "" && DOB != "" && Email != "" && Address != "" && Gender != "" && Phoneno != "") {
            var markup = "<td>" + Rollno + "</td><td>" + fname + "</td><td>" + lname +"</td><td>" + Email + "</td><td>" + DOB + "</td><td>" + Gender + "</td><td>" +Address + "</td><td>" + Phoneno  + "</td></tr>";
            $("table tbody").append(markup);
        } else {
            alert('Fields Cannot be Left Empty!!');
        }
    })
})