let createScene = function() {
    var args = _args(arguments)
    var width  = args.num[0] || window.innerWidth
    var height = args.num[1] || window.innerHeight
    var color  = args.str[0] || null
    var auto   = args.boo[0]
    var pref   = args.str[1] || "high-performance"
    // modules
    var scene    = new THREE.Scene()
    var camera   = new THREE.PerspectiveCamera(45, width / height, 0.2, 500)
    var renderer = new THREE.WebGLRenderer({
        alpah : true,
        antialias : true,
        powerPreference: pref
    })
    var controls = new CONTROLS.OrbitControls(camera, renderer.domElement)
    var light    = TrinityEngine.createLight('AMBIENT', 0xffffff)
    // post processing
    var composer   = new POSTPROCESSING.EffectComposer(renderer)
    var renderPass = new POSTPROCESSING.RenderPass(scene, camera)
    composer.addPass(renderPass)
    composer.setSize(width, height)
    scene.add(light)

    // setup
    color ? scene.background = new THREE.Color(color)
          : renderer.setClearColor(0x000000, 0)
    controls.enablePan       = false
    controls.autoRotate      = false
    controls.autoRotateSpeed = 0.8
    controls.enableDamping   = true
    controls.dampingFactor   = 0.1
    renderer.setSize(width, height)
    TrinityEngine.setupControls(
        'EXACT', controls,
        { x : 0, y : 1.5, z : 0.0001 },
        { x : 0, y : 1.5, z : 0 },
        { maxPolarAngle : 1.8, minPolarAngle : 0.8, enableZoom : false }
    )

    let modules = {
        scene      : scene,
        camera     : camera,
        renderer   : renderer,
        controls   : controls,
        composer   : composer,
        renderPass : renderPass,
        light      : light,
        tween      : { render : __TE__.Tween.render },
        xr         : null
    }

    TrinityEngine._glob.modules = modules
    modules.xr = TrinityEngine.xr.init()

    // render
    if(auto !== false) {
        renderer.setAnimationLoop(() => {
            composer.render()
            controls.update()
            modules.xr.update()
            modules.tween.render()
        })
    }

    // user events init
    createEvent.listen(modules)

    // return
    return modules
}

// ==========================================================================

let createEffect = function() {
    var args = _args(arguments)
    var name     = args.str[0].toUpperCase()
    var scene    = args.obj[0]
    var camera   = args.obj[1]
    var composer = args.obj[2]
    var renderer = composer.renderer
    var options  = args.obj[3] || {}

    var pass
    var w = composer.renderer.domElement.width
    var h = composer.renderer.domElement.height
    // select pass
    if(name === 'OUTLINE') {
        pass = new POSTPROCESSING.OutlinePass(new THREE.Vector2(w, h), scene, camera)
    } else if(name === 'SSR') {
        pass = new POSTPROCESSING.SSRPass({
            renderer,
            scene,
            camera,
            width : w,
            height : h
        })
    } else if(name === 'SSAO') {
        pass = new POSTPROCESSING.SSAOPass(scene, camera, w, h)
    } else if(name === 'UNREALBLOOM') {
        pass = new POSTPROCESSING.UnrealBloomPass({
            renderer,
            scene,
            camera,
            width : w,
            height : h
        })
    } else {
        return null
    }
    // options
    Object.keys(options).forEach(function(opt) {
        if(opt === 'visibleEdgeColor') {
            pass[opt].set(options[opt])
        } else {
            pass[opt] = options[opt]
        }
    })

    composer.addPass(pass)
    return pass
}

// ==============================================================================

let createEvent = function() {
    var args = _args(arguments)
    var type     = args.str[0]
    var object   = arguments[1]
    var callback = args.fun[0]

    if(Array.isArray(object) === false) {
        object = [object]
    }

    var arr = createEvent.list
    object.forEach(function(obj) {
        if(arr[type]) {
            if(arr[type][obj.uuid] === undefined) {
                arr[type][obj.uuid] = []
            }
            arr[type][obj.uuid].push(callback)
        }
    })

}

createEvent.list = {
    'click'      : {},
    'mousedown'  : {},
    'mouseup'    : {},
    'mousemove'  : {},
    'mouseenter' : {},
    'mouseleave' : {}
}

createEvent.down = false

createEvent.last = { object : {} }

