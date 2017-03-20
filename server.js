charset="utf-8"
var express = require('express');
var morgan = require('morgan');
var path = require('path');




var Client = require('pg').Client;
//var pool = new Pool({ Client: Client });

 var client = new Client({
  user: 'postgres',
  database: 'test',
  password: 'success5',
  host: 'localhost',
  port: '5432',
   max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000
});

var app = express();

app.use(morgan('combined'));
var articles = {
'article-one': {
title: 'Article one | Himanshu sharma',
heading:'Article one',
date: 'February-10-2017',
content: 
`<p>
This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.
</p>
<p>
This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.
</p>
<p>
This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.
</p>
<p>
This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.This is the content for my first article.
</p>
`
},
'article-two': {
title: 'Article one | Himanshu sharma',
heading:'Article Two',
date: 'February-15-2017',
content:
`
<p>
This is the content for my second article
</p>
`
},
'article-three': {
title: 'Article Three | Himanshu sharma',
heading:'Article Three',
date: 'February-25-2017',
content:
`
<p>
This is the content for my Third article
</p>
`
}
};
function createTemplate (data){
var date = data.date;
var content = data.content;
var heading = data.heading;
var title = data.title;

var htmlTemplate =  `

<html>
<head>
    <title>
        ${title}
        
        
    </title>
    <meta name="viewport" content="width=device-width,intial-scale=1"/>
     <link href="/ui/style.css" rel="stylesheet" />
     
</head>
<body>
    <div class="container">
        
    <div>
        <a href="/">Home</a>
        
    </div>
    <hr/>
    <h3>
        ${heading}
        
    </h3>
    <div>
        ${date}
        
    </div>
    <div>
        
        ${content}
    </div>
    </div>
</body>
</html>

`;
return htmlTemplate;
}
function hash(input, salt) {
// yep how we gonna create a hash
var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function(req, res) {
var hashedString = hash(req.params.input, 'this is some random string');
res.send(hashedString);
});

app.post('/create-user', function(req, res) {
//username , password
// {"username": "joshi", "password": "password"}
// JSON
var username = req.body.username;
var password = req.body.password;
var salt = crypto.randomBytes(128).toString('hex');
var dbString = hash(password, salt);
client.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, dbString], function (err, result){
if (err) {
res.status(500).send(err.toString());
} else {
res.send('User Successfully created: ' + username);
}
});
});

app.post('/login', function(req, res) {
var username = req.body.username;
var password = req.body.password;

client.query('SELECT * FROM "user" WHERE username = $1', [username], function (err, result){
if (err) {
        res.status(500).send(err.toString());
    } else {
        if (result.rows.length === 0){
            res.send(403).send('username/password is invalid');
            } else {
                // Match the password
                var dbString = result.rows[0].password;
                var salt = dbString.split('$')[2];
                var hashedPassword = hash(password, salt); // creating a hash based on the password submitted and the original salt 
                if (hashedPassword === dbString) {
            // set the session
                    req.session.auth = {userId: result.rows[0].id};
                    // abcd efghijklm set cookie with a server side, 
                    // internally, on the server side , it maps the session id to an object
                    // {auth: {userId}}
                     res.send('credentials correct !');
                } else {
                    res.send(403).send('username/password is invalid');
                }


            } 
    }
	});
});

app.get('/check-login', function (req, res) {
if (req.session && req.session.auth && req.session.auth.userId) {
res.send('you are logged in: ' + req.session.auth.userId.toString());
} else {
res.send('you are not logged in');
}

});
app.get('/', function (req, res) {
res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
// connect to our database
app.get('/testdb', function (req, res){
	
	client.connect(function (err) {
	if (err) throw err;

	// execute a query on our database
  
	client.query('SELECT * FROM article', function (err, result){
	if(err){
		res.status(500).send(err.toString());
		   } 
    else   {
        res.send(JSON.stringify(result.rows));
	       }
	client.end(function (err) {
    if (err) throw err;
    });
	});
	});
});
 app.get('/fetchone', function (req, res){
	
	client.connect(function (err) {
	if (err) throw err;

	// execute a query on our database
  
	client.query('SELECT * FROM article WHERE id = $1', ['1'], function(err, result) {
	if(err){
		res.status(500).send(err.toString());
		   } 
    else   {
        res.send(JSON.stringify(result.rows));
	       }
	client.end(function (err) {
    if (err) throw err;
    });
	});
	});
}); 	
var counter = 0;
app.get('/counter', function (req, res) {
counter = counter + 1;
res.send(counter.toString());

});

var names = [] ;
app.get('/submit-name', function(req, res) { // /submit-name?name=xxxxx
// get the name from the request
var name = req.query.name;

names.push(name);

// JSON: Javascript Object Notataion
res.send(JSON.stringify(names));
});
app.get('/:articleName', function (req,res){
var articleName = req.params.articleName;
res.send(createTemplate(articles[articleName]));
});

app.get('/ui/style.css', function (req, res) {
res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});
app.get('/ui/madi.png', function (req, res) {
res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});




  /* client.query('SELECT * FROM article WHERE id = $1', ['1'], function(err, result) {
  
    call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].id);
    //output: 1
  });
});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})

var Pool = require('pg-pool');

//by default the pool uses the same
//configuration as whatever `pg` version you have installed
var pool = new Pool();

//you can pass properties to the pool
//these properties are passed unchanged to both the node-postgres Client constructor
//and the node-pool (https://github.com/coopernurse/node-pool) constructor
//allowing you to fully configure the behavior of both
var pool2 = new Pool({
  database: 'postgres',
  user: 'brianc',
  password: 'secret!',
  port: 5432,
  ssl: true,
  max: 20, //set pool max size to 20
  min: 4, //set min pool size to 4
  idleTimeoutMillis: 1000 //close idle clients after 1 second
})

//you can supply a custom client constructor
//if you want to use the native postgres client
var NativeClient = require('pg').native.Client
var nativePool = new Pool({ Client: NativeClient })

//you can even pool pg-native clients directly
var PgNativeClient = require('pg-native')
var pgNativePool = new Pool({ Client: PgNativeClient })*/
// Submit username/password

var port = 8081; // Use 8080 for local development because you might already have apache running on 80

app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
