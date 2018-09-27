var express = require('express');
var router = express.Router();
//接受外部的连接
const  connection = require("./conn");

//调用connect方法，连接数据库
connection.connect(()=>{
  console.log("数据库连接成功");
})

module.exports = router;
