const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    formidable = require('formidable'),
    fs_extra = require('fs-extra'),
    moment = require('moment'),
    fs = require('fs');

const fcmFuncRouter = require('../fcm/fcmFuncRouter');
const { Op } = require('sequelize');

let URL = '/Center';

//생성
//name:string,
//site:string,
//telephoneNumber:string,
//location:string,
//type:integer, - 0:스파르타수능관
//publicSpaceCount:integer,
//studentTempPassword:string - 최대4글자
//parentTempPassword:string - 최대4글자
//staffTempPassword:string - 최대4글자
router.post('/Register', async(req, res) => {
    var haveCenter = await models.Center.findAll({where : {Name : req.body.name}});

    if(globalRouter.IsEmpty(haveCenter)){
        await models.Center.create({
            Name : req.body.name,
            Site : req.body.site,
            TelephoneNumber : req.body.telephoneNumber,
            Location : req.body.location,
            Type : req.body.type,
            PublicSpaceCount : req.body.publicSpaceCount,
            StudentTempPassword: req.body.studentTempPassword,
            ParentTempPassword : req.body.parentTempPassword,
            StaffTempPassword : req.body.staffTempPassword
        }).then(async result => {
            //센터를 만들면 해당 센터 기본 시간표 자동생성
            var timeSchedule = await models.TimeSchedule.create({
                Name : req.body.name + '시간표',
                CenterID : result.id,
            });
    
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Register is error ' + err );
            res.status(404).send(null);
        });
    }else{
        res.status(200).send(false);
    }
});

//리스트 가져오기
router.post('/Select/List', async(req, res) => {
    await models.Center.findAll({
        
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/List is error ' + err );
        res.status(404).send(null);
    });
});

