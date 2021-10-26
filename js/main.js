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
    .use(markdownItHtml5Media.html5Media)


let post = (msg, num, time) => 
    `<div class="post">
        <b>Anonymous</b> <a name="${num}" onclick="document.querySelector('textarea').value += '\\n[#${num}](#${num})'">#${num}</a> <span style="color: gray">${time}</span> <a onclick="mute(${num})">Mute!</a>
        ${md.render(msg)}
    </div>`

let renderPosts = posts => document.querySelector("main").innerHTML = 
    posts.map(({msg, time, poster}, num) => JSON.stringify(localStorage.bl).includes(poster) ? "<div class='post'>(Скрыт)</div>" : post(msg, num, time)).join("")

update = async() => {
    db = await (await fetch("/db", {method: "GET"})).json()
    renderPosts(db.posts)
    document.querySelectorAll("img").forEach(img => img.onclick = () => window.open(img.src,img.alt,'width=600,height=400'))
}

uploadPost = msg => 
    fetch("/post", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({msg, poster: localStorage.poster})
    }).then(() => update())

mute = n => {
    localStorage.bl = JSON.stringify(JSON.parse(localStorage.bl).concat([db.posts[n].poster]))
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

document.querySelector("header").innerHTML = `<h1>${db.title}</h1>`
document.querySelector("title").innerText = db.title + " | Hivechan"
document.querySelector("dl").innerHTML = `<i>${db.desc}</i>` ?? ""

})()