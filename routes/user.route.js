const route = require('express').Router();
const auth_middleware = require('../middlewares/auth.middleware');

route.get('/api/test', auth_middleware.verifyToken, (req, res) => {
    return res.json({status: true, message: "Success Connect."});
});

module.exports = route;