// screen dimensions
let width = window.innerWidth
let height = window.innerHeight

// three modules without auto rendering
let modules = TrinityEngine.createScene(width, height, false)

// create group
modules.group = new THREE.Group()
modules.scene.add(modules.group)

// reduce quality and ambient intensity
modules.renderer.setPixelRatio(window.devicePixelRatio * 0.8)
modules.light.intensity = 0.6

// add hemisphere light
modules.group.add(new THREE.HemisphereLight(0xffeeb1, 0x080820, 1))

// setup controls
TrinityEngine.setupControls(
    'EXACT', modules.controls,
    { x : 0, y : 1.5, z : 0.0001 },
    { x : 0, y : 1.5, z : 0 },
    { maxPolarAngle : 1.8, minPolarAngle : 0.8, enableZoom : false }
)

modules.renderer.xr.addEventListener('sessionend', () => {
    TrinityEngine.setupControls(
        'EXACT', modules.controls,
        { x : 0, y : 1.5, z : 0.0001 },
        { x : 0, y : 1.5, z : 0 },
        { maxPolarAngle : 1.8, minPolarAngle : 0.8, enableZoom : false }
    )
})

let boundL = 0
let boundR = 0
let boundT = 0
let boundB = 0

let loadBoundData = () => {
    const groundX = setup.ground.locate.x
    const groundZ = setup.ground.locate.z
    const groundA = setup.ground.locate.a
    const groundB = setup.ground.locate.b
    boundL = -((groundA / 2) - groundX)
    boundR = (groundA / 2) + groundX
    boundT = -((groundB / 2) - groundZ)
    boundB = (groundB / 2) + groundZ
}

let checkBound = (method, value) => {
    const x = modules.xr.controls.position.x
    const z = modules.xr.controls.position.z
    modules.xr.controls[method](value)
    if(x < boundL) { modules.xr.controls.position.x = boundL }
    if(x > boundR) { modules.xr.controls.position.x = boundR }
    if(z < boundT) { modules.xr.controls.position.z = boundT }
    if(z > boundB) { modules.xr.controls.position.z = boundB }
}

// screen resize setup
window.addEventListener('resize', function() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    TrinityEngine.setupScene(modules.composer, modules.camera, w, h)
})

// append canvas onload
window.addEventListener('load', () => {
    document.body.appendChild(modules.renderer.domElement)
})

let loadCanvas = (setup_in, files_in) => {
    setup = setup_in
    files = files_in
    loadBoundData()
    loadGround()
    loadModels()
    loadLights()
    loadSounds()
    loadVideo()
}

let loadModels = () => {
    // setup warehouse
    let obj = setup.models.warehouse
    TrinityEngine.setupObject(obj.source, obj.locate)
    modules.group.add(obj.source)
    // setup boombox
    let bbx = TrinityEngine.findByName(obj.source, 'Boombox')
    modules.boombox = bbx
    modules.boombox.material.transparent = true

    let selectBoombox = () => {
        bbx.material.color.r = 2
        bbx.material.color.g = 2
        bbx.material.color.b = 2
        modules.renderer.domElement.style.cursor = 'pointer'
    }

    let deselectBoombox = () => {
        bbx.material.color.r = 0.800000011920929
        bbx.material.color.g = 0.800000011920929
        bbx.material.color.b = 0.800000011920929
        modules.renderer.domElement.style.cursor = 'default'
    }

    // boombox select / deselect
    TrinityEngine.createEvent('mouseenter', bbx, selectBoombox)
    TrinityEngine.createEvent('mouseleave', bbx, deselectBoombox)
    TrinityEngine.createEventXR('device:xr-collide:start', bbx, selectBoombox)
    TrinityEngine.createEventXR('device:xr-collide:end', bbx, deselectBoombox)

    // boombox play event
    TrinityEngine.createEvent('click', bbx, toggleBoombox)
    TrinityEngine.createEventXR('button:x-button:start', bbx, toggleBoombox)
    TrinityEngine.createEventXR('button:a-button:start', bbx, toggleBoombox)
}

let loadLights = () => {
    setup.lights.forEach(obj => {
        let light = new THREE.PointLight(obj.color, obj.intensity, obj.distance)
        light.position.set(obj.locate.x, obj.locate.y, obj.locate.z)
        window.light = light
        modules.group.add(light)
    })
}

