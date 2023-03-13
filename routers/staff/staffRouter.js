const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    schedule = require('node-schedule'),
    moment = require('moment');

const crypto = require('crypto');
const config = require('../../config/configure'); //for secret data

const { Op } = require('sequelize');
const Sequelize = require('sequelize');

let URL = '/Staff';


//headCompany:boolean
//centerID:integer
//ui가 정해지면 attributes 정리
router.post('/Select/List', async(req, res) => {
    var rule = {};

    //센터인경우
    if(false == req.body.headCompany){
        rule.CenterID = req.body.centerID
    }

    rule.Type = {
        [Op.not] : -1
    }

    await models.Staff.findAll({
        where : rule,
        order : [   //최근 가입한 순
            ["id" , "DESC"]
        ]
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/List is error ' + err );
        res.status(404).send(null);
    });
})

//담당센터에 따른 센터 및 직원 리스트
//centerList:List<int>
//isAll:boolean
router.post('/Select/List/WithCenter', async(req, res) => {
	var rule = {};

    if(req.body.isAll == 1){
        var errorCheck = false;
        var centerList = await models.Center.findAll({
            
        }).catch(err => {
            console.error(URL + '/Select/List Center findAll is error ' + err );
            errorCheck = true;
        });
    
        var staffList = await models.Staff.findAll({
            where : {
                Type : {
                    [Op.not] : -1
                }
            },
            order : [   //최근 가입한 순
                ["id" , "DESC"]
            ]
        }).catch(err => {
            console.error(URL + '/Select/List Staff findAll is error ' + err );
            errorCheck = true;
        });

        if(errorCheck){
            res.status(404).send(null);
        }else{
            var resData = {
                centerList,
                staffList
            }

            res.status(200).send(resData);
        }
    }else{

		var centerListRule = [];
		for(var i = 0 ; i < req.body.centerList.length ; ++i){
			centerListRule.push({id : req.body.centerList[i]});
		}
        
		rule = {
			[Op.or] : centerListRule
		}

		var centerList = await models.Center.findAll({
            where : rule
        }).catch(err => {
            console.error(URL + '/Select/List Center findAll is error ' + err );
            errorCheck = true;
        });

		rule = {};
		centerListRule = [];
		
		for(var i = 0 ; i < req.body.centerList.length ; ++i){
			centerListRule.push({CenterID : req.body.centerList[i]});
		}

		rule = {
			[Op.or] : centerListRule
		}
		rule.Type = {
			[Op.not] : -1
		}

		var staffList = await models.Staff.findAll({
            where : rule,
            order : [   //최근 가입한 순
                ["id" , "DESC"]
            ]
        }).catch(err => {
            console.error(URL + '/Select/List Staff findAll is error ' + err );
            errorCheck = true;
        });

		if(errorCheck){
            res.status(404).send(null);
        }else{
            var resData = {
                centerList,
                staffList
            }

            res.status(200).send(resData);
        }
    }
})

//직원 가입
//name:string,
//loginID:string,
//centerID:integer,
//gender:boolean, 0-남자 1-여자
//phoneNumber:string,
//birthday:string,
//department:string, - 부서
//type:integer - 타입(1:센터직원,2:센터장,97:본사광역장,98:본사임원,99:CEO,-1:퇴사)
//position:string,
//specialNote:string
router.post('/Register', async(req, res) => {
    var center = await models.Center.findOne({where : {id : req.body.centerID}});

    await models.Staff.create({
        Name : req.body.name,
        LoginID: req.body.loginID,
        Password : crypto.createHmac('sha256', config.pwdsecret).update(center.StaffTempPassword).digest('base64'),
        CenterID : req.body.centerID,
        ChargeCenter : req.body.chargeCenter,
        PhoneNumber : req.body.phoneNumber,
        Birthday: req.body.birthday,
        Department: req.body.department,
        Type : req.body.type,
        Position : req.body.position,
        SpecialNote :req.body.specialNote
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Register is error ' + err );
        res.status(404).send(null);
    });
});

