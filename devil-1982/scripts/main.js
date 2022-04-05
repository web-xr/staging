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

// setup controls
TrinityEngine.setupControls(
    'EXACT', modules.controls,
    { x : 0, y : 1.5, z : 0.0001 },
    { x : 0, y : 1.5, z : 0 },
    { maxPolarAngle : 1.8, minPolarAngle : 0.8, enableZoom : false }
)

// restore camera back to gl space
modules.renderer.xr.addEventListener('sessionend', () => {
    TrinityEngine.setupControls(
        'EXACT', modules.controls,
        { x : 0, y : 1.5, z : 0.0001 },
        { x : 0, y : 1.5, z : 0 },
        { maxPolarAngle : 1.8, minPolarAngle : 0.8, enableZoom : false }
    )
})

// =========================== retical and movements ===========================

let findSource = x => {
    if(x === null) {
        return null
    } else {
        return setup.preload.files[x.replace('preload.files.', '')]
    }
}

let calculateBound = obj => {
    return {
        left : -((obj.a / 2) - obj.x),
        right : (obj.a / 2) + obj.x,
        top : -((obj.b / 2) - obj.z),
        bottom : (obj.b / 2) + obj.z
    }
}

let checkInbound = (bounds, e) => {
    const b =  calculateBound(bounds)
    const x = e.point.x > b.left && e.point.x < b.right
    const z = e.point.z > b.top && e.point.z < b.bottom
    return x && z
}

let isMoving = false

let updateRetical = (e = null) => {
    let retical = modules.retical
    if(!isMoving && e !== null) {
        // reset retical
        retical.scale.set(1, 1, 1)
        retical.visible = true
        retical.material.opacity = 0.2
        // set position
        retical.position.set(e.point.x, 0.1, e.point.z)
        // blocked check
        if(checkInbound(setup.ground.locate, e)) {
            retical.material.color.r = 255
            retical.material.color.g = 255
            retical.material.color.b = 255
        } else {
            retical.material.color.r = 255
            retical.material.color.g = 0
            retical.material.color.b = 0
        }
        retical.material.needsUpdate = true
    } else {
        // animate retical in current position
        TrinityEngine.tweenObject(retical,
            { scale : { x : 3, y : 3, z : 3 } }, 500, 'power1',
            () => {
                retical.visible = false
            }
        )
        TrinityEngine.tweenMaterial('VALUE', retical,
            { opacity : 0 }, 500, 'power1'
        )
    }
}

let hideRetical = () => {
    modules.retical.visible = false
}

let teleportGL = e => {
    if(checkInbound(setup.ground.locate, e)) {
        isMoving = true
        updateRetical()
        TrinityEngine.tweenControls('FIXED', modules.controls,
            { x : e.point.x, z : e.point.z },
            e.distance * setup.ground.navigate.gl.speed.walk,
            setup.ground.navigate.gl.function,
            () => {
                modules.controls.rotateSpeed = -0.3
                modules.retical.visible = true
                isMoving = false
            }
        )
    }
}

let teleportXR = e => {
    if(checkInbound(setup.ground.locate, e)) {
        isMoving = true
        updateRetical()
        TrinityEngine.tweenControlsXR(modules.xr.controls,
            { x : e.point.x, y : modules.xr.controls.position.y, z : e.point.z },
            e.distance * setup.ground.navigate.xr.speed.walk,
            setup.ground.navigate.xr.function,
            () => {
                modules.retical.visible = true
                isMoving = false
            }
        )
    }
}

// =========================== boombox and playlist ===========================

let selectBoombox = () => {
    let box = modules.boombox
    box.material.color.r = 1.7
    box.material.color.g = 1.7
    box.material.color.b = 1.7
    modules.renderer.domElement.style.cursor = 'pointer'
}

let deselectBoombox = () => {
    let box = modules.boombox
    box.material.color.r = 0.800000011920929
    box.material.color.g = 0.800000011920929
    box.material.color.b = 0.800000011920929
    modules.renderer.domElement.style.cursor = 'default'
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
    const context = findSource(setup.audio.boombox.playlist[setup.audio.boombox.current])
    if(context !== null) {
        setup.audio.boombox.context.setBuffer(context)
        setup.audio.boombox.context.play()
    }
}

let checkBound = (method, value) => {
    const x = modules.xr.controls.position.x
    const z = modules.xr.controls.position.z
    const b = calculateBound(setup.ground.locate)
    modules.xr.controls[method](value)
    if(x < b.left) { modules.xr.controls.position.x = b.left }
    if(x > b.right) { modules.xr.controls.position.x = b.right }
    if(z < b.top) { modules.xr.controls.position.z = b.top }
    if(z > b.bottom) { modules.xr.controls.position.z = b.bottom }
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
    loadGround()
    loadModels()
    loadSounds()
}

