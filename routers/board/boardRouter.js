const router = require('express').Router(),
    globalRouter = require('../global'),
    models = require('../../models'),
    formidable = require('formidable'),
    fs_extra = require('fs-extra'),
    moment = require('moment'),
    fs = require('fs');

const fcmFuncRouter = require('../fcm/fcmFuncRouter');
const boardFuncRouter = require('../board/boardFuncRouter');
const { Op } = require('sequelize');

let URL = '/Board';

//등록
//title:string,
//contents:string,
//datehead:string,
//type:integer - 0:직원,1:학생
//showDay:string
//isDirect:boolean - 0:예약,1:즉시
//filewidthlist:list<int>
//fileheightlist:list<int>
//filetypelist:list<boolean> - 0:파일,1:사진

router.post('/Register', async (req, res) => {
    console.log(URL + '/Insert flow start');

    var fields = new Map();

    var files = [];
    var file_widths = [];
    var file_heights = [];
    var file_types = [];

    var form = new formidable.IncomingForm();

    form.encoding = 'utf-8';
    form.uploadDir = './allphotos/temp';
    form.multiples = true;
    form.keepExtensions = true;

    form.on('field', function (field, value) { //값 하나당 한번씩 돌아가므로,
        console.log(field + ' ' + value);
        fields.set(field, value);
        if(field == 'filewidthlist') file_widths.push(value);
        else if(field == 'fileheightlist') file_heights.push(value);
        else if(field == 'filetypelist') file_types.push(value);
    });

    form.on('file', function (field, file) {
        files.push(file);
        console.log("what is file name in form.on file", file.name);
    }).on('end', async function() {
        await models.Notice.create({
            CenterID : fields.get('centerID'),
            TargetCenter : fields.get('targetCenter'),
            Title : fields.get('title'),
            Contents : fields.get('contents'),
            Type : fields.get('type'),
            ShowDay : new moment(fields.get('showDay')).toDate(),
            IsShow : fields.get('isShow')
        }).then(async result => {
            globalRouter.makeFolder('boardphotos/' + result.id); //생성된 공지사항 id 값으로 폴더 생성 //한번만 만들어짐 !
            for (var i = 0; i < files.length; ++i) {
                var folderName = 'boardphotos/' + result.id;
                //var fileName = Date.now() + '.' + files[i].name.split('.').pop();
                var resUrl = folderName + '/' + files[i].name;

                fs_extra.rename(files[i].path, resUrl); //파일 앞서 만든 폴더에 저장

                await models.NoticeFile.create({
                    NoticeID : result.id,
                    FileURL : resUrl,
                    Width : file_widths[i],
                    Height : file_heights[i],
                    IsPhoto : file_types[i]
                }).catch(err => {
                    console.error(URL + '/Modify NoticeFile create Failed ' + err);
                })

                //사용자들에게 새 글 작성 알림

            }

            var data = JSON.stringify({
                id : result.id
            });

            res.status(200).send(await boardFuncRouter.SelectOne(data));
        }).catch(err => {
            console.error(URL + '/Insert Notice create Failed ' + err);
            res.status(400).send(null);
        })
    }).on('error', function (err) {
        console.error('[error] error ' + err);
        globalRouter.removefiles('./allphotos/temp/');
        res.status(400).send(null);
    });

    form.parse(req, function (error, field, file) {
            console.log('[parse()] error : ' + error + ', field : ' + field + ', file : ' + file);
            console.log(URL + '/Insert success');
    });
});

//수정
//id:integer,
//title:string,
//contents:string,
//datehead:string,
//type:integer - 0:직원,1:학생
//showDay:string
//isDirect:boolean - 0:예약,1:즉시
//filewidthlist:list<int>
//fileheightlist:list<int>
//filetypelist:list<boolean> - 0:파일,1:사진
//removeidlist:list<list>