//직원 수정
//id:integer
//name:string,
//loginID:string,
//centerID:integer,
//phoneNumber:string,
//birthday:string,
//gender:boolean, 0-남자 1-여자
//department:string, - 부서
//type:integer - 타입(1:센터직원,2:센터장,97:본사광역장,98:본사임원,99:CEO,-1:퇴사)
//position:string
//specialNote:string
router.post('/Modify', async(req, res) => {
    await models.Staff.update(
        {
            Name : req.body.name,
            LoginID: req.body.loginID,
            CenterID : req.body.centerID,
            ChargeCenter : req.body.chargeCenter,
            Gender: req.body.gender,
            PhoneNumber : req.body.phoneNumber,
            Birthday: req.body.birthday,
            Department: req.body.department,
            Type : req.body.type,
            Position : req.body.position,
            SpecialNote :req.body.specialNote
        },
        {
            where : {id : req.body.id}
        }
    ).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Modify is error ' + err );
        res.status(404).send(null);
    });
})

//아이디 체크
router.post('/Check/LoginID' , async(req, res) => {
    await models.Staff.findOne({
        where : {
            LoginID : req.body.loginID
        }
    }).then(result => {
        if(globalRouter.IsEmpty(result)){
            res.status(200).send(false);
        }else{
            res.status(200).send(true);
        }
    }).catch(err => {
        console.error(URL + '/Check/LoginID is error ' + err );
        res.status(404).send(null);
    });
})


//직원 로그인
//loginID:string,
//password:string
router.post('/Login', async(req, res) => {
    const hashedPwd = crypto.createHmac('sha256', config.pwdsecret).update(req.body.password).digest('base64');

    await models.Staff.findOne({
        where : {
            LoginID : req.body.loginID,
            Password : hashedPwd,
        }
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Login is error ' + err );
        res.status(404).send(null);
    });
})

//직원 비밀번호 초기화
//id:integer,
//password:string,
//centerID:integer
router.post('/Reset/Password', async(req, res) => {
    var center = await models.Center.findOne({where : {id : req.body.centerID}});

    await models.Staff.update(
        {
            Password : crypto.createHmac('sha256', config.pwdsecret).update(center.StaffTempPassword).digest('base64'),
        },
        {
            where : {id : req.body.id}
        }
    ).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Modify is error ' + err );
        res.status(404).send(null);
    });
})

//직원 비밀번호 변경
//loginID:string
//password:string
router.post('/Modify/Password', async(req,res) => {
    
    const hashedPwd = crypto.createHmac('sha256', config.pwdsecret).update(req.body.password).digest('base64');

    await models.Staff.update(
        {
            Password : hashedPwd
        },
        {
            where : {LoginID : req.body.loginID}
        }
    ).then(result => {
        if(globalRouter.IsEmpty(result)){
            res.status(200).send(false);
        }else{
            res.status(200).send(true);
        }
    }).catch(err => {
        console.error(URL + '/Modify is error ' + err );
        res.status(404).send(null);
    });
});


//퇴사 처리
//id:integer
router.post('/Exit', async(req, res) => {
    await models.Staff.update(
        {
            Type : -1
        },
        {
            where : {id : req.body.id}
        }
    ).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Modify is error ' + err );
        res.status(404).send(null);
    });
})

//벌점 테이블 가져옴
router.get('/Select/RewardTable', async(req, res) => {
    await models.RewardTable.findAll({
        where : {IsAuto: false}
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/RewardTable is error ' + err );
        res.status(404).send(null);
    });
})

//임시회원검색
//name:string,
//centerID:integer,
//phoneNumber:string
router.post('/Search/Student/Detail', async(req, res) => {
    await models.Student.findOne({
        where : {
            Name : req.body.name,
            CenterID : req.body.centerID,
            [Op.or] : {
                PhoneNumber : req.body.phoneNumber,
                ParentPhoneNumber : req.body.phoneNumber,
            }
            
        }
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/RewardTable is error ' + err );
        res.status(404).send(null);
    });
})

