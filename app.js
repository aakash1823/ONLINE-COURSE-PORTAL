// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
const morgan=require('morgan');
const config = require("./config.json");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var sql = require("mysql");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(morgan("dev"));

var sqlConnection = sql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "root",
    database: "online_course_portal",
    multipleStatements: true
});
sqlConnection.connect(function(err) {
    if (!err) {
        console.log("Connected to SQL");
    } else {
        console.log("Connection Failed" + err);
    }
});

// ADMIN--PAGE--STARTS
// LOGIN
app.post("/login", async function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var option = req.body.option;
    var tablename,idname;
    if(option=="Course-Registration"){
        
        res.render("Enrollment.ejs",{username:username})
    }
    if(option==="student")
    {
        tablename="student";
        idname="Roll_no";
    }
    else if(option==="faculty")
    {
        tablename="faculty";
        idname="Faculty_id";
    }
    else
    {
        //admin login
        if(password===config.adminpassword){
            try {
               
                sqlConnection.query('select * from faculty', function (error, results, fields) {
                    if (error) throw error;
                    console.log("hi")
                    console.log(results);
                    res.render("Add_Faculty",{faculties:results});
                })
            } catch (error) {
                console.log(error);
            }
        }
        else{
            res.send('Password Incorrect!')
        }
        return;
    }
    console.log(`select * from ${tablename} where ${idname}='${username}'`);
   
    await sqlConnection.query(`select * from ${tablename} where ${idname}='${username}'`, function(err, rows) {
        console.log(rows);
        if (err) {
            console.log(err);
        } else {
            if (rows.length == 0) {
                console.log(rows);
                res.send("User Not Foundd!!");
            } else {
                
                if (password===rows[0].S_password) {
                    
                        // send student page
                        console.log('login success!');
                            sqlConnection.query(`select Course_id,Course_name from course where Course_id in (SELECT Course_id from enrolls where Roll_no="${username}")`,async function(err,result,fields){
                                
                                res.render("courses.ejs", { username:username,view:result});
                                return
                                })  
                                    
                                      
                       
                            
                 }

                else if(password===rows[0].F_password){
                        // send faculty page
                        console.log('faculty login success!');
                        sqlConnection.query(`select Course_id,Course_name from course where Course_id in (SELECT Course_id from teaches where Faculty_id="${username}")`,async function(err,result,fields){

                        res.render("faculty.ejs",{ username:username,view1:result})
                        return
                        })
                } else {
                    res.end("Password Incorrect for student or faculty!!");
                }
            }
        }
    })

});
app.get("/LOGIN", async function(req,res){
    const path = require('path');

    res.sendFile(path.join(__dirname,'/views/login.html'));
})
app.post('/ViewCourse',async function(req,res){
    var{username}=req.body
    sqlConnection.query(`select Course_id,Course_name from course where Course_id in (SELECT Course_id from enrolls where Roll_no='${username}')`,async function(err,result,fields){
        res.render("courses1.ejs", {view:result});
        return
        })  
})
app.post('/ViewCourse1',async function(req,res){
    var{username}=req.body
    sqlConnection.query(`select Course_id,Course_name from course where Course_id in (SELECT Course_id from teaches where Faculty_id='${username}')`,async function(err,result,fields){
        res.render("faculty1.ejs", {view1:result});
        return
        })  
})
// DASHBOARD
app.get("/dash",async function(req,res){
    sqlConnection.query('select count(Roll_no) as total from student',function(err,results,fields){
        var a=results;
        console.log(results);
        sqlConnection.query('select count(Faculty_id) as total1 from faculty',function(err,results1,fields){
            console.log(results1[0]);
            sqlConnection.query('select count(Dept_id) as total2 from department',function(err,results2,fields){
                console.log(results2[0]);
                sqlConnection.query('select count(Course_id) as total3 from course',function(err,results3,fields){
                    sqlConnection.query('SELECT Dept_id,COUNT(*) as CourseCount from Course group by Dept_id',function(err,results4,fields){
                        sqlConnection.query("Select Dept_id,Count(*) as StudentCount from student group by Dept_id;",function(err,results5,fields){
                            console.log(results3[0]);
                        res.render("dashboard.ejs",{total:results[0],total1:results1[0],total2:results2[0],total3:results3[0],total4:results4,total5:results5});
                        })
                        
                    })
                   
                })
            })
        })
    })
    
   
})

