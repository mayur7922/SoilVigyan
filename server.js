import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import axios from "axios";
import mongoose from "mongoose";
import stages from "./stages.js";
import npk_values from "./stnpk_values.js";
import tf from "@tensorflow/tfjs";

mongoose.connect("mongodb+srv://admin-mayur:pass123@cluster0.3krzrdf.mongodb.net/eKrushi");

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

// user schema
const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    crop : String,
    date : String
});
const User = mongoose.model("User",userSchema);

// buyer schema
const buyerSchema = new mongoose.Schema({
    username : String,
    password : String
});
const Buyer = mongoose.model("Buyer",buyerSchema);

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
    soil_suggestions : []
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
    if(store.npk[0] < 5){
        var s = "Nitrogen level has became less, add some nitrogen containing fertilizers once in a week.";
        store.soil_suggestions.push(s);
    }
    else{
        var s = "Reduce nitrogen-containing fertilizers and consider balanced fertilizers. Monitor and adjust based on future soil tests.";
        store.soil_suggestions.push(s);
    }
    if(store.npk[1] < 14){
        var s = "Phosphorous level has became less, add some phosphorous containing fertilizers once in a week.";
        store.soil_suggestions.push(s);
    }
    else{
        var s = "Phosphorus excess is less common, but if it occurs, consider reducing phosphatic fertilizers. Monitor and adjust based on future soil tests.";
        store.soil_suggestions.push(s);
    }
    if(store.npk[2] < 15){
        var s = "Potassium level has became less";
        store.soil_suggestions.push(s);
    }
    else {
        var s = "Reduce potassic fertilizers. Monitor and adjust based on future soil tests";
        store.soil_suggestions.push(s);
    }
    if(store.npk[3] < 60){
        var s = "Improve water management practices, consider irrigation, and use organic matter to enhance soil water retention";
        store.soil_suggestions.push(s);
    }
    else {
        var s = "Improve drainage, use soil amendments, and adjust irrigation practices to avoid waterlogging.";
        store.soil_suggestions.push(s);
    }
    if(store.npk[4] < 25){
        var s = "Current temperature is low, slow down the irrigation process";
        store.soil_suggestions.push(s);
    }
    else{
        var s = "Increse irrigation cycles";
        store.soil_suggestions.push(s);
    }
    if(store.islog == false) res.redirect("/login");
    else if(store.crop == null) res.render("features/select_crop.ejs",{store : store});
    else res.render("features/track_soil.ejs",{store : store});
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

app.get("/buyer_marketplace",(req,res)=>{
    res.render("features/buyer_marketplace.ejs",{store : store});
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
    store.stagecnt += 1;
    store.stagecnt %= 7;
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
    const input_data = tf.tensor2d([
        [110, 70, 130, 70, 6.0],
        [115, 75, 140, 75, 6.2],
        [100, 60, 120, 65, 6.5],
        [120, 80, 150, 80, 5.8],
        [105, 65, 125, 68, 6.1],
        [112, 72, 135, 72, 6.3],
        [95, 55, 110, 60, 6.8],
        [130, 90, 160, 85, 5.5],
        [108, 68, 128, 67, 6.4],
        [140, 100, 170, 90, 5.0],
        [90, 50, 100, 80, 7.0],
        [95, 55, 110, 85, 7.2],
        [100, 60, 120, 90, 6.8],
        [105, 65, 130, 95, 6.6],
        [110, 70, 140, 100, 6.5],
        [115, 75, 150, 105, 6.3],
        [120, 80, 160, 110, 6.0],
        [125, 85, 170, 115, 5.8],
        [130, 90, 180, 120, 5.5],
        [135, 95, 190, 125, 5.2],
        [100, 50, 80, 50, 7.5],
        [110, 60, 90, 55, 7.2],
        [95, 45, 75, 45, 7.8],
        [120, 70, 100, 60, 7.0],
        [105, 55, 85, 58, 7.4],
        [115, 65, 95, 62, 7.2],
        [90, 40, 70, 40, 8.0],
        [130, 80, 110, 65, 6.8],
        [98, 48, 78, 56, 7.7],
        [140, 90, 120, 70, 6.5],
        [90, 42, 43, 82.00274423, 6.502985292],
        [85, 58, 41, 80.31964408, 7.038096361],
        [60, 55, 44, 82.3207629, 7.840207144],
        [78,42,42,81.60487287,7.628472891],
        [69,37,42,83.37011772,7.073453503],
        [69,55,38,82.63941394,5.70080568],
        [78,	48,	22,	63.10459626,	5.588650585],
        [87,	54,	20,	63.4711755,	6.576418207000000],
        [87,	35,	25,	63.1621551,	6.178056304],
        [24,	67,	22,	22.89845607,	5.618844277000000],
        [11,	71,	24,	22.7182355,	5.6066203460000000],
        [37,	74,	15,	18.22590825,	5.582178402],
        [4,	36,	22,	86.13316408,	7.012740397000000],
        [10,	59,	22,	86.99495766,	7.1556850160000000],
        [14,	48,	21,	84.80084105,	6.991242362]
    ], [45, 5]);

    // Crop labels corresponding to the input data
    const crop_labels = tf.tensor2d([
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,1,0,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,0,1,0,0],
    [0,0,0,0,1,0,0],
    [0,0,0,0,1,0,0],
    [0,0,0,0,0,1,0],
    [0,0,0,0,0,1,0],
    [0,0,0,0,0,1,0],
    [0,0,0,0,0,0,1],
    [0,0,0,0,0,0,1],
    [0,0,0,0,0,0,1],
    ], [45, numClasses]);

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
        var weather_url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=632895ac151e2d5a324524da10d1d00b";
        var weather_info = await axios.get(weather_url);
        var result = weather_info.data;
        res.render("features/weather_conditions2.ejs",{store : store,result : result});
    }
    catch(error){
        console.log("Error");
    }
});

// post request of dashboard

app.post("/select_crop", async(req,res)=>{
    const date = new Date();
    var s = "";
    if(date.getDate() < 10) s += '0';
    s += date.getDate();
    s += '/';
    if(date.getMonth() < 10) s += '0';
    s += date.getMonth();
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