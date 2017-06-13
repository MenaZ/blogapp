const app = require('express')();
const Sequelize = require('sequelize');
const db = new Sequelize('nodeblog',process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    define: {
        timestamps: true
    }
});
const bodyParser = require('body-parser'());
const session = require('express-session');


app.set('views', 'views');
app.set('view engine', 'pug');

app.use('/',bodyParser); 


app.get('/', (response,request)=> {
	response.render('blog')
}

app.post('/createUser', (response,request)=> {
}