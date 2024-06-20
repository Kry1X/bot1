const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'name_db',
    'username',
    'password',
    {
        host: 'serverIP',
        port: 'serverPORT',
        dialect: 'postgres'
    }
)