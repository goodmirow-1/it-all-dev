const globalRouter = require('../routers/global.js');
const client = globalRouter.client;
const moment = require('moment');

module.exports = (req, res, next) => {
    client.exists(globalRouter.getRedisKey(req.body.userID, req.body.isParent), (err, reply) => {
        // if(err) {
        //     console.log(err);
        //     process.exit(0);
        // }

        if(reply == 1){
            client.get(globalRouter.getRedisKey(req.body.userID, req.body.isParent), (err, reply) => {

                if(globalRouter.IsEmpty(reply)){
                    let body = {
                        'isOnline' : 0,
                        'count': 1,
                        'startTime': moment().unix(),
                        'banTime': 0,
                    }

                    client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(body));
                    next();
                }else{
                    let data = JSON.parse(reply);

                    let curr = moment().unix();
                    let diff = (curr - data.startTime) / 60;

                    if(diff >= 1){
                        if(data.banTime != 0){
                            let bandiff = (curr - data.banTime) / (60 * 60);

                            //1시간 지나면
                            if(bandiff >= 1){
                                let body = {
                                    'isOnline' : data.isOnline,
                                    'count': 1,
                                    'startTime': moment().unix(),
                                    'banTime': 0,
                                }
                                client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(body));
                                next()
                            }else{
                                return res.status(429).send({"message" : "exceed request"});
                            }
                        }else{
                            let body = {
                                'isOnline' : data.isOnline,
                                'count': 1,
                                'startTime': moment().unix(),
                                'banTime': 0,
                            }
                            client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(body));
                            next()
                        }
                    }
                    else {
                        if(data.count >= 10) {
                            let body = {
                                'isOnline' : data.isOnline,
                                'count': 10,
                                'startTime': moment().unix(),
                                'banTime': moment().unix(),
                            }

                            return res.status(429).send({"message" : "exceed request"});
                        }
                        data.count++;
                        client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(data));
                        // allow request
                        next();
                    }
                }
            });
        }else{
            let body = {
                'isOnline' : 0,
                'count': 1,
                'startTime': moment().unix(),
                'banTime': 0,
            }

            client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(body));
            // allow request
            next();
        }
    })
}