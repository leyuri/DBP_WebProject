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
    res.redirect('/');
    
  }
  res.redirect('/');
 
};


router.get('/', isAuthenticated1, function (req, res,next) {
  connection.query('select ev_id, ev_contype,pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment , emp_name from employee,project, role_er, emp_proj, evaluate where employee.emp_id=emp_proj.emp_id and project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_type="PM"',
  function(err,pms){
    if(err) throw err;
    connection.query('select ev_id,ev_contype, pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment , emp_name from employee,project, role_er, emp_proj, evaluate where employee.emp_id=emp_proj.emp_id and project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_type="고객"',
    function(err,clients){
      if(err) throw err;
      connection.query('select ev_id,ev_contype, pro_name, project.pro_id,role_name,er_start,er_end,ev_rate,ev_rated,ev_type,score,comment , emp_name from employee,project, role_er, emp_proj, evaluate where employee.emp_id=emp_proj.emp_id and project.pro_id = emp_proj.pro_id and emp_proj.pro_id=evaluate.pro_id and emp_proj.er_role =role_er.role_id and emp_proj.emp_id = evaluate.ev_rated and evaluate.ev_type="동료"',
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

router.get('/add', isAuthenticated1, function (req, res,next) {
  connection.query('select * from project',
  function(err,emp_projs){
    if(err) throw err;
    connection.query('select * from emp_proj,employee where emp_proj.emp_id=employee.emp_id',
      function(err,employees){
        if(err) throw err;
        connection.query('select distinct(ev_type) from evaluate',
        function(err,evaluates){
          if(err) throw err;
      
          res.render('evaluation/add_eval',{
            emp_projs: emp_projs,
            evaluates:evaluates,
            employees:employees
          });
        });
      });    
  });
});


router.post('/add', isAuthenticated1, function (req, res,next) {
  connection.query('insert into evaluate(pro_id,ev_rate,ev_rated,ev_type,score,comment,ev_contype) values(?,?,?,?,?,?,?)',[req.body.project,req.user.id,req.body.ev_rated,req.body.ev_type,req.body.score,req.body.evaluate,"업무능력"],
  function(err,emp_projs){
    if(err) throw err;
    connection.query('insert into evaluate(pro_id,ev_rate,ev_rated,ev_type,score,comment,ev_contype) values(?,?,?,?,?,?,?)',[req.body.project,req.user.id,req.body.ev_rated,req.body.ev_type,req.body.score1,req.body.evaluate1,"커뮤니케이션"],
    function(err,emp_projs){
      if(err) throw err;
      req.flash('success', '성공적으로 평가를 등록했습니다.');
      res.redirect('/evaluation');
  
    });
  });
});
router.get('/:id/edit', isAuthenticated1, function (req, res,next) {
  connection.query('select * from evaluate',
  function(err,evaluates){
    if(err) throw err;

      res.render('evaluation/add_eval',{
        evaluates: evaluates,
      });
  });
});


router.get('/:id/delete_eval', isAuthenticated1, (req, res, next) => {
  connection.query('DELETE FROM evaluate WHERE ev_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/evaluation');
  });
});



module.exports = router;

  
