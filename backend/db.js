const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const db = new sqlite3.Database('./taskmanagement.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// promise meth
db.getAsync = promisify(db.get.bind(db));
db.runAsync = function (sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); 
    });
  });
};
db.allAsync = promisify(db.all.bind(db));

module.exports = db;