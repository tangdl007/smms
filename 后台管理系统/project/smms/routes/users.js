var express = require('express');
var router = express.Router();
//接受外部的连接
const  connection = require("./conn");

//调用connect方法，连接数据库
connection.connect(()=>{
  console.log("数据库连接成功");
});


//接受前端的请求
router.post("/userAdd",(req,res)=>{
    let{username,password,groups} = req.body;
    //构造sql语句
    const  sqlStr = "insert into users(username,password,groups) values(?,?,?)";
    //接受到的数据参数
    const sqlParams = [username,password,groups];
    //将获取的数据在数据库中保存
    connection.query(sqlStr,sqlParams,(err,data)=>{
      if(err){
        throw err
      }else{
        if(data.affectedRows>0){
          res.send({"errcode":1,"msg":"添加成功"})
        }else{
          res.send({"errcode":0,"msg":"添加失败 "})
        }
      }
    });
});

//接受前端请求，获取数据库全部数据
router.get("/userList",(req,res)=>{
  //构造数据字符串
  const sqlStr = "select * from users order by ctime desc";
  //利用query函数，将数据全部找出来并传给前端
  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err
    }else{
      res.send(data)
    }
  })
})



module.exports = router;
