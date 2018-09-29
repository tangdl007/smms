var express = require('express');
var router = express.Router();
//接受外部的连接
const  connection = require("./conn");

//调用connect方法，连接数据库
connection.connect(()=>{
  console.log("数据库连接成功");
});


//接受前端的请求，将数据加入数据库
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
  let {pageSize,currentPage} = req.query;
  const n = (currentPage - 1)*pageSize;
  let sqlStr = `select * from users`;
  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err
    }else{
      let totalCount = data.length;
      sqlStr+=` order by ctime desc limit ${n},${pageSize}`;
      connection.query(sqlStr,(err,data)=>{
        if(err){
          throw err
        }else{
          res.send({"totalCount":totalCount,"pageData":data})
        }
      })
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
  //注意变量要用单引号引起来，因为值为字符串
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
  const sqlStr = `delete from users where id in ('${idArr}')`;//括号里面为数组
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
    connection.query(sqlStr,(err,data)=>{ //data为数组，根据数组的长度判断是否存在
      if(err){
        throw err;
      }else{
        if(data.length){
          //如果有值那么设置cookie并响应数据，在用户的终端也就是浏览器
          res.cookie('username',data[0].username);
          res.cookie('password',data[0].password);
          res.cookie('groups',data[0].groups);
          res.cookie('id' ,data[0].id )
          res.send({"errcode":1,"msg":"登陆成功"})
        }else{
          res.send({"errcode":0,"msg":"请检查你的用户名和密码"})
        }
      }
    })
})

//检验是否已经登陆，用script的src进行调用在每一页都调用判断浏览器中是否有cookie
router.get("/checkIsLogin",(req,res)=>{
  let username = req.cookies.username;
  if(username){
    //用script调用那么就自带script标签
    res.send('console.log("")')
  }else{
    //因为使用script发送的请求所以res.send自带script标签不用特别的写
    res.send('alert("你想多了");location.href="./login.html";')
  }
})


//退出登陆
router.get("/logout",(req,res)=>{
  //清除
  res.clearCookie("username");
  res.clearCookie("password");
  res.clearCookie("groups");
  res.send('<script>alert("再见");location.href="http://localhost:555/login.html";</script>')
})


//修改密码，验证旧密码
router.get("/editPwd",(req,res)=>{
  let {oldpwd} = req.query;
  //登陆的时候就在cookie中保存了用户的id
  let id = req.cookies.id;
  const sqlStr = `select * from users where id = ${id}`;//找到这条数据
  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err
    }else{
      if(data[0].password===oldpwd){
        res.send({"errcode":1})
      }else{
        res.send({"errcode":0})
      }
    }
  });
})


//用新密码修改密码
router.get("/newPwd",(req,res)=>{
  let {newpwd} = req.query;
  let id = req.cookies.id;
  const sqlStr =`update users set password ='${newpwd}' where id = ${id}`;
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
module.exports = router;
