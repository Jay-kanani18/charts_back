let Charts = require("../models/charts")
let For_what = require("../models/for_what")

module.exports = class Charts{

    async get_chart_list (req,res){

        try{

            let for_what = await For_what.findById(req.body.id)

            let cond = []
            if(for_what.charts){
                cond = for_what.charts
                
            }

        let charts = await Charts.find({_id:{$in:cond}})

           return  res.json({status:true,data:charts})
                }catch(error){
            console.log(error);

        }
    }   

    async add_charts (req,res){
        
        try{

            let charts = new Charts(req.body)
            await charts.save()

           return res.json({status:true})

        }catch(error){
            console.log(error);

        }
    }

    async get_charts_detail(){
        
    }
    

}