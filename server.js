const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { mongoose } = require('mongoose');
require('./app/models/users')
const Users = require('./app/models/users')
const bodyParser = require("body-parser");
const Chart = require('./app/models/charts')

async function init() {

  //  db = await mongoose.connect("mongodb://localhost:27017/CHARTS",{
  //    useUnifiedTopology: true,
  //    useNewUrlParser: true
  //   })

  let dm = require("./config/mongoose")
  dm()


  let us = new Users({
    name: "jay",
    token: "xyz",
    email: "jay@gmail.com",
    charts: [{
      active: true,
      name: "chart 1",
      query: [
        {
          "$project": {
            "city_id": 1,
            "total": 1
          }
        },
        {
          "$lookup": {
            "from": "cities",
            "localField": "city_id",
            "foreignField": "_id",
            "pipeline": [{ "$project": { "city_name": 1 } }],
            "as": "city_detail"
          }
        },
        {
          "$addFields": {
            "city_detail": {
              "$ifNull": [
                {
                  "$arrayElemAt": [
                    "$city_detail",
                    0
                  ]
                },
                null
              ]
            }
          }
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$city_detail.city_name"
            },
            "__alias_1": {
              "$avg": "$total"
            }
          }
        },
        {
          "$project": {
            "_id": 0,
            "__alias_0": "$_id.__alias_0",
            "__alias_1": 1
          }
        },
        {
          "$project": {
            "y": "$__alias_1",
            "x": "$__alias_0",
            "_id": 0
          }
        },
        {
          "$addFields": {
            "__agg_sum": {
              "$sum": [
                "$y"
              ]
            }
          }
        },
        {
          "$sort": {
            "__agg_sum": -1
          }
        },
        {
          "$project": {
            "__agg_sum": 0
          }
        },
        {
          "$limit": 5000
        }
      ]
    }]
  })
  // await us.save()


}

init()


const app = express()

app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/get_charts_list", async (req, res) => {

  let client
  try {
    let token = req.query.token

    let user = await Users.findOne({ token })



    if (!user)  res.json({ status: false })
    

     client = new MongoClient(user.database_string, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const database = client.db(user.database);
    const collection = database.collection(user.collection);
    let charts = []
    let date_filter = { $match: {} }

    if (req.query.from_date && req.query.to_date) {

      date_filter = {
        $match: {
          "completed_at": {

            "$gt": new Date(req.query.from_date),
            "$lte": new Date(req.query.to_date)
          }
        }
      }
    };
    
    
    let chart_detail = await Chart.findById(req.query.chart_id)

    let query = JSON.parse(chart_detail.query)
    query.unshift(date_filter)
    console.log("🚀 ~ file: server.js:174 ~ app.get ~ chart_detail.chart_type:", chart_detail.chart_type)
    const temp = {
      data: await collection.aggregate(query).toArray(),
      type: chart_detail.chart_type,
      name: chart_detail.name
    }
    charts.push(temp)
    return res.json({ charts })
  } catch (e) {
    console.log(e);
  }

  finally {
    await client.close();
    console.log('Disconnected from MongoDB Atlas');
  }

  // [{$group: {
  //   _id: null,
  //   Total_visit:{$sum:{$sum:['$total_visit_in_hop_delivery','$total_visit_in_hop_ch','$total_visit_in_whop','$total_visit_in_ios','$total_visit_in_android']}}
  // }}] 

})



// const client = new MongoClient(user.database_string, { useNewUrlParser: true, useUnifiedTopology: true });
// try {


//       await client.connect();
//       console.log('Connected to MongoDB Atlas');
//       const database =  client.db(user.database); 
//       const collection =  database.collection(user.collection);
//       // collection.createIndex({ completed_at: 1, city_id: 1});
//       let charts = []
//       let date_filter = {$match:{}}
//       if(req.query.from_date && req.query.to_date){

//          date_filter =   {$match:{
//           "completed_at":{

//           "$gt": new Date(req.query.from_date),
//           "$lte": new Date(req.query.to_date)}
//         }
//       }
//       };


