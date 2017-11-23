// myDb.get("funs").then(function(result) {
//   console.log(result);
// });

// myDb
//     .post("funs", { title: "hahahahha", url: "cccccc" })
//     .then(function(result) {
//         return result;
//         // {
//         //     "fieldCount": 0,
//         //     "affectedRows": 1,
//         //     "insertId": 4,
//         //     "serverStatus": 2,
//         //     "warningCount": 0,
//         //     "message": "",
//         //     "protocol41": true,
//         //     "changedRows": 0
//         // }
//     });

// myDb
//     .put("funs", {id:3, title: "33333", url: "33333" ,content:'test'})
//     .then(function(result) {
//         return result;
//         // {
//         //     "fieldCount": 0,
//         //     "affectedRows": 1,
//         //     "insertId": 0,
//         //     "serverStatus": 2,
//         //     "warningCount": 0,
//         //     "message": "(Rows matched: 1  Changed: 1  Warnings: 0",
//         //     "protocol41": true,
//         //     "changedRows": 1
//         // }
//     });
//

// ctx.body = await myDb
//   .delete("funs", {id:3})
//   .then(function(result) {
//     return result;
//       // {
//       //     "fieldCount": 0,
//       //     "affectedRows": 1,
//       //     "insertId": 0,
//       //     "serverStatus": 2,
//       //     "warningCount": 0,
//       //     "message": "",
//       //     "protocol41": true,
//       //     "changedRows": 0
//       // }
//   });
//return;

var mysql = require('mysql');
module.exports = (function() {
  var mysqldb = function(conf) {
    this.conf = conf || {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fun.wtser.com',
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
      var sqlQuery = 'SELECT * FROM ' + tableName;
      if (queryVar.where) {
        if (typeof queryVar.where === 'string') {
          queryVar.where = JSON.parse(queryVar.where);
        }
        var whereWhat = Object.keys(queryVar.where)[0];
        switch (whereWhat) {
          case '$like':
            console.log('likelike');
            var whereObj = queryVar.where[whereWhat];
            var whereWhatObj = Object.keys(whereObj)[0];
            var whereValueObj = whereObj[whereWhatObj];
            sqlQuery +=
              ' WHERE `' +
              whereWhatObj +
              '` LIKE ' +
              mysql.escape('%' + whereValueObj);
            console.log(sqlQuery);
            break;

          default:
            sqlQuery +=
              ' WHERE `' +
              whereWhat +
              '`=' +
              mysql.escape(queryVar.where[whereWhat]);
        }
      }

      if (queryVar.order) {
        sqlQuery +=
          ' ORDER BY ' + queryVar.orderBy + ' ' + queryVar.order.toUpperCase();
      }
      if (queryVar.limit) {
        sqlQuery +=
          ' LIMIT ' +
          queryVar.limit * (queryVar.page - 1) +
          ',' +
          queryVar.limit;
      }

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
      var sqlQuery = 'INSERT INTO ' + tableName + ' SET ?';
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
      var sqlQuery = 'UPDATE ' + tableName + ' SET ? WHERE id=' + Id;
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
      var sqlQuery = 'DELETE FROM ' + tableName + ' WHERE id=' + obj.id;
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
