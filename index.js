/* Init */
const crypto = require('crypto')
const fs = require("fs")
const express = require('express')
const path = require('path')
const app = express()
const ngrok = require('ngrok')
const { Select, Input, Password } = require('enquirer');

/* Utils */

const getDirectories = path => fs.readdirSync(path).filter(file => fs.statSync(path+'/'+file).isDirectory())

const date = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

/* CLI */
const logo = fs.readFileSync("logo.ascii", {encoding: "utf-8"})                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
console.log(`\u001b[36;1m${logo}\u001b[0m`)

State = {posts: []}
 
const main = new Select({
  name: 'main',
  message: "Menu",
  choices: ['Create new server', 'Run server']
})

const new_board = async () => {
  let name = new Input({
    type: 'input',
    name: 'server name',
    message: 'Server name?',
    validate: name => !fs.existsSync(`servers/${name}`)
  })
  State.name = await name.run()

  let serverTitle = new Input({
    type: 'input',
    name: 'server title',
    message: 'Server title?'
  })
  State.title = await serverTitle.run()

  let serverDesc = new Input({
    type: 'input',
    name: 'server desc',
    message: 'Server description?'
  })
  State.desc = await serverDesc.run()

  fs.mkdirSync(`servers/${State.name}`)
  fs.writeFileSync(`servers/${State.name}/db.json`, JSON.stringify(State))
  runServer()
}

const run_server = async () => {
  let name = new Select({
    name: 'main',
    message: "Your servers:",
    choices: getDirectories("servers")
  })
  State.name = await name.run()
  runServer()
  runProxy()
}
 
main.run()
  .then(answer => {
    if(answer == 'Create new server') {
      new_board()
    }
    else {
      run_server()
    }
  })
  .catch(console.error);

/* Run Server */
function runServer() {
  app.use(express.json())

  app.get('/', (req, res) => {
    res.sendFile("index.html", {root: __dirname})
  })

  app.get('/about', (req, res) => {
    res.sendFile("about.html", {root: __dirname})
  })

  app.get('/favicon.svg', (req, res) => {
    res.sendFile("favicon.svg", {root: __dirname})
  })

  app.get('/css/retro.css', (req, res) => {
    res.sendFile("css/retro.css", {root: __dirname})
  })

  app.get('/js/:script', (req, res) => {
    res.sendFile("js/" + req.params.script, {root: __dirname})
  })

  app.get('/db', (req, res) => {
    res.sendFile(`/servers/${State.name}/db.json`, {root: __dirname})
  })

  app.post('/post', (req, res) => {
    let db = JSON.parse(fs.readFileSync(`servers/${State.name}/db.json`, {encoding: "utf-8"}))
    db.posts.push({msg: req.body.msg, time: date(), poster: req.body.poster})
    fs.writeFileSync(`servers/${State.name}/db.json`, JSON.stringify(db))
    res.status(200).send("Success!")
  })

  app.listen(8080)
}

/* Run Reverse Proxy */
async function runProxy() {
  console.log("Running...")
  let url = await ngrok.connect({addr: 8080})
  console.log(`Server "${State.name}" successufully launched!`)
  console.log(url)
}
