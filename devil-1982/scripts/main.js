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

modules.group.add(
    new THREE.HemisphereLight(0xffeeb1, 0x080820, 1)
)

// outline postprocessing
let outPass = TrinityEngine.createEffect(
    'Outline', modules.scene, modules.camera, modules.composer,
    { edgeStrength : 2, visibleEdgeColor : '#FFFFFF', enabled : true }
)

// setup controls
TrinityEngine.setupControls(
    'EXACT', modules.controls,
    { x : 0, y : 1.5, z : 0.0001 },
    { x : 0, y : 1.5, z : 0 },
    { maxPolarAngle : 1.8, minPolarAngle : 0.8, enableZoom : true }
)

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
    // mouseenter + highlight object
    TrinityEngine.createEvent('mouseenter', bbx, function(e) {
        outPass.selectedObjects = [bbx]
        modules.renderer.domElement.style.cursor = 'pointer'
    })
    // mouseleave + remove highlight object
    TrinityEngine.createEvent('mouseleave', bbx, function(e) {
        outPass.selectedObjects = []
        modules.renderer.domElement.style.cursor = 'default'
    })
    // click + focus object
    TrinityEngine.createEvent('click', bbx, toggleBoombox)
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

    // ground hover event
    TrinityEngine.createEvent('mousemove', ground, function(e) {
        if(!moving) {
            retical.visible = true
            retical.position.set(e.point.x, 0.04, e.point.z)
            retical.scale.set(1, 1, 1)
            retical.material.opacity = 0.2
            retical.material.needsUpdate = true
            modules.renderer.domElement.style.cursor = 'pointer'
        }
    })

    // ground hover event
    TrinityEngine.createEvent('mouseleave', ground, function(e) {
        if(!moving) {
            retical.position.set(e.point.x, -1, e.point.z)
            modules.renderer.domElement.style.cursor = 'default'
        }
    })

    window.addEventListener('mousedown', () => { if(!moving) { retical.visible = false } })
    window.addEventListener('mouseup', () => { if(!moving) { retical.visible = true } })

    modules.retical = retical
    modules.ground = ground

    // ground click event
    TrinityEngine.createEvent('click', ground, function(e, d) {
        // lock retical
        moving = true
        retical.visible = true
        // tween retical
        TrinityEngine.tweenObject(retical,
            { scale : { x : 3, y : 3, z : 3 } }, 500, 'power1',
            () => retical.visible = false
        )
        TrinityEngine.tweenMaterial('VALUE', retical, {
            opacity : 0
        }, 500, 'power1')
        // tween camera
        TrinityEngine.tweenControls('FIXED', modules.controls,  // type, controls
            { x : e.point.x, z : e.point.z },                   // new target pos
            e.distance * setup.ground.navigate.speed,           // duration
            setup.ground.navigate.function,                     // ease function
            () => {                                             // callback
                modules.controls.rotateSpeed = -0.3
                // unlock retical
                moving = false
                retical.scale.set(1, 1, 1)
                retical.material.opacity = 0.2
                retical.material.needsUpdate = true
                retical.visible = true
            }
        )
    })
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
    }, { visible : true, position : setup.audio.boombox.locate })
    modules.group.add(speaker)
    modules.speaker = speaker
    speaker.onEnded = function() { toggleBoombox() }
    speaker.add(boombox)
    setup.audio.boombox.context = boombox
}

let toggleBoombox = () => {
    if(setup.audio.boombox.context.isPlaying) {
        setup.audio.boombox.current++
        if(setup.audio.boombox.current === setup.audio.boombox.playlist.length) {
            setup.audio.boombox.current = 0
        }
        setup.audio.boombox.context.stop()
        setup.audio.boombox.context.setBuffer(
            setup.audio.boombox.playlist[setup.audio.boombox.current]
        )
    }
    setup.audio.boombox.context.play()
}

let createVideoTexture = source => {
    let video = document.createElement('video')
    video.loop = true
    video.muted = true
    video.autoplay = true
    video.src = source
    video.play()
    document.body.appendChild(video)
    return new THREE.VideoTexture(video)
}

