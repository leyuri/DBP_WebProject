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
  connection.query(' select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;

    res.render('project/index',{
      projects: projects
    });
  });
});

module.exports = router;
