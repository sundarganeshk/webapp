console.log('Loaded!');

var submit = document.getElementById('submit_btn');
submit.onclick = function () {

    // create a request object
var request = new XMLHttpRequest();

// capture the response and store it in a variable
request.onreadyStatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
    // take some action
    if (request.status === 200) {
      alert("logged in successfully");
    }else if (request.status === 403) {
        alert('username/password is incorrect');
    }else if (request.status === 500) {
        alert ('Something Went wrong on the server');
    }
    }

// not done yet

};
// make the request
var username = document.getElementById('username').value;
var password = document.getElementById('password').value;
console.log(username);
console.log(password);
request.open('POST','http://localhost:8080/login', true);
request.setRequestHeader('Content-Type', 'application/json');
request.send(JSON.stringify({username: username, password: password}));

};