let loadVideo = () => {

    let projector = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({
            color : '#555',
            map : createVideoTexture(setup.video.projector.source)
        })
    )

    TrinityEngine.setupObject(projector, {
        position : setup.video.projector.locate,
        scale : {
            x : setup.video.projector.locate.a,
            y : setup.video.projector.locate.b,
            z : 0.3,
        }
    })

    window.projector = projector
    TrinityEngine.checkTransform(projector)

    modules.group.add(projector)
}

let playCanvas = () => {
    // play audio contexts
    setup.audio.background.context.play()
    if(setup.audio.boombox.autoplay) { setup.audio.boombox.context.play() }
    // start render loop
    modules.renderer.setAnimationLoop(() => {
        modules.composer.render()
        modules.controls.update()
        if(modules.renderer.xr.isPresenting) {
            findXREvent()
            outPass.enabled = false
        } else {
            outPass.enabled = true
        }
    })
}






let tempMatrix = new THREE.Matrix4()
let raycaster = new THREE.Raycaster()

let xrmoving = false

let xrdata = { x : null, y : null, z : null, object : null }

let findXREvent = () => {
    tempMatrix.identity().extractRotation(modules.controller.matrixWorld)
    raycaster.ray.origin.setFromMatrixPosition(modules.controller.matrixWorld)
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix)
    const arr = raycaster.intersectObjects([modules.ground, modules.boombox], false)
    if(arr.length > 0) {
        if(arr[0].object) {
            let e = arr[0]
            // store controller data
            xrdata = {
                x : e.point.x,
                y : e.point.y,
                z : e.point.z,
                object : arr[0].object.name
            }
            // update retical position
            if(!xrmoving && arr[0].object.name === 'xrground') {
                modules.retical.visible = true
                modules.retical.position.set(e.point.x, 0.04, e.point.z)
                modules.retical.scale.set(0.5, 0.5, 0.5)
                modules.retical.material.opacity = 0.1
                modules.retical.material.needsUpdate = true
            }
        }
    } else {
        // lost ground contact
        if(!xrmoving) {
            modules.retical.position.set(0, -1, 0)
            xrdata = { x : null, y : null, z : null, object : null }
        }
    }
}

let onXRSelect = () => {
    if(xrdata.object === 'xrground') {
        modules.group.position.set(
            modules.group.position.x - xrdata.x,
            modules.group.position.y,
            modules.group.position.z - xrdata.z,
        )
    } else if(xrdata.object === 'Boombox') {
        toggleBoombox()
    }
}

window.addEventListener('load', () => {

    let controller = modules.renderer.xr.getController( 0 )

    // controller connect
    controller.addEventListener('connected', function (event) {
        modules.ring = buildController(event.data)
        this.add(modules.ring)
    })

    // controller disconnect
    controller.addEventListener('disconnected', function () {
        this.remove(modules.ring)
    })

    controller.addEventListener('selectstart', onXRSelect)

    modules.controller = controller
    modules.scene.add(controller)

    const controllerModelFactory = new XRControllerModelFactory()
    controllerGrip = modules.renderer.xr.getControllerGrip(0)
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip))
    modules.group.add(controllerGrip)

    // append vr button
    document.body.appendChild(VRButton.createButton(modules.renderer))
    modules.renderer.xr.enabled = true
})

function buildController( data ) {
    let geometry, material;
    switch (data.targetRayMode) {
        case 'tracked-pointer' :
            geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1 ], 3))
            geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0 ], 3))
            material = new THREE.LineBasicMaterial({ vertexColors : true, blending : THREE.AdditiveBlending })
            return new THREE.Line(geometry, material)
        case 'gaze' :
            geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate( 0, 0, - 1 )
            material = new THREE.MeshBasicMaterial({opacity : 0.5, transparent : true })
            return new THREE.Mesh(geometry, material)
    }
}