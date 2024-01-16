const { ObjectId } = require("mongodb");
let Charts = require("../models/charts")
let For_what = require("../models/for_what")
var User = require('../models/users'); // include user controller ////


const { MongoClient } = require('mongodb');
const users = require("../models/users");
let database
let Orders
let Users
let Analytics
let Order_payments
let Reviews
let Countries
async function init() {

  try {

    let client = new MongoClient("mongodb+srv://hopdemo:akQWOEus3ajieR@hop-prod-db.oo3hb.mongodb.net");
    // let client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    console.log("conected");
    database = client.db('hopdb');
    Orders = database.collection('orders');
    Users = database.collection('users');
    Analytics = database.collection('analytics');
    Order_payments = database.collection('order_payments');
    Reviews = database.collection('reviews');
    Countries = database.collection('countries');
  } catch (e) {
    console.log(e);
  }
}
init()

module.exports = class ChartsClass {

  async get_chart_list(req, res) {

    try {

      let for_what = await For_what.findById(req.query.id)


      let cond = []
      if (for_what.charts) {
        cond = for_what.charts

      }

      let charts = await Charts.find({ _id: { $in: cond } })

      return res.json({ status: true, data: { charts } })
    } catch (error) {
      console.log(error);

    }
  }

  async add_charts(req, res) {

    try {
      let charts = new Charts(req.body)
      await charts.save()



      let temp = await For_what.findByIdAndUpdate(req.query.id, { $addToSet: { charts: charts._id } })
      let user = await User.findOneAndUpdate(

        {
          charts_subcatagory: {
            $elemMatch: {
              $eq: new ObjectId(req.query.id)
            }
          }
        }, { $addToSet: { charts_array: charts._id } })

      return res.json({ status: true, data: user._id })
    } catch (error) {
      console.log(error);
      return res.json({ status: false })

    }
  }

  async get_charts_detail() {

  }

  async get_countries(req, res) {


    try {

      let countries = await Countries.find({},{_id:1,country_name:1}).toArray()

      return res.json({ status: true, countries })
    } catch (error) {
      console.log(error);
      return res.json({ status: false })

    }



  }

  async API_1(req, res) {

    try {


      let currentDate = new Date();
      let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);


      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const date = created_at.getDate()

      const day = created_at.getDay()

      let date_filter = 0
      let type = Number(req.body.params.type)





      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {



        if (req.body.params.startDate == req.body.params.endDate) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }




      let pipeline = [

        {
          $match: {
            // country_id: { $ne: new ObjectId('5b10de97df2add31dc2d1363') },

            order_status: 25
          }
        },
        // {
        //   $addFields: {
        //     year: { $year: "$created_at" },
        //     month: { $month: "$created_at" },
        //   },
        // },
        // {
        //   $match: {
        //     $expr: {
        //       $and: [
        //         { $eq: ["$year", 2023] }, // Replace 2023 with your target year
        //         { $gte: ["$month", 8] },
        //         { $lte: ["$month", 12] }
        //       ]
        //     }
        //   }
        // },


        {
          $group: {
            _id: null,
            total_revenue: {
              '$sum': '$total'
            },
            total_orders: {
              '$sum': 1
            }
          }
        }]

      let pipeline2 = [
        {
          $lookup: {
            from: "countries",

            // let: {

              localField: "country_name",
              foreignField: "country_name",
            // },
            // pipeline: [{ $project: { country_name: 1, _id: 1 } }],
            as: "country"
          }
        },
        {
          $group: {
            _id: null,
            total_users: { $sum: 1 }
          }
        },

      ]



      let country_filter = req.body.params.country_id




      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      let filter2 = { $match: { "country._id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline2.splice(1, 0, filter2)
      pipeline.unshift(date_filter)
      pipeline2.unshift(date_filter)



      let latest_data = await  Promise.all([Orders.aggregate(pipeline).toArray() ,Users.aggregate(pipeline2).toArray()])


      console.log(latest_data);


      if (latest_data[0].length == 0) {
        latest_data[0].push({})
      }

      // let data = await 
      latest_data[0][0].total_users = latest_data[1][0]?.total_users





      return res.json({ status: true, data: { latest_data:latest_data[0] } })
    } catch (error) {
      console.log(error);

    }
  }



  async API_2(req, res) {

    try {



      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;

      // const onejan = new Date(created_at.getFullYear(), 0, 1);


      // const week = Math.ceil(((created_at - onejan) / 86400000 + onejan.getDay() + 1) / 7);
      const day = created_at.getDay()
      const date = created_at.getDate()




      let date_filter = 0
      let type = Number(req.body.params.type)



      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }



      let pipeline = [
        { $project: { user_id: 1 } },

        {
          $lookup: {
            from: "users",
            // let: {
              localField: "user_id",
              foreignField: "_id",
            // },
            // pipeline: [{ $project: { device_type: 1, _id: 1 } }],
            as: "user_detail"
          }
        },
        {
          $unwind:"$user_detail"
        },
        // {
        //   "$addFields": {
        //     "user_detail": {
        //       "$ifNull": [
        //         {
        //           "$arrayElemAt": [
        //             "$user_detail",
        //             0
        //           ]
        //         },
        //         null
        //       ]
        //     }
        //   }
        // },
        // {
        //   "$match": {
        //     "user_detail.device_type": {
        //       "$nin": []
        //     }
        //   }
        // },
        {
          "$group": {
            "_id": {
              "__alias_0": "$user_detail.device_type"
            },
            "__alias_1": {
              "$sum": 1
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
            "name": "$__alias_0",
            "value": "$__alias_1",
            "_id": 0
          }
        },
        {
          "$addFields": {
            "__agg_sum": {
              "$sum": [
                "$value"
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

      ]


      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)

      pipeline.unshift(date_filter)



      let data = await Orders.aggregate(
        pipeline
      ).toArray()




      return res.json({ status: true, data: { data } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_3(req, res) {

    try {


      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;

      // const onejan = new Date(created_at.getFullYear(), 0, 1);


      // const week = Math.ceil(((created_at - onejan) / 86400000 + onejan.getDay() + 1) / 7);
      const day = created_at.getDay()
      const date = created_at.getDate()




      let date_filter = 0
      let type = Number(req.body.params.type)


      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }




      let pipeline1 = [
        {
          "$lookup": {
            "from": "carts",
            "localField": "cart_id",
            "foreignField": "_id",
            "as": "cart_detail"
          }
        },
        {
          "$addFields": {
            "cart_detail": {
              "$ifNull": [
                {
                  "$arrayElemAt": [
                    "$cart_detail",
                    0
                  ]
                },
                null
              ]
            }
          }
        },
        {
          "$match": {
            "cart_detail.order_details.items.item_name": {
              "$nin": [
                null,
                ""
              ]
            }
          }
        },
        {
          "$unwind": "$cart_detail.order_details"
        },
        {
          "$unwind": "$cart_detail.order_details.items"
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$cart_detail.order_details.items.item_name"
            },
            "__alias_1": {
              "$sum": {
                "$cond": [
                  {
                    "$ne": [
                      {
                        "$type": "$cart_detail.order_details.items.quantity"
                      },
                      "missing"
                    ]
                  },
                  1,
                  0
                ]
              }
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
            "x": "$__alias_0",
            "y": "$__alias_1",
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
          "$limit": 10
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

      let pipeline2 = [
        {
          "$lookup": {
            "from": "carts",

            "localField": "cart_id",
            "foreignField": "_id",
            "as": "cart_detail"
          }
        },
        {
          "$addFields": {
            "cart_detail": {
              "$ifNull": [
                {
                  "$arrayElemAt": [
                    "$cart_detail",
                    0
                  ]
                },
                null
              ]
            }
          }
        },
        {
          "$match": {
            "cart_detail.order_details.items.item_name": {
              "$nin": [
                null,
                ""
              ]
            }
          }
        },
        {
          "$unwind": "$cart_detail.order_details"
        },
        {
          "$unwind": "$cart_detail.order_details.items"
        },
        {
          "$unwind": "$cart_detail.order_details.items.specifications"
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$cart_detail.order_details.items.specifications.name"
            },
            "__alias_1": {
              "$sum": {
                "$cond": [
                  {
                    "$ne": [
                      {
                        "$type": "$cart_detail.order_details.items.total_specification_price"
                      },
                      "missing"
                    ]
                  },
                  1,
                  0
                ]
              }
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
            "x": "$__alias_0",
            "y": "$__alias_1",
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
          "$limit": 10
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

      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline1.unshift(filter)
      pipeline2.unshift(filter)
      pipeline1.unshift(date_filter)
      pipeline2.unshift(date_filter)



      let items = Orders.aggregate(pipeline1).toArray()

      let modifiers = Orders.aggregate(pipeline2).toArray()

      let pm = await Promise.all([items, modifiers])



      return res.json({ status: true, data: { items: pm[0], modifiers: pm[1] } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_4(req, res) {

    try {



      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }




      let pipeline1 = [

        {
          $lookup: {
            from: "stores",
            let: {

              localField: "store_id",
              foreignField: "_id",
            },
            pipeline: [{ "$project": { "country_id": 1, "_id": 1 } }],
            as: "store"
          }
        },
        {



          $group: {
            _id: null,
            total_visits: { $sum: { $sum: ['$total_visit_in_hop_delivery', '$total_visit_in_hop_ch', '$total_visit_in_whop', '$total_visit_in_ios', '$total_visit_in_android'] } }
          }
        }]

      let pipeline2 = [
        {
          $match: {
            order_status: { $ne: 25 }
          }
        }, {
          $group: {
            _id: null, total_orders: {
              '$sum': 1
            }
          }
        }
      ]

      let country_filter = req.body.params.country_id


      let filter1 = { $match: { "store.country_id": new ObjectId(country_filter) } }
      let filter2 = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline1.splice(1, 0, filter1)
      pipeline2.unshift(filter2)
      pipeline1.unshift(date_filter)
      pipeline2.unshift(date_filter)





      // let analytic = await

      let data = await Promise.all([Analytics.aggregate(pipeline1).toArray(), Orders.aggregate(pipeline2).toArray()])


      // let orders = await 



      return res.json({ status: true, data: { analytic: data[0], orders: data[1] } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_5(req, res) {

    try {
      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [
        {
          $addFields: {
            created_at: {
              $dateToString: {
                // format: "%H:%M:%S:%L%z",
                date: "$created_at",
                timezone: "$timezone",
              },
            },
          },
        },
        {
          $addFields: {
            created_at: {
              $dateFromString: {
                dateString: "$created_at",
              },
            },
          },
        },

        {
          $addFields: {
            hourOfDay: { $hour: "$created_at" },
            timeSlot: {
              $switch: {
                branches: [
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 6] }, { $lt: [{ $hour: "$created_at" }, 9] }] }, then: "6am-9am" },
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 9] }, { $lt: [{ $hour: "$created_at" }, 12] }] }, then: "9am-12pm" },
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 12] }, { $lt: [{ $hour: "$created_at" }, 15] }] }, then: "12pm-3pm" },
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 15] }, { $lt: [{ $hour: "$created_at" }, 18] }] }, then: "3pm-6pm" },
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 18] }, { $lt: [{ $hour: "$created_at" }, 21] }] }, then: "6pm-9pm" },
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 21] }, { $lt: [{ $hour: "$created_at" }, 24] }] }, then: "9pm-12am" },
                  { case: { $and: [{ $gte: [{ $hour: "$created_at" }, 0] }, { $lt: [{ $hour: "$created_at" }, 6] }] }, then: "12am-6am" }
                ],
                default: "Other"
              }
            }
          }
        },
        {
          $group: {
            _id: "$timeSlot",
            count: { $sum: 1 },
            // You can add more fields or accumulators as needed
          }
        },
        {
          $addFields: {
            order: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", "6am-9am"] }, then: 1 },
                  { case: { $eq: ["$_id", "9am-12pm"] }, then: 2 },
                  { case: { $eq: ["$_id", "12pm-3pm"] }, then: 3 },
                  { case: { $eq: ["$_id", "3pm-6pm"] }, then: 4 },
                  { case: { $eq: ["$_id", "6pm-9pm"] }, then: 5 },
                  { case: { $eq: ["$_id", "9pm-12am"] }, then: 6 },
                  { case: { $eq: ["$_id", "12am-6am"] }, then: 7 }
                ],
                default: 7
              }
            }
          }
        },
        {
          $sort: {
            order: 1
          }
        },
        {
          $project: {
            _id: 0,
            timeSlot: "$_id",
            count: 1
          }
        }
      ]


      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)





      let orders = await Orders.aggregate(pipeline).toArray()



      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_6(req, res) {

    try {
      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;


        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [

        {
          $match:
            { is_payment_paid: true, is_cancellation_fee: false, is_order_payment_refund: false }
        },

        {
          "$addFields": {
            "date": {
              "year": {
                "$year": "$created_at"
              },
              "month": {
                "$subtract": [
                  {
                    "$month": "$created_at"
                  },
                  1
                ]
              },
              "month_num": {
                "$subtract": [
                  {
                    "$month": "$created_at"
                  },
                  1
                ]
              }
            }
          }
        },
        {
          $addFields: {
            "date.month": {
              $let: {
                vars: {
                  monthsInString: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "June",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec"
                  ]
                },
                in: { $arrayElemAt: ["$$monthsInString", "$date.month"] }
              }
            }
          }
        },
        {
          "$group": {
            "_id": {
              "date": "$date"
            }, "Normal": {
              "$sum": 1
            },
            "Promo": {
              "$sum": {
                "$cond": {
                  "if": { "$ne": ["$promo_id", null] },
                  "then": 1,
                  "else": 0
                }
              }
            }
          }
        },

        {
          "$sort": {
            "_id.date.year": 1,
            "_id.date.month_num": 1
          }
        }
      ]

      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)


      let orders = await Order_payments.aggregate(pipeline).toArray()



      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_7(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [
        {
          $match: {
            provider_id: {
              $nin: [null],
            },
          },
        },
        // {
        //   $addFields: {
        //     year: { $year: "$created_at" },
        //     month: { $month: "$created_at" },
        //   },
        // },
        // {
        //   $match: {
        //     $expr: {
        //       $and: [
        //         { $eq: ["$year", 2023] }, // Replace 2023 with your target year
        //         { $gte: ["$month", 8] },
        //         { $lte: ["$month", 12] }
        //       ]
        //     }
        //   }
        // },


        {
          $group: {
            _id: "$provider_id",
            count: { $sum: 1 },
            revenue: {
              $sum: "$total",
            },
          },
        },
        {
          $sort: {
            revenue: -1,
          },
        },
        { "$limit": 5 },

        {
          $lookup: {
            from: "providers",
            // let: {

              localField: "_id",
              foreignField: "_id",
            // },
            // pipeline: [
            //   {
            //     $project: {
            //       first_name: 1,
            //       last_name: 1,
            //       unique_id: 1,
            //       image_url: 1
            //     },
            //   },
            // ],
            as: "provider",
          },
        },
        {
          $unwind: "$provider",
        },
        { "$limit": 5 },
      ]


      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)


      let orders = await Orders.aggregate(pipeline).toArray()



      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_8(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }

      let pipeline1 = [
        {
          $match: {
            user_id: {
              $nin: [null],
            },
          },
        },
    

        {
          $group: {
            _id: "$user_id",
            count: { $sum: 1 },
            revenue: {
              $sum: "$total",
            },
          },
        },
        {
          $sort: {
            revenue: -1,
          },
        },
        { $limit: 5 },

        {
          $lookup: {
            'from': "users",
            // 'let': {

              'localField': "_id",
              'foreignField': "_id",
            // },
            // 'pipeline': [
            //   {
            //     '$project': {
            //       first_name: 1,
            //       last_name: 1,
            //       unique_id: 1,
            //       image_url: 1
            //     },
            //   },
            // ],
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        { "$limit": 5 },
      ]

      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline1.unshift(filter)
      pipeline1.unshift(date_filter)



      let orders = await Orders.aggregate(pipeline1).toArray()



      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_9(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }




      let pipeline = [
        {
          "$lookup": {
            "from": "cities",

            "localField": "city_id",
            "foreignField": "_id",
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
          "$lookup": {
            "from": "stores",


            "localField": "store_id",
            "foreignField": "_id",
            "as": "store_detail"
          }
        },
        {
          "$addFields": {
            "store_detail": {
              "$ifNull": [
                {
                  "$arrayElemAt": [
                    "$store_detail",
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
              "__alias_0": "$store_detail.name"
            },
            "__alias_1": {
              "$sum": "$total"
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
            "x": "$__alias_0",
            "y": "$__alias_1",
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
          "$limit": 10
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


      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)




      let orders = await Orders.aggregate(pipeline).toArray()

      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_10(req, res) {


    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [
        {
          "$lookup": {
            "from": "cities",

            "localField": "city_id",
            "foreignField": "_id",
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

      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)




      let orders = await Orders.aggregate(pipeline).toArray()


      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_11(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [
        {
          $addFields: {
            diffMins: {
              $subtract: [
                "$total_delivery_time",
                "$total_time",
              ],
            },
          },
        },

        {
          $match: {

            $or: [{ diffMins: { $gt: 0 } }, { diffMins: { $lt: 0 } }]

          },
        },



        {
          $addFields: {
            date: {
              year: {
                $year: "$created_at",
              },
              month: {
                $subtract: [
                  {
                    $month: "$created_at",
                  },
                  1,
                ],
              },
              "month_num": {
                "$subtract": [
                  {
                    "$month": "$created_at"
                  },
                  1
                ]
              }
            },
          },
        },

        {
          $addFields: {
            "date.month": {
              $let: {
                vars: {
                  monthsInString: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "June",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
                in: {
                  $arrayElemAt: [
                    "$$monthsInString",
                    "$date.month",
                  ],
                },
              },
            },
          },
        },

        {
          $addFields: {
            monthNum: {
              $subtract: [
                {
                  $month: "$created_at",
                },
                1,
              ],
            },
          },
        },

        {
          $project: {
            actual_preparation_time: 1,
            ready_at: 1,
            indexOfStatus7: 1,
            estimated_time_for_ready_order: 1,
            diffMins: 1,
            diffTime: 1,
            preparation_time: 1,
            unique_id: 1,
            month: 1,
            date: 1,
            monthNum: 1,
          },
        },

        {
          $group: {

            "_id": {
              "date": "$date"
            },
            month: { $first: "$monthNum" },
            early_count: {
              $sum: {
                $cond: [
                  { $lt: ["$diffMins", -1] },
                  1,
                  0,
                ],
              },
            },
            ontime_count: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$diffMins", -1] },
                      { $lte: ["$diffMins", 1] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            over_time: {
              $sum: {
                $cond: [
                  { $gt: ["$diffMins", 1] },
                  1,
                  0,
                ],
              },
            },

          },
        },
        {
          "$sort": {
            "_id.date.year": 1,
            "_id.date.month_num": 1
          }
        }]

      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)



      let orders = await Orders.aggregate(pipeline).toArray()

      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_12(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [
        {
          $addFields: {
            indexOfStatus7: {
              $indexOfArray: ["$date_time.status", 7],
            },
          },
        },
        {
          $match: {
            indexOfStatus7: {
              $gte: 0,
            },
            preparation_time: { $gt: 0 },
          },
        },

        {
          $addFields: {
            ready_at: {
              $arrayElemAt: [
                "$date_time",
                "$indexOfStatus7",
              ],
            },
          },
        },
        {
          $addFields: {
            diffTime: {
              $subtract: [
                "$ready_at.date",
                "$estimated_time_for_ready_order",
              ],
            },
          },
        },
        {
          $addFields: {
            diffMins: {
              $ceil: {
                $divide: ["$diffTime", 60000], // Convert milliseconds to minutes
              },
            },
          },
        },
        {
          $addFields: {
            actual_preparation_time: {
              $add: ["$preparation_time", "$diffMins"],
            },
          },
        },
        {
          $addFields: {
            date: {
              year: {
                $year: "$created_at",
              },
              month: {
                $subtract: [
                  {
                    $month: "$created_at",
                  },
                  1,
                ],
              },

              "month_num": {
                "$subtract": [
                  {
                    "$month": "$created_at"
                  },
                  1
                ]
              }
            },
          },
        },

        {
          $addFields: {
            "date.month": {
              $let: {
                vars: {
                  monthsInString: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "June",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                },
                in: {
                  $arrayElemAt: [
                    "$$monthsInString",
                    "$date.month",
                  ],
                },
              },
            },
          },
        },

        {
          $addFields: {
            monthNum: {
              $subtract: [
                {
                  $month: "$created_at",
                },
                1,
              ],
            },
          },
        },

        {
          $project: {
            actual_preparation_time: 1,
            ready_at: 1,
            indexOfStatus7: 1,
            estimated_time_for_ready_order: 1,
            diffMins: 1,
            preparation_time: 1,
            unique_id: 1,
            month: 1,
            date: 1,
            monthNum: 1,
          },
        },

        {
          $group: {
            "_id": {
              "date": "$date"
            },
            month: { $first: "$monthNum" },
            early_count: {
              $sum: {
                $cond: [
                  { $lt: ["$diffMins", -1] },
                  1,
                  0,
                ],
              },
            },
            ontime_count: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$diffMins", -1] },
                      { $lte: ["$diffMins", 1] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            over_time: {
              $sum: {
                $cond: [
                  { $gt: ["$diffMins", 1] },
                  1,
                  0,
                ],
              },
            },

          },
        },
        {
          "$sort": {
            "_id.date.year": 1,
            "_id.date.month_num": 1
          }
        },
      ]


      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)




      let orders = await Orders.aggregate(pipeline).toArray()




      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_13(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline1 = [
        {
          $lookup: {
            from: "providers",
            // let: {

              localField: "provider_id",
              foreignField: "_id",
            // },
            // pipeline: [
            //   {
            //     $project: {
            //       first_name: 1,
            //       last_name: 1,
            //       unique_id: 1,
            //       country_id: 1
            //     },
            //   },
            // ],

            as: "provider",
          },
        },
        {
          "$match": {
            "provider_id": {
              "$nin": [
                null
              ]
            },
            "user_rating_to_provider": {
              "$gte": 1
            }
          }
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$provider_id"
            },
            "__alias_1": {
              "$sum": "$user_rating_to_provider"
            },
            "__alias_2": {
              "$sum": {
                "$cond": [
                  {
                    "$ne": [
                      {
                        "$type": "$user_rating_to_provider"
                      },
                      "missing"
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          "$project": {
            "_id": 0,
            "__alias_0": "$_id.__alias_0",
            "__alias_1": 1,
            "__alias_2": 1
          }
        },
        {
          "$project": {
            "provider_id": "$__alias_0",
            "y": "$__alias_1",
            "y_series_0": "$__alias_2",
            "_id": 0
          }
        },
        {
          "$addFields": {
            "__agg_sum": {
              "$sum": [
                "$y",
                "$y_series_0"
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
          "$limit": 1
        },
        {
          "$project": {
            "__agg_sum": 0
          }
        },
        {
          "$addFields": {
            "__multi_series": {
              "$objectToArray": {
                "count ( user_rating_to_provider )": "$y_series_0",
                "sum ( user_rating_to_provider )": "$y"
              }
            }
          }
        },
        {
          "$unwind": "$__multi_series"
        },
        {
          "$addFields": {
            "color": "$__multi_series.k",
            "y": "$__multi_series.v"
          }
        },
        {
          "$project": {
            "__multi_series": 0,
            "y_series_0": 0
          }
        },
        {
          $lookup: {
            from: "providers",
            // let: {

              localField: "provider_id",
              foreignField: "_id",
            // },
            // pipeline: [
            //   {
            //     $project: {
            //       first_name: 1,
            //       last_name: 1,
            //       unique_id: 1,
            //       country_id: 1
            //     },
            //   },
            // ],

            as: "provider",
          },
        },

      ]
      let pipeline2 = [
        {
          $lookup: {
            from: "stores",
            // let: {

              localField: "store_id",
              foreignField: "_id",
            // },
            // pipeline: [{ $project: { name: 1, unique_id: 1, country_id: 1 } }],

            as: "store"
          }
        },
        {
          "$match": {
            "store_id": {
              "$nin": [
                null
              ]
            },
            "user_rating_to_store": {
              "$gte": 1
            }
          }
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$store_id"
            },
            "__alias_1": {
              "$sum": "$user_rating_to_store"
            },
            "__alias_2": {
              "$sum": {
                "$cond": [
                  {
                    "$ne": [
                      {
                        "$type": "$user_rating_to_store"
                      },
                      "missing"
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          "$project": {
            "_id": 0,
            "__alias_0": "$_id.__alias_0",
            "__alias_1": 1,
            "__alias_2": 1
          }
        },
        {
          "$project": {
            "store_id": "$__alias_0",
            "y": "$__alias_1",
            "y_series_0": "$__alias_2",
            "_id": 0
          }
        },
        {
          "$addFields": {
            "__agg_sum": {
              "$sum": [
                "$y",
                "$y_series_0"
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
          "$limit": 1
        },
        {
          "$project": {
            "__agg_sum": 0
          }
        },
        {
          "$addFields": {
            "__multi_series": {
              "$objectToArray": {
                "count ( user_rating_to_store )": "$y_series_0",
                "sum ( user_rating_to_store )": "$y"
              }
            }
          }
        },
        {
          "$unwind": "$__multi_series"
        },
        {
          "$addFields": {
            "color": "$__multi_series.k",
            "y": "$__multi_series.v"
          }
        },
        {
          "$project": {
            "__multi_series": 0,
            "y_series_0": 0
          }
        },
        {
          $lookup: {
            from: "stores",
            // let: {

              localField: "store_id",
              foreignField: "_id",
            // },
            // pipeline: [{ $project: { name: 1, unique_id: 1, country_id: 1 } }],

            as: "store"
          }
        },

      ]
      let pipeline3 = [
        {
          $lookup: {
            from: "users",
            // let: {

              localField: "user_id",
              foreignField: "_id",
            // },
            // pipeline: [{ $project: { first_name: 1, last_name: 1, unique_id: 1, country_id: 1 } }],
            as: "user"
          }
        },
        {
          "$match": {
            "user_id": {
              "$nin": [
                null
              ]
            },
            "provider_rating_to_user": {
              "$gte": 1
            }
          }
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$user_id"
            },
            "__alias_1": {
              "$sum": "$provider_rating_to_user"
            },
            "__alias_2": {
              "$sum": {
                "$cond": [
                  {
                    "$ne": [
                      {
                        "$type": "$provider_rating_to_user"
                      },
                      "missing"
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          "$project": {
            "_id": 0,
            "__alias_0": "$_id.__alias_0",
            "__alias_1": 1,
            "__alias_2": 1
          }
        },
        {
          "$project": {
            "user_id": "$__alias_0",
            "y": "$__alias_1",
            "y_series_0": "$__alias_2",
            "_id": 0
          }
        },
        {
          "$addFields": {
            "__agg_sum": {
              "$sum": [
                "$y",
                "$y_series_0"
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
          "$limit": 1
        },
        {
          "$project": {
            "__agg_sum": 0
          }
        },
        {
          "$addFields": {
            "__multi_series": {
              "$objectToArray": {
                "count ( provider_rating_to_user )": "$y_series_0",
                "sum ( provider_rating_to_user )": "$y"
              }
            }
          }
        },
        {
          "$unwind": "$__multi_series"
        },
        {
          "$addFields": {
            "color": "$__multi_series.k",
            "y": "$__multi_series.v"
          }
        },
        {
          "$project": {
            "__multi_series": 0,
            "y_series_0": 0
          }
        },
        {
          $lookup: {
            from: "users",
            // let: {

              localField: "user_id",
              foreignField: "_id",
            // },
            // pipeline: [{ $project: { first_name: 1, last_name: 1, unique_id: 1, country_id: 1 } }],
            as: "user"
          }
        },

      ]

      let country_filter = req.body.params.country_id

      let filter1 = { $match: { "provider.country_id": new ObjectId(country_filter) } }
      let filter2 = { $match: { "store.country_id": new ObjectId(country_filter) } }
      let filter3 = { $match: { "user.country_id": new ObjectId(country_filter) } }


      pipeline1.splice(1, 0, filter1)
      pipeline2.splice(1, 0, filter2)
      pipeline3.splice(1, 0, filter3)

      pipeline1.unshift(date_filter)
      pipeline2.unshift(date_filter)
      pipeline3.unshift(date_filter)




      // let provider = 
      // let store = 
      // let user = 


      let data = await  Promise.all([ Reviews.aggregate(pipeline1).toArray(), Reviews.aggregate(pipeline2).toArray(), Reviews.aggregate(pipeline3).toArray()])
 
console.log(data);


      return res.json({ status: true, data: { provider:data[0], user:data[2], store:data[1] } })
    } catch (error) {
      console.log(error);

    }
  }
  async API_14(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }


      let pipeline = [
        {
          "$lookup": {
            "from": "cities",

            "localField": "city_id",
            "foreignField": "_id",
            "as": "city_id_lookup_cities"
          }
        },
        {
          "$addFields": {
            "city_id_lookup_cities": {
              "$ifNull": [
                {
                  "$arrayElemAt": [
                    "$city_id_lookup_cities",
                    0
                  ]
                },
                null
              ]
            }
          }
        },
        {
          "$match": {
            "total_delivery_time": {
              "$gt": 0
            }
          }
        },
        {
          "$group": {
            "_id": {
              "__alias_0": "$city_id_lookup_cities.city_name"
            },
            "__alias_1": {
              "$avg": "$total_delivery_time"
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
            "x": "$__alias_0",
            "y": "$__alias_1",
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

      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)



      let orders = await Orders.aggregate(pipeline).toArray()



      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }

  async API_15(req, res) {

    try {

      let created_at = new Date(req.body.params.current_date)
      const year = created_at.getFullYear();
      const month = created_at.getMonth() + 1;
      const day = created_at.getDay()
      const date = created_at.getDate()


      let date_filter = 0
      let type = Number(req.body.params.type)

      switch (type) {
        case 0:

          break;

        case 1:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  // { $eq: [ { $week: "$created_at" }, week] },
                  { $lte: [{ $dayOfWeek: "$created_at" }, day] },
                ]
              }
            }
          }

          break;

        case 2:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                ]
              }
            }
          }

          break;

        case 3:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                ]
              }
            }
          }


          break;
        case 4:

          date_filter = {
            $match: {}
          }
          break;
        case 6:

          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, (year - 1)] },
                ]
              }
            }
          }

          break;

        default:

          date_filter = {
            $match: {
            }
          }

          break;
      }
      if (req.body.params.startDate && req.body.params.endDate) {


        if (new Date(req.body.startDate) == new Date(req.body.endDate)) {

          const year = new Date(req.body.params.startDate).getFullYear();
          const month = new Date(req.body.params.startDate).getMonth() + 1;
          const date = new Date(req.body.params.startDate).getDate()
          date_filter = {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: "$created_at" }, year] },
                  { $eq: [{ $month: "$created_at" }, month] },
                  { $eq: [{ $dayOfMonth: "$created_at" }, date] },
                ]
              }
            }
          }
        } else {

          date_filter = {
            $match: {

              created_at: { $gt: new Date(req.body.params.startDate), $lte: new Date(req.body.params.endDate) }

            }
          }
        }


      }




      let pipeline = [
        {
          "$lookup": {
            "from": "cities",

            "localField": "city_id",
            "foreignField": "_id",
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
          "$lookup": {
            "from": "stores",

            "localField": "store_id",
            "foreignField": "_id",
            "as": "store_detail"
          }
        },
        {
          "$addFields": {
            "store_detail": {
              "$ifNull": [
                {
                  "$arrayElemAt": [
                    "$store_detail",
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
              "__alias_0": "$store_detail.name"
            },
            "__alias_1": {
              "$sum": 1
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
            "x": "$__alias_0",
            "y": "$__alias_1",
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
          "$limit": 10
        },
        {
          "$project": {
            "__agg_sum": 0
          }
        },

      ]


      let country_filter = req.body.params.country_id

      let filter = { $match: { "country_id": new ObjectId(country_filter) } }
      pipeline.unshift(filter)
      pipeline.unshift(date_filter)




      let orders = await Orders.aggregate(pipeline).toArray()

      return res.json({ status: true, data: { orders } })
    } catch (error) {
      console.log(error);

    }
  }


}