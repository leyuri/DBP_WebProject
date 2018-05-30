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



var isAuthenticated2 = function (req, res, next) {
  
  if (req.isAuthenticated()){
    if(req.user.dept ==3){
      //경영진만 가능
      return next();
    }
    req.flash('danger','접근 권한이 없습니다.');
    res.redirect('/project');
    
  }
  res.redirect('/signin');
 
};


var isAuthenticated3 = function (req, res, next) {
  
  if (req.isAuthenticated()){
    if(req.user.dept ==3){
      //경영진만 가능
      return next();
    }
    req.flash('danger','접근 권한이 없습니다.');
    res.redirect('/project/order_list');
    
  }
  res.redirect('/signin');
 
};

var isAuthenticated4 = function (req, res, next) {
  
  if (req.isAuthenticated()){
    if(req.user.dept ==3 || req.user.dept==5){
      //경영진만 가능
      return next();
    }
  }
  res.redirect('/signin');
 
};
router.get('/', isAuthenticated, function (req, res,next) {
  connection.query(' select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id',
  function(err,projects){
    if(err) throw err;
    connection.query('select count(*) from emp_proj group by pro_id',
    function(err,cnt){
    if(err) throw err;
      connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id and date(now()) >=project.pro_start and date(now())<=project.pro_deadline',
      function(err,current_projects){
      if(err) throw err;
      res.render('project/index',{
        projects: projects,
        moment:moment,
        cnt:cnt,
        current_projects:current_projects
      });
    });
    });
  });
});
router.get('/order_list', isAuthenticated, function (req, res,next) {
  connection.query(' select * from  cus_order, customer where cus_order.cus_id=customer.cus_id',
  function(err,orders){
    if(err) throw err;
  connection.query(' select * from   customer',
  function(err,clients){
    if(err) throw err;
    res.render('project/order_list',{
      orders: orders,
      moment:moment,
      clients:clients

    });
    });
  });
});

