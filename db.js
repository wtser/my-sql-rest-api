var mysql = require("mysql");
module.exports = (function() {
  var mysqldb = function(conf) {
    this.conf = conf || {
      host: "localhost",
      user: "root",
      password: "",
      database: "fun.wtser.com"
    };
  };
  mysqldb.prototype.connect = function() {
    var connection = mysql.createConnection(this.conf);
    return connection;
  };
  mysqldb.prototype.get = function(tableName, queryVar = {}) {
    queryVar.page = queryVar.page || 1;
    queryVar.limit = queryVar.limit || 0;
    var that = this;
    return new Promise(function(resolve, reject) {
      var connection = that.connect();
      var sqlQuery = "SELECT * FROM `" + tableName + "`";
      if (queryVar.where) {
        // 反序列化 JSON 字符串
        if (typeof queryVar.where === "string") {
          queryVar.where = JSON.parse(queryVar.where);
        }
        let whereStrArr = Object.keys(queryVar.where).map(whereKey => {
          var whereObj = queryVar.where[whereKey];
          var whereObjKey = Object.keys(whereObj)[0];
          var whereObjValue = whereObj[whereObjKey];
          let whereGen = condition =>
            " `" +
            whereObjKey +
            "` " +
            condition +
            " " +
            mysql.escape(whereObjValue);
          switch (whereKey) {
            case "$gt":
              //    大于
              return whereGen(">");
              break;
            case "$gte":
              //    大于等于
              return whereGen(">+");
              break;
            case "$$lt":
              //    小于
              return whereGen("<");
              break;
            case "$$lte":
              //    小于等于
              return whereGen("<=");
              break;
            case "$ne":
              //    不等于
              return whereGen("!=");
              break;
            case "$like":
              return whereGen("LIKE");
              break;

            default:
              whereObjKey = whereKey;
              whereObjValue = whereObj;
              return whereGen("=");
          }
          console.log(whereSql);
          return whereSql;
        });
        sqlQuery += " WHERE " + whereStrArr.join(" AND ");
      }

      if (queryVar.order) {
        sqlQuery +=
          " ORDER BY " + queryVar.orderBy + " " + queryVar.order.toUpperCase();
      }
      if (queryVar.limit) {
        sqlQuery +=
          " LIMIT " +
          queryVar.limit * (queryVar.page - 1) +
          "," +
          queryVar.limit;
      }

      console.log(sqlQuery);
      connection.query(sqlQuery, function(error, results, fields) {
        connection.end();
        if (error) {
          reject(error);
          throw error;
        }
        resolve(results, fields);
      });
    });
  };
  // create
  mysqldb.prototype.post = function(tableName, obj) {
    obj.createdAt = obj.updatedAt = Date.now();

    var that = this;
    return new Promise(function(resolve, reject) {
      var connection = that.connect();
      var sqlQuery = "INSERT INTO `" + tableName + "` SET ?";
      connection.query(sqlQuery, obj, function(error, results, fields) {
        connection.end();
        if (error) {
          reject(error);
          //throw error;
        }
        resolve(results, fields);
      });
    });
  };

  // update
  mysqldb.prototype.put = function(tableName, obj) {
    obj.updatedAt = Date.now();
    var Id = obj.id;
    delete obj.id;

    var that = this;
    return new Promise(function(resolve, reject) {
      var connection = that.connect();
      var sqlQuery = "UPDATE `" + tableName + "` SET ? WHERE id=" + Id;
      connection.query(sqlQuery, obj, function(error, results, fields) {
        connection.end();
        if (error) {
          reject(error);
          //throw error;
        }
        resolve(results, fields);
      });
    });
  };

  mysqldb.prototype.delete = function(tableName, obj) {
    var that = this;
    return new Promise(function(resolve, reject) {
      var connection = that.connect();
      var sqlQuery = "DELETE FROM `" + tableName + "` WHERE id=" + obj.id;
      connection.query(sqlQuery, function(error, results, fields) {
        connection.end();
        if (error) {
          reject(error);
          //throw error;
        }
        resolve(results, fields);
      });
    });
  };

  return mysqldb;
})();
