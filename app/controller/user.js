let For_whom = require("../models/for_whom")
const Users = require('../models/users')

module.exports = {

    login: async function (req, res) {
        try {
            // user_detail = await Us
            const user = await Users.findByCredentials(
                req.body.email,
                req.body.password
            );
            if(!user.status ){
              return  res.json({ status: false , data:{  msg: user.msg} });

            }
            user.data.user = await user.data.user.generateAuthToken();
            res.json(user);
             //uers.findOne({})
            // return res.json({ status: true })
        } catch (error) {
            console.log(error);
            console.log('jjjjjj');

        }
    },

    get_charts: async function (req, res) {
        try {

            let token = req.query.token

            let user = await Users.findOne({ token })

            if (!user) {

                return res.json({ status: false })
            }

        } catch (error) {
            console.log(error);

        }
    },
    get_users: async function (req, res) {
        try {
            let user_list = await Users.find({})



            return res.json({ status: true, user_list })
        } catch (error) {
            console.log(error);

        }
    },
    get_user_detail: async function (req, res) {
        try {


            let user_detail = await Users.findById(req.query.id)



            res.json({ status: true, user_detail })
        } catch (error) {
            console.log(error);
        }
    },
    update_user: async function (req, res) {
        try {

            console.log('this')
            console.log(req.body);
            // req.body.charts[0].query = JSON.parse(req.body.charts[0].query)
            // req.body.charts[1].query = JSON.parse(req.body.charts[1].query)
            // req.body.charts[2].query = JSON.parse(req.body.charts[2].query)
            let user_detail = null
            user_detail = await Users.findById(req.query.id)

            if (!user_detail) {
                user_detail = new Users(req.body)
                await user_detail.save()
            } else {

                user_detail = await Users.findByIdAndUpdate(req.query.id, req.body)
            }



            res.json({ status: true, user_detail })
        } catch (error) {
            console.log(error);

        }
    },
    delete_user: async function (req, res) {
        try {


            user_detail = await Users.findByIdAndDelete(req.query.id)




            return res.json({ status: true })
        } catch (error) {
            console.log(error);

        }
    }


}