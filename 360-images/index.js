const orbitView = {
    speed : 0.12,
    index : 0
}

orbitView.load = () => {
    // preload each image
    let index = 0
    let load = () => {
        if(index < orbitView.images.length) {
            // load current imge
            // let img = new Image()
            // img.src = orbitView.images[index++]
            // img.addEventListener('load', load)
            // orbitView.loaded.push(img)

            var xhr = new XMLHttpRequest()
            xhr.onload = function() {
              var reader = new FileReader()
              reader.onloadend = function() {
                orbitView.loaded.push(reader.result)
                load()
              }
              reader.readAsDataURL(xhr.response)
            }
            xhr.open('GET', orbitView.images[index++])
            xhr.responseType = 'blob'
            xhr.send()



        } else {
            // end loading
            orbitView.view()
        }
    }
    // start loading
    orbitView.loaded = []
    load()
}

orbitView.view = () => {
    const root = document.querySelector('#orbitViewRoot')
    root.addEventListener('mousedown', orbitView.startEvent)
    root.addEventListener('touchstart', orbitView.startEvent)

    root.addEventListener('mouseleave', orbitView.stopEvent)
    root.addEventListener('mouseout', orbitView.stopEvent)
    root.addEventListener('touchend', orbitView.stopEvent)
    root.addEventListener('mouseup', orbitView.stopEvent)

    root.addEventListener('mousemove', orbitView.animate)
    root.addEventListener('touchmove', orbitView.animate)
    orbitView.setImage(0)
}

orbitView.getMovement = event => {
    return event.changedTouches ? event.changedTouches[0].clientX : event.clientX
}

orbitView.startEvent = event => {
    orbitView.point = orbitView.getMovement(event)
    orbitView.mdown = true
    console.log('START', orbitView.mdown, orbitView.point)
}

orbitView.stopEvent = event => {
    orbitView.mdown = false
    orbitView.point = orbitView.getMovement(event)
    console.log('END', orbitView.mdown, orbitView.point)
}

orbitView.animate = event => {
    if(orbitView.mdown) {
        console.log('RUN_1', orbitView.mdown, orbitView.point)
        let point = orbitView.getMovement(event)
        orbitView.index -= (point - orbitView.point) * orbitView.speed
        orbitView.setImage(orbitView.index)
        orbitView.point = point
    } else {
        console.log('RUN_0', orbitView.mdown, orbitView.point)
    }
}

orbitView.setImage = index => {
    // fix overflow
    while(index < 0) { index = orbitView.loaded.length + index }
    while(index >= orbitView.loaded.length) { index = index - orbitView.loaded.length }
    // set image
    const root = document.querySelector('#orbitViewRoot')
    root.style.backgroundSize = `100% auto`
    root.style.backgroundImage = `url(${orbitView.loaded[parseInt(index)]})`

   // root.appendChild(orbitView.loaded[parseInt(index)])
}





window.addEventListener('load', () => {
    fetch('./index.json').then(k => k.json()).then(k => {
        orbitView.images = k
        orbitView.load()
    })
})