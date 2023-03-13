const fs = require('fs'),
moment = require('moment'),
Enum = require('enum'),
path = require('path');

require('dotenv').config()

const redis = require('redis');
const client = redis.createClient(6379, "127.0.0.1");
var SERVER_NAME = process.env.SERVER_NAME;
var notiEventEnum = new Enum({'REQUEST_ABSENCE' : 0, 'RESPONSE_ABSENCE' : 1, 'ADD_BOARD' : 2});

//0:등원,1:이른등원,2:무단지각,3:사유지각,4:재등원,5:무단외출,6:사유외출,7:외출복귀,8:무단조퇴,9:사유조퇴,10:무단결석,11:사유결석,12:하원 (알고리즘에 의해 변함)
//var attendanceEnum = new Enum({'ENTER' : 0, 'EARLY_ENTER' : 1, 'WITH_OUT_LATE' : 2, 'REASON_LATE' : 3 , 'WITH_OUT_GO_OUT': 4, 'REASON_GO_OUT' : 5, 'COMEBACK_GO_OUT' : 6, 'WITH_OUT_LEAVE' : 7, 'REASON_LEAVE' : 8, 'WITH_OUT_ABSENCE' : 9, 'REASON_ABSENCE' : 10, 'EXIT' : 11});
var attendanceEnum = new Enum({'ENTER' : 0, 'EARLY_ENTER' : 1, 'WITH_OUT_LATE' : 2, 'REASON_LATE' : 3 , 'RE_ENTER' : 4, 'WITH_OUT_GO_OUT': 5, 'REASON_GO_OUT' : 6, 'COMEBACK_GO_OUT' : 7, 'WITH_OUT_LEAVE' : 8, 'REASON_LEAVE' : 9, 'WITH_OUT_ABSENCE' : 10, 'REASON_ABSENCE' : 11, 'EXIT' : 12});
var holidayList;
var DateDiff = require('date-diff').default;

require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

function makeFolder(dir) { //폴더 만드는 로직
if (!fs.existsSync(dir)) { //만약 폴더 경로가 없다면
	fs.mkdirSync(dir); //폴더를 만들어주시오
} else {
	console.log('already folder exist!');
}
}

function print(txt) {
	console.log(txt);
}

function stringifyToJson(data) {
	return JSON.stringify(data);
}

async function CreateOrUpdate(model, where, newItem) {
	const foundItem = await model.findOne({ where });

	if (!foundItem) {
		const item = await model.create(newItem);
		return { item, created: true };
	}

	await model.update(newItem, { where });

	const item = foundItem;

	return { item, created: false };
}

async function CreateOrDestroy(model, where) {
	const foundItem = await model.findOne({ where });
	if (!foundItem) {
		const item = await model.create(where);
		return { item, created: true };
	}

	const item = await model.destroy({ where });
	return { item, created: false };
}

function getfilename(x) {
	var splitFileName = x.split(".");
	var name = splitFileName[0];
	return name;
}

function getImgMime(x) {
	var splitFileName = x.split(".");
	var mime = splitFileName[1];
	return mime;
}

//디렉토리랑 mime type 까지 싹다 인자로 받기

function removefiles(p) {
	try { // D
		const files = fs.readdirSync(p);  
		if (files.length) 
		  files.forEach(f => removePath(path.join(p, f), printResult)); 
	  } catch (err) {
		if (err) return console.log(err);
	  }	  
}

const removePath = (p, callback) => { // A 
	fs.stat(p, (err, stats) => { 
	  if (err) return callback(err);
  
	  if (!stats.isDirectory()) { // B 
		console.log('이 경로는 파일');
		return fs.unlink(p, err => err ? callback(err) : callback(null, p));
	  }
  
	  console.log('이 경로는 폴더');  // C 
	  fs.rmdir(p, (err) => {  
		if (err) return callback(err);
  
		return callback(null, p);
	  });
	});
  };

const printResult = (err, result) => {
	if (err) return console.log(err);

	console.log(`${result} 를 정상적으로 삭제했습니다`);
};

function IsEmpty(value) {
if (value == "" ||
	value == null ||
	value == undefined ||
	(Array.isArray(value) && value.length < 1) ||
	(value != null && typeof value == "object" && !Object.keys(value).length) ||
	(value != null && value == -100)
) {
	return true //비어있는 거임
}
else {
	return false
}
};

function getWordLen(x) { //검색 필터 단어 나누는 용
    var splitFileName = x.split("|");
    var len = splitFileName.length;
    return len;
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}   

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRedisKey(userID, isParent){
	return (isParent ? "P" : "S") + SERVER_NAME + String(userID);
}

function setHolidayList(list){
	holidayList = list;
}

function IsHoliday(date){
	var isHoliday = false;
	for(var i = 0 ; i < holidayList.length ; ++i){
		var diff = new DateDiff(date, holidayList[i].Time).days();
		
		if(Math.floor(diff) == 0){
			isHoliday = true;
			break;
		}
	}

	return isHoliday;
}

module.exports.client = client;
module.exports.notiEventEnum = notiEventEnum;
module.exports.attendanceEnum = attendanceEnum;
module.exports.serverName = SERVER_NAME;
//전역함수
module.exports.makeFolder = makeFolder;
module.exports.print = print;
module.exports.stringifyToJson = stringifyToJson;
module.exports.CreateOrUpdate = CreateOrUpdate;
module.exports.CreateOrDestroy = CreateOrDestroy;
module.exports.setHolidayList = setHolidayList;
module.exports.IsHoliday = IsHoliday;

module.exports.getfilename = getfilename;
module.exports.getImgMime = getImgMime;
module.exports.removefiles = removefiles;
module.exports.IsEmpty = IsEmpty;

module.exports.getWordLen = getWordLen;
module.exports.rand = rand;

module.exports.sleep = sleep;