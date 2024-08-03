const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const {faker} = require('@faker-js/faker');
const mysql = require('mysql2');
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'practice',
    password: 'Kay@1234'
});

//generate fake data
let getRandomUser = () =>{
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};


// Home route
app.get("/", (req, res) => {
    let q =`SELECT count(*) FROM user;`;
    try{
        connection.query(q, (err, result) =>{
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", {count});
        });
    }
    catch(err){
        console.log("this is error: "+ err);
        res.send("error!");
    }
});

//show route
app.get("/user", (req, res)=> {
    let q = `SELECT * FROM user`;
    try{
        connection.query(q, (err,users) => {
            if (err) throw err;
            // console.log(result);
            // res.send(result);
            res.render("showuser.ejs", {users});
        })
    }catch(err){
        console.log(err);
        res.send("error");
    }
})

// Edit route
app.get("/user/:id/edit", (req,res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}';`;
    try{
        connection.query(q, (err,result) => {
            if (err) throw err;
            let user = result[0];
            //console.log(result);
            // res.send(result);
            res.render('edit.ejs', {user});
        })
    }catch(err){
        console.log(err);
        res.send("error");
    }
})

// Update DB
app.patch("/user/:id", (req,res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;   
    let q = `SELECT * FROM user WHERE id = '${id}';`;
    try{
        connection.query(q, (err,result) => {
            if (err) throw err;
            let user = result[0];
            if (formPass != user.password) {
                res.send("wrong password");
            } else {
                let q2 = `UPDATE user SET username = '${newUsername}' WHERE id ='${id}';`;
                connection.query(q2, (err, result) => { 
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }catch(err){
        console.log(err);
        res.send("error");
    }
});

// New user
app.get("/user/new",(req, res) =>{
    res.render("new.ejs");
})

app.post("/user/new", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    //Query to Insert New User
    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        console.log("New user: " + username);
        res.redirect("/user");
      });
    } catch (err) {
      res.send("some error occurred");
    }
  });
  
  app.get("/user/:id/delete", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}';`;
    try{
        connection.query(q, (err, result) =>{
            if (err) throw err;
            let user = result[0];
            res.render("delete.ejs", {user}); 
        });
    }catch (err){
        res.send("some error occur");
    }
  });

  app.delete("/user/:id", (req, res) => {
    let {id} = req.params;
    let {password} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}';`;
    try{
        connection.query(q, (err, result) =>{
            if (err) throw err;
            let user = result[0];

            if (user.password != password){
                res.send("wrong password");
            }
            else{
                let q2 = `DELETE FROM user WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    else{
                        console.log(result);
                        console.log("deleted!");
                        res.redirect("/user");
                    }
                });
            }
        });
    }
    catch(err){
        res.send("Some error");
    }
  });

app.listen("8080", () => {
    console.log("App is listen in port 8080");
});

//Insert new data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let data = [];
// for (let i =1; i<=100; i++){
//     data.push(getRandomUser());
// }


// connection.end();



// console.log(getRandomUser());