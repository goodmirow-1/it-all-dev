const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    moment = require('moment');

const fcmFuncRouter = require('../fcm/fcmFuncRouter');
const verify = require('../../controllers/parameterToken');
const limiter = require('../../config/limiter');
const client = globalRouter.client;

const { Op } = require('sequelize');

const { promisify } = require("util");
const getallAsync = promisify(client.get).bind(client);

let URL = '/Meal';

router.get('/Select/PayMent/List', async(req, res) => {
    await models.MealPayment.findAll({
        order : [
            ['id', 'DESC']
        ],
        limit : 20,
        offset : req.body.index * 1, 
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/PayMent/List is error ' + err );
        res.status(404).send(null);
    });
});

router.post('/Register/PayMent', async(req, res) => {
    await models.MealPayment.create(
        {
            UserID : req.body.userID,
            PaymentDay : new Date(req.body.paymentDay),
            Count : req.body.count
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/PayMent is error ' + err );
        res.status(404).send(null);
    });
})

router.post('/Modify/PayMent', async(req, res) => {
    await models.MealPayment.update(
        {
            PaymentDay : new Date(req,body.paymentDay),
            Count : req.body.count
        },
        {
            where : {id : req.body.id}
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/PayMent is error ' + err );
        res.status(404).send(null);
    });
})

router.post('/Destroy/PayMent', async(req, res) => {
    await models.MealPayment.destroy({
        where : { id : req.body.id }
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Destroy/PayMent is error ' + err );
        res.status(404).send(null);
    });
})

router.post('/Register/Use', async(req, res) => {
    var student = await models.Student.findOne({where : {UserID : req.body.userID}});

    if((student.Count - (req.body.count * 1)) <= 0 ){
        res.status(200).send(false);
    }else{
        var errorCheck = false;
        for(var i = 0 ; i < req.body.count * 1 ; ++i){
            await models.MealUse.create({
                UserID : req.body.userID,
                UseDay : new Date(req.body.useDayList[i]),
                Type : req.body.typeList[i],
                State : 0
            }).catch(err => {
                console.error(URL + '/Register/Use MealUse create is error ' + err );
                errorCheck = true;
            });
        }

        if(errorCheck) {
            res.status(200).send(null);
        }
        else{
            student.update({HaveMealCount : student.Count - (req.body.count * 1)}).catch(err => {
                console.error(URL + '/Register/Use mealPayment Update is error ' + err );
                errorCheck = true;
            });

            if(errorCheck) {
                res.status(200).send(null);
            }else{
                res.status(200).send(true);
            }
        }
    }
});

router.post('/Cancel/Use', async(req, res) => {
    var errorCheck = false;
    for(var i = 0 ; i < req.body.idList.length ; ++i) {
        var mealuse = await models.MealUse.findOne({where : {id : req.body.idList[i]}});

        await models.MealUse.create({
            UserID : mealuse.UserID,
            UseDay : mealuse.UseDay,
            Type : mealuse.Type,
            State : 1
        }).catch(err => {
            console.error(URL + '/Cancel/Use MealUse create is error ' + err );
            errorCheck = true;
        });
    }

    if(errorCheck) {
        res.status(200).send(null);
    }
    else{
        var student = await models.Student.findOne({where : {UserID : req.body.userID}});

        student.update({HaveMealCount : student.Count + req.body.idList.length}).catch(err => {
            console.error(URL + '/Cancel/Use mealPayment Update is error ' + err );
            errorCheck = true;
        });

        if(errorCheck) {
            res.status(200).send(null);
        }else{
            res.status(200).send(true);
        }
    }
});

router.get('/Select/List/By/UserID', async(req, res) => {
    await models.MealUse.findAll({
        where : {
            UserID : req.body.userID
        },
        order : [
            ['id', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/List/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

router.get('/Register/TimeSchedule', async(req, res) => {
    var errorCheck = false;

    for(var i = 0 ; i < req.body.typeList.length ; ++i){
        await models.MealTimeSchedule.findOrCreate({
            where : {
                CenterID : req.body.centerID,
                Day : new Date(req.body.day),
                Type : req.body.typeList[i],
            },
            defaults: {
                CenterID : req.body.centerID,
                Day : new Date(req.body.day),
                Type : req.body.typeList[i],
                Schedule : req.body.scheduleList[i]
            }
        }).catch(err => {
            console.error(URL + '/Register/TimeSchedule MealTimeSchedule create is error ' + err );
            errorCheck = true;
        });
    }

    if(errorCheck) {
        res.status(200).send(null);
    }
    else{
        res.status(200).send(true);
    }
});

router.post('/Modify/TimeSchedule', async(req, res) => {
    await models.MealTimeSchedule.update(
        {
            CenterID : req.body.centerID,
            Day : new Date(req.body.day),
            Type : req.body.typeList[i],
            Schedule : req.body.scheduleList[i]
        },
        {
            where : {id : req.body.id }
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/TimeSchedule is error ' + err );
        res.status(404).send(null);
    });
})

router.post('/Destroy/TimeSchedule', async(req, res) => {
    await models.MealTimeSchedule.destroy({
        where : {id : req.body.id}
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Destroy/TimeSchedule is error ' + err );
        res.status(404).send(null);
    });
})

module.exports = router;