let setupObject = function() {
    var args = _args(arguments)
    var objs = args.obj[0]
    var data = args.obj[1]
    if(Array.isArray(objs) === false) { objs = [objs]  }

    var orr = ['position', 'rotation', 'scale']

    objs.forEach(function(obj) {
        Object.keys(data).forEach(function(key) {
            if(orr.indexOf(key) > -1) {
                if(data[key].x !== undefined) { obj[key].x = data[key].x }
                if(data[key].y !== undefined) { obj[key].y = data[key].y }
                if(data[key].z !== undefined) { obj[key].z = data[key].z }
            } else {
                obj[key] = data[key]
            }
        })
    })

    if(objs.length === 1) { return objs[0] }
    else { return objs }
}

let setupMaterial = function() {
    var args = _args(arguments)
    var mats = args.obj[0]
    var data = args.obj[1]
    var txar = [
        'map', 'emissiveMap', 'aoMap', 'bumpMap', 'displacementMap',
        'normalMap', 'roughnessMap'
    ]
    if(Array.isArray(mats) === false) { mats = [mats]  }
    mats.forEach(function(mat) {
        Object.keys(data).forEach(function(key) {
            if(txar.indexOf(key) > -1 && typeof data[key] === 'string') {
                mats[key] = TrinityEngine.loadTexture(data[key])
            } else {
                mats[key] = data[key]
            }
        })
    })

    if(mats.length === 1) { return mats[0] }
    else { return mats }
}

let setupScene = function() {
    var args = _args(arguments)
    var composer = args.obj[0]
    var camera   = args.obj[1]
    var width    = args.num[0]
    var height   = args.num[1]
    composer.setSize(width, height)
    composer.renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
}

let setupControls = function() {
    var args = _args(arguments)
    var type     = args.str[0].toUpperCase()
    var controls = args.obj[0]
    var target, position, options
    // pivot controls
    if(type === 'SHOOT') {
        position = args.obj[1] || { x : 0, y : 0, z : 0 }
        options  = args.obj[2] || {}

        controls.target.set(
            position.x,
            position.y,
            position.z
        )
        controls.object.position.set(
            position.x,
            position.y,
            position.z + 0.01
        )
        controls.enableZoom  = false
        controls.rotateSpeed = -0.3
    }
    // pivot controls
    if(type === 'ORBIT') {
        position = args.obj[1] || { x : 0, y : 0, z : 0 }
        target   = args.obj[2] || { x : 0, y : 0, z : 0 }
        options  = args.obj[3] || {}

        controls.target.set(
            target.x,
            target.y,
            target.z
        )
        controls.object.position.set(
            position.x,
            position.y,
            position.z
        )
        controls.enableZoom  = true
        controls.rotateSpeed = 1
    }
    // exact controls
    if(type === 'EXACT') {
        position = args.obj[1] || { x : 0, y : 0, z : 0 }
        target   = args.obj[2] || { x : 0, y : 0, z : 0 }
        options  = args.obj[3] || {}

        controls.target.set(
            target.x,
            target.y,
            target.z
        )
        controls.object.position.set(
            position.x,
            position.y,
            position.z
        )
        controls.enableZoom  = false
        controls.rotateSpeed = -0.3
    }

    // manual props
    Object.keys(options).forEach(function(opt) {
        controls[opt] = options[opt]
    })
}

// ============================================================================

TrinityEngine.setupControls = setupControls
TrinityEngine.setupObject = setupObject
TrinityEngine.setupScene = setupScene
TrinityEngine.setupMaterial = setupMaterial