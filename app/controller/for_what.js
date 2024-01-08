const { ObjectId } = require("mongodb")
let For_what = require("../models/for_what")
let For_whom = require("../models/for_whom")
const User = require('../models/users')

module.exports = class ForWhatClass{

    async  get_for_what (req,res){

        try{

            let for_whom = await For_whom.findById(req.query.id)


            let for_what = await For_what.find({_id:{$in:for_whom.for_what_Array}})

           return  res.json({status:true,data:for_what})
            }catch(error){
            console.log(error);
        }
    }

    async add_for_what  (req,res){
        
        try{


            let duplicate = await For_what.findOne({name:req.body.name})

            if(duplicate) res.json({status:false,error:1})



            let for_what = new For_what(req.body)
            await for_what.save()


            let for_whom_detail = await For_whom.findByIdAndUpdate(req.query.id,{$addToSet:{for_what_Array:for_what._id}})

            
            let user = await User.findOneAndUpdate({charts_catagory: {
                $elemMatch: {
                  $eq: new ObjectId(req.query.id)
                }
              }},{$addToSet:{charts_subcatagory:for_what._id}})

           return res.json({status:true})

        }catch(error){
            console.log(error);

        }
    }

    async save_for_what(req,res){
        
        try {

            console.log(req.body);
            let duplicate = await For_what.findOne({name:req.body.name})

            if(duplicate) res.json({status:false,error:1})



            let for_whom = await For_what.findByIdAndUpdate(req.query.id,req.body)



            return res.json({ status: true, data: for_whom })
        } catch (error) {
            console.log(error);

        }



    }
    async remove_for_what(req,res){
        
        try {

            console.log(req.query);
            console.log("🚀 ~ file: for_what.js:76 ~ For_What ~ remove_for_what ~ req.qwery:", req.query)



            let user = await User.findByIdAndUpdate(req.query.user_id,{$pull:{charts_subcatagory:new ObjectId(req.query.id)}})
            let for_whom = await For_whom.findByIdAndUpdate(req.query.whome_id,{$pull:{for_what_Array:new ObjectId(req.query.id)}})





            return res.json({ status: true, data: for_whom })
        } catch (error) {
            console.log(error);

        }



    }



}