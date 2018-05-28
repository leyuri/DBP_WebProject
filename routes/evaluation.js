var express = require('express');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();
var moment = require('moment');


var isAuthenticated1 = function (req, res, next) {    
  if (req.isAuthenticated()){
    if(req.user.dept ==3 ||req.user.dept ==2){
      //경영진/인사과만 열람가능
      return next();
    }
    req.flash('danger','접근 권한이 없습니다.');
    res.redirect('/employee');
    
  }
  res.redirect('/signin');
 
};


router.get('/', isAuthenticated1, function (req, res,next) {
  connection.query('select ev_id, pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment , emp_name from employee,project, role_er, emp_proj, evaluate where employee.emp_id=emp_proj.emp_id and project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_type="PM"',
  function(err,pms){
    if(err) throw err;
    connection.query('select ev_id, pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment , emp_name from employee,project, role_er, emp_proj, evaluate where employee.emp_id=emp_proj.emp_id and project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_type="고객"',
    function(err,clients){
      if(err) throw err;
      connection.query('select ev_id, pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment , emp_name from employee,project, role_er, emp_proj, evaluate where employee.emp_id=emp_proj.emp_id and project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_type="동료"',
      function(err,peers){
        if(err) throw err;
        res.render('evaluation/index',{
          pms: pms,
          peers:peers,
          clients:clients,
          moment:moment
        });
      });
    });  
  });
});


module.exports = router;

  
