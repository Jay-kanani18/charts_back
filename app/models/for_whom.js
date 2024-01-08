const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const for_whom = new Schema({
   
    name: {type: String, default: ""},
    for_what_Array:{type:Array,default:[]}
     
}, {
  usePushEach: true 
}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
})


module.exports = mongoose.model('For_whom', for_whom);