const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const for_what = new Schema({
   
    name: {type: String, default: ""},
    charts:{type:Array,default:[]}
    // parent_id:{type:[ObjectId],default:[]}
   
}, {
  usePushEach: true 
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})


module.exports = mongoose.model('For_what', for_what);