router.post('/Modify', async(req, res) => {
    console.log(URL + '/Modify flow start');

    var fields = new Map();

    var files = [];
    var file_widths = [];
    var file_heights = [];
    var file_types = [];
    var remove_id_values = [];

    var form = new formidable.IncomingForm();

    form.encoding = 'utf-8';
    form.uploadDir = './allphotos/temp';
    form.multiples = true;
    form.keepExtensions = true;

    form.on('field', function (field, value) { //값 하나당 한번씩 돌아가므로,
        console.log(field + ' ' + value);
        fields.set(field, value);
        if(field == 'filewidthlist') file_widths.push(value);
        else if(field == 'fileheightlist') file_heights.push(value);
        else if(field == 'filetypelist') file_types.push(value);
        else if(field == 'removeidlist') remove_id_values.push(value);
    });

    form.on('file', function (field, file) {
        files.push(file);
        console.log("what is file name in form.on file", file.name);
    }).on('end', async function() {

       await models.Notice.update(
            {
                CenterID : fields.get('centerID'),
                TargetCenter : fields.get('targetCenter'),
                Title : fields.get('title'),
                Contents : fields.get('contents'),
                Type : fields.get('type'),
                ShowDay : new moment(fields.get('showDay')).toDate(),
                IsShow : fields.get('IsShow')
            },
            {
                where : { id : fields.get('id')}
            }
       ).then(async result => {
            for(var i = 0 ; i < remove_id_values.length; ++i){
                var noticeFile = await models.NoticeFile.findOne({ where : {id : remove_id_values[i]}});

                fs.unlink(noticeFile.FileURL, function(err) {
                    noticeFile.destroy();

                    if(err){
                        console.error(URL + '/Modify error while delete NoticeFile ' + err);
                        res.status(400).send(null);
                        return;
                    }
                })
            }

            for (var i = 0; i < files.length; ++i) {
                var folderName = 'boardphotos/' + fields.get('id');
                //var fileName = Date.now() + '.' + files[i].name.split('.').pop();
                var resUrl = folderName + '/' + files[i].name;

                fs_extra.rename(files[i].path, resUrl); //파일 앞서 만든 폴더에 저장

                await models.NoticeFile.create({
                    NoticeID : fields.get('id'),
                    FileURL : resUrl,
                    Width : file_widths[i],
                    Height : file_heights[i],
                    IsPhoto : file_types[i]
                }).catch(err => {
                    console.error(URL + '/Modify NoticeFile create Failed ' + err);
                })
            }

            var data = JSON.stringify({
                id : fields.get('id')
            });

            res.status(200).send(await boardFuncRouter.SelectOne(data));
       }).catch(err => {
            console.error(URL + '/Modify Notice update Failed ' + err);
       });
    }).on('error', function (err) {
        console.error('[error] error ' + err);
        globalRouter.removefiles('./allphotos/temp/');
        res.status(400).send(null);
    });

    form.parse(req, function (error, field, file) {
            console.log('[parse()] error : ' + error + ', field : ' + field + ', file : ' + file);
            console.log(URL + '/Modify success');
    });
})

//삭제
//noticeID:integer
router.post('/Destroy', async(req, res) => {
    var noticeFiles = await models.NoticeFile.findAll({
        where : { NoticeID : req.body.noticeID }
    })

    for(var i = 0 ; i < noticeFiles.length ; ++i){
        fs.unlink(noticeFiles[i].FileURL, function(err) {
            noticeFiles[i].destroy();

            if(err){
                console.error(URL + '/Destroy error while delete NoticeFile ' + err);
                res.status(400).send(null);
                return;
            }
        })
    }

    await models.Notice.destroy({
        where : { id : req.body.noticeID }
    }).then(result => {
        res.status(200).send(true);
    }).catch(err => {
        console.error(URL + '/Insert Notice create Failed ' + err);
        res.status(400).send(null);
    })
});

//type:integer - 0:직원용,1:학생용
router.post('/Select/List', async(req,res) => {
    await models.Notice.findAll({
        where : {
            Type : req.body.type
        },
        include : [
            {
                model : models.NoticeFile
            }
        ],
        order : [
            ['id', 'DESC']
        ],
    }).then(result => {
        res.status(200).send(result);
    }).catch(err => {
        console.error(URL + '/Select/List findAll Failed ' + err);
        res.status(400).send(null);
    })
});

//센터전용 가져오기
router.post('/Select/List/By/CenterID', async(req,res) => {
    await models.Notice.findAll({
        where : {
            Type : req.body.type,
            IsShow : true,
            ShowDay : {
                //24시간 이내
                [Op.lte] : moment().toDate()
            }
        },
        include : [
            {
                model : models.NoticeFile
            }
        ],
        order : [
            ['id', 'DESC']
        ],
    }).then(result => {
        if(globalRouter.IsEmpty(result)){
            res.status(200).send(false);
        }else{
            var resData = [];

            for(var i = 0 ; i < result.length ; ++i){
                var notice = result[i];
                var targetCenterList = notice.TargetCenter.split('/');

                for(var j = 0 ; j < targetCenterList.length ; ++j){
                    if(req.body.centerID == (targetCenterList[j] * 1)){
                        resData.push(notice);
                        break;
                    }
                }
            }

            res.status(200).send(resData);
        }
    }).catch(err => {
        console.error(URL + '/Select/List findAll Failed ' + err);
        res.status(400).send(null);
    })
});

module.exports = router;