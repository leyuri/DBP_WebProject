var express = require('express');
// var mysql = require('mysql');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');


var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();


var isAuthenticated = function (req, res, next) {
  
  if (req.isAuthenticated()){
    if(req.user.dept !=3 ){
      //경영진만 열람가능(일단은)
      req.flash('danger','접근 권한이 없습니다.');
      res.redirect('/');
    }
    return next();
  }
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
  connection.query('select * from employee, dept where employee.emp_dep=dept.dept_id  and emp_id=?',req.params.id,
  function(err,employees){
    if(err) throw err;

      connection.query('select * from emp_proj , project, role_er where emp_proj.pro_id=project.pro_id and role_er.role_id =emp_proj.er_role and emp_id=?',req.params.id,
      function(err,emp_projs){
        if(err) throw err;

          connection.query('select * from skill , career where skill.emp_id=career.emp_id and skill.emp_id=?',req.params.id,
          function(err,skills){
            if(err) throw err;
    
              res.render('employee/show',{
                skills:skills,
                employees: employees,
                emp_projs: emp_projs
        
              });
          });
   
    });
  });
});


module.exports = router;

  
  
