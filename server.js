const express = require('express')
const app = express()
const cors = require('cors')
const mongoose= require('mongoose');
const user = require('./db');
const bodyParser = require('body-parser');
require('dotenv').config({path:"sample.env"})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(express.static('public'))


//connect to database
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
  if(err){
    console.log("app cannot be connnected db", err);
  }
  else{
    console.log("you connected to database");
  }
})

//index page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//user's post api
app.post('/api/users',(req,res)=>{
  const username = req.body.username;
  console.log(`username`)
  user.findOneAndUpdate({username: username},{username:username},{upsert:true, new:true},(err, doc)=>{
    if(err){
      res.json({"error":err});
    }
    else{
      console.log(doc.username);
      res.json({"username": doc.username, "_id": doc._id});
    }
  })
});

//get all of the users
app.get('/api/users',(req,res)=>{
  user.find({},(err,docs)=>{
    if(err){
      res.json({"error":"error occured"});
    }
    else {
        let users = [];
      for(let user of docs){
        users.push({"_id": user._id,"username":user.username,"__v":user.__v})
      }
      
      res.json(users);
    }
  })
})

//@TODO
//POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req,res)=>{
  const id = req.params._id;
  const description = req.body.description;
  const date = req.body.date?new Date(req.body.date).toDateString():new Date().toDateString();
  const duration = req.body.duration;
  const update = {
    $inc:{count:1},
    $push:{
      logs:{
        description, duration, date
      }}
  }
  user.findOneAndUpdate({_id:id}, update, {new: true},  (err,user)=>{
    if(err){ res.json({"error":err})}
    else {
      
        res.json(user);
      };
    }
    
  )
})

//@TODO
//GET /api/users/:_id/exercises


////@TODO
//GET /api/users/:_id/logs



//listen server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