// ADMIN--STUDENT
app.post("/add/student", async function(req, res) {
    // Roll_no, S_Fname, S_Lname, Gender, DOB, Year_enrolled, S_password, Email, Address, Dept_id
    var {Roll_no, S_Fname, S_Lname, Gender, DOB, Year_enrolled, S_password, Email, Address, Dept_id,Phone_no}=req.body
    if(Phone_no.length==10){
        await sqlConnection.query("INSERT into student set ?", { Roll_no, S_Fname, S_Lname, Gender, DOB, Year_enrolled, S_password, Email, Address, Dept_id }, async function(err, results) {
        if (err) {
            console.log(err);
        } else {
            try {
                sqlConnection.query('select * from student', function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                // res.render("Add_Student",{students:results});
                    var a="Student Added Successfully"
                    res.render("send.ejs",{a})
                  }) 
            } catch (error) {
                console.log(error);
            }
            
        }
    })
}else{
    var a="Invalid Phone number"
    res.render("send.ejs",{a})
}
    

});
app.post("/edit/student", async function(req, res) {
    // Roll_no, S_Fname, S_Lname, Gender, DOB, Year_enrolled, S_password, Email, Address, Dept_id
    var {Roll_no, S_Fname, S_Lname, Gender, DOB, Year_enrolled, S_password, Email, Address, Dept_id}=req.body
    sqlConnection.query(`select * from Student where Roll_no="${Roll_no}"`,async function(req,result2){
        if(result2.length==0){
            var a="Student Doesn't Exist"
                        res.render("send.ejs",{a})
        }else{
            await sqlConnection.query(`UPDATE student SET S_Fname='${S_Fname}',S_Lname='${S_Lname}',Gender='${Gender}',DOB='${DOB}',Year_enrolled='${Year_enrolled}',S_password='${S_password}',Email='${Email}',Address='${Address}' where Roll_no='${Roll_no}'`, async function(err, results) {
                console.log(results[0])
                if (err) {
                    console.log(err);
                } else {
                    try {
                        sqlConnection.query('select * from student', function (error, results, fields) {
                            if (error) throw error;
                           
                        var a="Student Edited Successfully"
                        res.render("send.ejs",{a})
                          }) 
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            })
        }
    })
    

}); 
app.post("/remove/student", async function(req, res) {
    console.log(req.body);
    var{Roll_no}=req.body;


   await sqlConnection.query(`Delete from S_Phone_no where Roll_no='${Roll_no}'`, async function(err, results) {
        if (err) {
            console.log(err);
        } 
        sqlConnection.query(`Delete from Feedback where Roll_no='${Roll_no}'`,async function(err, results1){
            sqlConnection.query(`Delete from Enrolls where Roll_no='${Roll_no}'`,async function(err, results2){
                sqlConnection.query(`Delete from Attends where Roll_no='${Roll_no}'`,async function(err, results3){
                    sqlConnection.query(`Delete from Student where Roll_no='${Roll_no}'`,async function(err, results4){
                        var a="Student Removed Successfully"
                        res.render("send.ejs",{a})
                    })
                })
            })
        })
    })
});
app.get('/Stud', function(req, res){
    try {
               
        sqlConnection.query('select * from student', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Add_Student");
        })
    } catch (error) {
        console.log(error);
    }
  }); 
app.get('/AllStud', function(req, res){
    try {
               
        sqlConnection.query('select * from student', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("All_Student",{students:results});
        })
    } catch (error) {
        console.log(error);
    }
});
app.get('/EditStud', function(req, res){
    try {
               
        sqlConnection.query('select * from student', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("edit_Student");
        })
    } catch (error) {
        console.log(error);
    }
  });
app.get('/RemStud', function(req, res){
    try {
               
        sqlConnection.query('select * from student', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Remove_Student");
        })
    } catch (error) {
        console.log(error);
    }
});
  
