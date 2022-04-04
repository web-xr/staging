let setup = {}
let files = []

fetch('./setup.json').then(resp => resp.json()).then(obj => {
    // model files
    files = files.concat(Object.values(obj.models).map(x => x.source))
    // audio files
    files.push(obj.audio.background.source)
    files = files.concat(obj.audio.boombox.playlist.filter(x => x !== null))
    // store setup
    setup = obj
    loadLabels()
    loadFiles()
})

let loadLabels = () => {
    document.querySelector('.title_main').innerHTML = setup.loading.title.large
    document.querySelector('.title_auth').innerHTML = setup.loading.title.small
    document.querySelector('.parag_main').innerHTML = setup.loading.description.join('<br><br>')
    document.querySelector('.splash').style.backgroundImage = `url(${setup.loading.splash})`
    document.querySelector('#progress').style.display = 'block'
}

let loadFiles = () => {
    TrinityEngine.loadAll(files, () => {
        let index = 0
        // loaded model files
        Object.values(setup.models).forEach(obj => obj.source = files[index++])
        // loaded audio files
        setup.audio.background.source = files[index++]
        setup.audio.boombox.playlist = files.splice(index, setup.audio.boombox.playlist.length)
        // null index for mute
        setup.audio.boombox.playlist.push(null)
        // setup canvas before rendering
        loadCanvas(setup, files)
        loadScreen(setup.loading.total)
    }, loadScreen)
}

let loadScreen = crr => {
    eval(`console.log("LOADING...", ${crr})`)
    let e = document.querySelector('#progress')
    let w = e.getBoundingClientRect().width
    let s = w * (crr / setup.loading.total)
    e.style.boxShadow = `inset ${parseInt(s)}px 0px 0px rgba(255,255,255,0.3)`
    if(crr === setup.loading.total) {
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
        let d = document.querySelector('.details')
        d.style.left = 'calc(-40vw - 10px)'
        let m = document.querySelector('#loading')
        m.style.opacity = 0
        setTimeout(() => {
            m.style.display = 'none'
        }, 1020)
    }, 20)
}