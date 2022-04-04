let que = function(e) { return document.querySelector(e); }
let api = new BloggerAPI('791479127391728969');
let crr = 1;
let len = 10;
let url = window.location.toString().split('index=')[1];
if(url) { crr = parseInt(url.split('&')[0].split('#')[0]); }

if(crr === 1) { len = 11; }

let obj = null;

api.requestSummaryList((crr - 1) * len, len, function(dat) {
    if(dat.feed.entry === undefined) {
        window.location = '../blog/';
        return;
    } else { obj = dat; }
});

window.addEventListener('load', function() {
    // url-lang buttons
    document.querySelectorAll('*[url-lang]').forEach(function(e) {
        e.addEventListener('click', function(e) {
            window.location = e.target.getAttribute('url-lang');
        });
    });
});

window.addEventListener('load', function() {
    // build items
    let out = '';

    if(crr > 1) {
        out += `<div class="BlogItem BlogItemMoreBack" onclick="newPosts()">`;
        out += '<div class="BlogItemTitle BlogItemTitleMore">Newer posts...</div>';
        out += '</div>';
    }


    obj.feed.entry.forEach(function(itm) {
        let img = '';
        if(itm.author[0].gd$image) { img = itm.author[0].gd$image.src; }
        let pid = itm.id.$t.split('-').pop();
        out += `<div class="BlogItem" onclick="openBlogPost('`+ pid +`')">`;
        out += '<div class="BlogItemTitle">'+ itm.title.$t +'</div>';
        out += '<div class="BlogItemText">'+ itm.summary.$t +'</div>';
        out += '<div class="BlogItemAuth" ';
        out += 'style="background-image: url('+ img +');">';
        out += '</div>';
        out += '<div class="BlogItemAuthName">';
        out += itm.author[0].name.$t +'<br>'+ itm.updated.$t.split('T')[0];
        out += '</div>';
        out += '</div>';
    });

    // hide load button
    if(obj.feed.entry.length === len) {
        out += `<div class="BlogItem BlogItemMoreNext" onclick="oldPosts()">`;
        out += '<div class="BlogItemTitle BlogItemTitleMore">Older posts...</div>';
        out += '</div>';
    }

    que('.listBody').innerHTML = '<center>' + out + '</center>';
});

function openBlogPost(id) {
    window.location = 'post.html?id=' + id;
};

function newPosts() {
    window.location = '?index=' + (crr - 1);
}

function oldPosts() {
    window.location = '?index=' + (crr + 1);
}