//디테일 가져오기
//id:integer
router.post('/Select/Detail', async(req, res) => {
    await models.Center.findOne({
        where : {
            id : req.body.id
        },
        include: [
            {
                model : models.Student,
            },
            {
                model : models.Class,
            },
            {
                model : models.TimeSchedule,
            },
            {
                model : models.PublicSpace,
            }
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/Detail is error ' + err );
        res.status(404).send(null);
    });
})

//수정
//name:string,
//site:string,
//telephoneNumber:string,
//location:string,
//type:integer, - 0:스파르타수능관
//publicSpaceCount:integer,
//studentTempPassword:string - 최대4글자
//parentTempPassword:string - 최대4글자
//staffTempPassword:string - 최대4글자
//isChangeName:bool
router.post('/Update', async(req, res) => {
    if(req.body.isChangeName){
        var haveCenter = await models.Center.findOne({
            where : {
                Name : req.body.name,
            }}
        );

        if(globalRouter.IsEmpty(haveCenter)){
            await models.Center.update(
                {
                    Name : req.body.name,
                    Site : req.body.site,
                    TelephoneNumber : req.body.telephoneNumber,
                    Location : req.body.location,
                    Type : req.body.type,
                    PublicSpaceCount : req.body.publicSpaceCount,
                    StudentTempPassword: req.body.studentTempPassword,
                    ParentTempPassword : req.body.parentTempPassword,
                    StaffTempPassword : req.body.staffTempPassword
                },
                {
                    where : {id : req.body.id}
                }
            ).then(result => {
                res.status(200).send(result); 
            }).catch(err => {
                console.error(URL + '/Update is error ' + err );
                res.status(404).send(null);
            });
        }else{
            res.status(200).send(false); 
        }
    }else{
        await models.Center.update(
            {
                Name : req.body.name,
                Site : req.body.site,
                TelephoneNumber : req.body.telephoneNumber,
                Location : req.body.location,
                Type : req.body.type,
                PublicSpaceCount : req.body.publicSpaceCount,
                StudentTempPassword: req.body.studentTempPassword,
                ParentTempPassword : req.body.parentTempPassword,
                StaffTempPassword : req.body.staffTempPassword
            },
            {
                where : {id : req.body.id}
            }
        ).then(result => {
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Update is error ' + err );
            res.status(404).send(null);
        });
    }
});

//교실등록
//centerID:integer,
//name:string,
//type:integer - 0:일반1인실,1:오픈1인실,2:통유리1인실,3:통유리2인실,4:통유리1인실특실,5:교실형,6:독서실형,7:도서관형,8:카페형,9:온라인룸,10:프리존,11:포커스존
//timescheduleID:integer - 시간표 id
//floorPlane:string - 교실 형태
router.post('/Register/Class', async(req, res) => {

    await models.Class.create({
        CenterID : req.body.centerID,
        Name : req.body.name,
        Type : req.body.type,
        FloorPlane : req.body.floorPlane,
        TimeScheduleID : req.body.timeScheduleID
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/Class is error ' + err );
        res.status(404).send(null);
    });
});

//교실수정
//centerID:integer,
//name:string,
//type:integer - 0:일반1인실,1:오픈1인실,2:통유리1인실,3:통유리2인실,4:통유리1인실특실,5:교실형,6:독서실형,7:도서관형,8:카페형,9:온라인룸,10:프리존,11:포커스존
//timescheduleID:integer - 시간표 id
//id:integer

//floorPlane:string - 교실 형태
router.post('/Update/Class', async(req, res) => {
    await models.Class.update(
        {
            Name : req.body.name,
            Type : req.body.type,
            FloorPlane : req.body.floorPlane,
            TimeScheduleID : req.body.timeScheduleID
        },
        {
            where : { id : req.body.id}
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Update/Class is error ' + err );
        res.status(404).send(null);
    });
});

//교실리스트 가져오기
//centerID:integer
router.post('/Select/Class/List', async(req, res) => {
    await models.Class.findAll({
        where : {
            CenterID : req.body.centerID
        },
    }).then(async result => {
        
        if(globalRouter.IsEmpty(result)){
            res.status(200).send(false);
        }else{
            var resData = [];
            for(var i = 0 ; i < result.length ; ++i){
                var eduClass = result[i];
                var timeSchedule = await models.TimeSchedule.findOne({where : {id : result[i].TimeScheduleID}});

                var data = {
                    eduClass,
                    timeSchedule
                }

                resData.push(data);
            }

            res.status(200).send(resData); 
        }
    }).catch(err => {
        console.error(URL + '/Select/Class/List is error ' + err );
        res.status(404).send(null);
    });
})

//교실 학생리스트 가져오기
//classID:integer
router.post('/Select/Class/UserList', async(req, res) => {
    var seatList = await models.Seat.findAll({where : {ClassID : req.body.classID}}).catch(err => {
        console.error(URL + '/Select/Class/UserList is error ' + err );
        res.status(404).send(null);
        return;
    });

    var resData = [];

    for(var i = 0 ; i < seatList.length ; ++i){
        var student = await models.Student.findOne({
            where : {UserID : seatList[i].UserID},
            attributes : ["UserID", "Number", "Name", "State"]
        }).catch(err => {
            console.error(URL + '/Select/Class/UserList is error ' + err );
        });

        var seat = seatList[i];
        var data = {
            student,
            seat
        }

        resData.push(data);
    }

    if(globalRouter.IsEmpty(resData)){
        res.status(200).send(false);
    }else{
        res.status(200).send(resData);
    }
})

//교실 삭제
router.post('/Destroy/Class', async(req,res) => {
    var seat = await models.Seat.findAll({ where : {ClassID : req.body.id}});

    if(globalRouter.IsEmpty(seat)){
        await models.Class.destroy({
            where : {id : req.body.id}
        }).then(result => {
            res.status(200).send(true); 
        }).catch(err => {
            console.error(URL + '/Destroy/Class is error ' + err );
            res.status(404).send(null);
            return;
        });
    }else{
        res.status(200).send(false);
    }
});

//수업생성
//name:string,
//centerID:integer,
//enterTime:string - ex) '08:00'
//closeTime:string - ex) '22:00'
//classOne:string - ex) '08:00~08:40'
//classTwo:string - ex) '08:50~10:20'
//classThree:string 
//classfour:string 
//classfive:string 
//classsix:string 
//classSeven:string 
//classEight:string 
//classNine:string 
//classTen:string 
router.post('/Register/TimeSchedule', async(req, res) => {
    await models.TimeSchedule.create({
        Name : req.body.name,
        CenterID : req.body.centerID,
        EnterTime : req.body.enterTime,
        CloseTime : req.body.closeTime,
        ClassOne : req.body.classOne,
        ClassTwo : req.body.classTwo,
        ClassThree : req.body.classThree,
        ClassFour : req.body.classFour,
        ClassFive : req.body.classFive,
        ClassSix : req.body.classSix,
        ClassSeven : req.body.classSeven,
        ClassEight : req.body.classEight,
        ClassNine : req.body.classNine,
        ClassTen : req.body.classTen
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/TimeSchedule is error ' + err );
        res.status(404).send(null);
    });
})

//시간표 수정
//id:integer,
//name:string,
//centerID:integer,
//enterTime:string - ex) '08:00'
//closeTime:string - ex) '22:00'
//classOne:string - ex) '08:00~08:40'
//classTwo:string - ex) '08:50~10:20'
//classThree:string 
//classfour:string 
//classfive:string 
//classsix:string 
//classSeven:string 
//classEight:string 
//classNine:string 
//classTen:string 
router.post('/Update/TimeSchedule', async(req, res) => {
    await models.TimeSchedule.update(
        {
            Name : req.body.name,
            CenterID : req.body.centerID,
            EnterTime : req.body.enterTime,
            CloseTime : req.body.closeTime,
            ClassOne : req.body.classOne,
            ClassTwo : req.body.classTwo,
            ClassThree : req.body.classThree,
            ClassFour : req.body.classFour,
            ClassFive : req.body.classFive,
            ClassSix : req.body.classSix,
            ClassSeven : req.body.classSeven,
            ClassEight : req.body.classEight,
            ClassNine : req.body.classNine,
            ClassTen : req.body.classTen
        },
        {
            where : {id : req.body.id }
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Update/TimeSchedule is error ' + err );
        res.status(404).send(null);
    });
})

//시간표 삭제
//id:integer
router.post('/Destroy/TimeSchedule', async(req, res) => {
    var myClass = await models.Class.findAll({where : {TimeScheduleID : req.body.id}})

    if(globalRouter.IsEmpty(myClass)){
        await models.TimeSchedule.destroy({
            where : {id : req.body.id}
        }).then(result => {
            res.status(200).send(true); 
        }).catch(err => {
            console.error(URL + '/Destroy/TimeSchedule is error ' + err );
            res.status(404).send(null);
        });
    }else{
        res.status(200).send(false);
    }
})

//공용공간 가져오기
//id:integer
router.post('/Select/PublicSpace/By/ID', async(req, res) => {
    await models.PublicSpace.findOne({
        where : {id : req.body.id}
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/PublicSpace/By/ID is error ' + err );
        res.status(404).send(null);
    });
})

//공용공간 등록
//name:string,
//centerID:integer,
//maxCount:integer,
router.post('/Register/PublicSpace', async(req, res) => {
    await models.PublicSpace.create({
        Name : req.body.name,
        CenterID : req.body.centerID,
        MaxCount : req.body.maxCount,
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/PublicSpace is error ' + err );
        res.status(404).send(null);
    });
})

//공용공간 수정
//id:integer,
//name:string,
//centerID:integer,
//maxCount:integer
router.post('/Modify/PublicSpace', async(req, res) => {
    await models.PublicSpace.update(
        {
            Name : req.body.name,
            CenterID : req.body.centerID,
            MaxCount : req.body.maxCount,
        },
        {
            where : {id : req.body.id}
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/PublicSpace is error ' + err );
        res.status(404).send(null);
    });
})

//공용공간 삭제
//id:integer
router.post('/Destroy/PublicSpace', async(req, res) => {
    await models.PublicSpace.destroy({
            where : {id : req.body.id}
    }).then(result => {
        res.status(200).send(true); 
    }).catch(err => {
        console.error(URL + '/Destroy/PublicSpace is error ' + err );
        res.status(404).send(null);
    });
})

module.exports = router;