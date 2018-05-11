module.exports = (function () {
  return {
    local: { // localhost
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: 'hyunju1111',
      database: 'dbpteam3'
    },
    real: { // real server db info
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    },
    dev: { // dev server db info
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    }
  }
})();