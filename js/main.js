(async() => {

let hash = str => Array.from(str).reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0)

localStorage.poster = hash(JSON.stringify({ua: navigator.userAgent, lang: navigator.language, screen: [screen.width, screen.height], touch: navigator.maxTouchPoints}))

if(!localStorage.bl) {
    localStorage.bl = "[]"
}

if(!localStorage.autoupdate) {
    localStorage.autoupdate = "off"
}

let page = 0;
location.hash = ""

const date = () => new Date().toUTCString()

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
        <div class="answers">${md.render(db.map((post, i) => [post, i]).filter(post => post[0].msg.indexOf(`[#${num}](#${num})`) > -1).map(post => `[#${post[1]}](#${post[1]})`).join(' '))}</div>
    </div>`

let db

let renderPosts = (posts, pages) => document.querySelector("main").innerHTML =
    posts.map(({msg, time, poster, files}, num) => JSON.stringify(localStorage.bl).includes(poster) ? "<div class='post'>(??????????)</div>" : post(msg, files, ((pages - page - 1) * 500) + num, time)).join("")

update = async() => {
    db = await (await fetch("https://api.jsonstorage.net/v1/json/c6ad7afd-b319-4909-8b41-bc5c6491bd1e", {method: "GET"})).json()
    let pages = chunk(db, 500).reverse()
    let pg = pages[page]
    renderPosts(pg, pages.length)
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
fetch("https://api.jsonstorage.net/v1/json/c6ad7afd-b319-4909-8b41-bc5c6491bd1e?apiKey=8fb8b49c-e22c-4c05-84a5-caee09624a9d", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([...db, {msg: msg, files: files, time: date(), poster: localStorage.poster, n: db.length}])
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
    document.querySelector('textarea').value += `${value == "" ? "" : "\n"}[#${num}](#${num})${selection != "" ? `\n> ${selection}\n` : ""}\n`
    document.querySelector("textarea").style.display = "block"
    document.getElementById("wrap").innerText = "Wrap form"
    document.getElementById("content").style["max-height"] = "55%"
    document.getElementById("content").scrollTop += document.getElementById("form").clientHeight
    location.href = "#" + num
}

let debug = msg => console.log(msg) || true

send = () => {
    if(document.querySelector("textarea").value == "" && document.getElementById("files").files.length == 0){
        document.getElementById("status").innerText = "???????????? ???????????????????? ???????????? ??????????????????."
        return false
    }
    uploadPost(document.querySelector("textarea").value)
    document.querySelector("textarea").value = ""
    document.getElementById('pin-files').innerText = "Pin files"
}

openStorageWindow = () => {
    window.open("storage.html","Storage",'width=600,height=400')
}

wrapForm = () => {
    if(document.querySelector("textarea").style.display != "none") {
        document.querySelector("textarea").style.display = "none"
        document.getElementById("wrap").innerText = "Unwrap form"
        document.getElementById("content").style["max-height"] = "85%"
    }
    else {
        document.querySelector("textarea").style.display = "block"
        document.getElementById("wrap").innerText = "Wrap form"
        document.getElementById("content").style["max-height"] = "55%"
    }
}

chunk = (arr, perChunk) =>
    arr.reduce((all,one,i) => {
       const ch = Math.floor(i/perChunk);
       all[ch] = [].concat((all[ch]||[]),one);
       return all
    }, [])

npi = oldDB => {
    let np = db.length - oldDB.length
    if(np != 0) document.querySelector("title").innerText = `Hivechan | ${np} new posts`
    window.onfocus = () => document.querySelector("title").innerText = "Hivechan"
}

window.onhashchange = () => {
    let p = Number(location.hash.match(/#page:([0-9]+)/)?.[1])
    if(p && p < chunk(db, 500)) {
        page = p
        renderPosts(db)
        document.querySelectorAll("img").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.naturalWidth/2},height=${img.naturalHeight/2}, left=500, top=300`))
        document.querySelectorAll("video").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.videoWidth},height=${img.videoHeight}`))
    }
}

prevPage = () => {
        location.href = `#page:${page++}`
        let pages = chunk(db, 500).reverse()
        let pg = pages[page]
        renderPosts(pg, pages.length)
        document.querySelectorAll("img").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.naturalWidth/2},height=${img.naturalHeight/2}, left=500, top=300`))
        document.querySelectorAll("video").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.videoWidth},height=${img.videoHeight}`))
}

nextPage = () => {
    if(page > 0) {
        location.href = `#page:${page--}`
        let pages = chunk(db, 500).reverse()
        let pg = pages[page]
        renderPosts(pg, pages.length)
        document.querySelectorAll("img").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.naturalWidth/2},height=${img.naturalHeight/2}, left=500, top=300`))
        document.querySelectorAll("video").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.videoWidth},height=${img.videoHeight}`))
        }
}

await update()

})()
