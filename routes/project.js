var express = require('express');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();

var moment = require('moment');


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
  connection.query(' select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;

    res.render('project/index',{
      projects: projects,
      moment:moment
    });
  });
});

router.get('/add_project', isAuthenticated, function (req, res,next) {
  connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;
      connection.query('select * from employee, dept where employee.emp_dep=dept.dept_id and dept.dept_id=5',
      function(err,employees){
        if(err) throw err;
        console.log(employees);
        connection.query('select * from role_er',
        function(err,role_ers){
          if(err) throw err;
          console.log(employees);
          res.render('project/add_project',{
            projects: projects,
            employees: employees,
            role_ers:role_ers
          });

        });
      });
  });
});


router.get('/:id', isAuthenticated, function (req, res,next) {
  connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id and project.pro_id=?',req.params.id,
  function(err,projects){
    if(err) throw err;

      connection.query('select * from emp_proj , employee,role_er where emp_proj.emp_id=employee.emp_id and role_er.role_id =emp_proj.er_role and pro_id=?',req.params.id,
      function(err,emp_projs){
        if(err) throw err;

        res.render('project/show',{
          projects: projects,
          emp_projs: emp_projs,
          moment:moment
        });
    
      });
  });
});


router.get('/:id/delete', isAuthenticated, (req, res, next) => {
  connection.query('DELETE FROM project WHERE pro_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/');
  });
});

router.post('/project/add_project', isAuthenticated, (req, res, next) => {
  console.log(req.body.pro_name);
  if(req.body.pro_name){
    connection.query('INSERT into project(pro_name, pro_start, pro_end) values(?,?,?)',
    [req.body.project_name,req.body.pro_start,req.body.pro_end] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 정보를 추가하였습니다.');
      return next();
    });
  }
  if(req.body.career_name){
    connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?) ',
    [req.body.pro_id, req.params.emp_id,req.body.er_role,body.pro_start,req.body.pro_end] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 정보를 추가하였습니다.');
      return next();
    });
  }
  res.redirect('/project');
  
});


module.exports = router;
