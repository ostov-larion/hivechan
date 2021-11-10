(async() => {

if(!localStorage.poster) {
    localStorage.poster = Math.floor(Math.random() * 1000000)
}
if(!localStorage.bl) {
    localStorage.bl = "[]"
}

if(!localStorage.autoupdate) {
    localStorage.autoupdate = "off"
}

document.getElementById("au-switch").innerText = `Autoupdate ${localStorage.autoupdate == "on" ? "On" : "Off"}`

switchAutoupdate = () => {
    let au = document.getElementById("au-switch")
    if(localStorage.autoupdate == "off") {
        localStorage.autoupdate = "on"
        au.innerText = "Autoupdate On"
        startTimer()
    }
    else {
        localStorage.autoupdate = "off"
        au.innerText = "Autoupdate Off"
        stopTimer()
    }
}

startTimer = () => {
    timer = setInterval(async () => {let oldDB = db; await update(); npi(oldDB)}, 60 * 1000)
}

stopTimer = () => {
    clearInterval(timer)
}

if(localStorage.autoupdate == "on") startTimer()

document.getElementById("theme-switch").innerText = `Make it ${localStorage.theme == "dark" ? "light" : "dark"}`

let md = markdownIt({
    html:     false,
    xhtmlOut: false,
    breaks:   false,
    linkify:  true,
    })
    .use(markdownItSpoiler)
    .use(markdownItHtml5Media.html5Media, {
        videoAttrs: "preload=metadata",
        audioAttrs: "preload=metadata"
    })

let post = (msg, files, num, time) =>
    `<div class="post">
        <b>Anonymous</b> <a name="${num}" onclick="linkClick(${num})">#${num}</a> <span style="color: gray">${time}</span> <a onclick="mute(${num})">Mute!</a>
        ${files ? "<br>" + files.map(file => {
            if(file[1]?.match(/audio.*/))
                return `<audio src="${file[0]}" preload="metadata"></audio>`
            if(file[1]?.match(/video.*/))
                return `<video src="${file[0]}" preload="metadata"></video>`
            else return `<img src="${file[0]}"></img>`
        }).join(' ') : ""}
        ${md.render(msg)}
    </div>`

let renderPosts = posts => document.querySelector("main").innerHTML =
    posts.map(({msg, time, poster, files}, num) => JSON.stringify(localStorage.bl).includes(poster) ? "<div class='post'>(Скрыт)</div>" : post(msg, files, num, time)).join("")

update = async() => {
    db = await (await fetch("https://hivechan.herokuapp.com/db", {method: "GET", 'cors': 'no-cors'})).json()
    renderPosts(db)
    document.querySelectorAll("img").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.naturalWidth/2},height=${img.naturalHeight/2}, left=500, top=300`))
    document.querySelectorAll("video").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.videoWidth},height=${img.videoHeight}`))
}

uploadFiles = async () => {
    let cids = []
    let prgs = 0
    let files = document.getElementById("files").files
    let status = document.getElementById("status")
    let updateStatus = () => status.innerText = files.length != 0 ? `${prgs}/${files.length} uploaded` : ''
    updateStatus()
    for await (let file of files) {
        let cid = await (await fetch("https://api.web3.storage/upload", {
            method: "POST",
            headers: {
                'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGYyMzc3ZDI2YUFFNDdFNDY0NmZFNTVmMDgzMzdlOWQ4Qzk1OUY5YzkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MzYzOTYxNTE0MDIsIm5hbWUiOiJoaXZlY2hhbiJ9.r4Ylo3MGJ9P5ickaWwKWNv8waCTrxgGqxVojBb0yWvA",
                'Content-Type': file.type,
            },
            body: file
        })).json()
        console.log(cid)
        cids.push([cid.cid, file.type])
        prgs++
        updateStatus()
    }
    document.getElementById("files").value = ''
    status.innerText = ""
    return cids.map(([cid, type]) => [`https://ipfs.io/ipfs/${cid}`, type])
}

uploadPost = async msg => {
    let files = await uploadFiles()
    await update()
    fetch("https://hivechan.herokuapp.com/post", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({msg, files, poster: localStorage.poster})
    }).then(() => update())
}

mute = n => {
    localStorage.bl = JSON.stringify(JSON.parse(localStorage.bl).concat([db[n].poster]))
    update()
}

unmute = () => {
    localStorage.bl = "[]"
    update()
}

selection = ""

window.onmousedown = () => {
    selection = window.getSelection().toString()
}

linkClick = num => {
    let value = document.querySelector('textarea').value
    document.querySelector('textarea').value += `${value == "" ? "" : "\n"}[#${num}](#${num})\n> ${selection}\n\n`
}

let debug = msg => console.log(msg) || true

send = () => {
    if(document.querySelector("textarea").value == "" && document.getElementById("files").files.length == 0){
        document.getElementById("status").innerText = "Нельзя отправлять пустые сообщения."
        return false
    }
    uploadPost(document.querySelector("textarea").value)
    document.querySelector("textarea").value = ""
    document.getElementById('pin-files').innerText = "Pin files"
}

openStorageWindow = () => {
    window.open("storage.html","Storage",'width=600,height=400')
}

npi = oldDB => {
    let np = db.length - oldDB.length
    if(np != 0) document.querySelector("title").innerText = `Hivechan | ${np} new posts`
    window.onfocus = () => document.querySelector("title").innerText = "Hivechan"
}

await update()

})()
