const { mongoose } = require('mongoose');


module.exports =async function () {


db = await mongoose.connect("mongodb://localhost:27017/CHARTS",{
    useUnifiedTopology: true,
    useNewUrlParser: true
   })
   
   require("../app/models/for_whom")
   require("../app/models/for_what")

   return db


}