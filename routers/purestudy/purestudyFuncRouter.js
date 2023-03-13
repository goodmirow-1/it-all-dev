const router = require('express').Router(),
        models = require('../../models'),
        moment = require('moment'),
        
        globalRouter = require('../global');

const { rest } = require('lodash');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
var DateDiff = require('date-diff').default;


module.exports = {
    Calculate : async function Calculate( body ) {
        return new Promise(async (resolv, reject) => {
            var data = JSON.parse(body);

            const nowDate = moment().toDate();     
            const hours = nowDate.getHours() + 9; //db에서 데이터를 가져올시 -9시간이 되어서 옴
            const minitues = nowDate.getMinutes();
    
            var attendances = await models.Attendance.findAll({
                where : {
                    UserID : data.userID,
                    [Op.and] : [
                        Sequelize.where(Sequelize.fn('year', Sequelize.col("Time")), nowDate.getFullYear()),
                        Sequelize.where(Sequelize.fn('month', Sequelize.col("Time")), nowDate.getMonth() + 1),
                        Sequelize.where(Sequelize.fn('day', Sequelize.col("Time")), nowDate.getDate()),
                    ],
                }
            })
    
            //등원시간 인덱스
            var attendanceTableIndex = 0;
            var attendanceHours = 0;
            var attendanceMinutes = 0;
            for(var i = attendances.length - 1 ; i >= 0 ; --i){
                if( (attendances[i].Type == 4 || attendances[i].Type == 0 || attendances[i].Type == 1 || attendances[i].Type == 2 || attendances[i].Type == 3)){ //재처음 등원 찾음 재등원, 등원, 이른등원, 무단지각,사유지각
                    attendanceTableIndex = i;
                    attendanceHours = attendances[attendanceTableIndex].Time.getHours() + 9;
                    attendanceMinutes = attendances[attendanceTableIndex].Time.getMinutes();
                    break;
                }
            }
    
            var puretimes = new DateDiff(nowDate, attendances[attendanceTableIndex].Time).minutes();
            puretimes = Math.floor(puretimes);
    
            //교실 시간표에서 계산 휴식시간 제외
            var scheduleList = [];
            scheduleList.push(data.timeschedule.ClassOne);
            scheduleList.push(data.timeschedule.ClassTwo);
            scheduleList.push(data.timeschedule.ClassThree);
            scheduleList.push(data.timeschedule.ClassFour);
            scheduleList.push(data.timeschedule.ClassFive);
            scheduleList.push(data.timeschedule.ClassSix);
            scheduleList.push(data.timeschedule.ClassSeven);
            scheduleList.push(data.timeschedule.ClassEight);
            scheduleList.push(data.timeschedule.ClassNine);
            scheduleList.push(data.timeschedule.ClassTen);
    
            var attendanceIndex = 0;
            var weight = Math.abs(((attendanceHours - scheduleList[attendanceIndex].split('~')[0].split(':')[0]) * 60) + (attendanceMinutes - scheduleList[attendanceIndex].split('~')[0].split(':')[1]));
    
            for(var i = 1 ; i < scheduleList.length ; ++i){
                var tempWeight = Math.abs(((attendanceHours - scheduleList[i].split('~')[0].split(':')[0]) * 60) + (attendanceMinutes - scheduleList[i].split('~')[0].split(':')[1]));
    
                if(weight > tempWeight){
                    attendanceIndex = i;
                    weight = tempWeight;
                }
            }
    
            var index = 0;
            weight = Math.abs(((hours - scheduleList[index].split('~')[0].split(':')[0]) * 60) + (minitues - scheduleList[index].split('~')[0].split(':')[1]));
    
            for(var i = 1 ; i < scheduleList.length ; ++i){
                var tempWeight =  Math.abs(((hours - scheduleList[i].split('~')[0].split(':')[0]) * 60) + (minitues - scheduleList[i].split('~')[0].split(':')[1]));
    
                if(weight > tempWeight){
                    index = i;
                    weight = tempWeight;
                }
            }
    
            //휴식시간
            var restTime = 0;
            var restTimeList = [];
            if(attendanceIndex != index){
                var i = attendanceIndex;
                var count = 0;
                while(count < (index - attendanceIndex)){
                    var timeone = scheduleList[i].split('~')[1];
                    var timetwo = scheduleList[i+1].split('~')[0];
        
                    restTimeList.push(timeone+'~'+timetwo);
    
                    var already = false;
                    //휴식시간에 포함되면
                    if( attendanceHours > timeone.split(':')[0] || ( attendanceHours == timeone.split(':')[0] && attendanceMinutes >= timeone.split(':')[1] ) ){
                        if(attendanceHours < timetwo.split(':')[0] || (attendanceHours == timetwo.split(':')[0] && attendanceMinutes <= timeone.split(':')[1])){
                            restTime += ((timetwo.split(':')[0] - attendanceHours) * 60)+ (attendanceMinutes - timeone.split(':')[1]);
                            already = true;
                        }
                    }
    
                    if(!already){
                        restTime += ((timetwo.split(':')[0] - timeone.split(':')[0]) * 60)+ (timetwo.split(':')[1] - timeone.split(':')[1]);
                    }
    
                    count++;
                    i++;
                }
            }
    
    
            //외출시간
            var goOutTime = 0;
            //겹치는시간
            var coverTime = 0;
            for(var i = 0 ; i < attendances.length ; ++i){
                if(attendances[i].Type == 4 || attendances[i].Type == 5){ //무단외출, 사유외출
                    var starthours = attendances[i].Time.getHours() + 9;
                    var startminutes = attendances[i].Time.getMinutes();
    
                    for(var j = i ; j < attendances.length ; ++j){
                        if(attendances[j].Type == 6){ //외출복귀
                            var endHours = attendances[j].Time.getHours() + 9;
                            var endMinutes = attendances[j].Time.getMinutes();
    
                            goOutTime += new DateDiff(attendances[j].Time,attendances[i].Time).minutes();
                            goOutTime = Math.floor(goOutTime);
    
                            for(var k = 0 ; k < restTimeList.length ; ++k){
                                var restStart = restTimeList[k].split('~')[0];
                                var restEnd = restTimeList[k].split('~')[1];
    
                                var already = false;
                                //휴식시간이 포함되면
                                //휴식시간에 나가는거랑 들어오는거 따로 구분해서..
                                if(restStart.split(':')[0] > starthours || (restStart.split(':')[0] == starthours && restStart.split(':')[1] >= startminutes)){
                                    //휴식시간내에 왔으면
                                    if(endHours <= restEnd.split(':')[0] || (endHours == restEnd.split(':')[0] && restEnd.split(':')[1] <= endMinutes)){
                                        coverTime += ((endHours - restStart.split(':')[0]) * 60)+ (endMinutes - restStart.split(':')[1]);
                                        already = true;
                                    }
                                }
                                
                                if(!already){
                                    coverTime += ((restStart.split(':')[0] - restEnd.split(':')[0]) * 60)+ (restStart.split(':')[1] - restEnd.split(':')[1]);
                                }
                            }
                        }
                    }
                }
            }
    
            console.log(puretimes);
            console.log(restTime);
            console.log(goOutTime);
            console.log(coverTime);
    
            //순공시간 계산
            puretimes -= restTime;
            puretimes -= goOutTime;
            puretimes += coverTime;
    
            await models.PureStudyTime.create({
                UserID : data.userID,
                Time : puretimes,
                State : 1
            }).then(async result => {
    
                // await models.Attendance.update(
                //     {
                //         IsCheck : true
                //     },
                //     {
                //         where : { id : attendances[attendanceTableIndex].id }
                //     }
                // ).catch(err => {
                //     console.error('PureStudyTime Attendance update failed ' + err);
                // });
    
                resolv(result);
            }).catch(err => {
                console.error('PureStudyTime Calculate create failed ' + err);
                result(null);
            });
        });
    }
}