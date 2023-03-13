const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    formidable = require('formidable'),
    fs_extra = require('fs-extra'),
    moment = require('moment'),
    fs = require('fs');

const crypto = require('crypto');
const config = require('../../config/configure'); //for secret data
const fcmFuncRouter = require('../fcm/fcmFuncRouter');
const verify = require('../../controllers/parameterToken');
const limiter = require('../../config/limiter');
const client = globalRouter.client;

const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const { promisify } = require("util");
const getallAsync = promisify(client.get).bind(client);

let URL = '/Student';

const PAGE_LIMIT = 15;


async function getStudentNumber(centerID){
    //앞에 년도
    const nowDate = moment().toDate();
    var year = nowDate.getFullYear();

    //중간 센터값
    var numdigit = centerID.toString().length;
    var numtostring = centerID.toString();

    if(numdigit < 3){
        for(var i = numdigit ; i < 3 ; ++i){
            numtostring = '0' + numtostring;
            numdigit = numtostring.length;
        }
    }

    var centerString = numtostring;

    //마지막 당일학번
    var centerStudents = await models.Student.findAll({
        attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('Student.UserID')), 'count']
        ],
        where : { CenterID : centerID }
    });

    centerStudents = Object.values(centerStudents[0])[0].count;
    numdigit = (centerStudents + 1).toString().length;
    numtostring = (centerStudents + 1).toString();

    if(numdigit < 3){
        for(var i = numdigit ; i < 3 ; ++i){
            numtostring = '0' + numtostring;
            numdigit = numtostring.length;
        }
    }

    var result = year.toString() + centerString + numtostring;

    var student = await models.Student.findOne({where : {CenterID : centerID,},
    order : [
        ['UserID', 'DESC']
    ],});

    if(!globalRouter.IsEmpty(student)){
        if(student.Number >= result * 1){
            result = student.Number + 1;
        }
    }

    return result;
}


//회원 임시등록
//name:string,
//phoneNumber:string,
//centerID:integer,
//enterRoot:string,
//willEnterCounseling:입학상담예정일
router.post('/Register/By/Temp', async(req, res) => {
    await models.Student.findOrCreate({
        where : {
            Name: req.body.name,
            PhoneNumber : req.body.phoneNumber,
            CenterID : req.body.centerID,
        },
        defaults: {
            Name: req.body.name,
            PhoneNumber : req.body.phoneNumber,
            CenterID: req.body.centerID,
            EnterRoot : req.body.enterRoot,
            WillEnterCounseling : req.body.willEnterCounseling,
            Type: 1 //준회원
        }
    }).then(async result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/By/Temp is error ' + err );
        res.status(404).send(null);
    });
});

//임시 회원 방문날짜 수정
//userID:integer
//willEnterCounseling:입학상담예정일
router.post('/Modify/WillEnterCounseling', async(req,res) => {
    await models.Student.update(
        {
            WillEnterCounseling : req.body.willEnterCounseling,
        },
        {
            where : {UserID : req.body.userID}
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/By/Temp is error ' + err );
        res.status(404).send(null);
    });
});

//임시 등록회원 목록 가져오기
//name:string,
//phoneNumber:string,
//centerID:integer
router.post('/Select/List/By/Temp', async(req, res) => {
    await models.Student.findAll({
        where :{ 
            Type : 1
        }
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/Student/By/Temp is error ' + err );
        res.status(404).send(null);
    });
})

