var express = require('express');
var router = express.Router();
var connection = require("./conn")

connection.connect(()=>{
    console.log('数据库连接成功');
})
//接受添加数据的请求
router.post("/inventoryAdd",(req,res)=>{
    let { goodCode,goodName,costPrice,incoming,inventory,saled } = req.body;
    let  sqlStr = `insert into inventory(goodCode,goodName,costPrice,incoming,inventory,saled) values(?,?,?,?,?,?)`;
    const sqlParams = [goodCode,goodName,costPrice,incoming,inventory,saled];
    connection.query(sqlStr,sqlParams,(err,data)=>{
        if(err){
            throw err
        }else{
            if(data.affectedRows > 0){
                res.send({"errcode":1,"msg":"数据添加成功"})
            }else{
                res.send({"errcode":0,"msg":"数据添加失败"})
            }
        }
    })
})

router.get("/inventoryList", (req, res) => {
    let { pageSize, currentPage,searchWord,searchName } = req.query;
  
    let sqlStr = 'select * from inventory where 1=1';
    connection.query(sqlStr, (err, data) => {
      if (err) {
        throw err
      } else {
        let totalCount = data.length;

        //搜索分类
        if (searchName !== "" && searchName !== "全部") {
          sqlStr += ` and goodGroup = '${searchName}'`
        };
    
        //判断搜索
        if (searchWord !== "") {
          sqlStr += ` and ( goodCode like '%${searchWord}%' or goodName like '%${searchWord}%' )`;
        };
        
        connection.query(sqlStr,(err,data)=>{
          if(err){
            throw err
          }else{
            totalCount = data.length;
          }
        });
        const n = (currentPage - 1) * pageSize;
        sqlStr += ` order by ctime desc limit ${n},${pageSize}`;
        connection.query(sqlStr, (err, data) => {
          if (err) {
            throw err
          } else {
            res.send({ "totalCount": totalCount, "pageData": data })
          }
        })
      }
    })
  });

 //接受单个数据删除的请求
 router.get("/delData", (req, res) => {
    let { id } = req.query;
    let sqlStr = `delete from inventory where id = ${id}`;
    connection.query(sqlStr, (err, data) => {
      if (err) {
        throw err
      } else {
        if (data.affectedRows > 0) {
          res.send({ "errcode": 1, "msg": "删除成功" })
        } else {
          res.send({ "errcode": 0, "msg": "删除失败" })
        }
      }
    })
  });

  router.post("/batchesDel", (req, res) => {
    let idArr = req.body["idArr[]"];
    const sqlStr = `delete from inventory where id in (${idArr})`;//括号里面为数组
    connection.query(sqlStr, (err, data) => {
      if (err) {
        throw err
      } else {
        if (data.affectedRows > 0) {
          res.send({ "errcode": 1, "msg": "删除成功" })
        } else {
          res.send({ "errcode": 0, "msg": "删除失败" })
        }
      }
    });
  });

module.exports = router;
