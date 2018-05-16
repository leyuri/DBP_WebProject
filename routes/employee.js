var express = require('express');
// var mysql = require('mysql');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');


var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();

/*로그인 유저 판단 로직*/
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/signin');
};



router.get('/', isAuthenticated, function (req, res,next) {
  connection.query(' select * from employee, dept where employee.emp_dep=dept.dept_id',
  function(err,employees){
    if(err) throw err;

    res.render('employee/index',{
      employees: employees
    });
  });
});

router.get('/:id', isAuthenticated, function (req, res,next) {
  connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id and project.pro_id=?',req.params.id,
  function(err,projects){
    if(err) throw err;

      connection.query('select * from emp_proj , employee where emp_proj.emp_id=employee.emp_id and pro_id=?',req.params.id,
      function(err,emp_projs){
        if(err) throw err;

        res.render('project/show',{
          projects: projects,
          emp_projs: emp_projs
        });
    
    });
  });
});


module.exports = router;

  
  
