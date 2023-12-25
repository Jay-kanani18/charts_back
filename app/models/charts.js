const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const charts = new Schema({
   
    name: {type: String, default: null},
    parent_id:{type:Array,default:[]},
    chart_type:{type:Number,default:0},
    query:{type:Array,default:{$match:{}}},
    suggestion:{
        type:{
            type:Number,
            description:String
        }
    }

   

  

}, {
  usePushEach: true 
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})


module.exports = mongoose.model('Charts', charts);