const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const morgan = require('morgan');
const logger = morgan('tiny') //parameter into morgan tells morgan to give us just a tiny bit of info
const helmet = require('helmet');
const fetch = require('node-fetch')

const host = '127.0.0.1';
const port = 3000;

const app = express();

app.use(logger);
app.use(helmet());
app.use(express.static('public/css/style.css'));


const es6Renderer = require('express-es6-template-engine')
app.engine('html', es6Renderer) //telling app to register es6
app.set('views', 'templates')
app.set('view engine', 'html');
const server = http.createServer(app);

const db = require('./db');

app.get('/', (req, res) => {
    console.log(req.url);
    res.render('home', {
        locals: {
            title: "Dog Profile"
        },
        partials: {
            head: '/partials/head',
        }
    });
});

app.get('/dogs', (req, res) => {
    console.log('request path is:' + req.path)
    res.render('dogs-list', {
        locals: {
            dogs: db,
            path: req.path,
            title: "Table of Dogtents"
        },
        partials: {
            head:'/partials/head'
        }
    })
});

app.get('/dogs/:breed', (req, res) => {

    let {breed} = req.params
    var dog = db.find(thisDog => thisDog.breed === breed);
    var replaced = breed.split(' ').join('-').toLowerCase()
    console.log(replaced)
    let url = `https://dog.ceo/api/breed/${replaced}/images/random`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let randomImage
            if(data.code === 404) {
                randomImage = data.message
                console.log(`Data.status is 404 error: ${randomImage}`)
                res.status(404)
                .send("No Dog found :(")
            }else{
                randomImage = data.message
                res.render('dog', {
                    locals: {
                        dog,
                        title: "A Dog",
                        dogImage: randomImage
                    },
                    partials: {
                        head: "/partials/head",
                        image: "/partials/image"
                    }
                });
            }

        })
});

server.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