router.get('/add_project', isAuthenticated2, function (req, res,next) {
  connection.query('select * from cus_order',
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

router.get('/add_order', isAuthenticated3, function (req, res,next) {
  connection.query('select * from customer',
  function(err,clients){
    if(err) throw err;
      res.render('project/add_order',{
        clients: clients      
      });
  });
});

router.get('/:id/edit_order', isAuthenticated3, function (req, res,next) {
  connection.query('select * from cus_order where order_id=?',req.params.id,
  function(err,orders){
    if(err) throw err;
      res.render('project/edit_order',{
        order: orders[0],
        moment:moment      
      });
  });
});
router.post('/:id/edit_order', isAuthenticated3, (req, res, next) => {


  connection.query('UPDATE cus_order SET  order_content=? ,order_date=? WHERE order_id=? ',
  [req.body.content,  req.body.orderdate, req.params.id] ,
  function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Updated successfully.');
    res.redirect(`/project/order_list`);
  
  });
});

router.post('/:id/answers', isAuthenticated2, (req, res, next) => {


  connection.query('insert into project_comment(com_project,com_author,com_content,com_date) values(?,?,?,NOW())',
  [req.params.id, req.user.id, req.body.content] ,
  function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', '성공적으로 comment를 남겼습니다.');
    res.redirect(`/project/${req.params.id}`);
  
  });
});

router.post('/add_order', isAuthenticated3, (req, res, next) => {
  if(req.body.client_add){
    connection.query('insert into customer(cus_name) values(?)',
    req.body.client_add, function(err,result){
      if (err) {
        return next(err);
      }
      connection.query('select * from customer where cus_name=?',
      req.body.client_add, function(err,result1){
        if (err) {
          return next(err);
        }
        
      connection.query('insert into cus_order(order_content,order_date,cus_id) values(?,?,?)',
      [req.body.content,req.body.orderdate,result1[0].cus_id], function(err,result){
        if (err) {
          return next(err);
        }
        req.flash('success', 'Updated successfully.');
        res.redirect(`/project/order_list`);
      });
    });
  });
  }
  else{
    connection.query('insert into cus_order(order_content,order_date,cus_id) values(?,?,?)',
    [req.body.content,req.body.orderdate,req.body.client], function(err,result){
      if (err) {
        return next(err);
      }
      req.flash('success', 'Updated successfully.');
      res.redirect(`/project/order_list`);
    
    });
  }
});



router.post('/add_project', isAuthenticated2, (req, res, next) => {
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


router.get('/:id', isAuthenticated4, function (req, res,next) {
  connection.query('select * from emp_proj  where emp_id=? and pro_id=?',[req.user.id,req.params.id],
  function(err,results){
    if(err) throw err;
    if(results[0]|| req.user.dept==3){
      connection.query('select * from project, cus_order, customer where project.pro_org=cus_order.order_id and cus_order.cus_id=customer.cus_id and project.pro_id=?',req.params.id,
      function(err,projects){
        if(err) throw err;
        connection.query('select * from emp_proj , employee,role_er where emp_proj.emp_id=employee.emp_id and role_er.role_id =emp_proj.er_role and emp_proj.pro_id=?',req.params.id,
        function(err,emp_projs){
          if(err) throw err;
          connection.query('select count(*) as cnt from (select emp_proj.er_id from emp_proj , employee,role_er where emp_proj.emp_id=employee.emp_id and role_er.role_id =emp_proj.er_role and emp_proj.pro_id=?)b',req.params.id,
          function(err,cnt){
            if(err) throw err;
      
            connection.query('select * from project_comment where com_project=?',req.params.id,
            function(err,answers){
              if(err) throw err;
        
              connection.query('select status, count(*) as cnt from proj_plan where pro_id=? group by status',req.params.id,
              function(err,plans){
                if(err) throw err;

                connection.query('select * from proj_plan,project where project.pro_id=proj_plan.pro_id and proj_plan.pro_id=?',req.params.id,
                function(err,pro_plans){
                  if(err) throw err;

                  connection.query('select * from evaluate where pro_id=?',req.params.id,
                  function(err,evaluates){
                    if(err) throw err;
        
                    res.render('project/show',{
                      projects: projects,
                      emp_projs: emp_projs,
                      cnt:cnt[0],
                      moment:moment,
                      answers:answers,
                      plans:plans,
                      pro_plans:pro_plans,
                      evaluates:evaluates
                    });        
                  });
                });
            });
          });
          });
        });
    
      });
    }else{
      req.flash('danger', '접근 권한이 없습니다.');
      res.redirect('/project');
    }

  });
});


router.get('/:id/delete', isAuthenticated2, (req, res, next) => {
  connection.query('DELETE FROM project WHERE pro_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/project');
  });
});

router.get('/:id/delete_order', isAuthenticated3, (req, res, next) => {
  connection.query('DELETE FROM cus_order WHERE order_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/project/order_list');
  });
});
router.get('/:id/delete_answer', isAuthenticated2, (req, res, next) => {
  connection.query('DELETE FROM project_comment WHERE com_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/project');
  });
});
router.get('/:id/delete_customer', isAuthenticated3, (req, res, next) => {
  connection.query('DELETE FROM customer WHERE cus_id = ?',req.params.id,function(err,result){
    if (err) {
      return next(err);
    }
    req.flash('success', 'Deleted Successfully.');
    res.redirect('/project/order_list');
  });
});

router.get('/:id/edit', isAuthenticated2, function (req, res) {
  connection.query('select * from cus_order',
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
  if(req.body.pro_name){
    connection.query('update project set pro_name=? ,pro_start=?, pro_deadline=?, pro_org=? where pro_id=?',
    [req.body.pro_name,req.body.pro_start,req.body.pro_end,req.body.order, req.params.id] ,
    function(err,result){
      if (err) {
        return next(err);}

      connection.query('delete from emp_proj where pro_id=?',
      req.params.id ,
      function(err,result){
        if (err) {
          return next(err);}
        connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?)',
        [req.params.id, req.body.employee,req.body.role,req.body.er_start,req.body.er_end] ,
        function(err,result){
          if (err) {
            return next(err);
          }
          if(req.body.select1_1)
            connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?)',
            [req.params.id, req.body.select1_1,req.body.select2_1,req.body.select3_1,req.body.select4_1] ,
            function(err,result){
              if (err) {
                return next(err);
              }
              if(req.body.select1_2)
                connection.query('INSERT into emp_proj(pro_id,emp_id,er_role,er_start,er_end) values(?,?,?,?,?)',
                  [req.params.id, req.body.select1_2,req.body.select2_2,req.body.select3_2,req.body.select4_2] ,
                  function(err,result){
                    if (err) {
                      return next(err);
                    }

          req.flash('success', '성공적으로 프로젝트/참여직원을 수정하였습니다.');
          res.redirect(`/project/${req.params.id}`);
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


module.exports = router;
