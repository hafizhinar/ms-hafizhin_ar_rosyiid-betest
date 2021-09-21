const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const redis_client = require('../redis_connect');
const { use } = require('../routes/auth.route');

const Register = async (req, res) => {
    const salt = bcrypt.genSaltSync(10);
    // encrypt password
    const user = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, salt),
        identityNumber: req.body.identityNumber,
        accountNumber: req.body.accountNumber,
        emailAddress: req.body.emailAddress
    });

    try {
        
        const saved_user = await user.save();
        let data = {
            "id": saved_user.id,
            "username": req.body.username,
            "identityNumber": saved_user.identityNumber,
            "emailAddress": saved_user.emailAddress,
            "accountNumber": saved_user.accountNumber
        }
        res.json({status: true, message: "Registered successfully.", data: data});


    } catch (error) {
        // do logging in DB or file.
        res.status(400).json({status: false, message: "Something went wrong.", data: error});
    }
}

const Login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const emailAddress = req.body.emailAddress;

    try {
        const user = {};
        const email = {};
        if(username && password){
            user = await User.findOne({username: username, password: password}).exec();
        }

        if(emailAddress && password){
            email = await User.findOne({email: emailAddress, password: password}).exec();
        }
      

        if(user === null || email === null) res.status(401).json({status: false, message: "username / email and password is not valid."});
        console.log('user', user);
        const access_token = jwt.sign({sub: user._id ? user._id : email._id}, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TIME});
        console.log('access_token', access_token);
        const refresh_token = GenerateRefreshToken(user._id);
        return res.json({status: true, message: "login success", data: {access_token, refresh_token}});
    } catch (error) {
        return res.status(401).json({status: true, message: "login fail", data: error});
    }

    
}

 const Logout = async (req, res) => {
    const user_id = req.userData.sub;
    const token = req.token;

    // remove the refresh token
    await redis_client.del(user_id.toString());

    // blacklist current access token
    await redis_client.set('BL_' + user_id.toString(), token);
    
    return res.json({status: true, message: "success."});
}

const GetAccessToken  = (req, res) => {
    const user_id = req.userData.sub;
    const access_token = jwt.sign({sub: user_id}, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TIME});
    const refresh_token = GenerateRefreshToken(user_id);
    return res.json({status: true, message: "success", data: {access_token, refresh_token}});
}

const GenerateRefreshToken = (user_id) => {
    const refresh_token = jwt.sign({ sub: user_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TIME });
    
    redis_client.get(user_id.toString(), (err, data) => {
        if(err) throw err;

        redis_client.set(user_id.toString(), JSON.stringify({token: refresh_token}));
    })

    return refresh_token;
}

module.exports = {
    Register,
    Login,
    Logout,
    GetAccessToken
}