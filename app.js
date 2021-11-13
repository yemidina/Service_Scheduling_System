//console.log('welcome yemiye');
var http = require('http');
var express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
var mysql = require('mysql');
const cors = require("cors");
const {body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var session = require('express-session');
const nodemailer = require("nodemailer");
var passport = require('passport');
flash = require('connect-flash')
var app = express()
var cookieParser = require('cookie-parser')
app.use(session({
  secret: 'secrettexthere',
  saveUninitialized: true,
  resave: true,
  // using store session on MongoDB using express-session + connect  
}));
app.use(cookieParser())
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
const sequelize = require('sequelize');
const db = require("./models");

//body-parser
app.use(express.urlencoded({extended:true}));

app.use(express.json());
var urlencodedParser = express.urlencoded({extended:true});
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
})
)

//app.use(express.urlencoded({extended:false}))
 app.set('view engine','ejs');
   //connection
   var conn = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:"",
      database:"project"
   })
   conn.connect(function(err){
      if(err)throw err;
      console.log('connnected successfully');
   
   })

     app.get('/register',function (req,res,next){
     
      res.render('register',{messages: req.flash('info')});
   });   
     
    app.post('/register',urlencodedParser,function(req, res,next) {
  var firstname = req.body.firstname;
      var lastname = req.body.lastname;
      var email = req.body.email;
      var phonenumber = req.body.phonenumber;
      var pasword = req.body.psw;
      var sex = req.body.sex;
      console.log(pasword)
      console.log(sex)
      console.log(email)

      conn.query('select * from worker where email="'+email+'" ', (err, result) => {
        
        if (result.length>0){
        //res.send("user already registered");
         req.flash('info','email already exists!');
         res.redirect('/register')
      }
      else{
    
      //res.send(req.body)
     var sql = `INSERT INTO worker (firstname,lastname,email,phonenumber,psw,sex)VALUES ("${firstname}","${lastname}","${email}","${phonenumber}","${pasword}","${sex}")`;
          conn.query(sql,function(err,result){
            if(!err){
              req.flash('info','registered successfully!');
            
            console.log('record inserted successfully');
            
            res.redirect('/register')
            
            }
           else{
         
            
           console.log(err);
           console.log(result);
            }
          })
        }
      })
  })
     
app.set('view engine','ejs');


//set static folder
app.use(express.static(path.join(__dirname,'public')));

 
    app.get('/admin',function root(req,res){
        
        res.render('admin',{messages: req.flash('info')});
     });   
    
    //admin login
    app.post("/admin", function(req, res) {
      var email = req.body.email;
      var password = req.body.password;
      conn.query('select * from admin where email = ? and password = ?',[email,password],function(err,results,fields){
         
         if(results.length >0){
           
            req.flash('info','admin')
            res.redirect('/adminpage')
         }
         else{
          req.flash('info','incorrect info!')
            res.redirect('/admin');
         }
         res.end();
      })
     })
    
    app.post("/userlogin", function(req, res) {
       var email = req.body.email;
       var password = req.body.psw;
       conn.query('select * from worker where email = ? and psw = ?',[email,password],function(err,results,fields){
          
          if(results.length >0){
            
            req.flash('info','logged in successfully!') 
             res.redirect('/user')
          }
          else{
            req.flash('info','incorrect email or password!')
           
             res.redirect('/userlogin');
             
          }
          res.end();
       })
      })
      app.get('/user',function(req,res){
        res.render('user',{messages: req.flash('info')});
        
      })
     //save worker requests
            app.post('/services', urlencodedParser,function (req, res,next) {
               var material = req.body.material;
               var start = req.body.start;
               var end = req.body.end;
               var worker_email = req.body.worker_email;
              
               console.log(end)
               console.log(start)
 //res.send(req.body)
              var sql = `INSERT INTO worker_request (worker_email,material,start,end)VALUES ("${worker_email}","${material}","${start}","${end}")`;
                   conn.query(sql,function(err,result){
                     if(!err){
                     req.flash('info','request submitted!,please wait for a response!')
                     console.log('user request inserted successfully');
                     
                    res.redirect('/services')
                     }
                    else{
                  
                     
                    console.log(err);
                    console.log(result);
                     }
                   })
                 })
                  
