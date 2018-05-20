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
  connection.query('SELECT * FROM employee, dept WHERE dept.dept_id = employee.emp_dep and emp_id = ?',req.user.id,

  function(err,result){

    if (err) {
      return next(err);
    }
    connection.query('select * from skill  where emp_id=?',req.user.id,

    function(err,result1){

      if (err) {
        return next(err);
      }
      connection.query('select * from career  where emp_id=?',req.user.id,

      function(err,result2){
  
        if (err) {
          return next(err);
        }
        res.render('myinfo/index', {
      
          title: 'My Info',
          user_info: result[0],
          skills:result1,
          careers:result2
      });
      });
    });

  });
});

router.get('/:id/add_skill', isAuthenticated, function (req, res) {
  connection.query('SELECT * FROM employee  WHERE  emp_id = ?',req.user.id,

  function(err,result){
    console.log(result[0]);
    if (err) {
      return next(err);
    }
    res.render('myinfo/add_skill', {
  
      title: 'My Info',
      user_info: result[0],
      myinfo:req.user

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
  res.redirect('/myinfo');
  
});


router.get('/:id/edit', isAuthenticated, function (req, res) {
  connection.query('SELECT * FROM employee  WHERE  emp_id = ?',req.user.id,

  function(err,result){
    console.log(result[0]);
    if (err) {
      return next(err);
    }
    res.render('myinfo/edit', {
  
      title: 'My Info',
      user_info: result[0],
      myinfo:req.user

    });

  });
});
router.post('/:id/edit', isAuthenticated, (req, res, next) => {


  if (req.body.password !== req.body.current_password) {
    req.flash('danger', 'Password is not same');
    return res.redirect('back');
  }
  if(!req.body.password){
    connection.query('UPDATE employee SET emp_NAME = ? , EMP_RNUM =? , EMP_EDU=? WHERE EMP_ID=? ',
    [req.body.name, req.body.rnum, req.body.edu, req.params.id] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', 'Updated successfully.');
      res.redirect('/myinfo');
    });
  }
  else{
    connection.query('UPDATE employee SET emp_NAME = ? , EMP_RNUM =? , EMP_EDU=? , EMP_PASS=? WHERE EMP_ID=? ',
    [req.body.name, req.body.rnum, req.body.edu, req.body.password,req.params.id] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', 'Updated successfully.');
      res.redirect('/myinfo');
    
    });
  }
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