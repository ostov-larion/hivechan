/* Init */
const express = require('express')
const fetch   = require('cross-fetch')
const cors    = require('cors')
const crypto  = require('crypto')
const app = express()

const date = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.get('/db', (req, res) => {
    fetch("https://api.jsonstorage.net/v1/json/c6ad7afd-b319-4909-8b41-bc5c6491bd1e", {method: "GET"})
    .then(json => json.json().then(db => res.status(200).send(JSON.stringify(db))))
})

app.post('/post', (req, res) => {
    if(typeof req.body.msg != 'string') {
        res.status(404).send("Долбоеб.")
        return null
    }
    fetch("https://api.jsonstorage.net/v1/json/c6ad7afd-b319-4909-8b41-bc5c6491bd1e", {method: "GET"})
    .then(json => json.json().then(db =>
    fetch("https://api.jsonstorage.net/v1/json/c6ad7afd-b319-4909-8b41-bc5c6491bd1e?apiKey=8fb8b49c-e22c-4c05-84a5-caee09624a9d", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([...db, {msg: req.body.msg, files: req.body.files, time: date(), poster: crypto.createHash('md5').update(req.ip).digest('hex')}])
    }).then(() => res.status(200).send("Success!"))))
})

app.listen(PORT)