// ADMIN--FACULTY
app.post("/add/faculty", async function(req, res) {
    console.log(req.body);
    var{Faculty_id, F_Fname, F_Lname, Gender, DOB, F_password, Email, Dept_id,Phone_no}=req.body;
    if (Phone_no.length==10){
        await sqlConnection.query("INSERT into faculty set ?", { Faculty_id, F_Fname, F_Lname, Gender, DOB, F_password, Email, Dept_id}, async function(err, results) {
            if (err) {
                console.log(err);
            } else {
                try {
                    sqlConnection.query('select * from faculty', function (error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                   
                    var a="Faculty Added Successfully"
                    res.render("send.ejs",{a})
                      }) 
                } catch (error) {
                    console.log(error);
                }
                
            }
        })
    }else{
        var a="Invalid Phone no"
        res.render("send.ejs",{a})
    }

  
});
app.post("/edit/faculty", async function(req, res) {
    console.log(req.body);
    var{Faculty_id, F_Fname, F_Lname, Gender, DOB, F_password, Email, Dept_id}=req.body;
    sqlConnection.query(`select * from faculty where Faculty_id="${Faculty_id}"`,async function(req,result2){
        if(result2.length==0){
            var a="Faculty Doesn't Exist"
                        res.render("send.ejs",{a})
        }else{
            await sqlConnection.query(`UPDATE faculty SET F_Fname='${F_Fname}',F_Lname='${F_Lname}',Gender='${Gender}',DOB='${DOB}',F_Password='${F_password}',Email='${Email}' where Faculty_id='${Faculty_id}'`, async function(err, results) {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        sqlConnection.query('select * from faculty', function (error, results, fields) {
                            if (error) throw error;
                            console.log(results);
                            var a="Faculty Edited Successfully"
                            res.render("send.ejs",{a})
                          }) 
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            })
        }
    })
  
});
app.post("/remove/faculty", async function(req, res) {
    console.log(req.body);
    var{Faculty_id}=req.body;


   await sqlConnection.query(`Delete from Tests where Faculty_id='${Faculty_id}'`, async function(err, results) {
        
        sqlConnection.query(`Delete from F_Phone_no where Faculty_id='${Faculty_id}'`,async function(err, results1){
            sqlConnection.query(`Delete from Feedback where Faculty_id='${Faculty_id}'`,async function(err, results2){
                sqlConnection.query(`Delete from Teaches where Faculty_id='${Faculty_id}'`,async function(err, results3){
                    sqlConnection.query(`Delete from Faculty where Faculty_id='${Faculty_id}'`,async function(err, results4){
                        var a="Faculty Deleted Successfully"
                        res.render("send.ejs",{a})
                    })
                })
            })
        })
    })
});
app.get('/Fac', function(req, res){
    try {
               
        sqlConnection.query('select * from faculty', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Add_Faculty");
        })
    } catch (error) {
        console.log(error);
    }
  });  
app.get('/AllFac', function(req, res){
    try {
               
        sqlConnection.query('select * from faculty', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("All_Faculty",{faculties:results});
        })
    } catch (error) {
        console.log(error);
    }
  });
app.get('/EditFac', function(req, res){
    try {
               
        sqlConnection.query('select * from faculty', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("edit_Faculty");
        })
    } catch (error) {
        console.log(error);
    }
  });
app.get('/RemFac', function(req, res){
    try {
               
        sqlConnection.query('select * from faculty', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Remove_Faculty");
        })
    } catch (error) {
        console.log(error);
    }
});

// ADMIN--COURSE
app.post("/add/course", async function(req, res) {
    // Course_id, Course_name, Details, Announcements, Dept_id
    var {Course_id, Course_name, Details, Announcements, Dept_id}=req.body
    sqlConnection.query(`Select * from Department where Dept_id="${Dept_id}"`,async function(err,results2){
        if(results2.length==0){
            var a="Invalid Dept id"
            res.render("send.ejs",{a})
        }else{
            await sqlConnection.query("INSERT into course set ?", { Course_id, Course_name, Details, Announcements, Dept_id }, function(err, results) {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        sqlConnection.query('select * from course', function (error, results, fields) {
                            if (error) throw error;
                            console.log(results);
                            var a="Course Added Successfully"
                            res.render("send.ejs",{a})
                          }) 
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            })
        }
    })
    


}); 

