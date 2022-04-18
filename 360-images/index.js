const orbitView = { mode : '360', index : 0, speed : 0.12 }

orbitView.showLoading = (array) => {
    const root = orbitView.element
    const load = root.querySelector('div')
    root.style.backgroundImage = `url(${array[orbitView.index]})`
    load.style.backgroundImage = `url(./media/spin.svg)`
    root.classList.add('orbitViewGray')
    orbitView.loading = true
}

orbitView.hideLoading = () => {
    const root = orbitView.element
    root.classList.remove('orbitViewGray')
    orbitView.loading = false
    orbitView.showDragger()
}

orbitView.showDragger = () => {
    const load = orbitView.element.querySelector('div')
    load.style.animationName = 'dragger'
    load.style.backgroundImage = 'url(./media/hand.svg)'
}

orbitView.hideDragger = () => {
    const root = orbitView.element
    const load = root.querySelector('div')
    load.style.animationName = 'none'
    load.style.backgroundImage = 'none'
}

orbitView.loadImages = array => {
    // return if already loading
    if(orbitView.loading) { return }
    // start loading
    orbitView.showLoading(array)
    // clear image history
    orbitView.data = []
    // current loading index
    let index = 0
    // image load method
    const loadImage = () => {
        if(index < array.length) {
            // load image
            const xhreq = new XMLHttpRequest()
            xhreq.onload = () => {
                // read using file reader
                const reader = new FileReader()
                reader.onloadend = () => {
                    orbitView.data.push(reader.result)
                    // load next image
                    setTimeout(loadImage, 3);
                }
                // read content as data url
                reader.readAsDataURL(xhreq.response)
            }
            // request in blob mode
            xhreq.open('GET', array[index++])
            xhreq.responseType = 'blob'
            xhreq.send()
        } else {
            // view first frame
            orbitView.viewFrame(orbitView.index)
            // end loading
            orbitView.hideLoading()
        }
    }
    loadImage()
}

orbitView.viewFrame = index => {
    // image array length
    const length = orbitView.data.length
    // round to array index
    if(orbitView.mode === '360') {
        while(index < 0) { index = length + index }
        while(index >= length) { index = index - length }
    } else {
        while(index < 0) { index =  orbitView.index = 0 }
        while(index >= length) { index =  orbitView.index = length - 1 }
    }
    const root = document.querySelector('#orbitViewRoot')
    root.style.backgroundImage = `url(${orbitView.data[parseInt(index)]})`
}

orbitView.getPosition = event => {
    return event.changedTouches ? event.changedTouches[0].clientX : event.clientX
}

orbitView.startRotate = event => {
    orbitView.hideDragger()
    orbitView.mdown = true
    orbitView.point = orbitView.getPosition(event)
}

orbitView.stopRotate = event => {
    orbitView.mdown = false
    orbitView.point = orbitView.getPosition(event)
}

orbitView.animateRotate = event => {
    if(orbitView.mdown) {
        let point = orbitView.getPosition(event)
        orbitView.index -= (point - orbitView.point) * orbitView.speed
        orbitView.viewFrame(orbitView.index)
        orbitView.point = point
    }
}
 
// mounted events
window.addEventListener('load', () => {
    const root = document.querySelector('#orbitViewRoot')
    // start rotate
    root.addEventListener('mousedown', orbitView.startRotate)
    root.addEventListener('touchstart', orbitView.startRotate)
    // animate rotate
    root.addEventListener('mousemove', orbitView.animateRotate)
    root.addEventListener('touchmove', orbitView.animateRotate)
    // end rotate
    root.addEventListener('mouseleave', orbitView.stopRotate)
    root.addEventListener('mouseout', orbitView.stopRotate)
    root.addEventListener('touchend', orbitView.stopRotate)
    root.addEventListener('mouseup', orbitView.stopRotate)

    orbitView.element = root
})