!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).markdownItHtml5Media=e()}}(function(){return function(){return function e(t,r,o){function n(s,a){if(!r[s]){if(!t[s]){var l="function"==typeof require&&require;if(!a&&l)return l(s,!0);if(i)return i(s,!0);var d=new Error("Cannot find module '"+s+"'");throw d.code="MODULE_NOT_FOUND",d}var u=r[s]={exports:{}};t[s][0].call(u.exports,function(e){return n(t[s][1][e]||e)},u,u.exports,e,t,r,o)}return r[s].exports}for(var i="function"==typeof require&&require,s=0;s<o.length;s++)n(o[s]);return n}}()({1:[function(e,t,r){"use strict";const o=["aac","m4a","mp3","oga","ogg","wav"],n=["mp4","m4v","ogv","webm","mpg","mpeg"];let i={en:{"html5 video not supported":"Your browser does not support playing HTML5 video.","html5 audio not supported":"Your browser does not support playing HTML5 audio.","html5 media fallback link":'You can <a href="%s" download>download the file</a> instead.',"html5 media description":"Here is a description of the content: %s"}},s=function(e,t,r){if(i[e]&&i[e][t]||(e="en"),!i[e])return"";let o=i[e][t]||"";if(r)for(let e of r)o=o.replace("%s",e);return o};function a(e){const t=e.match(/\.([^\/.]+)$/);if(null===t)return"image";const r=t[1];return-1!=o.indexOf(r.toLowerCase())?"audio":-1!=n.indexOf(r.toLowerCase())?"video":"image"}t.exports={html5Media:function(e,t={}){t.messages&&(i=t.messages),t.translateFn&&(s=t.translateFn);const r=void 0!==t.videoAttrs?t.videoAttrs:'controls class="html5-video-player"',o=void 0!==t.audioAttrs?t.audioAttrs:'controls class="html5-audio-player"';e.inline.ruler.at("image",(t,r)=>(function(e,t,r){let o,n,i,s,l,d,u,c,p,f,m,h,g,v="",x=e.pos,w=e.posMax;if(33!==e.src.charCodeAt(e.pos)||91!==e.src.charCodeAt(e.pos+1))return!1;if(d=e.pos+2,(l=e.md.helpers.parseLinkLabel(e,e.pos+1,!1))<0)return!1;if((u=l+1)<w&&40===e.src.charCodeAt(u)){for(u++;u<w&&(n=e.src.charCodeAt(u),r.utils.isSpace(n)||10===n);u++);if(u>=w)return!1;for(g=u,(p=e.md.helpers.parseLinkDestination(e.src,u,e.posMax)).ok&&(v=e.md.normalizeLink(p.str),e.md.validateLink(v)?u=p.pos:v=""),g=u;u<w&&(n=e.src.charCodeAt(u),r.utils.isSpace(n)||10===n);u++);if(p=e.md.helpers.parseLinkTitle(e.src,u,e.posMax),u<w&&g!==u&&p.ok)for(f=p.str,u=p.pos;u<w&&(n=e.src.charCodeAt(u),r.utils.isSpace(n)||10===n);u++);else f="";if(u>=w||41!==e.src.charCodeAt(u))return e.pos=x,!1;u++}else{if(void 0===e.env.references)return!1;if(u<w&&91===e.src.charCodeAt(u)?(g=u+1,(u=e.md.helpers.parseLinkLabel(e,u))>=0?s=e.src.slice(g,u++):u=l+1):u=l+1,s||(s=e.src.slice(d,l)),!(c=e.env.references[r.utils.normalizeReference(s)]))return e.pos=x,!1;v=c.href,f=c.title}if(e.pos=u,e.posMax=w,t)return!0;i=e.src.slice(d,l),e.md.inline.parse(i,e.md,e.env,h=[]);const A=a(v),y="image"==A?"img":A;return(m=e.push(A,y,0)).attrs=o=[["src",v]],"image"==A&&o.push(["alt",""]),m.children=h,m.content=i,f&&o.push(["title",f]),e.pos=u,e.posMax=w,!0})(t,r,e)),e.renderer.rules.video=e.renderer.rules.audio=((t,n,i,a)=>(i.html5Media={videoAttrs:r,audioAttrs:o},function(e,t,r,o,n){const i=e[t],a=i.type;if("video"!==a&&"audio"!==a)return"";let l=r.html5Media[`${a}Attrs`].trim();l&&(l=" "+l);const d=i.attrs[i.attrIndex("src")][1];return`<${a} src="${d}"${-1!=i.attrIndex("title")?` title="${n.utils.escapeHtml(i.attrs[i.attrIndex("title")][1])}"`:""}${l}>\n`+`${s(o.language,`html5 ${a} not supported`)+"\n"+s(o.language,"html5 media fallback link",[d])}${i.content?"\n"+s(o.language,"html5 media description",[n.utils.escapeHtml(i.content)]):""}\n`+`</${a}>`}(t,n,i,a,e)))},messages:i,guessMediaType:a}},{}]},{},[1])(1)});