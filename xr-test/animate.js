let animate = data => {
    // execeptions
    if(typeof data.onStart !== 'function') { data.onStart = () => {} }
    if(typeof data.onUpdate !== 'function') { data.onUpdate = () => {} }
    if(typeof data.onComplete !== 'function') { data.onComplete = () => {} }
    // add to queue
    animate.queue.push(data)
    // return methods
    return {
        start : () => {
            data.onStart(data.from)
            data.stamp = Date.now()
        }
    }
}

animate.queue = []
animate.stamp = Date.now()

animate.render = () => {
    animate.stamp = Date.now()
    animate.queue.forEach((data, i) => {
        // ended
        if(data === null) { return }
        // waiting
        if(data.stamp === undefined) { return }
        // begin
        if(data.stamp !== undefined && data.state === undefined) {
            data.state = animate.clone(data.from)
        }
        // animate
        let present = animate.solve(data)
        Object.keys(data.from).forEach(key => {
            let def = (data.to[key] - data.from[key]) * present
            data.state[key] = data.from[key] + def
            // overflow fix
            if(data.from[key] > data.to[key]) {
                if(data.state[key] < data.to[key]) {
                    data.state[key] = data.to[key]
                }
            } else {
                if(data.state[key] > data.to[key]) {
                    data.state[key] = data.to[key]
                }
            }
        })
        data.onUpdate(animate.clone(data.state), present)
        // end
        if(present >= 1) {
            data.onUpdate(animate.clone(data.to), 1)
            data.onComplete(animate.clone(data.to), 1)
            animate.queue[i] = null
        }
    })
}

animate.clone = data => JSON.parse(JSON.stringify(data))

animate.solve = (data) => {
    let line = (animate.stamp - data.stamp) / data.duration
    if(data.ease === 'ease-in') {
        return Math.pow(line, 2)
    } if(data.ease === 'ease-out') {
        return Math.pow(line, 0.75)
    } else {
        return line
    }
}

/*
    animate({
        from : { x : 0.1 },
        to : { x : 0.2 },
        duration : 3000,
        ease : 'linear',
        onUpdate : console.log,
        onComplete : console.error,
        onStart : console.warn
    }).start()
*/