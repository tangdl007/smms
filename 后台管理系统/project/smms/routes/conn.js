//引入mysql模块
const mysql = require("mysql");


//创建连接

const connection = mysql.createConnection({
    host : "localhost",
    user : "root",//用户
    password : "root",
    database : "admin"
});

//将连接暴露出去

module.exports = connection;

