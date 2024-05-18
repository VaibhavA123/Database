const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const methodOverride = require("method-override");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    database : 'delta_app',
    password : 'Varun@123'
});
// let q = "INSERT INTO user (id,username,email,password) VALUES (?,?,?,?)";
// let user = ["123","123_newuser","abc@gmail.com","abc"];

// let q = "INSERT INTO user (id,username,email,password) VALUES ?";
// let users = [
//     ["123b","123_newuserb","abc@gmail.comb","abcb"],
//     ["123c","123_newuserc","abc@gmail.comc","abcc"]
// ];
// try {
// connection.query(q ,[users] ,(err,result) => {
//     if(err) {
//         throw err;
//     }
//     console.log(result);
//     // console.log(result.length);
//     // console.log(result[0]);
//     // console.log(result[1]);
//     });
//     }
// catch(err){
//     console.log(err);
// }




let getRandomUser = () => {
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password()
    ];
};

let data = [];
for(let i=1;i<=5;i++) {
    data.push(getRandomUser());
}
console.log(data);
let q = 'INSERT INTO user (id,username,email,password) VALUES ?';
connection.query(q,[data],(err,result) => {
    console.log(result);
});




// let q = "INSERT INTO user (id,username,email,password) VALUES ?";
// let data = [];
// for(let i=1;i<=100;i++) {
//     data.push(getRandomUser());
// }
// console.log(data);
// try {
//     connection.query(q,[data],function(err,results) {
//             if(err) throw err;
//             console.log(results);
//     });
// }
// catch(err){
//     console.log(err);
// }

    app.get("/",(req,res) => {
        let q = 'SELECT count(*) FROM user';
        try {
            connection.query( q , (err, result) => {
                if(err) throw err;
                let count = result[0]["count(*)"];
                res.render("home.ejs", {count});
            });
        }
        catch(err) {
            console.log(err);
            res.send("some error in DB");
        }
    });


app.get("/user",(req,res) => {
    let q = "SELECT * FROM user";
    try {
        connection.query(q,(err,result) => {
            if(err) throw err;
            // console.log(result);
            let data = result;
            res.render("users.ejs",{data});
        });
    }catch(err){
        res.send("some error occured!");
    }
});


app.get("/user/:id/edit",(req,res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err,result) => {
            if(err) throw err;
            let user = result[0];
            // console.log(result);
            // console.log(result[0]);
            res.render("edit.ejs",{user});
        });
    }
    catch(err) {
        console.log(err);
        res.send("some error in DB");
    }
});

app.patch("/user/:id",(req,res) => {
    let {id} = req.params;
    let {password : formPass,username : newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q, (err,result) => {
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password) {
                res.send("Wrong password");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2,(err,result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }catch(err) {
        console.log(err);
        res.send("some error in DB");
    }
});

app.get("/user/add",(req,res) => {
    res.render("add.ejs");
});


app.post("/user/add",(req,res) => {
    let {username,email,password} = req.body;
    let id = uuidv4();
    let newARR = [id,username,email,password];
    let user = [];
    console.log(typeof id);
    user.push(newARR);
    console.log(id,username,email,password);
    let q = 'INSERT INTO user (id,username,email,password) VALUES ?';
    try {
        connection.query(q,[user],(err,result) => {
            if(err) throw err;
            console.log(result);
            res.redirect("/user");
        });
    }catch(err){
        console.log(err);
        res.send("some error occured");
    }
});




app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", {user});
        // res.render("delete.ejs", { user });
    });
    } catch (err) {
        res.send("some error with DB");
    }
});


app.delete("/user/:id/delete",(req,res) => {
    let {id} = req.params;
    let {password} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q,(err,result) => {
            if(err) throw err;
            let user = result[0];
            if(user.password != password) {
                res.send("WRONG password");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`;
                connection.query(q2,(err,result) => {
                    if(err) throw err;
                    res.redirect("/user");
                });
            }
        });
    }catch(err) {
        console.log(err);
        res.send("some error occured!");
    }
});



    // connection.end();
    app.listen("8080",() => {
        console.log("server is listening to port 8080");
    });
