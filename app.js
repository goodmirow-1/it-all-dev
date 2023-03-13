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

app.set('port', process.argv[2] || process.env.PORT || 20000); 
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

app.post('/OnResume', async(req, res) => {
	let body = {
		"isOnline" : 1,
		'count': 0,
		'startTime': moment().unix(),
		'banTime': 0,
	}

	globalRouter.client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(body));

	await models.FcmTokenList.update(
		{
			BadgeCount : 0
		},
		{
			where : {UserID : req.body.userID}
		}
	).catch(err => {
		console.log('/OnResume fcmtokenlist badgecount update is failed ' + err);
	})

	res.status(200).send(await NotificationFuncRouter.UnSendSelect(req.body.userID, req.body.isParent));
})

app.post('/OnPause', async(req, res) => {
	let body = {
		"isOnline" : 0,
		'count': 0,
		'startTime': moment().unix(),
		'banTime': 0,
	}

	globalRouter.client.set(globalRouter.getRedisKey(req.body.userID, req.body.isParent),JSON.stringify(body));

	res.status(200).send(true);
})

//1.결석체크 #
//2.외출시미복귀체크 #
//3.일주일개근체크 #
//4.한달개근체크 #
//6.휴일체크
//7.순공랭킹(달마다), 월순공시간top10 #
//8.매년 1일 올해 공휴일 받아옴 #
const Sequelize = require('sequelize');
app.get('/Test', async(req,res) => {
	
	var resData;

    const rule = new schedule.RecurrenceRule();
	rule.hour = 10;
    rule.minute = 33;
    rule.tz = 'Asia/Seoul';

    var job2 = schedule.scheduleJob(rule,async function() {
        const nowDate = moment().toDate();
        console.log(nowDate);

        await models.Attendance.create({
            UserID : 1,
            CenterID : 1,
            Type : 7, //무단 조퇴
            Time : moment().subtract(7, 'H').toDate() //전일자 11시 이후로 저장됨.
        }).catch(err => {
            console.error(URL + '/Register is error ' + err );
            errorCheck = true;
        });
    })


	res.status(200).send(resData);
})

let request = require('request');
app.post('/Test2', async(req, res) => {
	var resData;

    var data = JSON.stringify({
        userID : 1,
        rewardTableID : 4, //사유 결석, 무단 결석
        state : 2
    });

    errorCheck = await rewardFuncRouter.Insert(data);

	res.status(200).send(true);
})


app.post('/Generate/MonthPureStudyRank', async(req,res) => {
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
                Time : result[i].MonthPureStudyTime,
				createdAt : createDate
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
                    rewardTableID : 40 //센터 월 순공 시간 TOP 10
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

    res.status(200).send(true);
})

