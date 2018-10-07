var express = require('express');
var router = express.Router();
const connection = require("./conn")


//连接数据库
connection.connect(() => {
  console.log("数据库连接成功");
});


//接受添加数据请求
router.post("/goodsAdd", (req, res) => {
  let { searchName, goodsName,goodCode, totalNum,salePrice, marketPrice, costPrice,goodsWeight, goodUnit, resource, promotion, goodDesc } = req.body;
  //将数据添加到数据库中
  const sqlStr = 'insert into goods(searchName,goodsName,goodCode,totalNum,salePrice,marketPrice,costPrice,goodsWeight,goodUnit,resource,promotion,goodDesc) values(?,?,?,?,?,?,?,?,?,?,?,?)';
  const sqlPara = [searchName,  goodsName,goodCode, totalNum,salePrice, marketPrice, costPrice,  goodsWeight, goodUnit, resource, promotion, goodDesc];
  connection.query(sqlStr, sqlPara, (err, data) => {
    if (err) {
      throw err
    } else {
      if (data.affectedRows > 0) {
        res.send({"errCode": 1,"msg":"数据添加成功"})
      } else {
        res.send({"errCode": 0,"msg":"数据添加成功"})
      }
    }
  })
});
  //将数据传入数据库; 




  //将数据添加到商品列表中
  router.get("/goodList", (req, res) => {
    let { pageSize, currentPage,searchWord,searchName } = req.query;
  
    let sqlStr = 'select * from goods where 1=1';
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
          sqlStr += ` and ( goodCode like '%${searchWord}%' or goodsName like '%${searchWord}%' )`;
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
    let sqlStr = `delete from goods where id = ${id}`;
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


  //接受批量删除的指令
  router.post("/batchesDel", (req, res) => {
    let idArr = req.body["idArr[]"]
    const sqlStr = `delete from goods where id in (${idArr})`;//括号里面为数组
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



  //接受搜索商品的请求
  router.get("/searchGoods", (req, res) => {
    //接受数据
    let { searchWord, searchName } = req.query;


    //构造语句
    let sqlStr = `select * from goods where 1=1`;

    //判断关键字
    if (searchName !== "" && searchName !== "全部") {
      sqlStr += ` and goodGroup = '${searchName}'`
    };

    //判断搜索
    if (searchWord !== "") {
      sqlStr += ` and ( goodCode like '%${searchWord}%' or goodsName like '%${searchWord}%' )`;
    };

    console.log(sqlStr);

    //合并语句
    connection.query(sqlStr, (err, data) => {
      if (err) {
        throw err
      } else {
        res.send(data)
      }
    });
  })



  module.exports = router;
