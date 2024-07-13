import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import axios from "axios";
import mongoose from "mongoose";
import stages from "./CropStages.js";
import npk_values from "./values.js";
import tf from "@tensorflow/tfjs";
import training_dataset from "./values1.js";
import dataset_labels from "./values2.js";

mongoose.connect("mongodb+srv://admin-mayur:pass123@cluster0.3krzrdf.mongodb.net/eKrushi");

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

// user schema
const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    crop : String,
    date : String,
    stage_cnt : Number,
    farmer_request : [],
});
const User = mongoose.model("User",userSchema);

// buyer schema
const buyerSchema = new mongoose.Schema({
    username : String,
    password : String
});
const Buyer = mongoose.model("Buyer",buyerSchema);

// buyer marketplace schema
const buyer_marketplace = new mongoose.Schema({
    crop : String,
    size : String,
    price : String,
    duration : String,
    farmer_name : String
});
const Buyer_marketplace = mongoose.model("Buyer_marketplace",buyer_marketplace);

// variables

var store = {
    islog : false,
    username : "",
    password : "",
    who : "",
    crop : null,
    stagecnt : 0,
    crop_suggestion: null,
    fertilizer_suggestion: [],
    date : "",
    npk : [],
    soil_suggestions : [],
    request : []
}

var userinfo = {
    name : "",
    address : "",
    crop_names : "",
    land : "",
    income : ""
};

// get requests home page, login and signup page
app.get("/",(req,res)=>{
    res.render("index.ejs",{store : store});
});

app.get("/login",(req,res)=>{
    res.render("login.ejs",{store : store});
});

app.get("/signup",(req,res)=>{
    res.render("signup.ejs",{store : store});
});

app.get("/user",(req,res)=>{
    if(store.who == "buyer") res.render("buyer.ejs",{store : store, userinfo : userinfo});
    else res.render("user.ejs",{store : store, userinfo : userinfo});
});

app.get("/logout",(req,res)=>{
    store.islog = false;
    store.username = "";
    store.password = "";
    store.crop = null;
    store.stagecnt = 0;
    res.redirect("/");
});


// get requests for features

app.get("/crop_health_monitoring",(req,res)=>{
    if(store.islog == false) res.redirect("/login");
    else if(store.crop == null) res.render("features/select_crop.ejs",{store : store});
    else res.render("features/crop_health_monitoring.ejs",{store : store, stages : stages});
});

app.get("/crop_fertilizers_suggestions",(req,res)=>{
    if(store.islog == false) res.redirect("/login");
    else {
        store.crop_suggestion = null;
        store.fertilizer_suggestion = [];
        res.render("features/crop_fertilizers_suggestions.ejs",{store : store});
    }
});

app.get("/track_soil", (req,res)=>{
    var n = Math.floor(Math.random() * 300);
    store.npk = npk_values[n];
    store.soil_suggestions = [];
    var tvalues = [0,0,0,0];
    tvalues[0] = Math.floor(Math.random() * 50);
    tvalues[1] = Math.floor(Math.random() * 50);
    tvalues[2] = Math.floor(Math.random() * 50);
    tvalues[3] = Math.floor(Math.random() * 100);
    if(store.npk[0] > tvalues[0]){
        var s = "Nitrogen level has became less, add some nitrogen containing fertilizers once in a week.";
        store.soil_suggestions.push(s);
    }
    else{
        var s = "Reduce nitrogen-containing fertilizers and consider balanced fertilizers. Monitor and adjust based on future soil tests.";
        store.soil_suggestions.push(s);
    }
    if(store.npk[1] > tvalues[1]){
        var s = "Phosphorous level has became less, add some phosphorous containing fertilizers once in a week.";
        store.soil_suggestions.push(s);
    }
    else{
        var s = "Phosphorus is in excessive amount, consider reducing phosphatic fertilizers. Monitor and adjust based on future soil tests.";
        store.soil_suggestions.push(s);
    }
    if(store.npk[2] > tvalues[2]){
        var s = "Potassium level has became less";
        store.soil_suggestions.push(s);
    }
    else {
        var s = "Reduce potassic fertilizers. Monitor and adjust based on future soil tests";
        store.soil_suggestions.push(s);
    }
    if(store.npk[3] > tvalues[3]){
        var s = "Improve water management practices, consider irrigation, and use organic matter to enhance soil water retention";
        store.soil_suggestions.push(s);
    }
    else {
        var s = "Improve drainage, use soil amendments, and adjust irrigation practices to avoid waterlogging.";
        store.soil_suggestions.push(s);
    }
    if(store.npk[3] < tvalues[3]){
        var s = "Current temperature is low, slow down the irrigation process";
        store.soil_suggestions.push(s);
    }
    else{
        var s = "Increse irrigation cycles";
        store.soil_suggestions.push(s);
    }
    if(store.islog == false) res.redirect("/login");
    else if(store.crop == null) res.render("features/select_crop.ejs",{store : store});
    else res.render("features/track_soil.ejs",{store : store, tvalues : tvalues});
});

