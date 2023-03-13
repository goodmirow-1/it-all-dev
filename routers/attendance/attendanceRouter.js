const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    moment = require('moment');

const fcmFuncRouter = require('../fcm/fcmFuncRouter');
const verify = require('../../controllers/parameterToken');
const limiter = require('../../config/limiter');
const client = globalRouter.client;

const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const { promisify } = require("util");
const getallAsync = promisify(client.get).bind(client);
const pureStudyFuncRouter = require('../purestudy/purestudyFuncRouter');

let URL = '/Attendance';

//리스트 가져오기
//index:integer
router.post('/Select/List', async(req, res) => {
    await models.Attendance.findAll({
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
})

//해당학생 출결가져오기
//userID:integer
router.post('/Select/By/UserID', async(req, res) => {
    const nowDate = moment().toDate();

    await models.Attendance.findAll({
        where : {
            [Op.and] : [
                Sequelize.where(Sequelize.fn('year', Sequelize.col("createdAt")), nowDate.getFullYear()),
                Sequelize.where(Sequelize.fn('month', Sequelize.col("createdAt")), nowDate.getMonth() + 1)
            ],
            UserID : req.body.userID
        }
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/By/UserID is error ' + err );
        res.status(404).send(null);
    });
});

//출결등록
//userID:integer
//centerID:integer,
//type:integer -  0:등원,1:이른등원,2:무단지각,3:사유지각,4:무단외출,5:사유외출,6:외출복귀,7:무단조퇴,8:사유조퇴,9:무단결석,10:사유결석,11:하원
//Description:string,
//time:string
router.post('/Register/By/UserID', async(req, res) => {
    await models.Attendance.create({
        UserID : req.body.userID,
        CenterID : req.body.centerID,
        Type : req.body.type,
        Description : req.body.description,
        Time : moment(req.body.time).subtract(9,'H').toDate()
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Register/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//수정
//id:integer
//userID:integer
//centerID:integer,
//type:integer -  0:등원,1:이른등원,2:무단지각,3:사유지각,4:무단외출,5:사유외출,6:외출복귀,7:무단조퇴,8:사유조퇴,9:무단결석,10:사유결석,11:하원
//Description:string,
//time:string,
router.post('/Modify/By/ID', async(req, res) => {
    await models.Attendance.update(
        {
            UserID : req.body.userID,
            CenterID : req.body.centerID,
            Type : req.body.type,
            Description : req.body.description,
            Time : moment(req.body.time).subtract(9,'H').toDate()
        },
        {
            where : { id : req.body.id }
        }
    ).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Modify/By/ID is error ' + err );
        res.status(404).send(null);
    });
})

//삭제
//id:integer
router.post('/Destroy/By/ID', async(req, res) => {
    await models.Attendance.destroy({
        where : {
            id : req.body.id
        }
    }).then(result => {
        res.status(200).send(true); 
    }).catch(err => {
        console.error(URL + '/Destory/By/ID is error ' + err );
        res.status(404).send(null);
    });
})

//담당 센터별 예외 신청 리스트
//centerList:List<int>
//isAll:boolean
router.post('/Select/List/WithCenter', async(req, res) => {
    
	var rule = {};

    if(req.body.isAll == 1){
        var errorCheck = false;
        var attendanceList = await models.Absence.findAll({
            
        }).catch(err => {
            console.error(URL + '/Select/List Center findAll is error ' + err );
            errorCheck = true;
        });
    
        var staffList = await models.AbsenceRegular.findAll({
            where : {
                Type : {
                    [Op.not] : 99
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
			[Op.not] : 99
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

///////////////////
//출결등록
//userID:integer,
//centerID:integer,
//classID:integer,
//type:integer - 1:등원,2:하원,3:외출,4:외출복귀,-> 0:등원,1:이른등원,2:무단지각,3:사유지각,4:무단외출,5:사유외출,6:외출복귀,7:무단조퇴,8:사유조퇴,9:무단결석,10:사유결석,11:하원 (알고리즘에 의해 변함)
//var attendanceEnum = new Enum({'ENTER' : 0, 'EARLY_ENTER' : 1, 'WITH_OUT_LATE' : 2, 'REASON_LATE' : 3 ,'WITH_OUT_GO_OUT': 4, 'REASON_GO_OUT' : 5, 'COMEBACK_GO_OUT' : 6, 'WITH_OUT_LEAVE' : 7, 'REASON_LEAVE' : 8, 'WITH_OUT_ABSENCE' : 9, 'REASON_ABSENCE' : 10, 'EXIT' : 11});

router.post('/Register', async(req, res) => {
    const nowDate = moment().toDate();
    const hours = nowDate.getHours()+ 9; //db에서 데이터를 가져올시 -9시간이 되어서 옴
	const minitues = nowDate.getMinutes();

    var AttendanceType = 0;
	var RewardTableID = 0;
    var state = req.body.type;
    var description = null;
    
    var userClass = await models.Class.findOne({where : {id: req.body.classID}});
    var timeSchedule = await models.TimeSchedule.findOne({where : {id : userClass.TimeScheduleID}});
    var isHoliday = nowDate.getDay() == 7 ? true : globalRouter.IsHoliday(nowDate);
    var place = userClass.Name;

    if(isHoliday){
        AttendanceType = globalRouter.attendanceEnum.ENTER.value;

        if(req.body.type == 1) {
            if(hours <= 7){
                AttendanceType = globalRouter.attendanceEnum.EARLY_ENTER.value;
                RewardTableID = 38;	//7시 이전에 등원
            }else{
                var reEnter = await models.Attendance.findOne({
                    where : {
                        UserID : req.body.userID,
                        Type : {
                            [Op.or] : [0,1,2,3]
                        },
                        [Op.and] : [
                            Sequelize.where(Sequelize.fn('year', Sequelize.col("Time")), nowDate.getFullYear()),
                            Sequelize.where(Sequelize.fn('month', Sequelize.col("Time")), nowDate.getMonth() + 1),
                            Sequelize.where(Sequelize.fn('day', Sequelize.col("Time")), nowDate.getDate()),
                        ],
                    }
                })

                if(!globalRouter.IsEmpty(reEnter)){ //재등원
                    AttendanceType = globalRouter.attendanceEnum.RE_ENTER.value;
                }
            }
        }else if(req.body.type == 2) {
            AttendanceType = globalRouter.attendanceEnum.EXIT.value; //하원
            place = '학원밖'
        }else if(req.body.type == 3) {
            AttendanceType = globalRouter.attendanceEnum.REASON_GO_OUT.value;
            description = "주말 외출";
            place = '외출중';
        }else if(req.body.type == 4) {
            AttendanceType = globalRouter.attendanceEnum.COMEBACK_GO_OUT.value;
            state = 1;
        }
    }else{
        //등원
        if(req.body.type == 1){
            AttendanceType = globalRouter.attendanceEnum.ENTER.value;

            var reEnter = await models.Attendance.findOne({
                where : {
                    UserID : req.body.userID,
                    Type : {
                        [Op.or] : [0,1,2,3]
                    },
                    [Op.and] : [
                        Sequelize.where(Sequelize.fn('year', Sequelize.col("Time")), nowDate.getFullYear()),
                        Sequelize.where(Sequelize.fn('month', Sequelize.col("Time")), nowDate.getMonth() + 1),
                        Sequelize.where(Sequelize.fn('day', Sequelize.col("Time")), nowDate.getDate()),
                    ],
                }
            })

            if(!globalRouter.IsEmpty(reEnter)){ //재등원
                AttendanceType = globalRouter.attendanceEnum.RE_ENTER.value;
            }else{
                //이른 등원
                if(hours <= 7){
                    AttendanceType = globalRouter.attendanceEnum.EARLY_ENTER.value;
                    RewardTableID = 38;	//7시 이전에 등원
                } else if(hours > timeSchedule.EnterTime.split(':')[0] || (hours == timeSchedule.EnterTime.split(':')[0] && minitues > timeSchedule.EnterTime.split(':')[1])){ //지각
                    AttendanceType = globalRouter.attendanceEnum.WITH_OUT_LATE.value; //무단 지각
                    //예외 검사
                    var Absence = await models.Absence.findOne({
                        where : { 
                            UserID : req.body.userID,
                            Type : 3,	//지각
                            Acception : true,
                            [Op.and] : [
                                Sequelize.where(Sequelize.fn('year', Sequelize.col("PeriodStart")), nowDate.getFullYear()),
                                Sequelize.where(Sequelize.fn('month', Sequelize.col("PeriodStart")), nowDate.getMonth() + 1),
                                Sequelize.where(Sequelize.fn('day', Sequelize.col("PeriodStart")), nowDate.getDate()),
                            ],
                        }
                    })

                    if(Absence){
                        if((Absence.PeriodEnd.getHours() + 9 )> hours || ((Absence.PeriodEnd.getHours() + 9 )== hours && Absence.PeriodEnd.getMinutes() >= minitues)){
                            AttendanceType = globalRouter.attendanceEnum.REASON_LATE.value; //사유 지각
                        }
                    }

                    //정기예외 검사
                    if(AttendanceType == 2){
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

                        rule.UserID = req.body.userID;
                        rule.Type = 0; //외출
                        rule.Acception = true;

                        var AbsenceRegulars = await models.AbsenceRegular.findAll({
                            where : rule
                        })

                        if(!globalRouter.IsEmpty(AbsenceRegulars)){
                            var index = 0;
                            if(AbsenceRegulars.length != 1){
                                var weight = ((hours - AbsenceRegulars[index].PeriodEnd.split(':')[0]) * 60) + (minitues - AbsenceRegulars[index].PeriodEnd.split(':')[1]);
                                for(var i = 1 ; i < AbsenceRegulars.length ; ++i){
                                    var tempweight =  ((hours - AbsenceRegulars[i].PeriodEnd.split(':')[0]) * 60)  + (minitues - AbsenceRegulars[i].PeriodEnd.split(':')[1]);

                                    if(weight > tempweight){
                                        index = i;
                                        weight = tempweight;
                                    }
                                }
                            }

                            if(AbsenceRegulars[index].PeriodEnd.split(':')[0] > hours || (AbsenceRegulars[index].PeriodEnd.split(':')[0] == hours && AbsenceRegulars[index].PeriodEnd.split(':')[1] >= minitues)){
                                AttendanceType = globalRouter.attendanceEnum.REASON_LATE.value; //사유 지각
                            }
                        }
                    }

                    if(AttendanceType == globalRouter.attendanceEnum.WITH_OUT_LATE.value){
                        RewardTableID = 6; //무단 지각
                    }else if(AttendanceType == globalRouter.attendanceEnum.REASON_LATE.value){
                        RewardTableID = 7; //사유 지각
                    }
                }
            }
        }else if(req.body.type == 2){ //하원
            AttendanceType = globalRouter.attendanceEnum.EXIT.value; //하원
            place = '학원밖';

            if(hours < timeSchedule.CloseTime.split(':')[0] || (hours == timeSchedule.CloseTime.split(':')[0] && minitues <= timeSchedule.CloseTime.split(':')[1])){ //무단 조퇴
                AttendanceType = globalRouter.attendanceEnum.WITH_OUT_LEAVE.value; //무단 조퇴

                //예외 검사
                var Absence = await models.Absence.findOne({
                    where : { 
                        UserID : req.body.userID,
                        Type : 1,	//지각
                        Acception : true,
                        [Op.and] : [
                            Sequelize.where(Sequelize.fn('year', Sequelize.col("PeriodStart")), nowDate.getFullYear()),
                            Sequelize.where(Sequelize.fn('month', Sequelize.col("PeriodStart")), nowDate.getMonth() + 1),
                            Sequelize.where(Sequelize.fn('day', Sequelize.col("PeriodStart")), nowDate.getDate()),
                        ],
                    }
                })

                if(Absence){
                    //문제 발생시 루엔이 대신 싸우기로함 2023.01.17(화) 14:39:01초
                    if((Absence.PeriodStart.getHours() + 9) < hours || ((Absence.PeriodStart.getHours()+9) == hours && Absence.PeriodStart.getMinutes() <= minitues)){
                        AttendanceType = globalRouter.attendanceEnum.REASON_LEAVE.value; //사유 조퇴
                    }
                }

                //정기예외 검사
                if(AttendanceType == 7){
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

                    rule.UserID = req.body.userID;
                    rule.Type = 0; //외출
                    rule.Acception = true;

                    var AbsenceRegulars = await models.AbsenceRegular.findAll({
                        where : rule
                    })

                    if(!globalRouter.IsEmpty(AbsenceRegulars)){
                        var index = 0;
                        if(AbsenceRegulars.length != 1){
                            var weight = ((hours - AbsenceRegulars[index].PeriodStart.split(':')[0]) * 60) + (minitues - AbsenceRegulars[index].PeriodStart.split(':')[1]);
                            for(var i = 1 ; i < AbsenceRegulars.length ; ++i){
                                var tempweight =  ((hours - AbsenceRegulars[i].PeriodStart.split(':')[0]) * 60)  + (minitues - AbsenceRegulars[i].PeriodStart.split(':')[1]);

                                if(weight > tempweight){
                                    index = i;
                                    weight = tempweight;
                                }
                            }
                        }

                        if(AbsenceRegulars[index].PeriodStart.split(':')[0] > hours || (AbsenceRegulars[index].PeriodStart.split(':')[0] == hours && AbsenceRegulars[index].PeriodStart.split(':')[1] <= minitues)){
                            AttendanceType = globalRouter.attendanceEnum.REASON_LEAVE.value; //사유 조퇴
                        }
                    }
                }

                if(AttendanceType == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value){
                    RewardTableID = 8; //무단 조퇴
                }else if(AttendanceType == globalRouter.attendanceEnum.REASON_LEAVE.value){
                    RewardTableID = 9; //사유 조퇴
                }
            }

            
        }else if(req.body.type == 3){ //외출
            AttendanceType = globalRouter.attendanceEnum.WITH_OUT_GO_OUT.value;
            place = '외출중';

            //예외 검사
            var Absences = await models.Absence.findAll({
                where : { 
                    UserID : req.body.userID,
                    Type : 0,	//외출
                    Acception : true,
                    [Op.and] : [
                        Sequelize.where(Sequelize.fn('year', Sequelize.col("PeriodStart")), nowDate.getFullYear()),
                        Sequelize.where(Sequelize.fn('month', Sequelize.col("PeriodStart")), nowDate.getMonth() + 1),
                        Sequelize.where(Sequelize.fn('day', Sequelize.col("PeriodStart")), nowDate.getDate()),
                    ],
                }
            })

            if(!globalRouter.IsEmpty(Absences)){
                var index = 0;
                if(Absences.length != 1){
                    var weight = ((hours - (Absences[index].PeriodStart.getHours() + 9)) * 60) + (minitues - Absences[index].PeriodStart.getMinutes());
                    for(var i = 1 ; i < Absences.length ; ++i){
                        var tempweight =  ((hours - (Absences[i].PeriodStart.getHours() + 9)) * 60) + (minitues - Absences[i].PeriodStart.getMinutes());
                        if(weight > tempweight){
                            index = i;
                            weight = tempweight;
                        }
                    }
                }

                if((Absences[index].PeriodStart.getHours() + 9) < hours || ((Absences[index].PeriodStart.getHours() + 9) == hours && Absences[index].PeriodStart.getMinutes() <= minitues)){
                    AttendanceType = globalRouter.attendanceEnum.REASON_GO_OUT.value; //사유 외출
                }
            }

            //정기예외 검사
            if(AttendanceType == 4){
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
                rule.UserID = req.body.userID;
                rule.Type = 0; //외출
                rule.Acception = true;

                var AbsenceRegulars = await models.AbsenceRegular.findAll({
                    where : rule
                })

                if(!globalRouter.IsEmpty(AbsenceRegulars)){
                    var index = 0;
                    if(AbsenceRegulars.length != 1){
                        var weight = ((hours - AbsenceRegulars[index].PeriodStart.split(':')[0]) * 60) + (minitues - AbsenceRegulars[index].PeriodStart.split(':')[1]);
                        for(var i = 1 ; i < AbsenceRegulars.length ; ++i){
                            var tempweight =  ((hours - AbsenceRegulars[i].PeriodStart.split(':')[0]) * 60)  + (minitues - AbsenceRegulars[i].PeriodStart.split(':')[1]);

                            if(weight > tempweight){
                                index = i;
                                weight = tempweight;
                            }
                        }
                    }

                    if(AbsenceRegulars[index].PeriodStart.split(':')[0] > hours || (AbsenceRegulars[index].PeriodStart.split(':')[0] == hours && AbsenceRegulars[index].PeriodStart.split(':')[1] >= minitues)){
                        AttendanceType = globalRouter.attendanceEnum.REASON_GO_OUT.value; //사유 외출
                    }
                }
            }

            if(AttendanceType == globalRouter.attendanceEnum.WITH_OUT_GO_OUT.value){
                RewardTableID = 10; //무단 외출
            }else if(AttendanceType == globalRouter.attendanceEnum.REASON_GO_OUT.value){
                RewardTableID = 11; //사유 외출
            }
        }else if(req.body.type == 4){ //외출 복귀
            AttendanceType = globalRouter.attendanceEnum.COMEBACK_GO_OUT.value; //외출 복귀(등원)
            state = 1;
            place = userClass.Name;

            //예외 검사
            var Absences = await models.Absence.findAll({
                where : { 
                    UserID : req.body.userID,
                    Type : 0,	//외출
                    Acception : true,
                    [Op.and] : [
                        Sequelize.where(Sequelize.fn('year', Sequelize.col("PeriodStart")), nowDate.getFullYear()),
                        Sequelize.where(Sequelize.fn('month', Sequelize.col("PeriodStart")), nowDate.getMonth() + 1),
                        Sequelize.where(Sequelize.fn('day', Sequelize.col("PeriodStart")), nowDate.getDate()),
                    ],
                }
            })

            if(!globalRouter.IsEmpty(Absences)){
                var index = 0;
                if(Absences.length != 1){
                    var weight = Math.abs(hours - (Absences[index].PeriodStart.getHours() + 9)) * 60 + Math.abs(minitues - Absences[index].PeriodEnd.getMinutes());
                    for(var i = 1 ; i < Absences.length ; ++i){
                        var tempweight = Math.abs(hours - (Absences[i].PeriodStart.getHours() + 9)) * 60 + Math.abs(minitues - Absences[i].PeriodEnd.getMinutes());

                        if(weight > tempweight){
                            index = i;
                            weight = tempweight;
                        }
                    }
                }

                if((Absences[index].PeriodStart.getHours() + 9) < hours || ((Absences[index].PeriodStart.getHours() + 9) == hours && Absences[index].PeriodEnd.getMinutes() <= minitues)){
                    AttendanceType = globalRouter.attendanceEnum.WITH_OUT_LATE.value; //무단 지각
                }
            }

            //정기예외 검사
            if(AttendanceType == globalRouter.attendanceEnum.WITH_OUT_LATE.value){
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

                rule.UserID = req.body.userID;
                rule.Type = 0; //외출
                rule.Acception = true;

                var AbsenceRegulars = await models.AbsenceRegular.findAll({
                    where : rule
                })

                if(!globalRouter.IsEmpty(AbsenceRegulars)){
                    var index = 0;
                    if(AbsenceRegulars.length != 1){
                        var weight = ((hours - AbsenceRegulars[index].PeriodEnd.split(':')[0]) * 60) + (minitues - AbsenceRegulars[index].PeriodEnd.split(':')[1]);
                        for(var i = 1 ; i < AbsenceRegulars.length ; ++i){
                            var tempweight =  ((hours - AbsenceRegulars[i].PeriodEnd.split(':')[0]) * 60)  + (minitues - AbsenceRegulars[i].PeriodEnd.split(':')[1]);

                            if(weight > tempweight){
                                index = i;
                                weight = tempweight;
                            }
                        }
                    }

                    if(AbsenceRegulars[index].PeriodEnd.split(':')[0] > hours || (AbsenceRegulars[index].PeriodEnd.split(':')[0] == hours && AbsenceRegulars[index].PeriodEnd.split(':')[1] >= minitues)){
                        AttendanceType = globalRouter.attendanceEnum.REASON_GO_OUT.value; //사유 외출
                    }
                }
            }

            if(AttendanceType == globalRouter.attendanceEnum.WITH_OUT_LATE.value){
                RewardTableID = 6; //무단지각
            }
        }
    }

	var errorCheck = false;

	await models.Attendance.create({
		UserID : req.body.userID,
		CenterID : req.body.centerID,
		Type : AttendanceType,
		Time : nowDate,
        Description : description
	}).catch(err => {
		console.error(URL + '/Register is error ' + err );
		errorCheck = true;
	})

	if(RewardTableID != 0){
		var reward = await models.RewardTable.findOne({where : {id : RewardTableID}});

        //벌점부여
		await models.RewardPoint.create({
			UserID : 0, //시스템에 의해
			TargetID : req.body.userID, 
			Reason : reward.Reason,
			Value : reward.Value
		}).catch(err => {
			console.error(URL + '/Register is error ' + err );
			errorCheck = true;
		})
        
        if(false == errorCheck){
            //하원, 무단조퇴, 사유조퇴 일 경우 순공시간 계산
            if(AttendanceType == globalRouter.attendanceEnum.EXIT.value || AttendanceType == globalRouter.attendanceEnum.WITH_OUT_LEAVE.value || AttendanceType == globalRouter.attendanceEnum.REASON_LEAVE){
                var data = JSON.stringify({
                    userID : req.body.userID * 1,
                    timeschedule : timeSchedule,
                    date : nowDate
                });

                var calcuateRes = await pureStudyFuncRouter.Calculate(data);

                if(globalRouter.IsEmpty(calcuateRes)){
                    errorCheck = true;
                }

                if(false == errorCheck){
                    var holyRewardTableID = 0;
                    var holyReward;
                    //주말동안 순공시간 비교로 상점
                    if(isHoliday){
                        if(calcuateRes.Time >= 180 && calcuateRes.Time < 360) { //3시간
                            holyRewardTableID = 35;
                        }else if (calcuateRes.Time >= 360 && calcuateRes.Time < 600){ //6시간
                            holyRewardTableID = 36;
                        }else if ( calcuateRes.Time >= 600){ //6시간 이상
                            holyRewardTableID = 37;
                        }

                        holyReward = await models.RewardTable.findOne({where : {id : holyRewardTableID}});

                        //벌점부여
                        await models.RewardPoint.create({
                            UserID : 0, //시스템에 의해
                            TargetID : req.body.userID, 
                            Reason : holyReward.Reason,
                            Value : holyReward.Value
                        }).catch(err => {
                            console.error(URL + '/Register RewardPoint create is error ' + err );
                            errorCheck = true;
                        })
                    }

                    //벌점갱신
                    await models.Student.findOne({
                        where : {UserID : req.body.userID}
                    }).then(result => {
                        if(!globalRouter.IsEmpty(result)){
                            result.update({
                                TotalRewardPoint : result.TotalRewardPoint + reward.Value + (holyRewardTableID != 0 ? holyReward.Value : 0),
                                MonthPureStudyTime : result.MonthPureStudyTime + calcuateRes.Time,
                                State : state,
                                NowPlace : place
                            })
                        }
                    }).catch(err => {
                        console.error(URL + '/Register is error ' + err );
                        errorCheck = true;
                    })
                }
            }else{
                //벌점갱신
                await models.Student.findOne({
                    where : {UserID : req.body.userID}
                }).then(result => {
                    if(!globalRouter.IsEmpty(result)){
                        result.update({
                            TotalRewardPoint : result.TotalRewardPoint + reward.Value,
                            State : state,
                            NowPlace : place
                        })
                    }
                }).catch(err => {
                    console.error(URL + '/Register is error ' + err );
                    errorCheck = true;
                })
            }
        }
	}else{
        await models.Student.update(
            {
                State : state,
                NowPlace : place
            },
            {
                where : {UserID : req.body.userID}
            }
        ).catch(err => {
            console.error(URL + '/Register Student update is error ' + err );
            errorCheck = true;
        })
    }

	if(errorCheck){
		res.status(404).send(null);
	}else{
		var resData = {
			res : AttendanceType
		}

		res.status(200).send(resData);
	}
});

//이번달 공용공간갯수 가져오기
//userID:integer
router.post('/Select/PublicSpaceUse/Count', async(req, res) => {

    const nowDate = moment().toDate();

    await models.PublicSpaceUse.findAll({
        where : {
            UserID : req.body.userID,
            [Op.and] : [
                Sequelize.where(Sequelize.fn('year', Sequelize.col("createdAt")), nowDate.getFullYear()),
                Sequelize.where(Sequelize.fn('month', Sequelize.col("createdAt")), nowDate.getMonth() + 1)
            ],
        },
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/PublicSpaceUseList/Count is error ' + err );
        res.status(404).send(null);
    });
})

//공용공간 사용 이력 가져오기
//userID:integer
router.post('/Select/PublicSpaceUseList/By/UserID', async(req, res) => {
    await models.PublicSpaceUse.findAll({
        where : {
            UserID : req.body.userID
        },
        order : [
            ['id', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result); 
    }).catch(err => {
        console.error(URL + '/Select/PublicSpaceUseList/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//예외신청
//userID:integer,
//withVacation:integer - 0이면 안씀, 1:외출권, 2:반휴권, 3:휴가권
//centerName:string,
//seatNumber:integer,
//type:integer, - 0:외출,1:조퇴,2:결석,3:지각
//periodStart:string
//periodEnd:string,
//reason:string
router.post('/Register/Absence', async(req, res) => {
    var student;
    var rewardTable;
    var vacation = false;
    var havePoint = true;

    if(req.body.withVacation){
        student = await models.Student.findOne({
            attributes : [
                "TotalRewardPoint"
            ],
            where : {
                UserID : req.body.userID,
            }
        });

        //외출권
        rewardTable = await models.RewardTable.findOne({where : {id : req.body.withVacation}});
        if(student.TotalRewardPoint < Math.abs(rewardTable.Value)){
            havePoint = false;
        }
        vacation = true;
    }

    if(havePoint){
        await models.Absence.create({
            UserID : req.body.userID,
            Type : req.body.type,
            PeriodStart : new Date(req.body.periodStart),
            PeriodEnd : new Date(req.body.periodEnd),
            Reason : req.body.reason,
            WithVacation: vacation,
        }).then(async result => {

            var data = JSON.stringify({
                targetID : req.body.userID,
                toParent : true,
                notiTitle : "예외 신청",
                type : globalRouter.notiEventEnum.REQUEST_ABSENCE.value,
                subData : String(result.id),
                body : "학생이 예외를 신청했습니다.",
                isSend : 0
            })  

            fcmFuncRouter.SendFcmEvent( data );

            if(req.body.withVacation){  //상점사용
                await models.Student.update(
                    {
                        TotalRewardPoint : student.TotalRewardPoint + rewardTable.Value
                    },
                    {
                        where : { UserID : req.body.userID }
                    }
                )
    
                await models.RewardPoint.create({
                    UserID : req.body.userID,
                    TargetID : req.body.userID,
                    Reason : rewardTable.Reason,
                    Description : req.body.reason,
                    Value : rewardTable.Value
                }).catch(err => {
                    console.error(URL + '/Register/Absence RewardPoint create is error ' + err );
                    res.status(404).send(null);
                    return;
                });
            }
    
            res.status(200).send(result); 
        }).catch(err => {
            console.error(URL + '/Register/Absence is error ' + err );
            res.status(404).send(null);
        });
    }else{
        res.status(200).send(false);
    }
})

//정기 예외 등록하기
//userID:integer,
//type:integer,
//periodStart:string -- ex)09:00
//periodEnd:string,
//reason:string,
//monday:boolean,
//tuseday:boolean,
//wednesday:boolean,
//thursday:boolean,
//friday:boolean,
//saturday:boolean,
//sunday:boolean
router.post('/Register/Regular/Absence', async(req, res) => {
    await models.AbsenceRegular.create({
        UserID : req.body.userID,
        Type : req.body.type,
        PeriodStart : req.body.periodStart,
        PeriodEnd : req.body.periodEnd,
        Reason : req.body.reason,
        Monday : req.body.monday,
        Tuseday : req.body.tuseday,
        Wednesday : req.body.wednesday,
        Thursday : req.body.thursday,
        Friday : req.body.friday,
        Saturday : req.body.saturday,
        Sunday : req.body.sunday
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Register/Regular/Absence is error ' + err );
        res.status(404).send(null);
    });
});

//예외 가져오기
//userID:integer
router.post('/Select/Absence/By/UserID', async(req, res) => {
    await models.Absence.findAll({
        where : {
            UserID : req.body.userID
        }
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/Absence/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//정기예외 가져오기
//userID:integer
router.post('/Select/Regular/Absence/By/UserID', async(req, res) => {
    await models.AbsenceRegular.findAll({
        where : {
            UserID : req.body.userID
        }
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/Absence/By/UserID is error ' + err );
        res.status(404).send(null);
    });
})

//예외 처리
//id:integer,
//userID:integer
//isRegular:boolean - 0:일반,1:정기
//acception:boolean,
router.post('/Modify/Acception', async(req, res) => {
    if(req.body.isRegular){
        await models.AbsenceRegular.update(
            {
                Acception : req.body.acception
            },
            {
                where : {id : req.body.id }
            }
        ).then(result => {

            var data = JSON.stringify({
                targetID : req.body.userID,
                toParent : false,
                notiTitle : "예외 처리",
                type : globalRouter.notiEventEnum.RESPONSE_ABSENCE.value,
                subData : String(req.body.id),
                body : "부모가 신청한 예외를 처리하였습니다.",
                isSend : 0
            })  


            fcmFuncRouter.SendFcmEvent( data );

            res.status(200).send(result);
        }).catch(err => {
            console.error(URL + '/Modify/Acception AbsenceRegular update is error ' + err );
            res.status(404).send(null);
        });
    }else{
        await models.Absence.update(
            {
                Acception : req.body.acception
            },
            {
                where : {id : req.body.id }
            }
        ).then(result => {
            
            var data = JSON.stringify({
                targetID : req.body.userID,
                toParent : false,
                notiTitle : "예외 처리",
                type : globalRouter.notiEventEnum.RESPONSE_ABSENCE.value,
                subData : String(req.body.id),
                body : "부모가 신청한 예외를 처리하였습니다.",
                isSend : 0
            })

            fcmFuncRouter.SendFcmEvent( data );

            res.status(200).send(result);
        }).catch(err => {
            console.error(URL + '/Modify/Acception Absence update is error ' + err );
            res.status(404).send(null);
        });
    }
})

module.exports = router;