'use strict';
var views = require('co-views');
var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/plantLib');
var dbPlants = wrap(db.get('plants'));

var render = views(__dirname + '/../views', {
  map: { html: 'swig' }
});

/**
 * 数据库记录信息
 * @type {Object}
 */
var record = {
  sum: 0, //数据库记录总数
  current: 0 //当前第 current 条记录
};

/**
 * 主页
 * 返回第一个植物的信息
 * @yield {[type]} [description]
 */
module.exports.home = function *home() {
  record.sum = yield dbPlants.count({})
  this.body = yield render('index.jade', {});
};

/**
 * 获得植物信息
 * 不带参数，返回第一个植物
 * 参数：
 * prePlant===true，上一个植物
 * nextPlant===true，下一个植物
 * @yield {[type]} [description]
 */
module.exports.getPlant = function *getPlant() {
  var param = yield parse(this),
      plantInfo = null,
      file="";

  // 请求上一个植物
  if(param.prePlant===true){
    record.current === 1 ? record.current = record.sum : --record.current;
    plantInfo = yield dbPlants.findOne({no:record.current});
  }
  // 请求下一个植物
  else if(param.nextPlant===true){
    record.current === record.sum ? record.current = 1 : ++record.current;
    plantInfo = yield dbPlants.findOne({no:record.current});
  }
  // 选择某种植物 file
  else if(param.file){
    plantInfo = yield dbPlants.findOne({file:param.file});
    record.current = plantInfo.no;
  }
  // 默认请求第一个植物
  else{
    plantInfo = yield dbPlants.findOne({});
    record.current = 1;
  }

  this.body = plantInfo;
};
