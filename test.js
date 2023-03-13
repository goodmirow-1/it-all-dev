const express = require('express');
const methodOverride = require('method-override');		//Post,Delete,Update 관련 Module
const bodyParser = require('body-parser');			//Json으로 데이터 통신 Module
const helmet = require('helmet');				//http 보안관련 Module
const cookieParser = require('cookie-parser');			//Cookie Module
const path = require('path');
const cors = require('cors');
const dateutil = require('date-utils');
const { promisify } = require('util');          //동기화 module
const schedule = require('node-schedule');
require('dotenv').config()

const formidable = require('formidable');
const fs_extra = require('fs-extra');
const fs = require('fs');
const models = require("./models/index.js");

const attendanceRouter = require('./routers/attendance/attendanceRouter'),
	boardRouter = require('./routers/board/boardRouter'),
	centerRouter = require('./routers/center/centerRouter'),
	fcmRouter = require('./routers/fcm/fcmRouter'),
	notificationRouter = require('./routers/notification/notificationRouter'),
	pureStudyRouter = require('./routers/purestudy/purestudyRouter'),
	rewardRouter = require('./routers/reward/rewardRouter'),
	mealRouter = require('./routers/meal/mealRouter'),
	staffRouter = require('./routers/staff/staffRouter');
	studentRouter = require('./routers/student/studentRouter');

const globalRouter = require('./routers/global.js'),
	attendanceFuncRouter = require('./routers/attendance/attendanceFuncRouter'),
	boardFuncRouter = require('./routers/board/boardFuncRouter'),
	centerFuncRouter = require('./routers/center/centerFuncRouter'),
	fcmFuncRouter = require('./routers/fcm/fcmFuncRouter'),
	notificationFuncRouter = require('./routers/notification/notificationFuncRouter'),
	pureStudyFuncRouter = require('./routers/purestudy/purestudyFuncRouter'),
	mealFuncRouter = require('./routers/meal/mealFuncRouter'),
	rewardFuncRouter = require('./routers/reward/rewardFuncRouter'),
	studentFuncRouter = require('./routers/student/studentFuncRouter');


const app = express();

app.use(helmet());
app.use(cors());
app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname));

app.use('/Attendance', attendanceRouter);
app.use('/Board', boardRouter);
app.use('/Center', centerRouter);
app.use('/Meal', mealRouter);
app.use('/Fcm', fcmRouter);
app.use('/Notification', notificationRouter);
app.use('/PureStudy', pureStudyRouter);
app.use('/Reward', rewardRouter);
app.use('/Student', studentRouter);
app.use('/Staff', staffRouter);

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

app.set('port', process.argv[2] || 19999); 
const server = app.listen(app.get('port'), () => {
	console.log('Express it-all '  + globalRouter.serverName + ' server listening on port ' + app.get('port'));
});

const { Op } = require('sequelize');
// sequelize 연동
models.sequelize.sync().then( async () => {
    console.log("DB Connect Success");

	globalRouter.setHolidayList(await models.Holiday.findAll({}));
}).catch( err => {
    console.error("DB Connect Faield");
    console.error(err);
})

const Sequelize = require('sequelize');

app.post('/Test2', async(req, res) => {
    const nowDate = moment().toDate();
    var haveReason = true;



    var absence = await models.Absence.findOne({
        where : {
            UserID : 11,
            Type : 2, //결석
            PeriodStart: {
                //24시간 이내
                [Op.lte] : moment().add(9, 'H').toDate(),
                [Op.gte] : moment().subtract(24 - 9, 'H').toDate()
            }
        }
    })

    console.log(absence);

    if(globalRouter.IsEmpty(absence)){
        var rule = {};

        switch(nowDate.getDay()){
            case 1 : {rule = {Monday : true}} break;
            case 2 : {rule = {Tuseday : true}} break;
            case 3 : {rule = {Wednesday : true}} break;
            case 4 : {rule = {Thursday : true}} break;
            case 5 : {rule = {Friday : true}} break;
            case 6 : {rule = {Saturday : true}} break;
            case 7 : {rule = {Sunday : true}} break;
        }

        rule.UserID = 11;
        rule.Type = 1; //결석
        rule.Acception = true;

        var AbsenceRegulars = await models.AbsenceRegular.findAll({
            where : rule
        })

        console.log(AbsenceRegulars);

        if(globalRouter.IsEmpty(AbsenceRegulars)){
            haveReason = false;
        }
    }

    var data = JSON.stringify({
        userID : 11,
        rewardTableID : haveReason ? 5 : 4
    });

    errorCheck = await rewardFuncRouter.Insert(data);

    res.status(200).send(true);
})