app.get("/weather_conditions",(req,res)=>{
    if(store.islog == false) res.redirect("/login");
    else res.render("features/weather_conditions.ejs",{store : store});
});

app.get("/market_place",(req,res)=>{
    res.render("features/marketplace.ejs",{store : store});
});

app.get("/government_schemes",(req,res)=>{
    res.render("features/government_schemes.ejs",{store : store});
});

// other get requests

app.get("/dashboard", async(req,res)=>{
    var isfind = await User.findOne({username : store.username});
    if(store.islog == false) res.redirect("/login");
    else if(isfind.crop == null) res.render("features/select_crop.ejs",{store : store});
    else{
        store.crop = isfind.crop;
        res.render("dashboard.ejs",{store : store});
    }
});

app.get("/help",(req,res)=>{
    res.render("help.ejs",{store : store});
});

app.get("/about_us",(req,res)=>{
    res.render("about_us.ejs",{store : store});
});

app.get("/buyer_marketplace", async(req,res)=>{
    var isfind = await Buyer_marketplace.find();
    var buyer_options = isfind;
    res.render("features/buyer_marketplace.ejs",{store : store, buyer_options : buyer_options});
});


// post requests login related

app.post("/login_clicked",async(req,res)=>{
    store.username = req.body.username;
    store.password = req.body.password;
    store.who = req.body.type;
    if(store.who == "buyer"){
        var isfind = await Buyer.findOne({username : store.username});
        if(!isfind) res.send("No buyer exists with this credentials. Sign up please");
        else {
            store.islog = true;
            res.render("buyer.ejs",{store : store, userinfo : userinfo});
        }
    }
    else {
        var isfind = await User.findOne({username : store.username});
        if(!isfind) res.send("No user exists with this credentials. Sign up please");
        else {
            store.islog = true;
            store.crop = isfind.crop;
            store.request = isfind.farmer_request;
            res.render("user.ejs",{store : store, userinfo : userinfo});
        }
    }
});

app.post("/signup_clicked",async(req,res)=>{
    store.username = req.body.username;
    store.password = req.body.password;
    store.who = req.body.type;
    if(store.who == "buyer"){
        var isfind = await Buyer.findOne({username : store.username});
        if(isfind) res.send("User with this credentials already exists. Sign in please.");
        else{
            var newBuyer = new Buyer({
                username : store.username,
                password : store.password
            });
            newBuyer.save();
            store.islog = true;
            res.render("login-info/farmer-login-info.ejs",{store : store});
        }
    }
    else{
        var isfind = await User.findOne({username : store.username});
        if(isfind) res.send("User with this credentials already exists. Sign in please.");
        else{
            var newUser = new User({
                username : store.username,
                password : store.password,
                crop : null
            });
            newUser.save();
            store.islog = true;
            res.render("login-info/farmer-login-info.ejs",{store : store});
        }
    }
});

// post request of user info

app.post("/tbd",(req,res)=>{
    userinfo.name = req.body.full_name;
    userinfo.address = req.body.address;
    userinfo.crop_names = req.body.crop_names;
    userinfo.land = req.body.land;
    userinfo.income =  req.body.income;
    if(store.who == "buyer"){
        res.render("buyer.ejs",{store : store, userinfo : userinfo});
    }
    else res.render("user.ejs",{store : store, userinfo : userinfo});
});

// post request of features

app.post("/crop_health",(req,res)=>{
    if(store.stagecnt < 6) store.stagecnt += 1;
    // store.stagecnt %= 7;
    res.render("features/crop_health_monitoring.ejs",{store : store, stages : stages});
});