app.post("/edit/course", async function(req, res) {
    // Course_id, Course_name, Details, Announcements, Dept_id
    var {Course_id, Course_name, Details, Announcements, Dept_id}=req.body
    sqlConnection.query(`select * from course where Course_id="${Course_id}"`,async function(req,result2){
        if(result2.length==0){
            var a="Course Doesn't Exist"
                        res.render("send.ejs",{a})
        }else{
            await sqlConnection.query(`UPDATE course SET Course_name='${Course_name}',Details='${Details}',Announcements='${Announcements}' where Course_id='${Course_id}'`, async function(err, results) {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        sqlConnection.query('select * from course', function (error, results, fields) {
                            if (error) throw error;
                            console.log(results);
                            var a="Course Edited Successfully"
                            res.render("send.ejs",{a})
                          }) 
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            })
        
        }
    })
});
app.post("/remove/course", async function(req, res) {
    console.log(req.body);
    var{Course_id}=req.body;


   await sqlConnection.query(`Delete from Tests where Course_id='${Course_id}'`, async function(err, results) {
        if (err) {
            console.log(err);
        } 
        sqlConnection.query(`Delete from Enrolls where Course_id='${Course_id}'`,async function(err, results1){
            sqlConnection.query(`Delete from Teaches where Course_id='${Course_id}'`,async function(err, results2){
                sqlConnection.query(`Delete from resources where Course_id='${Course_id}'`,async function(err, results3){
                    sqlConnection.query(`Delete from Course where Course_id='${Course_id}'`,async function(err, results4){
                        var a="Course Deleted Successfully"
                        res.render("send.ejs",{a})
                    })
                })
            })
        })
    })
});
app.get('/course', function(req, res){
    try {
               
        sqlConnection.query('select * from course', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Add_Course");
        })
    } catch (error) {
        console.log(error);
    }
  });
app.get('/AllCourse', function(req, res){
    try {
               
        sqlConnection.query('select Course_id,Course_name,Dept_id,Details from course', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("All_Course",{courses:results});
        })
    } catch (error) {
        console.log(error);
    }
  });
app.get('/Editcourse', function(req, res){
    try {
               
        sqlConnection.query('select * from course', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("edit_Course");
        })
    } catch (error) {
        console.log(error);
    }
  });
app.get('/RemCourse', function(req, res){
    try {
               
        sqlConnection.query('select * from course', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Remove_Course");
        })
    } catch (error) {
        console.log(error);
    }
  });

// ADMIN--DEPT
app.get('/EditDept', function(req, res){
    try {
               
        sqlConnection.query('select * from department', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("edit_Dept");
        })
    } catch (error) {
        console.log(error);
    }
  });
app.post("/edit/dept", async function(req, res) {
    console.log(req.body);
    var{Dept_id,Dept_name,HOD,Dept_capacity}=req.body;
    sqlConnection.query(`select * from department where Dept_id="${Dept_id}"`,async function(req,result2){
        if(result2.length==0){
            var a="Department Doesn't Exist"
                        res.render("send.ejs",{a})
        }else{
            await sqlConnection.query(`UPDATE department SET Dept_name='${Dept_name}',HOD='${HOD}',Dept_capacity='${Dept_capacity}' where Dept_id='${Dept_id}'`, async function(err, results) {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        sqlConnection.query('select * from department', function (error, results, fields) {
                            if (error) throw error;
                            console.log(results);
                            var a="Department Edited Successfully"
                            res.render("send.ejs",{a})
                          }) 
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            })
        }
    })
   
});
app.get('/AllDept', function(req, res){
    try {
        sqlConnection.query('select * from department', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("All_Dept",{departments:results});
        })
    } catch (error) {
        console.log(error);
    }
  });
// ADMIN--TEACHES
app.post("/teaches",async function(req,res){
    console.log(req.body);
    var{Faculty_id,Course_id}=req.body;


   await sqlConnection.query("INSERT into teaches set ?", { Faculty_id, Course_id}, async function(err, results) {
        if (err) {
            var a="Faculty or Course Doesn't exist"
            res.render("send.ejs",{a})
        } else {
            try {
                sqlConnection.query('select * from teaches', function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    var a="Faculty Assigned to this Course"
                    res.render("send.ejs",{a})
                  }) 
            } catch (error) {
                console.log(error);
            }
            
        }
    })

})
app.get('/Teach',function(req,res){
    res.render("Teaches");
})
app.post('/Rem_enroll/course',async function(req,res){
    var{Roll_no,Course_id}=req.body
    console.log(`Delete from enrolls where Roll_no="${Roll_no}" and Course_id="${Course_id}"`);
    sqlConnection.query(`select * from Student where Roll_no="${Roll_no}"`,async function(err,results2){
        if(results2.length==0){
            var a="Invalid Roll no or Course id"
            res.render("send.ejs",{a})    
        }else{
            await sqlConnection.query(`Delete from enrolls where Roll_no="${Roll_no}" and Course_id="${Course_id}"` ,async function(err, results) {
        
                var a="Student De-registered Succesfully"
                res.render("send.ejs",{a})    
                
            })
        }
    })
    
})
app.get('/RemEnroll',async function(req,res){
    res.render("Rem_Enrollment.ejs")
})
//GO BACK
app.post('/Back',function(req,res){
    res.render("Add_Faculty.ejs");
})
// ADMIN PAGE CLOSE 
// STUDENT PAGE AND FACULTY PAGE STARTS
// FACULTY-SIDE
app.post("/add/resource", async function(req, res) {
      console.log(req.body);
      var{Course_id,resources}=req.body;


   await sqlConnection.query("INSERT into resources set ?", { Course_id,resources}, async function(err, results) {
        if (err) {
            console.log(err);
        } else {
            try {
                sqlConnection.query('select * from resources', function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    var a="Resources Added Successfully"
                    res.render("send_Fac.ejs",{a,Course_id})
                  }) 
            } catch (error) {
                console.log(error);
            }
            
        }
    })
    sqlConnection.query(`SELECT * from course where Course_id='${Course_id}'`,function(error,results,fields){
        if (error) throw error;
        
        console.log(results);

    })
    
  });