//입학상담등록
//agree:boolean - 승인
//isDirect:boolean - 즉시
//name:string
//centerID:integer,
//type:integer - 타입(0:일반회원,1:준회원,2:정회원)
//enterRoot:string - 가입경로(홈페이지,앱,전화 등)
//phoneNumber:string,
//parentName:string,
//parentPhoneNumber:string,
//willAttendance:string,
//location:string,
//birthday:string,
//gender:integer,
//classifyClass:integer - 클래스분류(0:중고등,1:수능,2:성인)
//examType:string - 시험분야(중1,2,3 고1,2 / 검정고시,고3,재수,3수,N수 / 성인)
//examDetail:string - 언수외과탐사탐
//highSchool:string
//university:string,
//target:string - 목표
//specialNote:string - 특이사항
router.post('/Register/EnterCounseling', async(req, res) => {
    var student;

    // if(req.body.agree) {
        
    // }

    var center = await models.Center.findOne({where : {id : req.body.centerID}});
    var number = await getStudentNumber(req.body.centerID);

    if(req.body.isDirect == 1){
        student = await models.Student.create({
            Number : number,
            Name: req.body.name,
            Type: req.body.type,
            EnterRoot : req.body.enterRoot,
            PhoneNumber: req.body.phoneNumber,
            Password : crypto.createHmac('sha256', config.pwdsecret).update(center.StudentTempPassword).digest('base64'),
            ParentName: req.body.parentName,
            ParentPhoneNumber: req.body.parentPhoneNumber,
            ParentPassword: crypto.createHmac('sha256', config.pwdsecret).update(center.ParentTempPassword).digest('base64'),
            Location: req.body.location,
            CenterID: req.body.centerID,
            Birthday: req.body.birthday,
            Gender: req.body.gender,
            ClassifyClass: req.body.classifyClass,
            ExamType: req.body.examType,
            ExamDetail : req.body.examDetail,
            HighSchool : req.body.highSchool,
            University : req.body.university,
            Target : req.body.target,
            WillEnterCounseling : moment().format("YYYY-MM-DD"),
            SpecialNote: req.body.specialNote
        })

        let body = {
            "isOnline" : 0,
            'count': 0,
            'startTime': moment().unix(),
            'banTime': 0,
        }
        
        client.set(globalRouter.serverName+String(student.UserID),JSON.stringify(body));
    }else{
        await models.Student.update(
            {   
                Number: number,             
                Name: req.body.name,
                Type: req.body.type,
                EnterRoot : req.body.enterRoot,
                PhoneNumber: req.body.phoneNumber,
                Password : crypto.createHmac('sha256', config.pwdsecret).update(center.StudentTempPassword).digest('base64'),
                ParentName: req.body.parentName,
                ParentPhoneNumber: req.body.parentPhoneNumber,
                ParentPassword: crypto.createHmac('sha256', config.pwdsecret).update(center.ParentTempPassword).digest('base64'),
                Location: req.body.location,
                CenterID: req.body.centerID,
                Birthday: req.body.birthday,
                Gender: req.body.gender,
                ClassifyClass: req.body.classifyClass,
                ExamType: req.body.examType,
                ExamDetail : req.body.examDetail,
                HighSchool : req.body.highSchool,
                University : req.body.university,
                Target : req.body.target,
                SpecialNote: req.body.specialNote
            },
            {
                where : { 
                    Name : req.body.name,
                    PhoneNumber : req.body.phoneNumber,
                    CenterID: req.body.centerID,
                }
            }
        )

        student = await models.Student.findOne({
            where : { 
                Name : req.body.name,
                PhoneNumber : req.body.phoneNumber,
                CenterID: req.body.centerID,
            }
        });

        let body = {
            "isOnline" : 0,
            'count': 0,
            'startTime': moment().unix(),
            'banTime': 0,
        }
        
        client.set(globalRouter.serverName+String(student.UserID),JSON.stringify(body));
    }

    await models.EnterCounselingForm.findOrCreate({
        where : {
            UserID : student.UserID,
            Name: req.body.name,
            PhoneNumber : req.body.phoneNumber,
            CenterID : req.body.centerID
        },
        defaults : {
            Birthday: req.body.birthday,
            Gender: req.body.gender,
            PhoneNumber : req.body.phoneNumber,
            ParentPhoneNumber: req.body.parentPhoneNumber,
            Location: req.body.location,
            HighSchool : req.body.highSchool,
            University : req.body.university,
            WillAttendance : req.body.willAttendance == null ? null : new Date(req.body.willAttendance),
            Target : req.body.target,
            TeacherCounseling : req.body.teacherCounseling,
            CurriculumCounseling : req.body.curriculumCounseling,
            WeeklyTest : req.body.weeklyTest,
            Previous : req.body.previous,
            Path : req.body.path,
            ETC : req.body.specialNote,
            Agree : false
        }
    }).then(result => {

        if(result[1] == false){
            result[0].update({Agree : req.body.agree});
        }

        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/EnterCounseling direct is error ' + err );
        res.status(404).send(null);
    });
});

