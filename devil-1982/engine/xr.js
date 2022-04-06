TrinityEngine.xr = {}

TrinityEngine.createEventXR = function() {
    let args = _args(arguments)
    let type = args.str[0].split(':')
    let objs = args.obj[0] || null
    let func = args.fun[0] || function() {}
    let hand = args.str[1] || 'any'
    // listeners object
    let list = TrinityEngine._glob.modules.xr.listeners
    // types
    let input = type[0]
    let component = type[1]
    let mode = type[2] || 'ongoing'
    // init new listerner type
    if(list[component] === undefined) { list[component] = [] }
    // store listerner
    list[component].push({
        component : component,
        type : input,
        mode : mode,
        touch : mode.indexOf('touch') > -1,
        object : objs,
        collide : false,
        callback : func,
        handedness : hand
    })
}

TrinityEngine.xr.init = () => {
    let modules = TrinityEngine._glob.modules
    // setup dolly camera
    let dolly = new THREE.Group()
    let camera = modules.camera
    dolly.add(camera)
    modules.scene.add(dolly)
    modules.renderer.xr.getCamera(camera)
    // toggle cameras
    let camHistory = new THREE.Vector3()
    modules.renderer.xr.addEventListener('sessionstart', () => {
        // backup gl cam position
        modules.camera.position.copy(camHistory)
        modules.controls.enabled = false
    })
    modules.renderer.xr.addEventListener('sessionend', () => {
        // restore gl cam position
        camHistory.copy(modules.camera.position)
        modules.controls.enabled = true
    })
    // enable xr
    modules.renderer.xr.enabled = true

    // build controllers
    const controllerModelFactory = new XRControllerModelFactory()

    // attributes
    let position = new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1 ], 3)
    let color = new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0 ], 3)
    // geometry
    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', position)
    geometry.setAttribute('color', color)
    // material
    let material = new THREE.LineBasicMaterial({
        vertexColors : true,
        blending : THREE.AdditiveBlending
    })
    // line mesh
    const line = new THREE.Line(geometry, material)

    const controllers = []

    for (let i = 0; i < 2; i++) {
        const controller = modules.renderer.xr.getController(i)
        controller.add(line.clone())
        controller.userData.selectPressed = false
        controller.userData.selectPressedPrev = false
        dolly.add(controller)
        controllers.push(controller)
        const grip = modules.renderer.xr.getControllerGrip(i)
        grip.add(controllerModelFactory.createControllerModel(grip))
        dolly.add(grip)
    }

    // load profile list
    let path = app.locator + '@webxr-input-profiles/assets/dist/profiles/profilesList.json'
    fetch(path).then(resp => resp.json()).then(obj => {
        TrinityEngine._glob.xr.profilesList = obj
    })

    return {
        camera : camera,
        controls : dolly,
        inputs : controllers,
        button : VRButton.createButton(modules.renderer),
        update : TrinityEngine.xr.update,
        listeners : {}
    }
}

let fetchXRProfile = profiles => {
    let list = TrinityEngine._glob.xr.profilesList
    // profile list not loaded yet
    if(list === undefined) { return false }
    for(let i = 0; i < profiles.length; i++) {
        let id = profiles[i]
        let data = list[id]
        if(data && data.loading === true) {
            // profile is loading
            return false
        } else if(data && data.data === undefined) {
            // profile not loaded yet
            data.loading = true
            let path = app.locator + '@webxr-input-profiles/assets/dist/profiles/' + data.path
            fetch(path).then(resp => resp.json()).then(obj => {
                data.data = obj
                data.loading = false
            })
            return false
        } else if(data && data.data) {
            // profile is loaded
            return data.data
        } else {
            // profile not found
            return false
        }
    }
    return false
}

TrinityEngine.xr.update = () => {
    let modules = TrinityEngine._glob.modules
    // return if no xr session
    if(modules.renderer.xr.isPresenting === false) { return }
    // return if no listeners
    if(Object.keys(modules.xr.listeners).length === 0) { return }
    // get input source profile
    let session = modules.renderer.xr.getSession()
    let sources = session.inputSources
    sources.forEach(source => {
        let profile = fetchXRProfile(source.profiles)
        if(profile) { checkXREventListeners(source, profile) }
    })
}

