var express = require('express');
// var mysql = require('mysql');
var router = express.Router();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');


var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expressssss!' });
});

router.get('/project', function(req, res, next) {
  res.render('project');
});

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

router.post('/signin', passport.authenticate('local', {failureRedirect: '/signin', failureFlash: true}), // 인증실패시 401 리턴, {} -> 인증 스트레티지
  function (req, res) {
    res.redirect('/');
  });

/*로그인 성공시 사용자 정보를 Session에 저장한다*/
passport.serializeUser(function (user, done) {
  console.log(user);
  done(null, user)

});

/*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
passport.deserializeUser(function (user, done) {
  done(null, user);
});

/*로그인 유저 판단 로직*/
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/signin');
};

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
 
  passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
}, function (req, username, password, done) {
  console.log(username);
  connection.query('select * from employee where emp_id= ?', username, function (err, result) {
    if (err) {
      req.flash('danger','Login Fail');
      console.log('err :' + err);
      return done(false, null);
    } else {
      console.log(result);
      if (result.length === 0) {
        console.log('해당 유저가 없습니다');
        req.flash('danger','No User');
        return done(false, null);
      } else {
        console.log(password);
        console.log(result[0].emp_pass);        
        if (password!= result[0].emp_pass) {
               req.flash('danger','Password x');
          return done(false, null);
        } else {
          
          req.flash('success','Successfully Signed In');
          connection.query('select * from dept where dept_id= ?', result[0].emp_dep, function (err, result1) {
            return done(null, {
              id: result[0].emp_id,
              name: result[0].emp_name,
              dept: result1[0].dept_name,
  
            });
          });
        }
      }
    }
  })
}));



router.get('/signout', function(req, res, next) {
  req.logout();
  req.flash('success','Successfully Signed Out');
  res.redirect('/');
});



module.exports = router;