let loadModels = () => {
    // setup warehouse
    let warehouse = findSource(setup.models.warehouse.source)
    TrinityEngine.setupObject(warehouse, setup.models.warehouse.locate)
    modules.group.add(warehouse)
    // setup boombox
    let bbx = TrinityEngine.findByName(warehouse, 'Boombox')
    modules.boombox = bbx
    modules.boombox.material.transparent = true



    // boombox select / deselect
    TrinityEngine.createEvent('mouseenter', bbx, selectBoombox)
    TrinityEngine.createEvent('mouseleave', bbx, deselectBoombox)
    TrinityEngine.createEventXR('device:xr-collide:start', bbx, selectBoombox)
    TrinityEngine.createEventXR('device:xr-collide:end', bbx, deselectBoombox)

    // boombox play event
    TrinityEngine.createEvent('click', bbx, toggleBoombox)
    TrinityEngine.createEventXR('button:x-button:start', bbx, toggleBoombox)
    TrinityEngine.createEventXR('button:a-button:start', bbx, toggleBoombox)

    loadTvBoxes()
}

let loadLights = () => {
    setup.colors.forEach(obj => {
        let mat = TrinityEngine.findByMaterialName(modules.group, obj.name)
        mat.color = obj.color
    })
    modules.light.intensity = setup.lights.ambient.intensity
    modules.hlight.intensity = setup.lights.hemisphere.intensity
}

let loadGround = () => {
    // create and add ground
    let ground = TrinityEngine.createObject({
        Box : [30, 0.28, 30],
        MeshBasic : { transparent : true, opacity : 0, color : 'red' }
    }, {
        position : { x : 0, y : 0, z : 0 },
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

    // xr axes navigate events
    TrinityEngine.createEventXR('x-axis:xr-standard-thumbstick', e => {
        let val = setup.ground.navigate.xr.speed.rotate * e['x-axis'] * -1
        modules.xr.controls.rotateY(val)
    })

    TrinityEngine.createEvent('mousemove', ground, updateRetical)
    TrinityEngine.createEvent('mouseleave', ground, hideRetical)
    TrinityEngine.createEventXR('device:xr-collide', ground, updateRetical)
    TrinityEngine.createEventXR('device:xr-collide:end', ground, hideRetical)

    TrinityEngine.createEvent('click', ground, teleportGL)
    TrinityEngine.createEventXR('button:a-button', ground, teleportXR, 'right')
    TrinityEngine.createEventXR('button:x-button', ground, teleportXR, 'left')

    modules.retical = retical
    modules.ground = ground
}

// audio listener
let listener = new THREE.AudioListener()
modules.camera.add(listener)

let loadSounds = () => {
    // background
    let background = new THREE.Audio(listener)
    background.setBuffer(findSource(setup.audio.background.source))
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
    speaker.onEnded = function() { toggleBoombox() }
    speaker.add(boombox)
    setup.audio.boombox.context = boombox
}

let loadTvBoxes = () => {
    setup.video.tvbox.displays.forEach(display => {
        let warehouse = findSource(setup.models.warehouse.source)
        let material = TrinityEngine.findByMaterialName(warehouse, display.name)
        material.map = findSource(display.source)
        material.needsUpdate = true
    })
    // tvsound
    let tvsound = new THREE.PositionalAudio(listener)
    tvsound.setBuffer(findSource(setup.video.tvbox.audio.source))
    tvsound.setRefDistance(setup.video.tvbox.audio.volume)
    tvsound.setLoop(true)
    // speaker of the tvsound
    let speaker = TrinityEngine.createObject({
        Box : [0.1, 0.1, 0.1],
        MeshBasic : { color : 'red' }
    }, { visible : true, position : setup.video.tvbox.audio.locate })
    modules.group.add(speaker)
    setup.video.tvbox.audio.context = tvsound
    speaker.add(tvsound)
    TrinityEngine.checkTransform(speaker)
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
    // play videos
    setup.video.tvbox.displays.forEach((display, index) => {
        const video = findSource(display.source).image
        video.loop = true
        if(index === 0) {
            video.addEventListener('play', () => {
                const audio = setup.video.tvbox.audio.context
                video.currentTime = 0
                audio.context.currentTime = 0
                audio.play()
            })
            video.addEventListener('ended', () => {
                const audio = setup.video.tvbox.audio.context
                video.currentTime = 0
                audio.context.currentTime = 0
                audio.play()
            })
        }
        video.play()
    })
    // start render loop
    modules.renderer.setAnimationLoop(() => {
        modules.composer.render()
        modules.controls.update()
        modules.xr.update()
        modules.tween.render()
    })
}