let checkXREventListeners = (source, profile) => {
    let modules = TrinityEngine._glob.modules
    let hand = source.handedness
    let struct = profile.layouts[hand].components
    let listenGroups = modules.xr.listeners
    let history = checkXREventListeners.history
    // init history handedness
    if(history[hand] === undefined) { history[hand] = {} }


    let record = {}
    Object.keys(listenGroups).forEach(component => {
        let structCompo = struct[component]
        let gamepadType = null
        let gamepadIndx = null
        let gamepadData = null
        if(structCompo) {
            if(structCompo.type === 'thumbstick') {
                // x and y axes + button
                gamepadType = 'buttons'
                gamepadIndx = structCompo.gamepadIndices.button
                gamepadData = source.gamepad[gamepadType][gamepadIndx]
                record[component] = {
                    pressed : gamepadData.pressed,
                    touched : gamepadData.touched,
                    value : gamepadData.value,
                    'x-axis' : source.gamepad['axes'][structCompo.gamepadIndices['x-axis']],
                    'y-axis' : source.gamepad['axes'][structCompo.gamepadIndices['y-axis']]
                }
                // init history values
                if(history[hand][component] === undefined) {
                    history[hand][component] = {
                        pressed : false,
                        touched : false,
                        value : 0,
                        'x-axis' : 0,
                        'y-axis' : 0
                    }
                }
            } else {
                // controller buttons
                gamepadType = 'buttons'
                gamepadIndx = structCompo.gamepadIndices.button
                gamepadData = source.gamepad[gamepadType][gamepadIndx]
                record[component] = {
                    pressed : gamepadData.pressed,
                    touched : gamepadData.touched,
                    value : gamepadData.value
                }
                // init history values
                if(history[hand][component] === undefined) {
                    history[hand][component] = {
                        pressed : false,
                        touched : false,
                        value : 0
                    }
                }
            }
        }
    })

    let call = checkXREventListeners.callback

    Object.keys(listenGroups).forEach(component => {
        let old = history[hand][component]
        let now = record[component]
        listenGroups[component].forEach(listener => {
            if(listener.type === 'device') { call(listener, hand, now) }
            if(old) {
                if(listener.type === 'button') {
                    if(now.pressed) { activeXRHand = hand }
                    if(listener.touch) {
                        if(!old.touched && now.touched && listener.mode === 'start') {
                            call(listener, hand, now)
                        } else if(old.touched && now.touched && listener.mode === 'ongoing') {
                            call(listener, hand, now)
                        } else if(old.touched && !now.touched && listener.mode === 'end') {
                            call(listener, hand, now)
                        }
                    } else {
                        if(!old.pressed && now.pressed && listener.mode === 'start') {
                            call(listener, hand, now)
                        } else if(old.pressed && now.pressed && listener.mode === 'ongoing') {
                            call(listener, hand, now)
                        } else if(old.pressed && !now.pressed && listener.mode === 'end') {
                            call(listener, hand, now)
                        }
                    }
                } else if(listener.type === 'x-axis') {
                    if(now['x-axis'] !== 0) {
                        activeXRHand = hand
                        call(listener, hand, now)
                    }
                } else if(listener.type === 'y-axis') {
                    if(now['y-axis'] !== 0) {
                        activeXRHand = hand
                        call(listener, hand, now)
                    }
                }
            }
        })
    })

    if(activeXRHand === 'right') {
        TrinityEngine._glob.modules.boombox.rotation.z = 0
    } else {
        TrinityEngine._glob.modules.boombox.rotation.z = 0
    }

    // store record in history
    history[hand] = JSON.parse(JSON.stringify(record))
}

checkXREventListeners.history = {}

checkXREventListeners.checkCollide = (listener, controllerIndex) => {
    let modules = TrinityEngine._glob.modules
    let controller = modules.xr.inputs[controllerIndex]
    let matrix4 = new THREE.Matrix4()
    let raycaster = new THREE.Raycaster()
    matrix4.identity().extractRotation(controller.matrixWorld)
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(matrix4)
    let arr = raycaster.intersectObjects([listener.object], false)
    return arr[0]
}


let activeXRHand = 'right'

checkXREventListeners.callback = (listener, hand, data = {}) => {
    let modules = TrinityEngine._glob.modules

    if(listener.object) {
        let collide = null
        let old = listener.collide
        let now = null

        if(activeXRHand === hand && listener.component === 'xr-collide') {
            let k = hand === 'right' ? 0 : 1
            collide = checkXREventListeners.checkCollide(listener, k)
            now = collide !== undefined
            if(listener.handedness === 'any' || listener.handedness === hand) {
                if(!old && now && listener.mode === 'start') {
                    listener.callback(collide)
                } else if(old && now && listener.mode === 'ongoing') {
                    listener.callback(collide)
                } else if(old && !now && listener.mode === 'end') {
                    listener.callback(collide)
                }
                listener.collide = now
            }
        }

        if(activeXRHand === hand && listener.component !== 'xr-collide') {
            let k = hand === 'right' ? 0 : 1
            collide = checkXREventListeners.checkCollide(listener, k)
            if(collide !== undefined) { listener.callback(collide) }
        }

    } else {
        if(listener.handedness === hand || listener.handedness === 'any')
        listener.callback(data)
    }

}