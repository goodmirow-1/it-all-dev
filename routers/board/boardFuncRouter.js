const router = require('express').Router(),
        models = require('../../models'),
        globalRouter = require('../global');

const { result } = require('lodash');
const { Op } = require('sequelize');


module.exports = {
    SelectOne : async function SelectOne( body ) {
        return new Promise(async (resolv, reject) => {
            var data = JSON.parse(body);

            await models.Notice.findOne({
                where : {id : data.id},
                include : [
                    {
                        model : models.NoticeFile
                    }
                ]
            }).then(result => {
                resolv(result);
            }).catch(err => {
                console.log('boardfuncrouter selectone is error ' + err);
                resolv(err);
            })
        })
    }
};