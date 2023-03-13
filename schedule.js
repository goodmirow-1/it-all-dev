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

app.set('port', process.argv[2] || 20001); 
const server = app.listen(app.get('port'), () => {
	console.log('Express it-all '  + globalRouter.serverName + ' server listening on port ' + app.get('port'));
});

const { Op } = require('sequelize');
// sequelize 연동
models.sequelize.sync().then( async () => {
    console.log("DB Connect Success");

	globalRouter.setHolidayList(await models.Holiday.findAll({}));

    console.log("Play Scheduler");

    const rule1 = new schedule.RecurrenceRule();
	rule1.hour = 11;
    rule1.minute = 0;
    rule1.tz = 'Asia/Seoul';

    //사진 임시파일 삭제
	var job1 = schedule.scheduleJob(rule1, function() {
		//Temp에 등록된 데이터 삭제
		let mNow = new Date();
		console.log('remove temp folder call');
		console.log(mNow);
		globalRouter.removefiles('./allphotos/temp/');
	});

    const rule2 = new schedule.RecurrenceRule();
	rule2.hour = 6;
    rule2.minute = 50;
    rule2.tz = 'Asia/Seoul';

    //결석체크
    //외출시미복귀체크
    //일주일개근체크
    //한달개근체크
	var job2 = schedule.scheduleJob(rule2, async function() {
        const nowDate = moment().toDate();
        const day = nowDate.getDay();
        const yesterCheckDay = moment().subtract(7, 'H').toDate();
        const yesterHoliday = globalRouter.IsHoliday(yesterCheckDay);

        console.log('daily attendance check flow call');
        console.log(nowDate);

        await models.Student.findAll({
            where : {
                Type : 2    //정회원
            }
        }).then(async result => {
            for(var i = 0 ; i < result.length ; ++i){
                var student = result[i];
                var haveReason = true;
    
                //일요일 아닐때만 검사 (월요일에 전일 검사)
                if(day != 1 && false == yesterHoliday){
                    var attendance = await models.Attendance.findOne({
                        where : {
                            UserID : result[i].UserID,
                            Type : {
                                [Op.or] : [0,1,2,3] //등원,이른등원,무단지각,사유지각
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
        
                        if(globalRouter.IsEmpty(absence)){
                            var rule = {};
        
                            switch(nowDate.getDay()){
                                case 0 : {rule = {Sunday : true}} break;
                                case 1 : {rule = {Monday : true}} break;
                                case 2 : {rule = {Tuseday : true}} break;
                                case 3 : {rule = {Wednesday : true}} break;
                                case 4 : {rule = {Thursday : true}} break;
                                case 5 : {rule = {Friday : true}} break;
                                case 6 : {rule = {Saturday : true}} break;
                            }
        
                            rule.UserID = student.UserID;
                            rule.Type = 1; //결석
                            rule.Acception = true;
        
                            var AbsenceRegulars = await models.AbsenceRegular.findAll({
                                where : rule
                            })
        
                            if(globalRouter.IsEmpty(AbsenceRegulars)){
                                haveReason = false;
                            }
                        }
    
                        await models.Attendance.create({
                            UserID : student.UserID,
                            CenterID : student.CenterID,
                            Type : haveReason ? globalRouter.attendanceEnum.REASON_ABSENCE.value : globalRouter.attendanceEnum.WITH_OUT_ABSENCE.value, //사유 결석, 무단 결석
                            Time : moment().subtract(7, 'H').toDate() //전일자 11시 이후로 저장됨. //전일자 11시 이후로 저장됨.
                        }).catch(err => {
                            console.error(URL + '/Register is error ' + err );
                            errorCheck = true;
                        })
        
                        var data = JSON.stringify({
                            userID : student.UserID,
                            rewardTableID : haveReason ? 5 : 4, //사유 결석, 무단 결석
                            state : 2,
                            nowPlace: "학원밖"
                        });
        
                        errorCheck = await rewardFuncRouter.Insert(data);
                    }else{
                        var attendance = await models.Attendance.findOne({
                            where : {
                                UserID : student.UserID,
                                Type : globalRouter.attendanceEnum.EXIT.value, //하원
                                Time: {
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
                                Type : globalRouter.attendanceEnum.WITH_OUT_LEAVE.value, //무단 조퇴
                                Time : moment().subtract(7, 'H').toDate() //전일자 11시 이후로 저장됨. //전일자 11시 이후로 저장됨.
                            }).catch(err => {
                                console.error(URL + '/Register is error ' + err );
                                errorCheck = true;
                            })
        
                            var data = JSON.stringify({
                                userID : student.UserID,
                                rewardTableID : 8, //무단조퇴
                                state : 2,
                                nowPlace : "학원밖"
                            });
            
                            errorCheck = await rewardFuncRouter.Insert(data);
                        }
                    }
                }
    
                //일주일 개근
                if(day == 0){ //일요일
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
                                if(attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LATE || attendance[j].Type == globalRouter.attendanceEnum.REASON_LATE.value || 
                                    attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_GO_OUT.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                    attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                    attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value ){ //무단지각,사유지각,무단외출,무단조퇴,사유조퇴,무단결석,사유결석
                                    continues = false;
                                    break;
                                }
                            }
                        }
                    }
    
                    if(continues){
                        var data = JSON.stringify({
                            userID : student.UserID,
                            rewardTableID : 33, //일주일개근,
                            state : 0,
                            nowPlace : ""
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
                                    if(attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LATE || attendance[j].Type == globalRouter.attendanceEnum.REASON_LATE.value || 
                                        attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_GO_OUT.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                        attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                        attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value ){ //무단지각,사유지각,무단외출,무단조퇴,사유조퇴,무단결석,사유결석
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
                            rewardTableID : 34, //한달개근
                            state : 0,
                            nowPlace : ""
                        });
        
                        errorCheck = await rewardFuncRouter.Insert(data);
                    }
                }
            }
        }).catch(err => {
            console.error(URL + '/Select/PublicSpaceUseList/By/UserID is error ' + err );
        });
    });

    const rule3 = new schedule.RecurrenceRule();
    rule3.month = 1;
    rule3.date = 1;
    rule3.hour = 6;
    rule3.tz = 'Asia/Seoul';

    //매월 순공 랭킹
    var job3 = schedule.scheduleJob(rule3, async function() {
        var pureStudyList;
        await models.Center.findAll({

        }).then(result => {
            pureStudyList = Array(result.length).fill(null).map(() => Array());
        })
    
        await models.Student.findAll({
            attributes : [
                'UserID' , 'CenterID', 'MonthPureStudyTime'
            ],
            where : {Type : 2},
            order : [
                ['MonthPureStudyTime', 'DESC']
            ],
            limit : 50000
        }).then(async result => {
            const nowDate = moment().toDate();
            var yesterday = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
            var year = nowDate.getFullYear();
            var month = nowDate.getMonth();

            if(month == 0){
                year -= 1;
                month = 12;
            }

            var createDate = year + '-' + month + '-' + yesterday.getDate() +' 14:59:59'; 
            
            for(var i = 0 ; i < result.length ; ++i){
                //월간 순공 랭킹 저장하기
                await models.PureRank.create({
                    UserID : result[i].UserID,
                    CenterID : result[i].CenterID,
                    Rank : i+1,
                    Time : result[i].MonthPureStudyTime
                }).catch(err => {
                    console.error('MonthPureStudyTime PureRank create is error ' + i + '_' + err );
                })
    
                //월간 순공 랭킹 상점부여
                if(pureStudyList[result[i].CenterID-1].length < 10){
                    var data = {
                        userID : result[i].UserID,
                        time : result[i].MonthPureStudyTime
                    };
    
                    pureStudyList[result[i].CenterID-1].push(data);
    
                    var rewardData = JSON.stringify({
                        userID : result[i].UserID,
                        rewardTableID : 40, //센터 월 순공 시간 TOP 10
                        state : 0,
                        nowPlace : ""
                    });
    
                    errorCheck = await rewardFuncRouter.Insert(rewardData);
                    await models.Student.update(
                        {
                            MonthPureStudyTime : 0
                        },
                        {
                            where : {UserID : result[i].UserID}
                        }
                    )
                }
            }
        }).catch(err => {
            console.error('MonthPureStudyTime Calculate is error ' + err );
        });
    });

    const rule4 = new schedule.RecurrenceRule();
    rule4.month = 12;
    rule4.date = 31;
    rule4.hour = 23;
    rule4.tz = 'Asia/Seoul';

    //매년 12월 31일 23시에 다음해 공휴일 받아옴 #
    var job4 = schedule.scheduleJob(rule4,async function() {
        await models.Holiday.destroy({ truncate : true, cascade: false}); //기존 휴일데이터 날림

        const nowDate = moment().toDate();

        var year = nowDate.getFullYear() + 1;
    
        for(var i = 0 ; i < 12 ; ++i){
            var month = i + 1;
    
            if(month < 10){
                month = '0' + month;
            }
        
            var options = {
                'method' : 'GET',
                'url' : 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=' + year.toString() + '&solMonth=' + month.toString() + '&_type=json&ServiceKey=' + process.env.HOLIDAY_KEY,
                'headers':{}
            }
            
            request(options, async function (error, response, body) {
                if (error) {
                    throw new Error(error);
                }
                let info = JSON.parse(body);
    
                let holidayList = [];
        
                if(info['response']['body']['totalCount'] == 0){
    
                }else if(info['response']['body']['totalCount'] == 1){
                    let holidayName = info['response']['body']['items']['item']['dateName'];
                    let holidayDate = info['response']['body']['items']['item']['locdate'];
                    holidayList.push([holidayName, holidayDate])
                }else{
                    for (i in info['response']['body']['items']['item']) {
                        let holidayName = info['response']['body']['items']['item'][i]['dateName'];
                        let holidayDate = info['response']['body']['items']['item'][i]['locdate'];
                        holidayList.push([holidayName, holidayDate])
                    }
                }
        
                if(!globalRouter.IsEmpty(holidayList)){
                    for(var i = 0 ; i < holidayList.length; ++i){
                        var holiday = holidayList[i];
                        var date = holiday[1].toString();
    
                        await models.Holiday.create({
                            Name : holiday[0],
                            Time : new Date(date[0]+date[1]+date[2]+date[3]+'-'+date[4]+date[5]+'-'+date[6]+date[7])
                        }).catch(err => {
                            console.log(err);
                        })
                    }
                }
            });
        }
    });
}).catch( err => {
    console.error("DB Connect Faield");
    console.error(err);
})

app.get('/Test', async(req,res) => {
	
	var resData;

	res.status(200).send(resData);
})

let request = require('request');
app.post('/Test2', async(req, res) => {
	var resData;


	res.status(200).send(true);
})


app.post('/Play/Scheduler', async(req, res) => {
    console.log("Play Scheduler");

    const rule1 = new schedule.RecurrenceRule();
	rule1.hour = 11;
    rule1.tz = 'Asia/Seoul';

    //사진 임시파일 삭제
	var job1 = schedule.scheduleJob(rule1, function() {
		//Temp에 등록된 데이터 삭제
		let mNow = new Date();
		console.log('remove temp folder call');
		console.log(mNow);
		globalRouter.removefiles('./allphotos/temp/');
	});

    const rule2 = new schedule.RecurrenceRule();
	rule2.hour = 6;
    rule2.tz = 'Asia/Seoul';

    //결석체크
    //외출시미복귀체크
    //일주일개근체크
    //한달개근체크
	var job2 = schedule.scheduleJob(rule2, async function() {
        const nowDate = moment().toDate();
        console.log('daily attendance check flow call');
        console.log(nowDate);

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
                            [Op.or] : [0,1,2,3] //등원,이른등원,무단지각,사유지각
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
    
                        if(globalRouter.IsEmpty(AbsenceRegulars)){
                            haveReason = false;
                        }
                    }

                    await models.Attendance.create({
                        UserID : student.UserID,
                        CenterID : student.CenterID,
                        Type : haveReason ? globalRouter.attendanceEnum.REASON_ABSENCE.value : globalRouter.attendanceEnum.WITH_OUT_ABSENCE.value, //사유 결석, 무단 결석
                        Time : moment().subtract(7, 'H').toDate() //전일자 11시 이후로 저장됨. //전일자 11시 이후로 저장됨.
                    }).catch(err => {
                        console.error(URL + '/Register is error ' + err );
                        errorCheck = true;
                    })
    
                    var data = JSON.stringify({
                        userID : student.UserID,
                        rewardTableID : haveReason ? 5 : 4, //사유 결석, 무단 결석
                        state : 2,
                        nowPlace : ""
                    });
    
                    errorCheck = await rewardFuncRouter.Insert(data);
                }else{
                    var attendance = await models.Attendance.findOne({
                        where : {
                            UserID : student.UserID,
                            Type : globalRouter.attendanceEnum.EXIT.value, //하원
                            Time: {
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
                            Type : globalRouter.attendanceEnum.WITH_OUT_LEAVE.value, //무단 조퇴
                            Time : moment().subtract(7, 'H').toDate() //전일자 11시 이후로 저장됨. //전일자 11시 이후로 저장됨.
                        }).catch(err => {
                            console.error(URL + '/Register is error ' + err );
                            errorCheck = true;
                        })
    
                        var data = JSON.stringify({
                            userID : student.UserID,
                            rewardTableID : 8, //무단조퇴
                            state : 2,
                            nowPlace : "학원밖"
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
                                if(attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LATE || attendance[j].Type == globalRouter.attendanceEnum.REASON_LATE.value || 
                                    attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_GO_OUT.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                    attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                    attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value ){ //무단지각,사유지각,무단외출,무단조퇴,사유조퇴,무단결석,사유결석
                                    continues = false;
                                    break;
                                }
                            }
                        }
                    }
    
                    if(continues){
                        var data = JSON.stringify({
                            userID : student.UserID,
                            rewardTableID : 33, //일주일개근,
                            state : 0,
                            nowPlace : ""
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
                                    if(attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LATE || attendance[j].Type == globalRouter.attendanceEnum.REASON_LATE.value || 
                                        attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_GO_OUT.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                        attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value || attendance[j].Type == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || 
                                        attendance[j].Type == globalRouter.attendanceEnum.REASON_LEAVE.value ){ //무단지각,사유지각,무단외출,무단조퇴,사유조퇴,무단결석,사유결석
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
                            rewardTableID : 34, //한달개근
                            state : 0,
                            nowPlace : ""
                        });
        
                        errorCheck = await rewardFuncRouter.Insert(data);
                    }
                }
            }
        }).catch(err => {
            console.error(URL + '/Select/PublicSpaceUseList/By/UserID is error ' + err );
        });
    });

    const rule3 = new schedule.RecurrenceRule();
    rule3.month = 1;
    rule3.date = 1;
    rule3.hour = 6;
    rule3.tz = 'Asia/Seoul';

    //매월 순공 랭킹
    var job3 = schedule.scheduleJob(rule3, async function() {
        var pureStudyList;
        await models.Center.findAll({

        }).then(result => {
            pureStudyList = Array(result.length).fill(null).map(() => Array());
        })
    
        await models.Student.findAll({
            attributes : [
                'UserID' , 'CenterID', 'MonthPureStudyTime'
            ],
            where : {Type : 2},
            order : [
                ['MonthPureStudyTime', 'DESC']
            ],
            limit : 50000
        }).then(async result => {
            const nowDate = moment().toDate();
            var yesterday = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
            var year = nowDate.getFullYear();
            var month = nowDate.getMonth();

            if(month == 0){
                year -= 1;
                month = 12;
            }

            var createDate = year + '-' + month + '-' + yesterday.getDate() +' 14:59:59'; 
            
            for(var i = 0 ; i < result.length ; ++i){
                //월간 순공 랭킹 저장하기
                await models.PureRank.create({
                    UserID : result[i].UserID,
                    CenterID : result[i].CenterID,
                    Rank : i+1,
                    Time : result[i].MonthPureStudyTime
                }).catch(err => {
                    console.error('MonthPureStudyTime PureRank create is error ' + i + '_' + err );
                })
    
                //월간 순공 랭킹 상점부여
                if(pureStudyList[result[i].CenterID-1].length < 10){
                    var data = {
                        userID : result[i].UserID,
                        time : result[i].MonthPureStudyTime
                    };
    
                    pureStudyList[result[i].CenterID-1].push(data);
    
                    var rewardData = JSON.stringify({
                        userID : result[i].UserID,
                        rewardTableID : 40, //센터 월 순공 시간 TOP 10
                        state : 0,
                        nowPlace : ""
                    });
    
                    errorCheck = await rewardFuncRouter.Insert(rewardData);
                    await models.Student.update(
                        {
                            MonthPureStudyTime : 0
                        },
                        {
                            where : {UserID : result[i].UserID}
                        }
                    )
                }
            }
        }).catch(err => {
            console.error('MonthPureStudyTime Calculate is error ' + err );
        });
    });

    const rule4 = new schedule.RecurrenceRule();
    rule4.month = 12;
    rule4.date = 31;
    rule4.hour = 23;
    rule4.tz = 'Asia/Seoul';

    //매년 12월 31일 23시에 다음해 공휴일 받아옴 #
    var job4 = schedule.scheduleJob(rule4,async function() {
        await models.Holiday.destroy({ truncate : true, cascade: false}); //기존 휴일데이터 날림

        const nowDate = moment().toDate();

        var year = nowDate.getFullYear() + 1;
    
        for(var i = 0 ; i < 12 ; ++i){
            var month = i + 1;
    
            if(month < 10){
                month = '0' + month;
            }
        
            var options = {
                'method' : 'GET',
                'url' : 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=' + year.toString() + '&solMonth=' + month.toString() + '&_type=json&ServiceKey=' + process.env.HOLIDAY_KEY,
                'headers':{}
            }
            
            request(options, async function (error, response, body) {
                if (error) {
                    throw new Error(error);
                }
                let info = JSON.parse(body);
    
                let holidayList = [];
        
                if(info['response']['body']['totalCount'] == 0){
    
                }else if(info['response']['body']['totalCount'] == 1){
                    let holidayName = info['response']['body']['items']['item']['dateName'];
                    let holidayDate = info['response']['body']['items']['item']['locdate'];
                    holidayList.push([holidayName, holidayDate])
                }else{
                    for (i in info['response']['body']['items']['item']) {
                        let holidayName = info['response']['body']['items']['item'][i]['dateName'];
                        let holidayDate = info['response']['body']['items']['item'][i]['locdate'];
                        holidayList.push([holidayName, holidayDate])
                    }
                }
        
                if(!globalRouter.IsEmpty(holidayList)){
                    for(var i = 0 ; i < holidayList.length; ++i){
                        var holiday = holidayList[i];
                        var date = holiday[1].toString();
    
                        await models.Holiday.create({
                            Name : holiday[0],
                            Time : new Date(date[0]+date[1]+date[2]+date[3]+'-'+date[4]+date[5]+'-'+date[6]+date[7])
                        }).catch(err => {
                            console.log(err);
                        })
                    }
                }
            });
        }
    });

    res.status(200).send(true);
})
