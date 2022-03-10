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
 
  user.findOneAndUpdate({username: username},{username:username},{upsert:true, new:true},(err, doc)=>{
    if(err){
      res.json({"error":err});
    }
    else{
      
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


//POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req,res)=>{
  const id = req.params._id;
  const description = req.body.description;
  const date = req.body.date?new Date(req.body.date).toDateString():new Date().toDateString();
  const duration = req.body.duration;
  const update = {
    $inc:{count:1},
    $push:{
      log:{
        description, duration, date
      }}
  }
  user.findOneAndUpdate({_id:id}, update, {new: true},  (err,user)=>{
    if(err){ res.json({"error":err})}
    else {
         console.log(typeof user.log[0].date);
        res.json({"username":user.username, "description":user.log[user.log.length-1].description, "duration":user.log[user.log.length-1].duration, "date": new String(user.log[user.log.length-1].date), "_id":user._id});
      };
    }
    
  )
})


//GET /api/users/:_id/logs?[from][to][limit]
app.get('/api/users/:_id/logs', (req,res)=>{
  //get id para
  const _id = req.params._id;
  // get query strings
 const {from , to, limit} = req.query;
  console.log(from, to, limit);

   user.findOne({_id}, (err, docs)=>{
     if(from && to){
       // filter by the given date's range, toDateString() return same value when parsing 'Wed Jan 03 1990' and '1990-01-03'
      let exercises = docs.log.filter((elem, i)=>(
        Date.parse(elem.date)>=Date.parse(new Date(from).toDateString()) && Date.parse(elem.date)<=Date.parse(new Date(to).toDateString())
      ))
       console.log(`from to ${exercises}`)
  // filter by the given limit
       if(limit){
         exercises = exercises.filter((elem,i)=>(
           i<Number(limit)
         ))
       }
       res.json({'_id': docs._id, 'userName': docs.userName, 'conunt': docs.count, 'log':exercises});
     } else {
       // if from and to dates are not given check if the limit have
       if(limit){
         // if the limit was given then filter by the given limit
           const exercises = docs.log.filter((elem,i)=>(
           i<Number(limit)
         ))
         res.json({'_id': docs._id, 'userName': docs.userName, 'conunt': docs.count, 'log':exercises});
       } else{
         //if the limit was not given then return all data with the orginal format
      res.json(docs);
     }}
    })
 
   
  
  })




//listen server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
