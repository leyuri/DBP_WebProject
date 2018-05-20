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
  connection.query(' select * from employee, dept ,status where employee.emp_dep=dept.dept_id and employee.emp_status=status.st_id',
  function(err,employees){
    if(err) throw err;

    res.render('employee/index',{
      employees: employees
    });
  });
});


router.get('/new', isAuthenticated, function (req, res,next) {
 
  res.render('employee/new');

});

router.post('/new', isAuthenticated, (req,res, next) => {
  if(!req.body.id){
    req.flash('danger', '사번을 입력해주세요');
    res.redirect('/employee/new');
  }
  else if(!req.body.name){
    req.flash('danger', '사원 이름을 입력해주세요');
    res.redirect('/employee/new');
  }
  else if(!req.body.password){
    req.flash('danger', '비밀번호를 입력해주세요');
    res.redirect('/employee/new');
  }
  connection.query('select * from employee where emp_id=?',req.body.id, function(err, result){
    if (err) {
      return next(err);
    }
    console.log(result);
    if(!(result[0])){
    var workyear = (req.body.workyear)?req.body.workyear:null;
    var rnum = (req.body.rnum)?req.body.rnum:null;
    var edu = (req.body.edu)?req.body.edu:null;
    var status = (req.body.status)?req.body.status:null;
    var hiredate = (req.body.hiredate)?req.body.hiredate:null;
    connection.query('INSERT INTO employee(emp_id, emp_dep, emp_name, emp_rnum, emp_edu, emp_status, emp_pass, emp_hiredate, emp_workyear) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.body.id, req.body.dept, req.body.name, rnum, edu,status, req.body.password, hiredate, workyear], function(err, result){
      if (err) {
        return next(err);
      }
      req.flash('success', 'Inserted successfully.');
      res.redirect('/');
    });
    }
    else{
      req.flash('danger', '이미 존재하는 사원번호입니다.');
      res.redirect('/employee/new');
    }
  });
});


router.get('/:id', isAuthenticated, function (req, res,next) {
  connection.query('select * from employee, dept, status where employee.emp_dep=dept.dept_id and employee.emp_status=status.st_id and emp_id=?',req.params.id,
  function(err,employees){
    if(err) throw err;

      connection.query('select * from emp_proj , project, role_er where emp_proj.pro_id=project.pro_id and role_er.role_id =emp_proj.er_role and emp_id=?',req.params.id,
      function(err,emp_projs){
        if(err) throw err;
        

          connection.query('select * from skill where  emp_id=?',req.params.id,
          function(err,skills){
            if(err) throw err;
            
            connection.query('select * from career where  emp_id=?',req.params.id,
              function(err,careers){
                if(err) throw err;
    
                res.render('employee/show',{
                  careers:careers,
                  skills:skills,
                  employees: employees,
                  emp_projs: emp_projs
          
                });
              });
          });
   
    });
  });
});
router.get('/:id/delete', isAuthenticated, (req, res, next) => {
  connection.query('DELETE FROM employee WHERE emp_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/');
  });
});

module.exports = router;

  
  