app.post('/Test', async(req,res) => {
	
	var resData;
    const nowDate = moment().toDate();

    await models.Student.findAll({
        where : {
            Type : 2    //정회원
        }
    }).then(async result => {
        for(var i = 0 ; i < result.length ; ++i){
            var student = result[i];
            var haveReason = true;

            var attendance = await models.Attendance.findOne({
                where : {
                    UserID : result[i].UserID,
                    Type : {
                        [Op.or] : [0,1,2,3]
                    },
                    Time: {
                        //24시간 이내
                        [Op.lte] : moment().add(9, 'H').toDate(),
                        [Op.gte] : moment().subtract(24 - 9, 'H').toDate()
                    }
                } 
            });

            //등원 안함
            if(globalRouter.IsEmpty(attendance)){
                var absence = await models.Absence.findOne({
                    where : {
                        UserID : student.UserID,
                        Type : 2, //결석
                        PeriodStart: {
                            //24시간 이내
                            [Op.lte] : moment().add(9, 'H').toDate(),
                            [Op.gte] : moment().subtract(24 - 9, 'H').toDate()
                        }
                    }
                })

                console.log(absence);

                if(globalRouter.IsEmpty(absence)){
                    var rule = {};

                    switch(nowDate.getDay()){
                        case 1 : {rule = {Monday : true}} break;
                        case 2 : {rule = {Tuseday : true}} break;
                        case 3 : {rule = {Wednesday : true}} break;
                        case 4 : {rule = {Thursday : true}} break;
                        case 5 : {rule = {Friday : true}} break;
                        case 6 : {rule = {Saturday : true}} break;
                        case 7 : {rule = {Sunday : true}} break;
                    }

                    rule.UserID = student.UserID;
                    rule.Type = 1; //결석
                    rule.Acception = true;

                    var AbsenceRegulars = await models.AbsenceRegular.findAll({
                        where : rule
                    })

                    console.log(AbsenceRegulars);

                    if(globalRouter.IsEmpty(AbsenceRegulars)){
                        haveReason = false;
                    }
                }

                var data = JSON.stringify({
                    userID : student.UserID,
                    rewardTableID : haveReason ? 5 : 4
                });

                errorCheck = await rewardFuncRouter.Insert(data);
            }else{
                var attendance = await models.Attendance.findOne({
                    where : {
                        UserID : student.UserID,
                        Type : 11, //하원
                        Time: {
                            //24시간 이내
                            //24시간 이내
                            [Op.lte] : moment().add(9, 'H').toDate(),
                            [Op.gte] : moment().subtract(24 - 9, 'H').toDate()
                        }
                    } 
                });

                //하원이 안찍힘
                if(globalRouter.IsEmpty(attendance)){
                    await models.Attendance.create({
                        UserID : student.UserID,
                        CenterID : student.CenterID,
                        Type : 7, //무단 조퇴
                        Time : moment().subtract(3 - 9, 'H').toDate() //전일자 11시 이후로 저장됨.
                    }).catch(err => {
                        console.error(URL + '/Register is error ' + err );
                        errorCheck = true;
                    })

                    var data = JSON.stringify({
                        userID : student.UserID,
                        rewardTableID : 8 //무단조퇴
                    });
    
                    errorCheck = await rewardFuncRouter.Insert(data);
                }
            }

            //일주일 개근
            var day = nowDate.getDay();
            if(day == 7){ //일요일
                var continues = true;
                for(var i = 0 ; i < 6 ; ++i){
                    var today = moment().subtract(i,'day').toDate();
                    var yesterday = moment().subtract(i+1, 'day').toDate();

                    var isHoliday = globalRouter.IsHoliday(yesterday);

                    if(false == isHoliday){
                        var attendance = await models.Attendance.findAll({
                            where : {
                                UserID : student.UserID,
                                Time: {
                                    //하루씩 검사
                                    [Op.lte] : today,
                                    [Op.gte] : yesterday
                                }
                            }
                        })
    
                        if(globalRouter.IsEmpty(attendance)){
                            continues = false;
                            break;
                        }
    
                        for(var j = 0 ; j < attendance.length ; ++j){
                            if(attendance[j].Type == 2 || attendance[j].Type == 3 || attendance[j].Type == 4 || attendance[j].Type == 7 || attendance[j].Type == 8 || attendance[j].Type == 9 || attendance[j].Type == 10 ){ //무단지각,사유지각,무단외출,무단조퇴,사유조퇴,무단결석,사유결석
                                continues = false;
                                break;
                            }
                        }
                    }
                }

                if(continues){
                    var data = JSON.stringify({
                        userID : student.UserID,
                        rewardTableID : 33 //일주일개근
                    });
    
                    errorCheck = await rewardFuncRouter.Insert(data);
                }
            }

            //한달 개근
            if(nowDate.getDate() == 1){
                var yesterday = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
                var continues = true;

                for(var i = 0 ; i < yesterday.getDate(); ++i){
                    var isHoliday = yesterday.getDay() == 7 ? true : false;

                    if(false == isHoliday){
                        var standardDay = moment().subtract(i,'day').toDate();
                        var standardYesterDay = moment().subtract(i+1, 'day').toDate();

                        isHoliday = globalRouter.IsHoliday(standardYesterDay);

                        if(false == isHoliday){
                            var attendance = await models.Attendance.findAll({
                                where : {
                                    UserID : student.UserID,
                                    Time: {
                                        //하루씩 검사
                                        [Op.lte] : standardDay,
                                        [Op.gte] : standardYesterDay
                                    }
                                }
                            })
        
                            if(globalRouter.IsEmpty(attendance)){
                                continues = false;
                                break;
                            }
        
                            for(var j = 0 ; j < attendance.length ; ++j){
                                if(attendance[j].Type == 2 || attendance[j].Type == 3 || attendance[j].Type == 4 || attendance[j].Type == 7 || attendance[j].Type == 8 || attendance[j].Type == 9 || attendance[j].Type == 10 ){ //무단지각,사유지각,무단외출,무단조퇴,사유조퇴,무단결석,사유결석
                                    continues = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                if(continues){
                    var data = JSON.stringify({
                        userID : student.UserID,
                        rewardTableID : 34 //한달개근
                    });
    
                    errorCheck = await rewardFuncRouter.Insert(data);
                }
            }
        }
    }).catch(err => {
        console.error(URL + '/Select/PublicSpaceUseList/By/UserID is error ' + err );
    });


	res.status(200).send(resData);
})
