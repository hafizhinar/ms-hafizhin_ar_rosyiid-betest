const redis = require('redis');

// connect to redis
const redisPassword = "" ; 
const redis_client = redis.createClient({
          host : process.env.REDIS_HOST, 
          port: process.env.REDIS_PORT,
          no_ready_check: true,
          auth_pass: redisPassword,                                                                                                                                                           
});                               
     
// const redis_client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redis_client.on('connect', function () {
    console.log('redis client connected');
});

module.exports = redis_client;