const router = require('express').Router(),
        models = require('../../models'),
        moment = require('moment'),
        globalRouter = require('../global');

    require('moment-timezone');

    moment.tz.setDefault("Asia/Seoul");

module.exports = {
    Insert : async function InsertNotification( data ) {
        var date = moment().format('yyyy-MM-DD HH:mm:ss');

        var targetIndex = data.targetIndex;

        if(globalRouter.IsEmpty(targetIndex)){
            targetIndex = 0;
        }

        return new Promise((resolv, reject) => {

            models.NotificationList.create({
                TargetID : data.targetID,
                ToParent: data.toParent,
                Type : data.type,
                SubData : data.subData,
                isSend : data.isSend
            }).then( result => {
                resolv(result);
            }).catch( err => {
                console.error('InsertNotification create failed ' + err);
                resolv(null);
            })
        });
    },
    UnSendSelect : async function UnSendSelect( userID, toParent ) {
        return new Promise((resolv, reject) => {
            models.NotificationList.findAll({
                where : {
                    TargetID : userID,
                    ToParent : toParent,
                    IsSend : 0
                }
            }).then( result => {
                if(globalRouter.IsEmpty(result)){
                    resolv(false);
                }else{
                    resolv(true);
                }
            }).catch( err => {
                console.error('UnSendSelect findAll failed ' + err);
                resolv(null);
            })
        });
    }
};
