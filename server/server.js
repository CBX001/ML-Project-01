let express = require("express");
let app = express();

app.use(function(req, res, next){
    console.log(`${new Date()} - ${req.method} reqest for ${req.url}`);
    next();
});

app.use(express.static("../client"));

let port = 5000
app.listen(port, function(){
    console.log("Serving at 5000")
});