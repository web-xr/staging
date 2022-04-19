let orbitView = {
    scene : null,
    camera : null,
    renderer : null,
    controls : null,
    manual : false
}

orbitView.init = src => {
    // create components
    orbitView.scene = new THREE.Scene()
    orbitView.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000)
    orbitView.renderer = new THREE.WebGLRenderer({ antialias : true })
    orbitView.controls = new THREE.OrbitControls(
        orbitView.camera,
        orbitView.renderer.domElement
    )

    // directional light
    let dlight = new THREE.DirectionalLight(0xffffff, 0.4)
    dlight.position.set(150, 220, 0)
    dlight.castShadow = true
    dlight.shadow.mapSize.width = 1024
    dlight.shadow.mapSize.height = 1024
    dlight.shadow.radius = 20
    dlight.shadow.camera.near = 0.1
    dlight.shadow.camera.far = 1000
    orbitView.scene.add(dlight)

    // ambient light
    var alight = new THREE.AmbientLight(0x090909, 0.4)
    orbitView.scene.add(alight);

    // hemisphere light
    let hlight = new THREE.HemisphereLight(0x000000, 0x777777, 0.1)
    orbitView.scene.add(hlight)

    // renderer shadow setup
    orbitView.renderer.shadowMap.enabled = true
    orbitView.renderer.shadowMapSoft = true
    orbitView.renderer.shadowMap.type = THREE.PCFShadowMap

    // setup scene
    orbitView.scene.background = new THREE.Color(0xefefef)

    // setup controls
    orbitView.camera.position.set(12.312400, 9.950173, 11.120262)
    orbitView.controls.enableZoom  = false
    orbitView.controls.target.set(0, 4, 0)
    orbitView.controls.object.position.set(12.3124000, 9.9501732, 11.12026)
    orbitView.controls.autoRotate = true
    orbitView.controls.dampingFactor = 0.1
    orbitView.controls.autoRotateSpeed = 1
    orbitView.controls.enablePan = false
    orbitView.controls.maxPolarAngle = Math.PI / 2.2
    orbitView.controls.minPolarAngle = Math.PI / 2.2
    orbitView.controls.minAzimuthAngle = 0.2
    orbitView.controls.maxAzimuthAngle = Math.PI - 0.2

    // ground
    var ground = new THREE.Mesh(
        new THREE.CircleGeometry(200, 62),
        new THREE.MeshStandardMaterial({
            color : 0xffffff,
            transparent : true,
            opacity : 0.1
        })
    )
    ground.rotation.x = -0.5 * Math.PI
    ground.receiveShadow = true
    orbitView.scene.add(ground)

    // resize renderer and camera aspect
    window.addEventListener('resize', orbitView.size)
    orbitView.size()
    orbitView.load(src)
    orbitView.ctrl()
}

orbitView.size = () => {
    // get container dimensions
    let outer = document.querySelector('#orbit-view')
    let width = outer.getBoundingClientRect().width
    let height = outer.getBoundingClientRect().height
    // update renderer and camera aspect
    orbitView.renderer.setSize(width, height)
    orbitView.camera.aspect = width / height
    orbitView.camera.updateProjectionMatrix()
}

orbitView.load = src => {
    // render loop
    let render = () => {
        requestAnimationFrame(render)
        // rotate switch
        orbitView.swth()
        // update controls
        orbitView.controls.update()
        // render
        orbitView.renderer.render(
            orbitView.scene,
            orbitView.camera
        )
    }
    // load model
    new THREE.GLTFLoader().load(src, model => {
        if(model.scene) { model = model.scene }
        // texture map fix
        model.traverse(function(child) {
            if(child.isMesh) {
                child.material.emissive    = child.material.color
                child.material.emissiveMap = child.material.map
                child.castShadow = true
            }
        })
        // add mdoel to scene
        orbitView.scene.add(model)
        // append canvas
        let container = document.querySelector('#orbit-view-cnv')
        container.appendChild(orbitView.renderer.domElement)
        // delay time
        setTimeout(() => {
            container.style.opacity = 1
            // start loop
            render()
        }, 800)
    })
}

orbitView.ctrl = () => {
    let rt = (x, c) => {
        orbitView.manual = c
        orbitView.controls.autoRotateSpeed = x
        orbitView.controls.update()
    }
    // rotate buttons
    let bl = document.querySelector('#orbit-view-bl')
    let br = document.querySelector('#orbit-view-br')
    bl.addEventListener('mousedown', () => { rt(-20, true) })
    bl.addEventListener('mouseup', () => { rt(-1, false) })
    br.addEventListener('mousedown', () => { rt(20, true) })
    br.addEventListener('mouseup', () => { rt(1, false) })
}

orbitView.swth = () => {
    if(orbitView.manual === false) {
        let r = orbitView.camera.rotation.z
        if(r <= 0.07332187492432814) {
            orbitView.controls.autoRotateSpeed = -1
        } else if(r >= 3.068270778665465) {
            orbitView.controls.autoRotateSpeed = 1
        }
    }
}