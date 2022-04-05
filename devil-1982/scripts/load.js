let qs = x => document.querySelector(x)

let setup = {}

fetch('./setup.json').then(resp => resp.json()).then(obj => {
    setup = obj
    loadLabels()
    loadFiles()
})

let loadLabels = () => {
    qs('.title_main').innerHTML = setup.welcome.title.large
    qs('.title_auth').innerHTML = setup.welcome.title.small
    qs('.parag_main').innerHTML = setup.welcome.description.join('<br><br>')
    qs('.splash').style.backgroundImage = `url(${setup.welcome.splash})`
    qs('#progress').style.display = 'block'
}

let loadFiles = () => {
    TrinityEngine.loadAll(setup.preload.files, obj => {
        // replace materials

        // non-array material update
        setup.materials.forEach(name => {
            let mesh = TrinityEngine.findByName(obj.warehouse, name)
            let nmat = new THREE.MeshBasicMaterial()
            nmat.name = mesh.material.name
            nmat.map = obj[name]
            mesh.material = nmat
            mesh.material.needsUpdate = true
        })

        Object.keys(setup.materials_array).forEach(name => {
            let mesh = TrinityEngine.findByName(obj.warehouse, name)
            setup.materials_array[name].forEach((matname, i) => {
                let nmat = new THREE.MeshBasicMaterial()
                nmat.name = mesh.material[i].name
                nmat.map = obj[matname]
                mesh.material[i] = nmat
                mesh.material.needsUpdate = true
            })
        })

        loadCanvas(setup)
        loadScreen(setup.preload.count)
    }, loadScreen)
}

let loadScreen = crr => {
    eval(`console.log("LOADING...", ${crr})`)
    let e = qs('#progress')
    let w = e.getBoundingClientRect().width
    let s = w * (crr / setup.preload.count)
    e.style.boxShadow = `inset ${parseInt(s)}px 0px 0px rgba(255,255,255,0.3)`
    if(crr === setup.preload.count) {
        setTimeout(() => {
            e.style.height = '5vw'
            e.style.backgroundColor = '#a10d0d'
            setTimeout(() => {
                e.innerHTML = 'CLICK TO START'
                e.style.color = '#FFF'
                e.style.cursor = 'pointer'
                e.style.boxShadow = `inset ${parseInt(s)}px 0px 0px rgba(255,255,255,0)`
                e.addEventListener('click', endLoading)
            }, 100)
        }, 800)
    }
}

let endLoading = () => {
    playCanvas()
    setTimeout(() => {
        let d = qs('.details')
        d.style.left = 'calc(-40vw - 10px)'
        let m = qs('#loading')
        m.style.opacity = 0
        setTimeout(() => {
            m.style.display = 'none'
        }, 1020)
    }, 20)
}