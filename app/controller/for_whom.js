let For_whom = require("../models/for_whom")
var User = require('../models/users'); // include user controller ////

module.exports = class For_whom{

    async get_for_whom (req, res) {

        try {


            let user_detail = await User.findById(req.query.id)
            console.log("🚀 ~ file: for_whom.js:12 ~ user_detail:", user_detail)


            let for_whom = await For_whom.find({ _id: { $in: user_detail.charts_catagory || [] } })
            console.log("🚀 ~ file: for_whom.js:16 ~ for_whom:", for_whom)

            return res.json({ status: true, data: for_whom })
        } catch (error) {
            console.log(error);

        }
    }
    
    async add_for_whom(req, res) {

        try {


            let for_whom = new For_whom(req.body)
            console.log("🚀 ~ file: for_whom.js:30 ~ req.body:", req.body)
            
            console.log("🚀 ~ file: for_whom.js:32 ~ for_whom:", for_whom)
            await for_whom.save()

            
            let user_detail = await User.findByIdAndUpdate(req.query.id,{$addToSet:{charts_catagory:for_whom._id}})

            return res.json({ status: true })

        } catch (error) {
            console.log(error);

        }
    }



}