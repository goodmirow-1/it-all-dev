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

let URL = '/Reward';

//상점등록
//userID:integer, - 누가
//targetID:integer, - 누구한테
//reason:string,
//description:string,
//value:integer
router.post('/Register', async(req, res) => {
    await models.RewardPoint.create({
        UserID : req.body.userID,
        TargetID : req.body.targetID,
        Reason : req.body.reason,
        Description : req.body.description,
        Value : req.body.value
    }).then(async result => {
        var student = await models.Student.findOne({
            where : {UserID : req.body.targetID}
        });

        if(globalRouter.IsEmpty(student)){
            res.status(200).send(false); 
        }else{
            student.update({TotalRewardPoint : student.TotalRewardPoint + req.body.value});

            res.status(200).send(result); 
        }
    }).catch(err => {
        console.error(URL + '/Register is error ' + err );
        res.status(404).send(null);
    });
});

//리스트 가져오기
//index:integer
router.post('/Select/List', async(req, res) => {
    await models.RewardPoint.findAll({
        order : [
            ['id', 'DESC']
        ],
        limit : 20,
        offset : req.body.index * 1, 
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/List is error ' + err );
        res.status(404).send(null);
    });
});

//유저 이력 가져오기(준사람)
//userID:integer
router.post('/Select/By/UserID', async(req, res) => {
    await models.RewardPoint.findAll({
        where : { UserID : req.body.userID },
        order : [
            ['id', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/By/UserID is error ' + err );
        res.status(404).send(null);
    });
});

//유저 이력 가져오기(받은사람)
//userID:integer
router.post('/Select/By/TargetID', async(req, res) => {
    await models.RewardPoint.findAll({
        where : { TargetID : req.body.userID },
        order : [
            ['id', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/By/UserID is error ' + err );
        res.status(404).send(null);
    });
});

//수정하기
//userID:integer,
//target:integer,
//reason:string,
//description:string,
//value:integer,
//id:integer
router.post('/Modify/By/ID', async(req, res) => {

    var reward = await models.RewardPoint.findOne({
        where : {id : req.body.id * 1}
    });

    //기존벌점과의 차이
    var diff = 0;
    if(req.body.value * 1 > reward.Value){
        diff = req.body.value * 1 - reward.Value;
    }else if(req.body.value * 1< reward.Value){
        diff = Math.abs(reward.Value - req.body.value * 1);
        diff = -diff;
    }

    var errorCheck = false;

    //상벌점부여
    await models.RewardPoint.create(
        {
            UserID : 0,
            TargetID : req.body.targetID * 1,
            Reason : reward.Reason + '이/가 \n' + req.body.reason + '로 수정됨',
            Description : req.body.description,
            Value : diff
        },
        {
            where : { id : req.body.id }
        }
    ).catch(err => {
        console.error(URL + '/Modify/By/UserID is error ' + err );
        errorCheck = true;
    });

    //벌점갱신
    await models.Student.findOne({
        where : {UserID : req.body.userID}
    }).then(result => {
        if(!globalRouter.IsEmpty(result)){
            result.update({
                TotalRewardPoint : result.TotalRewardPoint + diff,
            })
        }
    }).catch(err => {
        console.error(URL + '/Register is error ' + err );
        errorCheck = true;
    })

    if(errorCheck){
		res.status(404).send(null);
	}else{
        var resData = {
            res : true
        }

        res.status(200).send(resData);
    }
});

//삭제
//id:integer
router.post('/Destroy/By/ID', async(req, res) => {
    await models.RewardPoint.destroy({
        where : { id : req.body.id }
    }).then(result => {
        res.status(200).send(true); 
    }).catch(err => {
        console.error(URL + '/Destroy/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//상점테이블 수정
//category:string,
//reason:string,
//value:integer,
//id:integer
router.post('/Modify/Table', async(req, res) => {
    await models.RewardTable.update(
        {
            Category : req.body.category,
            Reason : req.body.reason,
            Value : req.body.value
        },
        {
            where : { id : req.body.id }
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Destroy/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//벌점 테이블 가져옴
router.get('/Select/RewardTable', async(req, res) => {
    await models.RewardTable.findAll({
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/RewardTable is error ' + err );
        res.status(404).send(null);
    });
})


/////////////////////////////



module.exports = router;