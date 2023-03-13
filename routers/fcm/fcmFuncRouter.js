const router = require('express').Router(),
    admin = require('firebase-admin'),
    moment = require('moment'),
    models = require('../../models'),
    globalRouter = require('../global'),
    notificationFuncRouter = require('../notification/notificationFuncRouter');

module.exports = {
    SendFcmEvent : async function SendFcmEvent( body ) {
        var data = JSON.parse(body);

        await models.FcmTokenList.findOne({
            where : {
                UserID : data.targetID
            },
            order : [
                ['id', 'DESC']
            ]
        }).then( async result => {
            var res = '';
            var date = moment().format('yyyy-MM-DD HH:mm:ss');

            var fcmData = await notificationFuncRouter.Insert(data);

            if(globalRouter.IsEmpty(fcmData) == false){
                res = fcmData.Type + '|' + fcmData.id + "|"  + fcmData.TargetID + '|'  + fcmData.ToParent + '|' + fcmData.SubData + '|' + date;
            }

            var message;
            var notiBody = data.notiTitle + ' : ' + data.body;

            message = {
                notification : {
                    title : "잇올",
                    body : notiBody,
                },
                data : {
                    body : res,
                    click_action : "FLUTTER_NOTIFICATION_CLICK",
                    screen: 'NOTIFICATION'
                },
                apns: {
                    payload: {
                        aps: {
                        badge: 1,
                        sound: 'default',
                        },
                    },
                },
            }

            var errorCheck = false;
            if(fcmData.ToParent == true){
                //부모 1에게
                if(!globalRouter.IsEmpty(result.ParentTokenOne)){
                    token = result.ParentTokenOne;
                    message.token = token;

                    console.log(message);
    
                    admin.messaging().send(message)
                    .then( fcmResult => {
                        console.log('fcm send is success' + fcmResult);
                    })
                    .catch( e => {
                        console.error(e);
                        errorCheck = true;
                    })
                }

                //부모2에게 보냄
                if(!globalRouter.IsEmpty(result.ParentTokenTwo)){
                     token = result.ParentTokenTwo;
                     message.token = token;

                    console.log(message);

                    admin.messaging().send(message)
                    .then( fcmResult => {
                        console.log('fcm send is success' + fcmResult);
                    })
                    .catch( e => {
                        console.error(e);
                        errorCheck = true;
                    })
                }
            }else{
                token = result.StudentToken;
                message.token = token;

                admin.messaging().send(message)
                .then( fcmResult => {
                    console.log('fcm send is success' + fcmResult);
                })
                .catch( e => {
                    console.error(e);
                    errorCheck = true;
                })
            }

            return errorCheck;
        }).catch( err => {
            console.error('FcmTokenList Select Faield ' + err);
            return false;
        })
    },
};