//       let chart_list = await Chart.find({_id:{$in:user.charts_array}})
//       // console.log(date_filter);
//       // for (const chart of user.charts) {
//         // console.log(JSON.parse(chart.query))
//       //  let chart = user.charts[0]
//        let charti = chart_list[0]

//        c = JSON.parse(charti.query) 


//       c.unshift(date_filter)

//        console.log(JSON.stringify(c));

//        let q = await collection.aggregate(c).toArray()


//         const temp = {
//           data : q,
//           type : charti.type || 1,
//           name : charti.name
//         }
//           charts.push(temp)
//       // } 
//       // const lable = await collection.aggregate(
//       //   [
//       //     {
//       //       "$lookup": {
//       //         "from": "cities",
//       //         "localField": "city_id",
//       //         "foreignField": "_id",
//       //         "as": "city_detail"
//       //       }
//       //     },
//       //     {
//       //       "$addFields": {
//       //         "city_detail": {
//       //           "$ifNull": [
//       //             {
//       //               "$arrayElemAt": [
//       //                 "$city_detail",
//       //                 0
//       //               ]
//       //             },
//       //             null
//       //           ]
//       //         }
//       //       }
//       //     },
//       //     {
//       //       "$group": {
//       //         "_id": {
//       //           "__alias_0": "$city_detail.city_name"
//       //         },
//       //         "__alias_1": {
//       //           "$avg": "$total"
//       //         }
//       //       }
//       //     },
//       //     {
//       //       "$project": {
//       //         "_id": 0,
//       //         "__alias_0": "$_id.__alias_0",
//       //         "__alias_1": 1
//       //       }
//       //     },
//       //     {
//       //       "$project": {
//       //         "y": "$__alias_1",
//       //         "label": "$__alias_0",
//       //         "_id": 0
//       //       }
//       //     },
//       //     {
//       //       "$addFields": {
//       //         "__agg_sum": {
//       //           "$sum": [
//       //             "$y"
//       //           ]
//       //         }
//       //       }
//       //     },
//       //     {
//       //       "$sort": {
//       //         "__agg_sum": -1
//       //       }
//       //     },
//       //     {
//       //       "$project": {
//       //         "__agg_sum": 0
//       //       }
//       //     },
//       //     {
//       //       "$limit": 5000
//       //     }
//       //   ]

//       // ).toArray();


// console.log(charts);
//         return res.json({charts})
//     } catch(e){
//       console.log(e);
//     }

//     finally {
//       await client.close();
//       console.log('Disconnected from MongoDB Atlas');
//     }



// })

// app.use("/get_users",async (req,res)=>{

//   let user_list = await Users.find({})



//   res.json({status:true,user_list})
// })

// app.use("/get_user_detail",async (req,res)=>{

//   try{


//     let user_detail = await Users.findById(req.query.id)



//     res.json({status:true,user_detail})
//   }catch(error){
//     console.log(error);
//   }
// })
// app.post("/update_user",async (req,res)=>{

//   try{


//     console.log('this')
//     console.log(req.body);
//     // req.body.charts[0].query = JSON.parse(req.body.charts[0].query)
//     // req.body.charts[1].query = JSON.parse(req.body.charts[1].query)
//     // req.body.charts[2].query = JSON.parse(req.body.charts[2].query)
//     let user_detail = null
//     if(!req.body.id){
//       user_detail = new Users(req.body)
//       await user_detail.save()
//     }else{

//       user_detail = await Users.findByIdAndUpdate(req.query.id,req.body)
//     }



//     res.json({status:true,user_detail})
//   }catch(error){
//     console.log(error);
//   }
//   })
// app.delete("/delete_user",async (req,res)=>{

//   try{



//       user_detail = await Users.findByIdAndDelete(req.query.id)




//     res.json({status:true})
//   }catch(error){
//     console.log(error);
//   }
//   })


require("./config/express")(app)


app.listen(5000, (data) => console.log('server started at 5000'))