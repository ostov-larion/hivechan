(async() => {

if(!localStorage.poster) {
    localStorage.poster = Math.floor(Math.random() * 1000000)
}
if(!localStorage.bl) {
    localStorage.bl = "[]"
}

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

const date = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

let post = (msg, files, num, time) =>
    `<div class="post">
        <b>Anonymous</b> <a name="${num}" onclick="document.querySelector('textarea').value += '\\n[#${num}](#${num})'">#${num}</a> <span style="color: gray">${time}</span> <a onclick="mute(${num})">Mute!</a>
        ${files ? "<br>" + files.map(file => {
            if(file[1].match(/audio.*/))
                return `<audio src="${file[0]}" preload="metadata"></audio>`
            if(file[1].match(/video.*/))
                return `<video src="${file[0]}" preload="metadata"></video>`
            else return `<img src="${file[0]}"></img>`
        }).join(' ') : ""}
        ${md.render(msg)}
    </div>`

let renderPosts = posts => document.querySelector("main").innerHTML =
    posts.map(({msg, time, poster, files}, num) => JSON.stringify(localStorage.bl).includes(poster) ? "<div class='post'>(Скрыт)</div>" : post(msg, files, num, time)).join("")

update = async() => {
    db = await (await fetch("https://api.jsonstorage.net/v1/json/c6ad7afd-b319-4909-8b41-bc5c6491bd1e", {method: "GET"})).json()
    renderPosts(db)
    document.querySelectorAll("img").forEach(img => img.onclick = () => window.open(img.src,img.alt,`width=${img.naturalWidth/2},height=${img.naturalHeight/2}`))
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
            body: JSON.stringify([...db, {msg, files, time: date(), poster: localStorage.poster}])
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

let debug = msg => console.log(msg) || true

send = () => {
    uploadPost(document.querySelector("textarea").value)
    document.querySelector("textarea").value = ""
}

openStorageWindow = () => {
    window.open("storage.html","Storage",'width=600,height=400')
}

await update()

})()