app.post("/crop_health_prev",(req,res)=>{
    if(store.stagecnt > 0) store.stagecnt -= 1;
    res.render("features/crop_health_monitoring.ejs",{store : store, stages : stages});
});

app.post("/crop_prediction",(req,res)=>{
    var n = parseInt(req.body.N);
    var p = parseInt(req.body.P);
    var k = parseInt(req.body.K);
    var h = parseInt(req.body.H);
    var pH = parseInt(req.body.pH);
    var cropNames = ["Tomato","Sugarcane","Wheat","Rice","Maize","Kidneybeans","Mungbean"];
    const numClasses = 7;

    const model = tf.sequential();

    model.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: tf.train.adam(),
    metrics: ['accuracy']
    });

    // Training data
    const input_data = tf.tensor2d(training_dataset, [343, 5]);

    // Crop labels corresponding to the input data
    const crop_labels = tf.tensor2d(dataset_labels, [343, numClasses]);

    // Training the model
    model.fit(input_data, crop_labels, { epochs: 100 });
    
    // Using the trained model for prediction
    const new_input = tf.tensor2d([[n, p, k, h, pH]]);
    const prediction = model.predict(new_input);

    const predictedCropIndex = tf.argMax(prediction, 1).dataSync()[0];
    var obj = {
        name: String,
        url : String
    } 
    obj.name = cropNames[predictedCropIndex];
    obj.url = "/images/" + obj.name + ".jpeg";
    store.crop_suggestion = obj;
    res.render("features/crop_fertilizers_suggestions.ejs",{store : store});
})

app.post("/fertilizer_suggestions",(req,res)=>{
    store.fertilizer_suggestion = []
    if(req.body.N < 100){
        var s = "Less nitrogen content, suggested fertilizers = Urea or Ammonium sulfate"
        store.fertilizer_suggestion.push(s);
    }
    else{
        var s = "Nitrogen content is as expected"
        store.fertilizer_suggestion.push(s);
    }
    if(req.body.P < 60){
        var s = "Less phosphorous content, suggested fertilizers =  Diammonium Phosphate (DAP) or Single Super Phosphate (SSP)"
        store.fertilizer_suggestion.push(s);
    }
    else{
        var s = "Phosphorous content is as expected"
        store.fertilizer_suggestion.push(s);
    }
    if(req.body.K < 80){
        var s = "Less potassium content, suggested fertilizers = Muriate of Potash (MOP) or Sulfate of Potash (SOP)"
        store.fertilizer_suggestion.push(s);
    }
    else{
        var s = "Potassium content is as expected"
        store.fertilizer_suggestion.push(s);
    }
    res.render("features/crop_fertilizers_suggestions.ejs",{store : store});
})

app.post("/weather_conditions",async(req,res)=>{
    try{
        var cityName = req.body.city;
        var turl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName +"&cnt=6&appid=632895ac151e2d5a324524da10d1d00b";
        var wt = await axios.get(turl);
        var result = wt.data;
        res.render("features/weather_conditions2.ejs",{store : store,result : result});
    }
    catch(error){
        console.log("Error");
    }
});

// market place post request

app.post("/farmer_request",async(req,res)=>{
    var obj = {
        crop: req.body.crop,
        size: req.body.size,
        price: req.body.price,
        duration: req.body.duration
    }
    var obj1 = new Buyer_marketplace({
        crop: req.body.crop,
        size: req.body.size,
        price: req.body.price,
        duration: req.body.duration,
        farmer_name : store.username
    });
    obj1.save();
    // console.log(obj);
    var isfind = await User.findOne({username : store.username});
    isfind.farmer_request.push(obj);
    isfind.save();
    store.request.push(obj);
    res.redirect("/market_place");
});

// Government Schemes

app.post("/scheme_clicked",async(req,res)=>{
    console.log(req.body);
});

// post request of dashboard

app.post("/select_crop", async(req,res)=>{
    const date = new Date();
    var s = "";
    if(date.getDate() < 10) s += '0';
    s += date.getDate();
    s += '/';
    let month = date.getMonth() + 1;
    if(month < 10) s += '0';
    s += month;
    s += '/';
    s += date.getFullYear();
    store.date = s;
    var isfind = await User.updateOne({username : store.username},{date : store.date});
    store.crop = req.body.type;
    var isfind = await User.updateOne({username : store.username},{crop : store.crop});
    res.redirect("/");
});

// port
app.listen(3000,()=>{
    console.log("Server has started");
});