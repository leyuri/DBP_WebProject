var express = require('express');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

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
    res.redirect('/project');
    
  }
  res.redirect('/signin');
 
};

var isAuthenticated2 = function (req, res, next) {
  
  if (req.isAuthenticated()){
    if(req.user.dept ==3||req.user.dept ==5){
      //경영진, 개발자만 가능
      return next();
    }
    req.flash('danger','접근 권한이 없습니다.');
    res.redirect('/project');
    
  }
  res.redirect('/signin');
 
};
router.get('/', isAuthenticated, function (req, res,next) {
  connection.query(' select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;
    connection.query('select count(*) from emp_proj group by pro_id;',
    function(err,cnt){
    if(err) throw err;

    res.render('project/index',{
      projects: projects,
      moment:moment,
      cnt:cnt
    });
    });
  });
});
router.get('/order_list', isAuthenticated, function (req, res,next) {
  connection.query(' select * from  cus_order, customer where cus_order.cus_id=customer.cus_id',
  function(err,orders){
    if(err) throw err;

    res.render('project/order_list',{
      orders: orders,
      moment:moment

    });
  });
});

router.get('/add_project', isAuthenticated2, function (req, res,next) {
  connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;
      connection.query('select * from employee, dept where employee.emp_dep=dept.dept_id and dept.dept_id=5',
      function(err,employees){
        if(err) throw err;

        connection.query('select * from role_er',
        function(err,role_ers){
          if(err) throw err;

          res.render('project/add_project',{
            projects: projects,
            employees: employees,
            role_ers:role_ers
          });

        });
      });
  });
});

router.post('/add_project', isAuthenticated2, (req, res, next) => {
  console.log(req.body.select1_2);
  console.log(req.body.select2_2);
  console.log(req.body.select3_1);
  if(req.body.pro_name){
    connection.query('INSERT into project(pro_name, pro_start, pro_deadline, pro_org) values(?,?,?,?)',
    [req.body.pro_name,req.body.pro_start,req.body.pro_end,req.body.order] ,
    function(err,result){
      if (err) {
        return next(err);
      }
      connection.query('select * from project where pro_name=?',req.body.pro_name,
      function(err,projects){
        if(err) throw err;

        connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?)',
        [projects[0].pro_id, req.body.employee,req.body.role,req.body.er_start,req.body.er_end] ,
        function(err,result){
          if (err) {
            return next(err);
          }
         
          connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?)',
          [projects[0].pro_id, req.body.select1_1,req.body.select2_1,req.body.select3_1,req.body.select4_1] ,
          function(err,result){
            if (err) {
              return next(err);
            }
            connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?)',
              [projects[0].pro_id, req.body.select1_2,req.body.select2_2,req.body.select3_2,req.body.select4_2] ,
              function(err,result){
                if (err) {
                  return next(err);
                }
                req.flash('success', '성공적으로 프로젝트/참여직원을 추가하였습니다.');
                res.redirect('/project');
            });
          });
        
        });
      });  
    });
  }
  else{
    req.flash('danger', '프로젝트 이름을 지정해주세요');
    res.redirect('/project/add_project');
  }
});


router.get('/:id', isAuthenticated1, function (req, res,next) {
  connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id and project.pro_id=?',req.params.id,
  function(err,projects){
    if(err) throw err;

      connection.query('select * from emp_proj , employee,role_er where emp_proj.emp_id=employee.emp_id and role_er.role_id =emp_proj.er_role and emp_proj.pro_id=?',req.params.id,
      function(err,emp_projs){
        if(err) throw err;
        connection.query('select count(*) as cnt from (select emp_proj.er_id from emp_proj , employee,role_er where emp_proj.emp_id=employee.emp_id and role_er.role_id =emp_proj.er_role and emp_proj.pro_id=?)b',req.params.id,
        function(err,cnt){
          if(err) throw err;
          console.log(cnt);
        res.render('project/show',{
          projects: projects,
          emp_projs: emp_projs,
          cnt:cnt[0],
          moment:moment
        });
      });
    
      });
  });
});


router.get('/:id/delete', isAuthenticated2, (req, res, next) => {
  connection.query('DELETE FROM project WHERE pro_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/');
  });
});

router.get('/:id/edit', isAuthenticated2, function (req, res) {
  connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;
      connection.query('select * from employee, dept where employee.emp_dep=dept.dept_id and dept.dept_id=5',
      function(err,employees){
        if(err) throw err;

        connection.query('select * from role_er',
        function(err,role_ers){
          if(err) throw err;
          connection.query('select * from project,cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id and project.pro_id=?',req.params.id,function(err,result){
            if(err){
              return next(err);
            }
            connection.query('select emp_id, pro_id, er_role, er_start,er_end from emp_proj where pro_id=?',req.params.id,function(err,result1){
            if(err){
              return next(err);
            }
            connection.query('select count(*) as cnt from (select emp_proj.er_id from emp_proj where emp_proj.pro_id=?)b',req.params.id,
            function(err,cnt){
            if(err) throw err;

              res.render('project/edit',{
                projects: projects,
                employees: employees,
                role_ers:role_ers,
                pro_info:result[0],
                moment:moment,
                emp_infos:result1,
                cnt:cnt[0]
              });

            });  
          });       
        });
      });
    });
  });
});

router.post('/:id/edit', isAuthenticated2, (req, res, next) => {


  connection.query('UPDATE employee SET  emp_dep=? ,emp_name = ? , emp_Rnum =? , emp_edu=?,  emp_status=?, emp_pass=?, emp_workyear=? ,emp_retiredate=? WHERE emp_id=? ',
  [req.body.dept, req.body.name, req.body.rnum, req.body.edu,  req.body.status, req.body.password, req.body.workyear,req.body.retiredate, req.params.id] ,
  function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Updated successfully.');
    res.redirect(`/employee`);
  
  });
});

module.exports = router;
