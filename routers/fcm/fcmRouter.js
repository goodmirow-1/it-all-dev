const router = require('express').Router(),
    admin = require('firebase-admin'),
    globalRouter = require('../global'),
    models = require('../../models');
    const { Op } = require('sequelize');

    var serviceAccount = require("../../keys/itallapp-firebase-adminsdk-e5l2o-39e1cf53d2.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

var URL = '/Fcm/';

router.post('/Token/Save',async (req,res) => {
    var fcm = await models.FcmTokenList.findOne({
        where : {
            UserID : req.body.userID * 1
        }
    })

    if(globalRouter.IsEmpty(fcm)){
        await models.FcmTokenList.create({
            UserID : req.body.userID,
            StudentToken : req.body.token
        }).then(function(result) {
            console.log(URL + "Token/Save new Success" + result);
            res.status(200).send(result);
        }).catch( err => {
            console.error(URL + "Token/Save Faield " + err);
            res.status(400).send(err);
        })
    }else{
        var rule = {};
        rule.LoginChecker = !fcm.LoginCheck;

        if(req.body.isParent * 1 == 1){
            if(fcm.ParentTokenOne == null){
                rule.ParentTokenOne = req.body.token;
            }else {
                if(fcm.ParentTokenOne != req.body.token){
                    if(fcm.ParentTokenTwo == null){
                        rule.ParentTokenTwo = req.body.token;
                    }else if(fcm.ParentTokenOne != req.body.token){
                        rule.ParentTokenOne = req.body.token;
                    }else if(fcm.ParentTokenTwo != req.body.token){
                        rule.ParentTokenTwo = req.body.token;
                    }
                }
            }
        }else{
            if(fcm.StudentToken != req.body.token){
                rule.StudentToken = req.body.token;
            }
        }

        await models.FcmTokenList.update(
            rule,
            {
                where : {
                    id : fcm.id
                }
            }
        ).catch( err => {
            console.error(URL + "Token/Save Faield " + err);
            res.status(400).send(err);
            return;
        })

        res.status(200).send(fcm);
    }
});

router.post('/DetailAlarmSetting', async(req,res) => {
    await models.FcmTokenList.update(
        {
            Alarm: req.body.alarm,
        },
        {
            where : {
                UserID : req.body.userID,
            }
        },
    ).then( result => {
        res.status(200).send(result);
    }).catch(err => {
        console.log(URL + 'DetailAlarmSetting' + err);
        res.status(400).send(null);
    })
});

module.exports = router;