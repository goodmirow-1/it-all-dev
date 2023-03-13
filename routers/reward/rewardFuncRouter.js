const router = require('express').Router(),
        models = require('../../models'),
        globalRouter = require('../global');

const { Op } = require('sequelize');


module.exports = {
        Insert : async function Insert( body ) {
                var data = JSON.parse(body);

                var reward = await models.RewardTable.findOne({where : {id : data.rewardTableID}});	//사유,무단 결석

                var errorCheck = false;
                //벌점부여
                await models.RewardPoint.create({
                        UserID : 0, //시스템에 의해
                        TargetID : data.userID, 
                        Reason : reward.Reason,
                        Value : reward.Value
                }).catch(err => {
                        console.error(URL + '/Register RewardPoint create is error ' + err );
                })

                var rule = {};


                //벌점갱신
                await models.Student.findOne({
                        where : {UserID : data.userID}
                }).then(result => {
                        if(!globalRouter.IsEmpty(result)){
                                rule.TotalRewardPoint = result.TotalRewardPoint + reward.Value;

                                if(data.state != 0){
                                  rule.State = data.state;
                                }

                                if(data.nowPlace != ""){
                                  rule.NowPlace = data.nowPlace;
                                }

                                result.update(rule).catch(err => {
                                        console.error(URL + '/Register Student update is error ' + err );
                                        errorCheck = true;
                                });
                        }
                }).catch(err => {
                        console.error(URL + '/Register Student findOne is error ' + err );
                        errorCheck = true;
                })

                return errorCheck;
        }
};