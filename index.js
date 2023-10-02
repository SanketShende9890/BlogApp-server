const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PORT = 4000;

const salt =bcrypt.genSaltSync(10);
const secret = 'g566e9wb9r78t87fbdstf78bdfdsb78tf7sfn8';

const app = express();
app.use(cors({credentials:true,origin:"http://localhost:3000"}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}))


// database connection 
mongoose.connect("mongodb://127.0.0.1:27017/userregister").then(()=>{
    console.log("Database is connected");
}).catch((er)=>{
    console.error("MongoDB connection error:", err);
})



// Register post request
app.post("/register", async (req,res)=>{
    try{
        const {username, password} = req.body;
        const userDoc = await User.create({username, password: bcrypt.hashSync(password,salt)})
        res.json("Registration successfull!")
    } catch(err){
        console.error("Error registering user:", err);
        res.status(400).json({ err: "Registration failed." });
    }
})

// Login post request

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const userDoc = await User.findOne({ username: username });

        if (!userDoc) {
            return res.status(400).json({ error: "User not found." });
        }

        const passOk = bcrypt.compareSync(password, userDoc.password);

        if (!passOk) {
            return res.status(400).json({ error: "Wrong credentials." });
        }

        // If credentials are correct, generate a JWT token
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) {
                console.error("Error signing JWT:", err);
                return res.status(500).json({ error: "Internal server error." });
            }

            // Set the JWT token as a cookie and send a success response
            res.cookie("token", token).json({ success: true });
        });
    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});



app.get("/",(req,res)=>{
    res.json("Server is working fine");
})

app.listen(PORT,()=>{
    console.log(`Server is working on http://localhost:${PORT}`);
})