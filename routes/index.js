var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var mysql_dbc = require('../models/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expressssss!' });
});


router.get('/mysql/test', function (req, res) {
  var stmt = 'select *from user';
  connection.query(stmt, function (err, result) {

  })
});

module.exports = router;