let loadGround = () => {
    // create and add ground
    let ground = TrinityEngine.createObject({
        Box : [setup.ground.locate.a, 0.09, setup.ground.locate.b],
        MeshBasic : { transparent : true, opacity : 0, color : 'red' }
    }, {
        position : { x : setup.ground.locate.x, y : 0, z : setup.ground.locate.z },
        visible : false, name : 'xrground'
    })
    modules.group.add(ground)
    
    // retical
    let retical = TrinityEngine.createObject({
        Circle : [0.2, 100],
        MeshBasic : { color : '#FFF', transparent : true, opacity : 0.2 }
    }, {
        position : { x : 0, y : -1, z : 3 },
        rotation : { x : -Math.PI / 2, y : 0, z : 0 }
    })
    modules.scene.add(retical)

    let moving = false

    let showRetical = e => {
        if(!moving) {
            retical.visible = true
            retical.position.set(e.point.x, 0.04, e.point.z)
            retical.scale.set(1, 1, 1)
            retical.material.opacity = 0.2
            retical.material.needsUpdate = true
            modules.renderer.domElement.style.cursor = 'pointer'
        }
    }

    let hideRetical = e => {
        if(!moving) {
            retical.position.set(e.point.x, -1, e.point.z)
            modules.renderer.domElement.style.cursor = 'default'
        }
    }

    let playRetical = () => {
        moving = true
        retical.visible = true
        TrinityEngine.tweenObject(retical,
            { scale : { x : 3, y : 3, z : 3 } }, 500, 'power1',
            () => retical.visible = false
        )
        TrinityEngine.tweenMaterial('VALUE', retical, {
            opacity : 0
        }, 500, 'power1')
    }

    let unlockRetical = () => {
        moving = false
        retical.scale.set(1, 1, 1)
        retical.material.opacity = 0.2
        retical.material.needsUpdate = true
        retical.visible = true
    }

    // xr axes navigate events
    TrinityEngine.createEventXR('x-axis:xr-standard-thumbstick', e => {
        if(moving) { return }
        let val = setup.ground.navigate.xr.speed.rotate * e['x-axis'] * -1
        modules.xr.controls.rotateY(val)
    })

    // show / hide for pointing on ground
    TrinityEngine.createEvent('mousemove', ground, showRetical)
    TrinityEngine.createEvent('mouseleave', ground, hideRetical)
    
    window.addEventListener('mousedown', () => { if(!moving) { retical.visible = false } })
    window.addEventListener('mouseup', () => { if(!moving) { retical.visible = true } })


    // ground click event
    TrinityEngine.createEvent('click', ground, function(e, d) {
        playRetical()
        // tween camera
        TrinityEngine.tweenControls('FIXED', modules.controls,  // type, controls
            { x : e.point.x, z : e.point.z },                   // new target pos
            e.distance * setup.ground.navigate.gl.speed.walk,   // duration
            setup.ground.navigate.gl.function,                  // ease function
            () => {                                             // callback
                modules.controls.rotateSpeed = -0.3
                unlockRetical()
            }
        )
    })



    TrinityEngine.createEventXR('button:a-button', ground, e => {
        if(moving) { return }
        moving = true
        TrinityEngine.tweenControlsXR(modules.xr.controls,
            { x : e.point.x, y : modules.xr.controls.position.y, z : e.point.z },
            e.distance * setup.ground.navigate.xr.speed.walk,
            setup.ground.navigate.xr.function,
            () => { moving = false }
        )
    })
    

    TrinityEngine.createEventXR('button:x-button', ground, e => {
        if(moving) { return }
        moving = true
        TrinityEngine.tweenControlsXR(modules.xr.controls,
            { x : e.point.x, y : modules.xr.controls.position.y, z : e.point.z },
            e.distance * setup.ground.navigate.xr.speed.walk,
            setup.ground.navigate.xr.function,
            () => { moving = false }
        )
    })

    modules.retical = retical
    modules.ground = ground
}

let loadSounds = () => {
    // audio listener
    let listener = new THREE.AudioListener()
    modules.camera.add(listener)
    // background
    let background = new THREE.Audio(listener)
    background.setBuffer(setup.audio.background.source)
    background.setVolume(setup.audio.background.volume)
    background.setLoop(setup.audio.background.loop)
    setup.audio.background.context = background
    // boombox
    let boombox = new THREE.PositionalAudio(listener)
    boombox.setBuffer(setup.audio.boombox.playlist[setup.audio.boombox.current])
    boombox.setRefDistance(setup.audio.boombox.volume)
    // speaker of the boombox
    let speaker = TrinityEngine.createObject({
        Box : [0.1, 0.1, 0.1],
        MeshBasic : { color : 'red' }
    }, { visible : false, position : setup.audio.boombox.locate })
    modules.group.add(speaker)
    modules.speaker = speaker
    speaker.onEnded = function() { toggleBoombox() }
    speaker.add(boombox)
    setup.audio.boombox.context = boombox
}

let toggleBoombox = () => {
    // get next context index
    setup.audio.boombox.current++
    if(setup.audio.boombox.current === setup.audio.boombox.playlist.length) {
        setup.audio.boombox.current = 0
    }
    // stop if playing
    if(setup.audio.boombox.context.isPlaying) {
        setup.audio.boombox.context.stop()
    }
    // get context
    const context = setup.audio.boombox.playlist[setup.audio.boombox.current]
    if(context !== null) {
        setup.audio.boombox.context.setBuffer(context)
        setup.audio.boombox.context.play()
    }
}

let createVideoTexture = source => {
    let video = document.createElement('video')
    video.loop = true
    video.muted = true
    video.autoplay = true
    video.src = source
    video.play()
    document.body.appendChild(video)
    let texture = new THREE.VideoTexture(video)
    texture.anisotropy = 0.001
    return texture
}

let loadVideo = () => {
    // tv boxes
    let tvmap = createVideoTexture(setup.video.tvbox.source)
    setup.video.tvbox.displays.forEach((position, i) => {
        let tvbox = TrinityEngine.createObject({
            Box : [1, 1, 1],
            MeshBasic : { color : '#EEE', map : tvmap }
        }, position)
        modules.scene.add(tvbox)
        if(i === 0) {
            TrinityEngine.checkTransform(tvbox)
            window.tvbox = tvbox
        }
    })
}

let playCanvas = () => {
    // append vr button
    document.body.appendChild(modules.xr.button)
    // play background audio
    setup.audio.background.context.play()
    // play boombox audio
    if(setup.audio.boombox.autoplay) {
        setup.audio.boombox.context.play()
    }
    // start render loop
    modules.renderer.setAnimationLoop(() => {
        modules.composer.render()
        modules.controls.update()
        modules.xr.update()
        modules.tween.render()
    })
}