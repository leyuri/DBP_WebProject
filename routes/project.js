var express = require('express');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();

/*로그인 유저 판단 로직*/
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/signin');
};


router.get('/', isAuthenticated, function (req, res,next) {
  connection.query('SELECT * FROM PROJECT',
  function(err,result){
    console.log(result);
    if (err) {
      return next(err);
    }
    res.render('project/index', {
  
      title: 'Project List',
      project_list: result,

    });

  });
});