app.post("/add/test", async function(req, res) {
    console.log(req.body);
    var{Course_id,Add_Test,Test_Name}=req.body;
    var Test=Add_Test;

 await sqlConnection.query("INSERT into Test_details set ?", { Course_id,Test,Test_Name}, async function(err, results) {
      if (err) {
          console.log(err);
      } else {
          try {
              sqlConnection.query('select * from Test_details', function (error, results, fields) {
                  if (error) throw error;
                  console.log(results);
                  var a="Test Added Successfully"
                  res.render("send_Fac.ejs",{a,Course_id})
                }) 
          } catch (error) {
              console.log(error);
          }
          
      }
  })
  sqlConnection.query(`SELECT * from course where Course_id='${Course_id}'`,function(error,results,fields){
      if (error) throw error;
      
      console.log(results);

  })
  
});
app.post('/add/mark',async function(req,res){
    var{Roll_no,Course_id,Test_Name,mark_obt}=req.body;
    var Test_name=Test_Name;
    sqlConnection.query(`select * from test_details where Test_name="${Test_name}" and Course_id="${Course_id}"`,function(err,results2,fields){

        if(results2.length==0){
            var a="Test Doesn't Exist"
            res.render("send_Fac.ejs",{a,Course_id})
        }else{
            sqlConnection.query("Insert into attends set ?",{Roll_no,Course_id,Test_name,mark_obt},function(err,results,fields){
                var a="Mark Entered"
                res.render("send_Fac.ejs",{a,Course_id})
            })
        }
       
    })
    
})
app.post('/add/grade',async function(req,res){
    var{Roll_no,Course_id,grades}=req.body;
    sqlConnection.query(`select * from enrolls where Course_id="${Course_id}" and Roll_no="${Roll_no}"`,function(err,results2,fields){
        if(results2.length==0){
            var a="Student Dosen't enrolled to this Course"
            res.render("send_Fac.ejs",{a,Course_id})
        }else{
            sqlConnection.query(`update enrolls set grades="${grades}" where Roll_no="${Roll_no}" and Course_id="${Course_id}"`,function(err,results,fields){
                var a="Grade Entered"
                res.render("send_Fac.ejs",{a,Course_id})
            })
        }
    })
    
})
app.post('/add/announcement',async function(req,res){
    var{Course_id,Announcement}=req.body;
    sqlConnection.query(`UPDATE course set Announcements="${Announcement}" where Course_id="${Course_id}"`,function(err,results,fields){
        var a="Announcement has been made"
        res.render("send_Fac.ejs",{a,Course_id})
    })
})
app.post('/show/fac',async function(req,res){
    var{submit}=req.body;
    var b="FEEDBACK"
    sqlConnection.query(`select Roll_no,comments from feedback where Course_id='${submit}'`,function(err,results,fields){
        res.render("send_fac2.ejs",{a:results,b,submit})

    })
})
app.post("/Back-4",function(req,res){
    var{bak}=req.body;
    var val=bak;
    console.log(val);
    sqlConnection.query(`select details from course where Course_id="${val}"`, function (error, results, fields) {
        sqlConnection.query(`select Faculty_id from teaches where Course_id="${val}"`,function(error,results1,fields){
            var b=results1[0].Faculty_id;
            console.log(b)
            sqlConnection.query(`select F_Fname,F_Lname from faculty where Faculty_id='${b}'`,function(error,results2,fields){
                sqlConnection.query(`select Test_name,avg(mark_obt) as Avg from attends where Course_id="${val}" group by Test_name`,function(error,results3,fields){
                    res.render("faculty-details",{val,det:results[0],Facname:results2[0],Test:results3});
                })
                
            })
                
        })

    })
})
//STUD-SIDE
app.post("/stud/resource", async function(req, res) {
    var{submit}=req.body;

  sqlConnection.query(`SELECT * from resources where Course_id='${submit}'`,function(error,results,fields){
      if (error) throw error;
    console.log(results);
var b="RESOURCES"
res.render("send_Stud.ejs",{a:results,b,submit})
      
  })
  
});
app.post("/stud/announcement", async function(req,res){
    var{submit}=req.body
    var b="ANNOUNCEMENT"
    sqlConnection.query(`Select Announcements from course where Course_id="${submit}"`,function(err,results,fields){
        res.render("send_Stud1.ejs",{a:results[0],b,submit})
    })
})
app.post("/stud/test", async function(req, res) {
    var{submit}=req.body;
    var b="TEST"
  sqlConnection.query(`SELECT * from Test_details where Course_id='${submit}'`,function(error,results,fields){
      if (error) throw error;
    console.log(results);
res.render("send_Stud2.ejs",{b,submit,a:results})
      
  })
  
});
app.post("/stud/marks",async function(req,res){
    var{Roll_no,submit}=req.body
    var b="MARKS"
    sqlConnection.query(`select Course_id,Test_name,mark_obt from Attends where Roll_no='${Roll_no}' and Course_id='${submit}' `,function (error,results,fields){
        res.render("send_Stud3.ejs",{a:results,b,submit})
    })
})
app.post("/stud/grades",async function(req,res){
    var{Roll_no,submit}=req.body
    var b="GRADE"
    console.log(Roll_no)
    console.log(`select Course_id,grades from enrolls where Roll_no='${Roll_no}' and Course_id='${submit}'`);
    sqlConnection.query(`select Course_id,grades from enrolls where Roll_no='${Roll_no}' and Course_id='${submit}' `,function (error,results,fields){
        res.render("send_Stud4.ejs",{a:results,b,submit})
    })
})
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/add/feedback",  function(req, res) {
    console.log(req.body);
    var {submit,username,feedback,faculty_id,Course_id}=req.body;
    let Roll_no = username;
    console.log(Roll_no);
    var comments=feedback;
    var Faculty_id=faculty_id;
    
    sqlConnection.query("INSERT into feedback set ?", { Roll_no, comments,Faculty_id,Course_id}, async function(err, results) {
        if (err) {
            console.log(err);
        } else {
            try {
                sqlConnection.query('select * from feedback', function (error, results, fields) {
                    if (error) throw error;
                    console.log(results);
                    var a="Feedback Added Successfully"
                    res.render("send_Stud5.ejs",{a,submit})
                  }) 
            } catch (error) {
                console.log(error);
            }
            
        }
    })
});
app.post("/Back-3",function(req,res){
    var{bak}=req.body;
    var val=bak;
    console.log(val);
    console.log(`select Faculty_id from teaches where Course_id="${val}"`)
    sqlConnection.query(`select Faculty_id from teaches where Course_id="${val}"`,function(error,results,fields){
        
        sqlConnection.query(`select details from course where Course_id="${val}"`,function(error,results1,fields){
            var b=results[0].Faculty_id;
            console.log(b)
            sqlConnection.query(`select F_Fname,F_Lname from faculty where Faculty_id='${b}'`,function(error,results2,fields){
                console.log(`select F_Fname,F_Lname from faculty where Faculty_id='${b}'`);
                console.log(results);
                console.log(results2)
                res.render("course-details",{val,fac:results[0],det:results1[0],Facname:results2[0]});
            })
        })  
    })
    
})
// STUD COURSES
app.get('/course/:id',async function(req,res){
    console.log(`select Faculty_id from teaches where Course_id="${req.params.id}"`)
    sqlConnection.query(`select Faculty_id from teaches where Course_id="${req.params.id}"`,function(error,results,fields){
        
        sqlConnection.query(`select details from course where Course_id="${req.params.id}"`,function(error,results1,fields){
            var b=results[0].Faculty_id;
            console.log(b)
            sqlConnection.query(`select F_Fname,F_Lname from faculty where Faculty_id='${b}'`,function(error,results2,fields){
                console.log(`select F_Fname,F_Lname from faculty where Faculty_id='${b}'`);
                console.log(results);
                console.log(results2)
                res.render("course-details",{val:req.params.id,fac:results[0],det:results1[0],Facname:results2[0]});
            })
        })
    })
})
// Faculty Courses
app.get('/course/faculty/:id',async function(req,res){
    sqlConnection.query(`select details from course where Course_id="${req.params.id}"`, function (error, results, fields) {
        sqlConnection.query(`select Faculty_id from teaches where Course_id="${req.params.id}"`,function(error,results1,fields){
            var b=results1[0].Faculty_id;
            console.log(b)
            sqlConnection.query(`select F_Fname,F_Lname from faculty where Faculty_id='${b}'`,function(error,results2,fields){
                sqlConnection.query(`select Test_name,avg(mark_obt) as Avg from attends where Course_id="${req.params.id}" group by Test_name`,function(error,results3,fields){
                    res.render("faculty-details",{val:req.params.id,det:results[0],Facname:results2[0],Test:results3});
                })
               

            })
                
        })

    })
})
//PROFILE--FAC||STUD
app.post('/Profile',async function(req,res){
    var{username}=req.body
    console.log(username);
    sqlConnection.query(`select * from student where Roll_no="${username}"`, function (error, results, fields) {
        if (results.length==0) {
            sqlConnection.query(`select * from faculty where Faculty_id="${username}"`, function (error, results, fields) {
                if (error) throw error;
                console.log("hi")
                console.log(results);
                res.render("FacProfile.ejs");
            })
        }
        else{
        console.log("hi")
        console.log(results);
        res.render("Profile.ejs");
        }
    })
    


})
app.post('/clickhere', async function(req,res){
    var{username}=req.body
    console.log(req.body)
    sqlConnection.query(`select * from student where Roll_no="${username}"`, function (error, results, fields) {
        if (results.length==0) {
            sqlConnection.query(`select * from faculty where Faculty_id="${username}"`, function (error, results, fields) {
                if (error) throw error;
                console.log("hi")
                console.log(results);
                res.render("Profile2.ejs",{faculties:results});
            })
        }
        else{
        console.log("hi")
        console.log(results);
        res.render("Profile1.ejs",{students:results});
        }
    })
    
})