app.get('/adminpage',function root(req,res){
      res.render('adminpage',{messages: req.flash('info')});
   });  
  
   
   app.get('/page',function root(req,res){
      res.render('page');
   });
   
   app.get('/userlogin',function root(req,res){
    res.render('userlogin',{messages: req.flash('info')});
   });
   
 // delete services
 app.get('/delete/:id', function(req, res){
   var id = req.params.id;
   console.log(id);
   var sql = `DELETE FROM service WHERE id=${id}`;
 
   conn.query(sql, function(err, result) {
     if (err) throw err;
     console.log('record deleted!');
     res.redirect('/adminservices');
   });
 });

 // delete requests
 app.get('/deleting/:id', function(req, res){
   var id = req.params.id;
   console.log(id);
   var sql = `DELETE FROM worker_request WHERE id=${id}`;
 
   conn.query(sql, function(err, result) {
     if (err) throw err;
     console.log('request  deleted!');
     res.redirect('/requests');
   });
 });

 //delete worker

 // delete requests
 app.get('/deletes/:id', function(req, res){
  var id = req.params.id;
  console.log(id);
  var sql = `DELETE FROM worker WHERE id=${id}`;

  conn.query(sql, function(err, result) {
    if (err) throw err;
    console.log('worker deleted deleted!');
    res.redirect('/workers');
  });
});
 //update/edit/<%=data.id%>
 app.get('/edit/:id', function(req, res, next) {
   var id = req.params.id;
   var sql = `SELECT * FROM service WHERE id= ${id}`;
   conn.query(sql, function(err, rows, fields) {
       res.render('adminpage', {title: 'Edit services', userData: rows});
   });
 });
 
 app.post('/edit/:id', function(req, res, next) {
   
   var material = req.body.material;
   var quantity = req.body.quantity;
   var id = req.params.id;
   
   
   var sql = `UPDATE service SET material="${material}", quantity="${quantity}" WHERE id=2`;
 conn.query(sql, function(err, result) {
     if (err) throw err;
     console.log('record updated!');
     console.log(id)
     res.redirect('/adminservices');
   });
 });
  
   
 //  app.get('/user',urlencodedParser,function(req,res,next){
     // res.sendFile('user.html', { root: __dirname });
  // })
   app.post('/adminpage', urlencodedParser,function (req, res,next) {
      //res.send(req.body)
      var material = req.body.material;
      var quantity = req.body.quantity;
      console.log(quantity);
      //services registration
   var sql = `INSERT INTO service (material,quantity)VALUES ("${material}","${quantity}")`;
          conn.query(sql,function(err,result){
            if(!err){
            
            console.log('record inserted successfully');
            req.flash('info','record inserted')
            
           res.redirect('/adminpage')
            }
           else{
          console.log(err);
           console.log(result);
            }
          });
         })
    
     
          app.get('/services', function(req, res, next) {
            var sql='SELECT * FROM service';
            conn.query(sql, function (err, data, fields) {
            if (err) throw err;
            res.render('services', { title: 'User List', userData: data});
          });
        });   
        app.get('/services', function(req, res) {
          res.render('services',{messages:req.flash('info')});

        })
        //workers list
        app.get('/workers', function(req, res, next) {
          var sql='SELECT * FROM worker';
          conn.query(sql, function (err, data, fields) {
          if (err) throw err;
          res.render('workers', { title: 'worker List', userData: data});
        });
      });   

        //adminpage
        app.get('/adminservices', function(req, res, next) {
      
         var sql='SELECT * FROM service';
         conn.query(sql, function (err, data, fields) {
         if (err) throw err;
         res.render('adminservices', { title: 'material List', userData: data});
       });
     });   
        //fetch requests
        app.get('/requests', function(req, res, next) {
      
         var sql='SELECT * FROM worker_request';
         conn.query(sql, function (err, data, fields) {
         if (err) throw err;
         res.render('requests', { title: 'request List', userData: data});
       });
     }); 
     //request check  
    
     var express = require('express');
     app.get('/index2',function(req,res){
       res.render('index2');
     })
     //
    
 var randtoken = require('rand-token');
