let For_what = require("../models/for_what")
let For_whom = require("../models/for_whom")

module.exports = class For_what{

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

            let for_what = new For_what(req.body)
            await for_what.save()

            let for_whom_detail = await For_whom.findByIdAndUpdate(req.query.id,{$addToSet:{for_what_Array:for_what._id}})
           return res.json({status:true})

        }catch(error){
            console.log(error);

        }
    }



}