//유저 디테일
//userID:integer
router.post('/Select/Student/Detail', async(req, res) => {
    const nowDate = moment().toDate();

    await models.Student.findOne({
        where : { UserID : req.body.userID },
        include : [
            {
                model : models.Seat,
                required : false
            },
            {
                model : models.Attendance,
                required : false,
                where : {
					[Op.and] : [
						Sequelize.where(Sequelize.fn('year', Sequelize.col("Time")), nowDate.getFullYear()),
						Sequelize.where(Sequelize.fn('month', Sequelize.col("Time")), nowDate.getMonth() + 1),
						Sequelize.where(Sequelize.fn('day', Sequelize.col("Time")), nowDate.getDate()),
					],
                },
            },
        ],
        order : [
            [models.Attendance, 'Time', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/Student/Detail is error ' + err );
        res.status(404).send(null);
    });
});

//상벌점 등록
//staffID:integer,
//target:integer,
//reason:string,
//description:string,
//value:integer,
//class:integer - 교시
router.post('/Register/RewardPoint', async(req, res) => {
    await models.RewardPoint.create({
        UserID : req.body.staffID,
        TargetID : req.body.targetID,
        Reason : req.body.reason,
        Description : req.body.description,
        Value : req.body.value,
        Class: req.body.class
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
        console.error(URL + '/Register/RewardPoint is error ' + err );
        res.status(404).send(null);
    })
})

//상벌점 가져오기
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

//공용공간 가져오기
//centerID:integer
router.post('/Select/PublicSpace', async(req, res) => {
    await models.PublicSpace.findAll({
        where : {
            CenterID : req.body.centerID
        }
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//센터이름 가져오기
//centerList:List<int> - 센터리스트
router.post('/Select/Center/NameList',async(req,res) => {
    var centerListRule = [];
    for(var i = 0 ; i < req.body.centerList.length ; ++i){
        centerListRule.push({id : req.body.centerList[i]});
    }
    
    rule = {
        [Op.or] : centerListRule
    }

    await models.Center.findAll({
        attributes : ['id','Name'],
        where : rule
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/List Center findAll is error ' + err );
        res.status(200).send(null);
    });
});

//센터에 해당하는 학생들 가져오기
//id:integer
//state:integer - 0:입학전상태,1:등원,2:하원,3:외출,4:공용공간 
router.post('/Select/Center/StudentList', async(req, res) => {

    const nowDate = moment().toDate();

    await models.Center.findOne({
        where : {
            id : req.body.id
        },
        include: [
            {
                attributes : [
                    "UserID", "Name", "Number","MonthPureStudyTime", "ImageURL", "Gender","State","PhoneNumber", "Type"
                ],
                model : models.Student, 
                include : [
                    {
                        model : models.Attendance,
                        required : false,
                        where : {
                            [Op.and] : [
                                Sequelize.where(Sequelize.fn('year', Sequelize.col("Time")), nowDate.getFullYear()),
                                Sequelize.where(Sequelize.fn('month', Sequelize.col("Time")), nowDate.getMonth() + 1),
                                Sequelize.where(Sequelize.fn('day', Sequelize.col("Time")), nowDate.getDate()),
                            ],
                        },
                    }
                ]
            },
            {
                model : models.Class
            }
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/Center/StudentList is error ' + err );
        res.status(404).send(null);
    });
})

//교실에 해당하는 좌석 목록 가져오기
//classID:integer
router.post('/Select/Seat/List/By/ClassID', async(req, res) => {
    await models.Seat.findAll({
        where : {ClassID : req.body.classID}
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/Seat/List/By/ClassID is error ' + err );
        res.status(404).send(null);
    });
})

//사용자 시간표 가져오기
//number:integer - 학번
router.post('/Select/TimeSchedule',async(req, res) => {
    var student = await models.Student.findOne({where : {Number : req.body.number}});
    if(globalRouter.IsEmpty(student)){
        res.status(404).send(null);
    }else{
        var studentClass = await models.Class.findOne({where : {id : student.ClassID}});

        await models.TimeSchedule.findOne({
            where : { id : studentClass.TimeScheduleID }
        }).then(result => {
            res.status(200).send(result);
        }).catch(err => {
            console.error(URL + '/Select/By/UserID is error ' + err );
            res.status(404).send(null);
        });
    }
})

//공용공간 리스트 가져오기
//number:integer - 학번
router.post('/Select/PublicSpace/List', async(req, res) => {
    const nowDate = moment().toDate();
    
    var errorCheck = false;

    var student = await models.Student.findOne({
        attributes : ["UserID","Name","CenterID","ClassID"]
        ,
        where : {
            Number : req.body.number
        }
    }).catch(err => {
        console.log(URL + '/Select/PublicSpaceList Student findone is error ' + err);
        errorCheck = true;
    });

    if(!globalRouter.IsEmpty(student)){
        var studentCenter =await models.Center.findOne({where : {id : student.CenterID}}).catch(err => {
            console.log(URL + '/Select/PublicSpaceList Center findone is error ' + err);
            errorCheck = true;
        });
        var studentClass = await models.Class.findOne({where : {id : student.ClassID}}).catch(err => {
            console.log(URL + '/Select/PublicSpaceList Class findone is error ' + err);
            errorCheck = true;
        });
        var timeSchedule = await models.TimeSchedule.findOne({where : {id : studentClass.TimeScheduleID}}).catch(err => {
            console.log(URL + '/Select/PublicSpaceList TimeSchedule findone is error ' + err);
            errorCheck = true;
        });
    
        var publicSpaceList = await models.PublicSpace.findAll({where: {CenterID : student.CenterID}}).catch(err => {
            console.log(URL + '/Select/PublicSpaceList PublicSpace findone is error ' + err);
            errorCheck = true;
        });
        var publicSpaceUses = await models.PublicSpaceUse.findAll({
            where : {
                UserID : student.UserID,
                [Op.and] : [
                    Sequelize.where(Sequelize.fn('year', Sequelize.col("createdAt")), nowDate.getFullYear()),
                    Sequelize.where(Sequelize.fn('month', Sequelize.col("createdAt")), nowDate.getMonth() + 1),
                    Sequelize.where(Sequelize.fn('day', Sequelize.col("createdAt")), nowDate.getDate()),
                ],
            }
        }).catch(err => {
            console.log(URL + '/Select/PublicSpaceList PublicSpaceUse findone is error ' + err);
            errorCheck = true;
        });
    
        var leftUseCount = studentCenter.PublicSpaceCount - publicSpaceUses.length;
    
        var resData = {
            student,
            leftUseCount,
            publicSpaceList,
            timeSchedule
        }
    
        res.status(200).send(resData);
        return;
    }else{
        errorCheck = true;
    }

    if(errorCheck){
        res.status(404).send(null);
    }else{
        res.status(200).send(true);
    }
})

//공용공간 사용하기
//userID:integer,
//publicSpaceID:integer,
//timeScheduleID:integer,
//class:integer - 교시 1~10

var publicSpaceDict = {};

async function turnaroundClass(userID,publicSpaceID){
	var publicSpace = await models.PublicSpace.findOne({where : {id : publicSpaceID}})
	await publicSpace.update({CurrCount : publicSpace.CurrCount - 1});

    await models.Student.update(
        {
            NowPlace : "교실",
            State: 1 //등원중
        },
        {
            where : {UserID : userID}
        }
    ).catch(err => {
        console.error(URL + '/Select/By/UserID is error ' + err );
    });
}

router.post('/Register/PublicSpaceUse', async(req, res) => {
    await models.PublicSpaceUse.create({
        UserID : req.body.userID,
        PublicSpaceID : req.body.publicSpaceID,
        TimeScheduleID : req.body.timeScheduleID,
        Class : req.body.class
    }).then(async result => {

		if(false == globalRouter.IsEmpty(result)){
			var publicSpace = await models.PublicSpace.findOne({where : {id : req.body.publicSpaceID}})
			publicSpace.update({CurrCount : publicSpace.CurrCount + 1});

			await models.Student.update(
				{
					NowPlace :	 publicSpace.Name,
                    State : 4   //공용공간사용중
				},
				{
					where : {
						UserID : req.body.userID
					}
				}
			)

			var timeSchedule = await models.TimeSchedule.findOne({where : {id : req.body.timeScheduleID}});

			var classTime = timeSchedule.ClassOne;
			if(req.body.class == 2) classTime = timeSchedule.ClassTwo;
			else if(req.body.class == 3) classTime = timeSchedule.ClassThree;
			else if(req.body.class == 4) classTime = timeSchedule.ClassFour;
			else if(req.body.class == 5) classTime = timeSchedule.ClassFive;
			else if(req.body.class == 6) classTime = timeSchedule.ClassSix;
			else if(req.body.class == 7) classTime = timeSchedule.ClassSeven;
			else if(req.body.class == 8) classTime = timeSchedule.ClassEight;
			else if(req.body.class == 9) classTime = timeSchedule.ClassNine;
			else if(req.body.class == 10) classTime = timeSchedule.ClassTen;
	
			const nowDate = moment().toDate();
			var startTime = nowDate.getHours() + 9;
			var endTime = classTime.split('~')[1];
	
			var diff = ((endTime.split(':')[0] - startTime) * 60) + (endTime.split(':')[1] - nowDate.getMinutes());

			var myTimer = setTimeout(turnaroundClass, diff * 60 * 1000, req.body.userID, req.body.publicSpaceID );
	
			publicSpaceDict[req.body.userID.toString()] = myTimer;
	
			res.status(200).send(result);
		}else{
			res.status(404).send(null);
		}
    }).catch(err => {
        console.error(URL + '/Register/PublicSpaceUse is error ' + err );
        res.status(404).send(null);
    });
})

module.exports = router;