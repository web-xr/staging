/**
 *  BloggerAPI v1.0 by Deshan Nawanjana
 *  https://dnjs.info/
 *  deshan.nawanjana@arimaclanka.com
 *  Copyright © 2021 Deshan Nawanjana <dnjs.info@gmail.com>
**/

function BloggerAPI(blogId) {

    this.blogId = blogId;

    this.request = function(url, callback) {
        // create random callback id
        let cid = 'api_' + Date.now()
                + Math.floor(Math.random() * Date.now());
        // setup callback
        window[cid] = function(data) {
            // callback data
            callback(data);
            // remove callback
            delete window[cid];
        };
        // add callback to url
        url += '&callback=' + cid;
        // create script element
        let e = document.createElement('script');
        e.setAttribute('src', url);
        e.onerror = function() { window[cid](null); }
        document.head.appendChild(e);
    };

    this.requestDefaultList = function() {
        let args = BloggerAPI._args(arguments);
        // prepare values
        let startIndex = args.num[0] || 0;
        let maxResults = args.num[1] || 100;
        let callback   = args.fun[0] || function() {};
        // create url
        let url = 'https://www.blogger.com/feeds/'
                + this.blogId + '/posts/default/'
                + '?start-index=' + (startIndex + 1)
                + '&max-results=' + maxResults
                + '&alt=json-in-script';
        // request url
        this.request(url, callback);
    };

    this.requestSummaryList = function() {
        let args = BloggerAPI._args(arguments);
        // prepare values
        let startIndex = args.num[0] || 0;
        let maxResults = args.num[1] || 100;
        let callback   = args.fun[0] || function() {};
        // create url
        let url = 'https://www.blogger.com/feeds/'
                + this.blogId + '/posts/summary/'
                + '?start-index=' + (startIndex + 1)
                + '&max-results=' + maxResults
                + '&alt=json-in-script';
        // request url
        this.request(url, callback);
    };

    this.requestDefault = function(postId, callback) {
        // create url
        let url = 'https://www.blogger.com/feeds/'
                + this.blogId + '/posts/default/'
                + postId + '?alt=json-in-script';
        // request url
        this.request(url, callback);
    };

    this.requestSummary = function(postId, callback) {
        // create url
        let url = 'https://www.blogger.com/feeds/'
                + this.blogId + '/posts/summary/'
                + postId + '?alt=json-in-script';
        // request url
        this.request(url, callback);
    };

};

BloggerAPI._args = function(arr) {
	var out = { "obj" : [], "str" : [], "num" : [], "fun" : [], "boo" : [] };
	if(arr === undefined) { return out; }
	for(var i = 0; i < arr.length; i++) {
		var arg = arr[i];
		var typ = (typeof arg).substr(0, 3);
		if(out[typ] === undefined) { out[typ] = []; }
		out[typ].push(arg);
	}
	return out;
};