//const { connect } = require('http2');

     //send email
     function sendEmail(email, token) {
     var email = email;
     var token = token;
     var mail = nodemailer.createTransport({
     service: 'gmail',
     auth: {
     user: 'yemesrach23@gmail.com', // Your email id
     pass: 'adinagetahun' // Your password
     }
     });
     var mailOptions = {
     from: 'yemesrach23@gmail.com',
     to: email,
     subject: 'Reset Password Link - infonans',
     html: '<p>You requested for reset password, kindly use this <a href="http://localhost:2400/reset-password?token=' + token + '">link</a> to reset your password</p>'
     };
     mail.sendMail(mailOptions, function(error, info) {
     if (error) {
     console.log('email not sent')
     } else {
     console.log('email sent')
     }
     });
     }
     /* home page */
     app.get('/index', function(req, res, next) {
     res.render('index', {
     title: 'Forget Password Page'
     });
     });
     /* send reset password link in email */
     app.post('/reset-password-email', function(req, res, next) {
     var email = req.body.email;
     //console.log(sendEmail(email, fullUrl));
     conn.query('SELECT * FROM worker WHERE email ="' + email + '"', function(err, result) {
     if (err) throw err;
     var type = ''
     var msg = ''
     console.log(result[0]);
     if (result[0].email.length > 0) {
     var token = randtoken.generate(20);
     var sent = sendEmail(email, token);
     if (sent != 'email sent') {
     var data = {
     token: token
     }
     conn.query('UPDATE worker SET ? WHERE email ="' + email + '"', data, function(err, result) {
     if(err) throw err
     })
     type = 'success';
     msg = 'The reset password link has been sent to your email address';
     
     } else {
     type = 'error';
     msg = 'Something goes to wrong. Please try again';
     
     }
     } else {
     //console.log('2');
     type = 'error';
     msg = 'The Email is not registered with us';
     
     console.log('email not exist')
     }
     
     res.redirect('/index');
     });
     })
     /* reset page */
     app.get('/reset-password', function(req, res, next) {
     res.render('reset-password', {
     title: 'Reset Password Page',
     token: req.query.token
     });
     });
     /* update password to database */
     app.post('/reset-password', function(req, res, next) {
     var token = req.body.token;
     var psw = req.body.password;
     conn.query('SELECT * FROM worker WHERE token ="' + token + '"', function(err, result) {
     if (err) throw err;
     var type
     var msg
     if (result.length > 0) {
     var saltRounds = 10;
     //var hash = bcrypt.hash(psw, saltRounds);
     bcrypt.genSalt(saltRounds, function(err, salt) {
     bcrypt.hash(psw, salt, function(err, hash) {
     var data = {
     psw: hash
     }
     conn.query('UPDATE worker SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
     if(err) throw err
     });
     });
     });
     type = 'success';
     msg = 'Your password has been updated successfully';
     console.log('psw updated')
     } else {
     console.log('3');
     type = 'success';
     msg = 'Invalid link; please try again';
     }
     
     res.redirect('/reset-password');
     });
     })
//acceptance email////


     
function sendEmail(worker_email) {
  var worker_email = worker_email;
 // var token = token;
  var mail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
  user: 'yemesrach23@gmail.com', // Your email id
  pass: 'adinagetahun' // Your password
  }
  });
  var mailOptions = {
  from: 'yemesrach23@gmail.com',
  to: worker_email,
  subject: 'Request acceptance message- infonans',
  html: '<p>your request has been accepted , you can use it!.</p>'
  };
  mail.sendMail(mailOptions, function(error, info) {
  if (error) {
  console.log('email not sent')
  } else {
  console.log('email sent')
  }
  });
  }
  /* home page */
  app.get('/accept', function(req, res, next) {
  res.render('accept', {
  title: 'email entering page'
  });
  });
  /* send reset password link in email */
  app.post('/accept', function(req, res, next) {
  var worker_email = req.body.worker_email;
  //console.log(sendEmail(email, fullUrl));
  conn.query('SELECT * FROM worker_request WHERE worker_email ="' + worker_email + '"', function(err, result) {
  if (err) throw err;
  var type = ''
  var msg = ''
  console.log(result[0]);
  if (result[0].worker_email.length > 0) {
  var token = randtoken.generate(20);
  var sent = sendEmail(worker_email);
  if (sent != 'email sent') {
  var data = {
  token: token
  }
 
  type = 'success';
  msg = 'The reset password link has been sent to your email address';
  
  } else {
  type = 'error';
  msg = 'Something goes to wrong. Please try again';
  
  }
  } else {
  //console.log('2');
  type = 'error';
  msg = 'The Email is not registered with us';
  console.log('email not exist')
  }
  
  res.redirect('/accept');
  });
  })
app.listen('2400');
console.log('i am listening')