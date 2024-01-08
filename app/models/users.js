const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    is_premium: {type: String, default:false},
    name: {type: String, default: ""},
    email: {type: String, default: ""},
    token: {type: String, default: ""},
    database: {type: String, default: ""},
    database_string:{type: String, default: ""},
    collection:{type: String, default: ""},
    charts:[{
        type:{type: String, default: true},
        name:{type: String, default: ""},
        query:{type: Array, default: []},
        // collection:{type: String, default: []}
    }],
    charts_catagory:{type:Array,default:[]},
    charts_subcatagory:{type:Array,default:[]},
    charts_array:{type:Array,default:[]}

  

}, {
  usePushEach: true 
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})


module.exports = mongoose.model('User', user);
        