//Course_REG
app.get('/AvailableCourse', function(req, res){
    try {
               
        sqlConnection.query('select * from course', function (error, results, fields) {
            if (error) throw error;
            console.log("hi")
            console.log(results);
            res.render("Available_Course",{courses:results});
        })
    } catch (error) {
        console.log(error);
    }
  });
app.post('/enroll/course',async function(req,res){
    var{Roll_no,Course_id}=req.body;
    sqlConnection.query(`select * from Course where Course_id="${Course_id}"`,async function(err,results3){
        if(results3.length==0){
            var a="Course Doesn't exist"
            res.render("send1.ejs",{a})
        }else{
            await sqlConnection.query("INSERT into enrolls set ?", { Roll_no, Course_id }, async function(err, results) {
                if (err) {
                    console.log(err);
                } else {
                    try {
                        sqlConnection.query('select * from enrolls', function (error, results, fields) {
                            if (error) throw error;
                            console.log(results);
                            var a="Course Enrolled"
                            res.render("send1.ejs",{a})
                          }) 
                    } catch (error) {
                        console.log(error);
                    }
                    
                }
            })
        }
    })
    
})
app.get('/AllEnroll',async function(req,res){
            
            res.render("Courses_Enrolled");

})
app.post('/clickhere1',async function(req,res){
    var{Roll_no}=req.body;
    sqlConnection.query(`select * from enrolls where Roll_no="${Roll_no}"`, function(err,results,fields){
        res.render("Courses_Enrolled1.ejs",{Course_Enrolled:results})
    })
})
app.get('/AddEnroll',async function(req,res){
    res.render("Enrollment1.ejs")
})
app.post('/Back-1',function(req,res){
    res.render("Enrollment1.ejs")
})

// STUDENT AND FACULTY PAGE CLOSES

//SERVER
app.listen(3000, function() {
    console.log("Server Running at 3000");
})