//담당센터 리스트 가져오기
//centerList:List<int>
//isAll:boolean
//index:int
router.post('/Select/List/ChargeOfCenter', async(req,res) => {
    var rule = {};
    if(!req.body.isAll){
        var centerListRule = [];
		for(var i = 0 ; i < req.body.centerList.length ; ++i){
			centerListRule.push({CenterID : req.body.centerList[i]});
		}
        
		rule = {
			[Op.or] : centerListRule
		}
    }

    await models.Student.findAll({
        attributes : [
            "UserID", "CenterID" ,"Number" ,  "Type", "Name", "PhoneNumber", "ParentPhoneNumber", "State", "PeriodStart", "PeriodEnd"
        ],
        offset : req.body.index * 1,
        limit : PAGE_LIMIT,
        order : [
            ['UserID', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/List/ChargeOfCenter is error ' + err );
        res.status(404).send(null);
    });
})

//학생 디테일정보 가져오기
//userID:integer
router.post('/Select/Detail', async(req, res) => {
    await models.Student.findOne({
        where : { UserID : req.body.userID },
        include : [
            {
                model : models.Seat
            },
        ]
    }).then(async result => {

        var eduClass = await models.Class.findOne({where : {id : result.ClassID}});

        var student = result;

        var resData = {
            student,
            eduClass
        }

        res.status(200).send(resData);
    }).catch(err => {
        console.error(URL + '/Select/Detail is error ' + err );
        res.status(404).send(null);
    });
});

//수정하기
//name:string
//type:integer - 타입(0:일반회원,1:준회원,2:정회원)
//enterRoot:string - 가입경로(홈페이지,앱,전화 등)
//phoneNumber:string,
//parentName:string,
//parentPhoneNumber:string,
//location:string,
//centerID:integer,
//classID:integer - 없애고 싶으면 null,
//birthday:string,
//gender:integer,
//classifyClass:integer - 클래스분류(0:중고등,1:수능,2:성인)
//examType:string - 시험분야(중1,2,3 고1,2 / 검정고시,고3,재수,3수,N수 / 성인)
//examDetail:string - 언수외과탐사탐
//highSchool:string
//university:string,
//target:string - 목표
//department:string - 부서,
//teacher:string,
//periodStart:string - ex)2023-01-01,
//periodEnd:string
//specialNote:string
//userID:integer
//isCreateClass:boolean - 클래스 처음 등록
//seatNumber:string - 좌석 - 처음등록 및 수정시
//seatID:integer - 좌석id - 수정시
router.post('/Modify', async(req, res) => {
    var errorCheck = false;

    await models.Student.update(
        {
            Name: req.body.name,
            Type: req.body.type,
            EnterRoot : req.body.enterRoot,
            PhoneNumber : req.body.phoneNumber,
            ParentName: req.body.parentName,
            ParentPhoneNumber: req.body.parentPhoneNumber,
            Location: req.body.location,
            CenterID: req.body.centerID,
            ClassID: req.body.classID,
            Birthday: req.body.birthday,
            Gender: req.body.gender,
            ClassifyClass: req.body.classifyClass,
            ExamType: req.body.examType,
            ExamDetail : req.body.examDetail,
            HighSchool : req.body.highSchool,
            University : req.body.university,
            Target : req.body.target,
            Teacher : req.body.teacher,
            // PeriodStart : req.body.periodStart == null ? null : new Date(req.body.periodStart),
            // PeriodEnd : req.body.periodEnd == null ? null : new Date(req.body.periodEnd),
            SpecialNote: req.body.specialNote
        },
        {
            where : { UserID : req.body.userID }
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify Student update is error ' + err );
        errorCheck = true;
    });

    // //처음 생성
    // if(req.body.isCreateClass){
    //     await models.Seat.create({
    //         UserID : req.body.userID,
    //         ClassID : req.body.classID,
    //         Number : req.body.seatNumber        //좌석
    //     }).catch(err => {
    //         console.error(URL + '/Modify Seat create is error ' + err );
    //         errorCheck = true;
    //     });
    // }else{
    //     if(req.body.centerID == null){
    //         await models.Seat.destroy({
    //             where : {id : req.body.seatID}
    //         }).catch(err => {
    //             console.error(URL + '/Modify Seat destroy is error ' + err );
    //             errorCheck = true;
    //         });
    //     }else{
    //         await models.Seat.update(
    //             {
    //                 UserID : req.body.userID,
    //                 ClassID : req.body.classID,
    //                 Number : req.body.seatNumber
    //             },
    //             {
    //                 where : {id : req.body.seatID }
    //             }
    //         ).catch(err => {
    //             console.error(URL + '/Modify/Seat update is error ' + err );
    //             errorCheck = true;
    //         });
            
    //     }
    // }

    // if(errorCheck){
    //     res.status(404).send(null);
    // }else{
    //     res.status(200).send(true);
    // }
});

//입학상담신청서 수정하기
//userID:integer,
//centerID:integer,
//service:integer,
//name:string,
//birthday:string,
//gender:integer - 0:남자,1:여자
//phoneNumber:string
//parentPhoneNumber:string,
//location:string,
//highSchool:string,
//university:string,
//willAttendance:string,
//target:string,
//teacherCounseling:boolean,
//curriculumCounseling:boolean,
//weeklyTest:string,
//previous:string,
//path:string,
//etc:string,
//agree:boolean
router.post('/Modify/EntercounselingForm', async(req, res) => {
    await models.EnterCounselingForm.update(
        {
            UserID : req.body.UserID,
            CenterID : req.body.centerID,
            Service: req.body.service,
            Name: req.body.name,
            Birthday: req.body.birthday,
            Gender: req.body.gender,
            PhoneNumber : req.body.phoneNumber,
            ParentPhoneNumber: req.body.parentPhoneNumber,
            Location: req.body.location,
            HighSchool : req.body.highSchool,
            University : req.body.university,
            WillAttendance : req.body.willAttendance == null ? null : new Date(req.body.willAttendance),
            Target : req.body.target,
            TeacherCounseling : req.body.teacherCounseling,
            CurriculumCounseling : req.body.curriculumCounseling,
            WeeklyTest : req.body.weeklyTest,
            Previous : req.body.previous,
            Path : req.body.path,
            ETC : req.body.etc,
            Agree : req.body.agree
        },
        {
            where : { id : req.body.id }
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/EntercounselingForm is error ' + err );
        res.status(404).send(null);
    });
})

//비밀번호 초기화
//userID:integer
//centerID:integer,
//isParent:integer
router.post('/Reset/Password', async(req, res) => {

    var center = await models.Center.findOne({where : {id : req.body.centerID * 1}});

    if(req.body.isParent == 1){
        console.log('alksdjfklasd');
        await models.Student.update(
            {
                ParentPassword : crypto.createHmac('sha256', config.pwdsecret).update(center.ParentTempPassword).digest('base64'),
            },
            {
                where : { UserID : req.body.userID * 1}
            }
        ).then(result => {
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Update is error ' + err );
            res.status(404).send(null);
        }); 
    }else{
        await models.Student.update(
            {
                Password : crypto.createHmac('sha256', config.pwdsecret).update(center.StudentTempPassword).digest('base64'),
            },
            {
                where : { UserID : req.body.userID * 1}
            }
        ).then(result => {
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Update is error ' + err );
            res.status(404).send(null);
        }); 
    }
});

//입학상담신청서 가져오기
//userID:integer
router.post('/Select/EnterCounseling/By/UserID', async(req, res) => {
    await models.EnterCounselingForm.findOne({
        where :{ 
            UserID : req.body.userID
        }
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/EnterCounseling/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//좌석 선택하기
//userID:integer,
//classID:integer,
//number:string
router.post('/Register/Seat', async(req, res) => {
    await models.Seat.create({
        UserID : req.body.userID,
        ClassID : req.body.classID,
        Number : req.body.number
    }).then(async result => {
        await models.Student.update(
            {
                ClassID : req.body.classID,
            },
            {
                where : {UserID : req.body.userID}
            }
        ).catch(err => {
            console.error(URL + '/Register/Seat is error ' + err );
            res.status(404).send(null);
            return;
        });

        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/Seat is error ' + err );
        res.status(404).send(null);
    });
})

//좌석 수정하기
//userID:integer,
//classID:integer,
//number:string
//id:integer
router.post('/Modify/Seat', async(req, res) => {
    await models.Seat.update(
        {
            UserID : req.body.userID,
            ClassID : req.body.classID,
            Number : req.body.number
        },
        {
            where : {id : req.body.id }
        }
    ).then(async result => {

        await models.Student.update(
            {
                ClassID : req.body.classID,
            },
            {
                where : {UserID : req.body.userID}
            }
        ).catch(err => {
            console.error(URL + '/Modify/Seat is error ' + err );
            res.status(404).send(null);
            return;
        });

        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/Seat is error ' + err );
        res.status(404).send(null);
    });
});

//좌석 삭제하기
//seatID:integer,
//userID:integer
router.post('/Destroy/Seat', async(req, res) => {
    await models.Seat.destroy(
        {
            where : {id : req.body.id}
        }
    ).then(async result => {

        await models.Student.update(
            {
                ClassID : null,
            },
            {
                where : {UserID : req.body.userID}
            }
        ).catch(err => {
            console.error(URL + '/Destroy/Seat is error ' + err );
            res.status(404).send(null);
            return;
        });

        res.status(200).send(true); 
    }).catch(err => {
        console.error(URL + '/Destroy/Seat is error ' + err );
        res.status(404).send(null);
    });
})

//타입 세팅
//userID:integer,
//type:integer
router.post('/Modify/Type', async(req, res) => {
    await models.Student.update(
        {
            Type : req.body.type
        },
        {
            where : {UserID : req.body.userID}
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/Type is error ' + err );
        res.status(404).send(null);
    });
})

//기간 세팅
//userID:integer,
//periodStart:string - ex)2023-01-01 12:00:00,
//periodEnd:string - ex)2023-01-01 12:00:00,
router.post('/Modify/Period', async(req, res) => {
    await models.Student.update(
        {
            PeriodStart : req.body.periodStart == null ? null : new Date(req.body.periodStart),
            PeriodEnd : req.body.periodEnd == null ? null : new Date(req.body.periodEnd),
        },
        {
            where : {UserID : req.body.userID}
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/Period is error ' + err );
        res.status(404).send(null);
    });
})

//학생삭제
//userID:integer
router.post('/Destroy/By/UserID' , async(req, res) => {
    await models.Student.destroy({
        where : { UerID : req.body.userID }
    }).then(result => {
        res.status(200).send(true); 
    }).catch(err => {
        console.error(URL + '/Destroy/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//입학상담신청서 삭제
//id:integer
router.post('/Destroy/EnterCounseling/By/UserID' , async(req, res) => {
    await models.EnterCounselingForm.destroy({
        where : { id : req.body.id }
    }).then(result => {
        res.status(200).send(true); 
    }).catch(err => {
        console.error(URL + '/Destroy/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//////////////////////

//비밀번호 수정
//password:string,
//number:integer - 학번,
//isParent:boolean
router.post('/Modify/Password', async(req, res) => {
    const hashedPwd = crypto.createHmac('sha256', config.pwdsecret).update(req.body.password).digest('base64');

    if(req.body.isParent){
        await models.Student.update(
            {
                ParentPassword : hashedPwd
            },
            {
                where : { Number : req.body.number }
            }
        ).then(result => {
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Modify/Password is error ' + err );
            res.status(404).send(null);
        });
    }else{
        await models.Student.update(
            {
                Password : hashedPwd
            },
            {
                where : { Number : req.body.number }
            }
        ).then(result => {
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Modify/Password is error ' + err );
            res.status(404).send(null);
        });
    }
});

//로그인
//number:integer - 학번
//password:string,
//isParentLogin:boolean - 학부모로그인여부 0:학생,1:학부모
router.post('/Login', async(req, res) => {

    var errorCheck = false;
    var resData;

    const nowDate = moment().toDate();

    const hashedPwd = crypto.createHmac('sha256', config.pwdsecret).update(req.body.password).digest('base64');

    var rule = {};
    rule.Number = req.body.number * 1
    if(req.body.isParentLogin == 1){
        rule.ParentPassword = hashedPwd
    }else{
        rule.Password = hashedPwd
    }

    await models.Student.findOne({
        where : rule,
        include : [
            {
                model : models.Seat,
                required : false
            },
            {
                model : models.Attendance,
                required : false,
                where : {
                    createdAt : { 
                        //30일 이내
                        [Op.lte] : moment().toDate(),
                        [Op.gte] : moment().subtract(1, 'M').toDate()
                    },
                },
            },
        ],
        order : [
            [models.Attendance, 'Time', 'DESC']
        ],
    }).then(async result => {
        //비밀번호 일치하지 않음
        if(globalRouter.IsEmpty(result)){
            var student = null;
            var studingCount = 0;

            resData = {
                student,
                studingCount,
            }
        }else{
            var students = await models.Student.findAll({
                where : {
                    Type : 2, // 정회원
                    State: 1, // 등원상태,
                    CenterID : result.CenterID
                }
            }).catch(err => {
                console.error(URL + '/Login is error ' + err );
                errorCheck = true;
            });

            var studentClass = await models.Class.findOne({
                where : {
                    id : result.ClassID
                }
            })

            if(false == errorCheck){
                var student = result;
                var eduClass = studentClass;
                var studingCount = students.length;

                resData = {
                    student,
                    eduClass,
                    studingCount,
                }
            }
        }
        
    }).catch(err => {
        console.error(URL + '/Login is error ' + err );
        errorCheck = true;
    });

    if(errorCheck){
        res.status(404).send(null);
    }else{
        let body = {
            "isOnline" : 1,
            'count': 0,
            'startTime': moment().unix(),
            'banTime': 0,
        }

        //client.set(globalRouter.serverName+String(resData.student.UserID),JSON.stringify(body));

        res.status(200).send(resData);
    }
});

//프로필이미지 수정
//userID:integer
router.post('/Modify/ProfileImage', async(req, res) => {
    console.log(URL + '/Insert flow start');

    var fields = new Map();

    var files = [];

    var form = new formidable.IncomingForm();

    console.log(form);

    form.encoding = 'utf-8';
    form.uploadDir = './allphotos/temp';
    form.multiples = true;
    form.keepExtensions = true;


    form.on('field', function (field, value) { //값 하나당 한번씩 돌아가므로,
        console.log(field + ' ' + value);
        fields.set(field, value);
    });

    form.on('file', function (field, file) {
        files.push(file);
        console.log("what is file name in form.on file", file.name);
    }).on('end', async function() {
        
        var student = await models.Student.findOne({
            where : { UserID : fields.get('userID')}
        });

        var resUrl;
        if(student.ImageURL == null){
            globalRouter.makeFolder('profilephotos/' + fields.get('userID')); 

            var folderName = 'profilephotos/' + fields.get('userID');
            var fileName = Date.now() + '.' + files[0].name.split('.').pop();
            resUrl = folderName + '/' + fileName
    
            fs_extra.rename(files[0].path, resUrl); //파일 앞서 만든 폴더에 저장
    
            await models.Student.update(
                {
                    ImageURL : resUrl
                },
                {
                    where : { UserID : fields.get('userID')}
                }
            )
        }else{
            fs.unlink(student.ImageURL, function(err) {
                if(err){
                    console.error(URL + '/Modify/ProfileImage error while delete NoticeFile ' + err);
                    res.status(400).send(null);
                    return;
                }
            })

            if(!globalRouter.IsEmpty(files)){
                var folderName = 'profilephotos/' + fields.get('userID');
                var fileName = Date.now() + '.' + files[0].name.split('.').pop();
                resUrl = folderName + '/' + fileName
        
                fs_extra.rename(files[0].path, resUrl); //파일 앞서 만든 폴더에 저장
        
                await models.Student.update(
                    {
                        ImageURL : resUrl
                    },
                    {
                        where : { UserID : fields.get('userID')}
                    }
                )
            }
        }

        if(globalRouter.IsEmpty(resUrl)){
            res.status(200).send(null);
        }else{
            res.status(200).send(resUrl);
        }
     }).on('error', function (err) {
         console.error('[error] error ' + err);
         globalRouter.removefiles('./allphotos/temp/');
         res.status(400).send(null);
     });
 
     form.parse(req, function (error, field, file) {
             console.log('[parse()] error : ' + error + ', field : ' + field + ', file : ' + file);
             console.log(URL + '/Modify/ProfileImage success');
     });
});

//userID:integer,
//token:string
router.post('/Logout', async(req ,res) => {

    var errorCheck = false;

    var fcm = await models.FcmTokenList.findOne({where : {UserID : req.body.userID}}).catch(err =>{
        console.log(URL + '/Logout FcmTokenList findOne is error ' + err);
        errorCheck = true;
    });

    if(req.body.token == fcm.StudentToken){
        fcm.update({StudentToken : null}).catch(err =>{
            console.log(URL + '/Logout FcmTokenList StudentToken update is error ' + err);
            errorCheck = true;
        });
    }else if(req.body.token == fcm.ParentTokenOne){
        fcm.update({ParentTokenOne : null}).catch(err =>{
            console.log(URL + '/Logout FcmTokenList ParentTokenOne update is error ' + err);
            errorCheck = true;
        });
    }else{
        fcm.update({ParentTokenTwo : null}).catch(err =>{
            console.log(URL + '/Logout FcmTokenList ParentTokenTwo update is error ' + err);
            errorCheck = true;
        });
    }

    if(errorCheck){
        res.status(200).send(null);
    }else{
        res.status(200).send(true);
    }
});

module.exports = router;