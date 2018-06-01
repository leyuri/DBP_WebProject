var express = require('express');
// var mysql = require('mysql');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');


var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();

var moment = require('moment');

  var isAuthenticated = function (req, res, next) {  
    if (req.isAuthenticated()){ 
      return next();    
    }
    res.redirect('/signin'); 
  };
  
  
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
  


router.get('/', isAuthenticated, function (req, res,next) {
  connection.query(' select * from  employee ,  dept ,status where employee.emp_dep=dept.dept_id and employee.emp_status=status.st_id',
  function(err,employees){
    if(err) throw err;

    res.render('employee/index',{
      employees: employees,
      moment:moment
    });
  });
});


router.get('/new', isAuthenticated1, function (req, res,next) {
 
  res.render('employee/new');

});

router.post('/new', isAuthenticated1, (req,res, next) => {
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
      res.redirect('/employee');
    });
    }
    else{
      req.flash('danger', '이미 존재하는 사원번호입니다.');
      res.redirect('/employee/new');
    }
  });
});


router.get('/:id', isAuthenticated1, function (req, res,next) {
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

                connection.query('select ev_id,ev_contype,pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment from project, role_er, emp_proj, evaluate where project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_rated =?',req.params.id,
                function(err,evaluations){
                  if(err) throw err; 
    
                res.render('employee/show',{
                  careers:careers,
                  skills:skills,
                  employees: employees,
                  emp_projs: emp_projs,
                  moment:moment,
                  evaluations:evaluations
          
                });
              });
          });
        });
    });
  });
});

router.get('/:id/add_skill', isAuthenticated, function (req, res) {
  connection.query('SELECT * FROM employee  WHERE  emp_id = ?',req.params.id,

  function(err,result){
    console.log(result[0]);
    if (err) {
      return next(err);
    }
    res.render('employee/add_skill', {
  

      user_info: result[0],

    });

  });
});


router.post('/:id/add_skill', isAuthenticated, (req, res, next) => {
  console.log(req.body.skill_level);
  if(req.body.skill_name){
    connection.query('INSERT into skill(emp_id,skill_name,skill_grade) values(?,?,?) ',
    [req.params.id, req.body.skill_name, req.body.skill_level] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 정보를 추가하였습니다.');
      
 
    });
  }
  if(req.body.career_name){
    connection.query('INSERT into career(emp_id,career_name,career_period ) values(?,?,?) ',
    [req.params.id, req.body.career_name, req.body.career_period] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 정보를 추가하였습니다.');
      return next();
    });
  }
    res.redirect(`/employee/${req.params.id}`);
  
});


router.get('/:id/edit', isAuthenticated1, function (req, res) {
  connection.query('SELECT * FROM employee,dept  WHERE employee.emp_dep=dept.dept_id and  emp_id = ?',req.params.id,

  function(err,result){
    console.log(result[0]);
    if (err) {
      return next(err);
    }
    res.render('employee/edit', {
  
      title: 'Employee Info',
      emp_info: result[0],
      moment,moment
    });

  });
});

router.post('/:id/edit', isAuthenticated1, (req, res, next) => {


  connection.query('UPDATE employee SET  emp_dep=? ,emp_name = ? , emp_Rnum =? , emp_edu=?,  emp_status=?, emp_pass=?, emp_workyear=? ,emp_retiredate=? WHERE emp_id=? ',
  [req.body.dept, req.body.name, req.body.rnum, req.body.edu,  req.body.status, req.body.password, req.body.workyear,req.body.retiredate, req.params.id] ,
  function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Updated successfully.');
    res.redirect(`/employee/${req.params.id}`);
  
  });
});

router.get('/:id/delete', isAuthenticated1, (req, res, next) => {
  connection.query('DELETE FROM employee WHERE emp_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/employee');
  });
});

module.exports = router;

  
  
