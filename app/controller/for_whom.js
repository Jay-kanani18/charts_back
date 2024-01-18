const { ObjectId } = require("mongodb");
const For_whom = require("../models/for_whom")
const User = require('../models/users'); // include user controller ////

module.exports = class ForWhom {

    async get_for_whom(req, res) {

        try {


            let user_detail = await User.aggregate([{$project:{name:1,_id:1,charts_catagory:1,token:1}},{$lookup:{
                from:"for_whoms",
                localField:"charts_catagory",
                foreignField:"_id",
                as:"catagory_detail"
            }}])

            user_detail = user_detail[0]

            let for_whom = await For_whom.aggregate([
                {
                    "$match": {
                        _id: {
                            "$in": user_detail.charts_catagory
                        }
                    }
                },
                {
                    "$lookup": {
                        from: "for_whats",
                        foreignField: "_id",
                        localField: "for_what_Array",
                        pipeline: [{ $project: { _id: 1, name: 1 } }],
                        as: "for_what_Array"
                    }
                }
            ])

            return res.json({ status: true, data: for_whom ,user_detail})
        } catch (error) {
            console.log(error);

        }
    }

    async add_for_whom(req, res) {

        try {


            let duplicate = await For_whom.findOne({ name: req.body.name })

            if (duplicate) res.json({ status: false, error: 1 })


            let for_whom = new For_whom(req.body)

            await for_whom.save()


            let user_detail = await User.findByIdAndUpdate(req.query.id, { $addToSet: { charts_catagory: for_whom._id } })

            return res.json({ status: true })

        } catch (error) {
            console.log(error);

        }
    }

    async save_for_whom(req, res) {

        try {

            let duplicate = await For_whom.findOne({ name: req.body.name })

            if (duplicate) res.json({ status: false, error: 1 })



            let for_whom = await For_whom.findByIdAndUpdate(req.query.id, req.body)



            return res.json({ status: true, data: for_whom })
        } catch (error) {
            console.log(error);

        }



    }
    async remove_for_whom(req, res) {

        try {


            console.log(req.query.id);
            let for_whom = await User.findByIdAndUpdate(req.query.user_id, { $pull: { charts_catagory: new ObjectId(req.query.id) } })



            return res.json({ status: true, data: for_whom })
        } catch (error) {
            console.log(error);

        }



    }



}