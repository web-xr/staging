let loadAll = function() {
    var args = _args(arguments)
    var files = args.obj[0]
    var callback = args.fun[0] || function() {}
    var progress = args.fun[1] || function() {}
    var loaddata = { mngr : 0 }

    if(loadAll.isBusy === true) { return }
    loadAll.isBusy = true

    // prepare
    Object.keys(files).forEach(function(key) {
        var type = loadAll.getFileType(files[key])
        files[key] = { wait : true, path : files[key].split('#')[0] }
        files[key].type = 'load' + type[0] + type.substring(1).toLowerCase()
        files[key].extn = type
        loaddata[files[key].path] = 0
    })
    // manager callback
    loadAll.manager.onProgress = function(u, n) {
        loaddata.mngr = n
        setTimeout(check, 10)
    }
    
    // checker
    function check() {
        var ready = true
        var count = 0
        Object.keys(files).forEach(function(name) {
            if(files[name].wait === true) { ready = false }
        })
        Object.values(loaddata).forEach(function(x) { count += x })
        progress(count)
        if(ready && loadAll.isBusy) {
            callback(files)
            loadAll.isBusy = false
        }
    }

    // load
    Object.keys(files).forEach(function(name) {
        var type = files[name].type
        var path = files[name].path
        TrinityEngine[type](path, function(resp) {
            var extn = files[name].extn
            if(extn !== 'MODEL' && extn !== 'TEXTURE') {
                loaddata[files[name]] = 1
            }
            files[name] = resp
            setTimeout(check, 10)
        })
    })
}

loadAll.isBusy  = false
loadAll.manager = new THREE.LoadingManager()

loadAll.getFileType = function(url) {
    var type = 'AJAX', ext
    if(url.indexOf('#') > -1) {
        // manual
        ext = url.split('#')[1].toUpperCase()
        var arr = ['MODEL', 'TEXTURE', 'IMAGE', 'BITMAP', 'AJAX', 'AUDIO']
        if(arr.indexOf(ext) > -1) { type = ext }
    } else {
        // auto
        ext = url.split('.').pop().toLowerCase()
        var e_1 = ['glb', 'gltf', 'fbx', 'obj', 'ply']
        var e_2 = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
        var e_3 = ['ogg', 'mp3', 'wav']
        var e_4 = ['mp4', 'avi', 'mpg', '3gp']
        if(e_1.indexOf(ext) > -1) { type = 'MODEL' }
        if(e_2.indexOf(ext) > -1) { type = 'TEXTURE' }
        if(e_3.indexOf(ext) > -1) { type = 'AUDIO' }
        if(e_4.indexOf(ext) > -1) { type = 'VIDEO' }
    }
    return type
}

let loadImage = function() {
    var args = _args(arguments)
    var file     = args.str[0]
    var callback = args.fun[0] || function() {}

    var image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = function() { callback(image) }
    image.src = file
}

let loadBitmap = function() {
    var args = _args(arguments)
    var file     = args.str[0]
    var callback = args.fun[0] || function() {}

    new THREE.ImageBitmapLoader().load(file, function(bitmap) {
        callback(bitmap)
    })
}

let loadModel = function() {
    var args = _args(arguments)
    var file     = args.str[0]
    var callback = args.fun[0] || function() {}
    // get extension
    var ext = file.split('.').pop().toLowerCase()
    // select loader
    var loader
    if(ext === 'obj') {

        var mtlfile = file.substr(0, file.lastIndexOf('.obj')) + '.mtl'

        var mtlload = new LOADERS.MTLLoader(loadAll.manager)
        loader      = new LOADERS.OBJLoader(loadAll.manager)

        mtlload.load(mtlfile, function(materials) {
            materials.preload()
            loader.setMaterials(materials)
            loader.load(file, function(model) {
                model.traverse(function(child) {
                    if(child.isMesh) {
                        child.material.opacity = 1
                        child.material.emissive    = child.material.color
                        child.material.emissiveMap = child.material.map
                    }
                })
                callback(model)
            })
        })
        return

    } else if(ext === 'glb' || ext === 'gltf') {
        loader  = new LOADERS.GLTFLoader(loadAll.manager)
    } else if(ext === 'fbx') {
        loader = new LOADERS.FBXLoader(loadAll.manager)
    } else if(ext === 'ply') {
        loader = new LOADERS.PLYLoader(loadAll.manager)
    } else { callback(null) }
    // load and callback
    loader.load(file, function(model) {
        if(model.scene) { model = model.scene }
        // texture map fix
        model.traverse(function(child) {
            if(child.isMesh) {
                child.material.emissive    = child.material.color
                child.material.emissiveMap = child.material.map
            }
        })
        // return
        callback(model)
    })
}

let loadTexture = function() {
    var args = _args(arguments)
    var file     = args.str[0]
    var width    = args.num[0] || 0
    var height   = args.num[1] || 0
    var callback = args.fun[0] || function() {}
    // texture loader
    return new THREE.TextureLoader(loadAll.manager).load(file, function(tex) {
        // pattern texture
        if(width !== 0 || height !== 0) {
            tex.wrapS = THREE.RepeatWrapping
            tex.wrapT = THREE.RepeatWrapping
            tex.repeat.set(width, height)
        }
        // return
        callback(tex)
    })
}

let loadAjax = function() {
    var args = _args(arguments)
    var url = args.str[0]
    var obj = args.obj[0] || { a : 1 }
    var fun = args.fun[0] || function() {}

	if(url.indexOf('?') === -1) { url += '?dnjs_ajax_t=' + Date.now() }
	else { url += '&dnjs_ajax_t=' + Date.now() }

	var frm = new FormData()
	Object.keys(obj).forEach(function(key) {
		var dat = obj[key]
		if(typeof dat === 'object') { dat = JSON.stringify(dat) }
		frm.append(key, dat)
	})

	var xhr = new XMLHttpRequest()
	xhr.open('GET', url, true)
    xhr.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            if(fun != null) {fun(this.responseText) }
        }
    }

	xhr.send(frm)

}

let loadAudio = function() {
    var args = _args(arguments)
    var file     = args.str[0]
    var callback = args.fun[0] || function() {}

    new THREE.AudioLoader(loadAll.manager).load(file, function(buffer) {
        callback(buffer)
    })
}

let loadVideo = function() {
    var args = _args(arguments)
    var file     = args.str[0]
    var autoplay = args.boo[0] || false
    var callback = args.fun[0] || function() {}

    let video = document.createElement('video')
    video.addEventListener('loadstart', () => {
        callback(new THREE.VideoTexture(video))
    })
    video.style.display = 'none'
    video.load = true
    video.muted = true
    video.src = file
    if(autoplay) {
        video.autoplay = autoplay
        video.play()
    }
    document.documentElement.appendChild(video)
}

// ============================================================================

TrinityEngine.loadAll = loadAll
TrinityEngine.loadAjax = loadAjax
TrinityEngine.loadImage = loadImage
TrinityEngine.loadBitmap = loadBitmap
TrinityEngine.loadModel = loadModel
TrinityEngine.loadTexture = loadTexture
TrinityEngine.loadAudio = loadAudio
TrinityEngine.loadVideo = loadVideo