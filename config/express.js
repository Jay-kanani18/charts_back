const bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');

module.exports = function (app) {
    app.use(cors())
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    //  if  somone put "/" behind url then show 404  


    // app.use(require("../app/routes/user")(app))
    require("../app/routes/for_whom")(app)
    require("../app/routes/for_what")(app)
    require("../app/routes/charts")(app)
    require("../app/routes/user")(app)
    

    app.get('**',(req,res)=>{
        res.send('<h1 style="display:flex;justify-content:center;"> 404 PAGE NOT FOUND </h1>');
    })

    return app;


}