createEvent.listen = function(modules) {
    let u = createEvent
    let cnv = modules.renderer.domElement
    cnv.addEventListener('mousedown', function(e) {
        u.down = true
        // mousedown
        var obj = createEvent.cast(e, modules)
        if(obj === null) { return }
        else { createEvent.callback('mousedown', obj, e) }
    })
    cnv.addEventListener('mousemove', function(e) {
        u.down = false
        if(u.down === false) {
            // mousemove
            var obj = createEvent.cast(e, modules)
            if(obj === null) { return }
            else {
                createEvent.callback('mousemove', obj, e)
                if(u.last.object.uuid !== obj.object.uuid) {
                    // mouseleave
                    createEvent.callback('mouseleave', u.last, e)
                    u.last = obj
                    // mouseenter
                    createEvent.callback('mouseenter', obj, e)
                }
            }
        }
    })
    cnv.addEventListener('mouseup', function(e) {
        if(u.down) {
            // click
            var obj = createEvent.cast(e, modules)
            if(obj === null) { return }
            else { createEvent.callback('click', obj, e) }
        }
        u.down = false
    })
}

createEvent.cast = function(event, modules) {
    // positions
    let xy = new THREE.Vector2()
    xy.x = +(event.clientX /  window.innerWidth) * 2 - 1
    xy.y = -(event.clientY / window.innerHeight) * 2 + 1
    // raycaster
    let caster = new THREE.Raycaster()
    caster.setFromCamera(xy, modules.camera)
    let arr = TrinityEngine.findByType(modules.scene, 'Mesh', true)
    let out = caster.intersectObjects(arr)
    if(out.length > 0) {
        return out[0]
    } else { return null }
}

createEvent.callback = function(type, data, event) {
    var uuid = data.object.uuid
    var list = createEvent.list[type]
    if(list[uuid] === undefined) { return }
    else {
        list[uuid].forEach(function(f) { f(data, event) })
    }
}

// ==========================================================================

let createObject = function() {
    var args = _args(arguments)
    var data = args.obj[0] || {}
    var opts = args.obj[1]

    var grr = [
        'Box',
        'Circle',
        'Cone',
        'Cylinder',
        'Dodecahedron',
        'Edges',
        'Extrude',
        'Icosahedron',
        'Lathe',
        'Octahedron',
        'Parametric',
        'Plane',
        'Polyhedron',
        'Ring',
        'Shape',
        'Sphere',
        'Tetrahedron',
        'Text',
        'Torus',
        'TorusKnot',
        'Tube',
        'Wireframe'
    ]

    var mrr = [
        'LineBasic',
        'LineDashed',
        'MeshBasic',
        'MeshDepth',
        'MeshDistance',
        'MeshLambert',
        'MeshMatcap',
        'MeshNormal',
        'MeshPhong',
        'MeshPhysical',
        'MeshStandard',
        'MeshToon',
        'Points',
        'RawShader',
        'Shader',
        'Shadow',
        'Sprite'
    ]

    var g = null, m = null
    Object.keys(data).forEach(function(key) {
        if(grr.indexOf(key) > -1) { g = key }
        if(mrr.indexOf(key) > -1) { m = key }
    })
    if(g === null || m === null) { return }

    var vrr = Object.values(data[g])

    g += 'Geometry'

    var geo
    if(vrr.length === 0) {
        geo = new THREE[g]()
    } else if(vrr.length === 1) {
        geo = new THREE[g](vrr[0])
    } else if(vrr.length === 2) {
        geo = new THREE[g](vrr[0], vrr[1])
    } else if(vrr.length === 3) {
        geo = new THREE[g](vrr[0], vrr[1], vrr[2])
    } else if(vrr.length === 4) {
        geo = new THREE[g](vrr[0], vrr[1], vrr[2], vrr[3])
    } else if(vrr.length === 5) {
        geo = new THREE[g](vrr[0], vrr[1], vrr[2], vrr[3], vrr[5])
    }

    var mat = new THREE[m + 'Material'](data[m])

    var mesh = new THREE.Mesh(geo, mat)
    if(opts) { mesh = TrinityEngine.setupObject(mesh, opts) }
    return mesh
}

let createLight = function() {
    var args = _args(arguments)
    var type  = args.str[0] || 'DIRECT'
    var color = args.num[0] || 0xffffff
    var power = args.num[1] || 1
    var light
    if(type === 'DIRECT') {
        light = new THREE.DirectionalLight(color, power)
    } else if(type === 'AMBIENT') {
        light = new THREE.AmbientLight(color, power)
    }
    return light
}

// ==========================================================================

TrinityEngine.createScene = createScene
TrinityEngine.createEffect = createEffect
TrinityEngine.createEvent = createEvent
TrinityEngine.createLight = createLight
TrinityEngine.createObject = createObject