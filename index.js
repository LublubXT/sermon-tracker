const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');
const mongoose = require("mongoose");
const fs = require('fs');
var path = require('path');
var mime = require('mime');

const Schema = mongoose.Schema;

mongoose.connect("mongodb+srv://your-mongodb-atlas-link-here", { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


const userSchema = {
    data: Array,
    password: String,
    username: String,
}

const ItemSchema = {
    date: String,
    place: String,
    title: String,
    topic: String,
};

const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", ItemSchema);

var usern
var pass
var data

var filename

var exportString = ''

app.get('/', function(req, res) {
    res.render("index")
});

app.get('/export', function(req, res) {
    res.render("export")
});

app.get('/signup', function(req, res) {
    res.render("signup")
});

app.get('/home', function(req, res) {
    User.findOne({ username: usern, password: pass }, async function(err, foundItems) {

        if (err) {
            console.log(err)
            res.redirect('/')
        } else {
            data = await foundItems;

            // console.log(data.data)

            for (var i = 0; i < data.data.length; i++) {
                data.data[i].index = i;
            }

            res.render("home", { "data": data.data });
        }
    });
});

app.post('/login', function(req, res) {

    pass = req.body.password
    usern = req.body.username

    res.redirect('/home')
})

app.post('/export', function(req, res) {

    filename = req.body.filename

    exportString += "Sermon Title, Sermon Topic, Location Preached, Date Preached\n"

    for (var i = 0; i < data.data.length; i++) {
        exportString += data.data[i].title + ", "
        exportString += data.data[i].topic + ", "
        exportString += data.data[i].place + ", "
        exportString += data.data[i].date + "\n"
    }

    console.log(exportString)

    fs.writeFile("./data/download.csv", exportString, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    res.redirect('/download')
})

app.get('/download', function(req, res) {

    var file = __dirname + '/data/download.csv';

    // var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.csv');
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);

    // res.redirect('/home')
});


app.post('/signup', function(req, res) {

    var password = req.body.password
    var username = req.body.username

    const data = [{ "title": "Welcome!", "topic": "App", "place": "Here!", "date": "1/19/2022" }]

    const user = new User({
        data: data,
        password: password,
        username: username
    });

    pass = password
    usern = username

    user.save();

    res.redirect('/home')
})

app.post('/delete', function(req, res) {

    // console.log(req.body.index)

    User.findOne({ username: usern, password: pass }, function(err, foundItems) {

        if (err) {
            console.log(err)
        } else {

            foundItems.data.splice(req.body.index, 1);
            // console.log(foundItems.data)
            foundItems.save(function() {
                res.redirect("/home");
            });
        }
    });
})

app.post('/edit', function(req, res) {

    // console.log(req.body.index)

    // User.save()

    var date = req.body.date
    var location = req.body.place
    var title = req.body.title
    var topic = req.body.topic

    const itemUpdate = new Item({
        date: date,
        place: location,
        title: title,
        topic: topic,
    });

    User.findOne({ username: usern, password: pass }, function(err, d) {

        if (err) {
            console.log(err)
        } else {

            // console.log(d.data[req.body.index])

            // d.data[req.body.index].title = req.body.title
            // d.data[req.body.index].topic = req.body.topic
            // d.data[req.body.index].place = req.body.place
            // d.data[req.body.index].date = req.body.date

            console.log(d.data[req.body.index])

            d.data[req.body.index] = itemUpdate;
            // User.findOneAndUpdate({ title: foundItems.data[req.body.index].title }, { title: foundItems.data[req.body.index].title, topic: foundItems.data[req.body.index].topic, place: foundItems.data[req.body.index].place, date: foundItems.data[req.body.index].date })
            d.save(function() {
                res.redirect('/home')
            })

        }
    });

})


app.post('/submit', function(req, res) {

    var title = req.body.title
    var topic = req.body.topic
    var location = req.body.location
    var date = req.body.date

    const item = new Item({
        date: date,
        place: location,
        title: title,
        topic: topic,
    });

    User.findOne({ username: usern, password: pass }, function(err, foundItems) {

        if (err) {
            console.log(err)
        } else {

            // for (var i = 0; i < 50; i++) {
            foundItems.data.push(item);
            // }
            // console.log(foundItems.data)
            foundItems.save(function() {
                res.redirect("/home");
            });
        }
    });
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started on port", port);
    console.log("its working so far so good!")
});
