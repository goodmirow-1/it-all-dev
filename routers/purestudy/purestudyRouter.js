const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    formidable = require('formidable'),
    fs_extra = require('fs-extra'),
    moment = require('moment'),
    fs = require('fs');

const fcmFuncRouter = require('../fcm/fcmFuncRouter');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

let URL = '/PureStudy';

//리스트 가져오기
//userID:integer
router.post('/Select/List/By/UserID', async(req, res) => {
    await models.PureStudyTime.findAll({
        where : {
            UserID : req.body.userID
        },
        order : [
            ['id', 'DESC']
        ]
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/List/By/UserID is error ' + err );
        res.status(404).send(null);
    });
});

//랭크 가져오기
//centerID:integer,
//isThisMonth:integer - 0:지난달,1:이번달
//userID:integer,
router.post('/Select/Rank', async(req, res) => {
    var ranks = [];

    //이번달
    if(req.body.isThisMonth * 1 == 1){
        var rule = {};

        //센터별
        if(req.body.centerID != 0){
            rule.CenterID = req.body.centerID * 1;
        }

        rule.Type == 2; //정회원

        console.log(rule);

        var students = await models.Student.findAll({
            attributes : [
                "UserID", "Name", "MonthPureStudyTime", "ImageURL", "Gender"
            ],
            order : [
                ['MonthPureStudyTime', 'DESC']
            ],
            limit : 50000,
            where : rule
        });
    
        //3위까지
        for(var i = 0 ; i < (students.length > 3 ? 3 : students.length); ++i){
            var student = students[i];
            var number = (i+1) * 1;
    
            var rank = {
                number,
                student
            }
    
            ranks.push(rank);
        }
    
        //내 순위
        for(var i = 0 ; i < students.length ; ++i){
            if(students[i].UserID == req.body.userID * 1){
                var student = students[i];
                var number = (i+1) * 1;
        
                var rank = {
                    number,
                    student
                }
        
                ranks.push(rank);
                break;
            }
        }
    }else{
        //저번달
        const nowDate = moment().toDate();

        var year = nowDate.getFullYear();
        var month = nowDate.getMonth();

        if(month == 0) {
            year -= 1;
            month = 12;
        }

        var rule = {
            [Op.and] : [
                Sequelize.where(Sequelize.fn('year', Sequelize.col("createdAt")), year),
                Sequelize.where(Sequelize.fn('month', Sequelize.col("createdAt")), month)
            ],
        };
        
        //센터별
        if(req.body.centerID != 0){
            rule.CenterID = req.body.centerID;
        }

        var prevRanks = await models.PureRank.findAll({
            where : rule,
            order : [
                ['Rank', 'ASC']
            ],
            limit : 3,
        })

        if(!globalRouter.IsEmpty(prevRanks)){
            for(var i = 0 ; i < prevRanks.length ; ++i){
                var student = await models.Student.findOne({
                    attributes : [
                        "UserID", "Name", "MonthPureStudyTime", "ImageURL", "Gender"
                    ],
                    where : {
                        UserID : prevRanks[i].UserID
                    }
                });
    
                student.MonthPureStudyTime = prevRanks[i].Time;
                var number = (i+1) * 1;
    
                var rank = {
                    number,
                    student
                }
        
                ranks.push(rank);
            }
    
            //전국
            if(req.body.centerID == 0){
                rule.UserID = req.body.userID;
    
                var prevUserRank = await models.PureRank.findOne({
                    where : rule
                })
        
                var student = await models.Student.findOne({
                    attributes : [
                        "UserID", "Name", "MonthPureStudyTime", "ImageURL", "Gender"
                    ],
                    where : {
                        UserID : prevUserRank.UserID
                    }
                });
        
                if(globalRouter.IsEmpty(student)){
                    student = null;
                    var number = 0;
            
                    var rank = {
                        number,
                        student
                    }
                    
                    ranks.push(rank);
                }else{
                    student.MonthPureStudyTime = prevUserRank.Time;
                    var number = prevUserRank.Rank;
            
                    var rank = {
                        number,
                        student
                    }
            
                    ranks.push(rank);
                }
            }else{
                var prevUserRank = await models.PureRank.findAll({
                    where : rule
                })

                var haveRank = false;
                for(var i = 0 ; i < prevUserRank.length ; ++i){
                    if(prevRanks[i].UserID == req.body.userID){
                        var student = await models.Student.findOne({
                            attributes : [
                                "UserID", "Name", "MonthPureStudyTime", "ImageURL", "Gender"
                            ],
                            where : {
                                UserID : prevRanks[i].UserID
                            }
                        });

                        student.MonthPureStudyTime = prevUserRank[i].Time;
                        var number = (i+1) * 1;

                        var rank = {
                            number,
                            student
                        }
                
                        ranks.push(rank);
                        haveRank = true;
                        break;
                    }
                }

                if(false == haveRank){
                    student = null;
                    var number = 0;
            
                    var rank = {
                        number,
                        student
                    }
                    
                    ranks.push(rank);
                }
            }
        }
    }

    if(globalRouter.IsEmpty(ranks)){
        ranks = null;
    }

    res.status(200).send(ranks);
});

//지난달 순공시간 가져오기
//userID:integer
router.post('/Select/LastMonthTime', async(req,res) => {
    const nowDate = moment().toDate();

    var year = nowDate.getFullYear();
    var month = nowDate.getMonth();

    if(month == 0) {
        year -= 1;
        month = 12;
    };
    
    models.PureRank.findAll({
        where : {
            [Op.and] : [
                Sequelize.where(Sequelize.fn('year', Sequelize.col("createdAt")), year),
                Sequelize.where(Sequelize.fn('month', Sequelize.col("createdAt")), month)
            ],
            UserID : req.body.userID
        }
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/LastMonthTime is error ' + err );
        res.status(404).send(null);
    });
});

module.exports = router;