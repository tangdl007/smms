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

    console.log(groups.length);
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
//接受前端删除的请求
router.get("/delData",(req,res)=>{
  let {id} = req.query;
  let sqlStr = `delete from users where id = ${id}`;
  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err
    }else{
      if(data.affectedRows>0){
        res.send({"errcode":1,"msg":"删除成功"})
      }else{
        res.send({"errcode":0,"msg":"删除失败"})
      }
    }
  })
})

//接受修改的请求

router.get("/editUser",(req,res)=>{
    let {id} = req.query;
    let sqlStr = `select * from users where id = ${id}`;
    connection.query(sqlStr,(err,data)=>{
      if(err){
        throw err
      }else{
        res.send(data)
      }
    })
})

//接受修改的数据
router.post("/userEdit",(req,res)=>{
  let{username,password,groups,id} = req.body;
  //注意变量要用单引号引起来
  const sqlStr = `update users set username = '${username}',password = '${password}',groups = '${groups}' where id = ${id}`
  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err
    }else{
      if(data.affectedRows>0){
        res.send({"errcode":1,"msg":"修改成功"})
      }else{
        res.send({"errcode":0,"msg":"修改失败"})
      }
    }
  })
})

//接受批量删除的请求
router.post("/batchesDel",(req,res)=>{
  let idArr = req.body["idArr[]"]
  
  const sqlStr = `delete from users where id in ('${idArr}')`;

  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err
    }else{
      if(data.affectedRows>0){
        res.send({"errcode":1,"msg":"删除成功"})
      }else{
        res.send({"errcode":0,"msg":"删除失败"})
      }
    }
  });
})

//接受检查用户名是否存在

router.post("/loginCheck",(req,res)=>{
    let {username,password} = req.body;
    const sqlStr = `select * from users where username='${username}' and password='${password}'`;
    connection.query(sqlStr,(err,data)=>{
      if(err){
        throw err;
      }else{
        if(data.length){
          //如果有值那么设置cookie并响应数据
          res.cookie('username',data[0].username);
          res.cookie('password',data[0].password);
          res.cookie('groups',data[0].groups);
          res.send({"errcode":1,"msg":"登陆成功"})
        }else{
          res.send({"errcode":0,"msg":"请检查你的用户名和密码"})
        }
      }
    })
})

//检验是否已经登陆
router.get("/checkIsLogin",(req,res)=>{
  let username = req.cookies.username;
  if(username){
    res.send('console.log("")')
  }else{
    //因为使用script发送的请求所以res.send自带script标签不用特别的写
    res.send('alert("你想多了");location.href="./login.html";')
  }
})


//推出登陆
router.get("/logout",(req,res)=>{
  res.clearCookie("username");
  res.clearCookie("password");
  res.clearCookie("groups");
  res.send('<script>alert("再见");location.href="http://localhost:555/login.html";</script>')
})

module.exports = router;
