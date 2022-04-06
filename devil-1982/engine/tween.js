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

function xyzByDist(p1, p2, d) {
    var u = Math.pow(
        Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2) +
        Math.pow(p2.z - p1.z, 2),
    0.5)
    d = u - d
    var s = d / u
    return {
        x : p1.x + s * (p2.x - p1.x),
        y : p1.y + s * (p2.y - p1.y),
        z : p1.z + s * (p2.z - p1.z)
    }
}

let tweenControls = function() {
    var args = _args(arguments)
    var type     = args.str[0].toUpperCase()
    var controls = args.obj[0]
    var pos_1    = args.obj[1]
    var pos_2    = args.obj[2]
    var callback = args.fun[0] || function() {}
    var ease     = args.str[1] || 'easeOutSine'
    var offset, time
    var t_0, t_1, p_0, p_1, d, a, b

    var t = controls.target
    var p = controls.object.position

    controls.enabled = false

    if(type === 'FIXED') {
        time   = args.num[0]
        d = { x : t.x - p.x, y : t.y - p.y, z : t.z - p.z }
        t_0 = { x : t.x, y : t.y, z : t.z }
        t_1 = {}
        Object.keys(pos_1).forEach(function(k) { t_1[k] = pos_1[k] })

        __TE__.Tween({
            from : t_0,
            to : t_1,
            duration : time,
            ease : ease,
            onComplete : function() {
                controls.enabled = true
                controls.update()
                callback()
            },
            onUpdate : function(t_0) {
                controls.object.position.set(t_0.x, t_0.y, t_0.z)
                controls.target.set(t_0.x + d.x, t_0.y + d.y, t_0.z + d.z)
                controls.update()
            }
        }).start()
    }

    if(type === 'LOOSE') {
        offset = args.num[0]
        time   = args.num[1] / 1000
        t_0 = { x : t.x, y : t.y, z : t.z }
        p_0 = { x : p.x, y : p.y, z : p.z }
        t_1 = { ease : ease, duration : time }
        Object.keys(pos_1).forEach(function(k) { t_1[k] = pos_1[k] })

        p_1 = xyzByDist(p_0, t_1, offset)
        var startRotation = new THREE.Euler().copy(controls.object.rotation)
        
        a = { px : p_0.x, py : p_0.y, pz : p_0.z, tx : t_0.x, ty : t_0.y, tz : t_0.z }
        b = { px : p_1.x, py : p_1.y, pz : p_1.z, tx : t_1.x, ty : t_1.y, tz : t_1.z }
        b.ease = ease
        b.duration = time

        GSAP.timeline({
            onComplete : function() {
                controls.enabled = true
                callback()
            },
            onUpdate : function() {
                controls.target.set(a.tx, a.ty, a.tz)
                controls.object.position.set(a.px, a.py, a.pz)
                controls.update()
                controls.object.rotation.copy(startRotation)
            }
        }).fromTo(a, a, b)

    }

    if(type === 'EXACT') {
        time = args.num[0] / 1000
        t_0 = { x : t.x, y : t.y, z : t.z }
        p_0 = { x : p.x, y : p.y, z : p.z }
        p_1 = { }
        t_1 = { ease : ease, duration : time }
        Object.keys(pos_1).forEach(function(k) { t_1[k] = pos_1[k] })
        Object.keys(pos_2).forEach(function(k) { p_1[k] = pos_2[k] })
        a = { px : p_0.x, py : p_0.y, pz : p_0.z, tx : t_0.x, ty : t_0.y, tz : t_0.z }
        b = { px : p_1.x, py : p_1.y, pz : p_1.z, tx : t_1.x, ty : t_1.y, tz : t_1.z }

        __TE__.Tween({
            from : a,
            to : b,
            duration : time,
            ease : ease,
            onComplete : function() {
                controls.enabled = true
                controls.update()
                callback()
            },
            onUpdate : function(a) {
                controls.target.set(a.tx, a.ty, a.tz);
                controls.object.position.set(a.px, a.py, a.pz);
                controls.update();
            }
        }).start()

    }
    
}

let tweenControlsXR = function() {
    var args = _args(arguments)
    var dolly = args.obj[0]
    var pos_1 = dolly.position
    var pos_2 = args.obj[1]
    var back  = args.fun[0] || function() {}
    var ease  = args.str[1] || 'easeOutSine'
    var time  = args.num[0] || 1000

    __TE__.Tween({
        from : pos_1,
        to : pos_2,
        duration : time,
        ease : ease,
        onComplete : back,
        onUpdate : function(pos) {
            dolly.position.set(pos.x, pos.y, pos.z)
        }
    }).start()

}

tweenControls.captureSpot = function() {
    var args = _args(arguments)
    var controls = args.obj[0]
    var scene    = args.obj[1]
    window.addEventListener('dblclick', function() {
        console.log(['TARGET'])
        console.log('x ==> ', controls.target.x)
        console.log('y ==> ', controls.target.y)
        console.log('z ==> ', controls.target.z)
        console.log(['CAMERA'])
        console.log('x ==> ', controls.object.position.x)
        console.log('y ==> ', controls.object.position.y)
        console.log('z ==> ', controls.object.position.z)
        console.log(['SCENE'])
        console.log('x ==> ', scene.rotation.x)
        console.log('y ==> ', scene.rotation.y)
        console.log('z ==> ', scene.rotation.z)
    })
}

let tweenObject = function() {
    var args = _args(arguments)
    var obj  = args.obj[0]
    var val  = args.obj[1]
    var ease = args.str[0] || 'power1'
    var time = args.num[0] || 1000
    var back = args.fun[0] || function() {}
    // prepare
    var a = {}, b = {}
    var arr = ['position', 'rotation', 'scale']
    arr.forEach(function(type) {
        // defaults
        a[type + 'X'] = b[type + 'X'] = obj[type].x
        a[type + 'Y'] = b[type + 'Y'] = obj[type].y
        a[type + 'Z'] = b[type + 'Z'] = obj[type].z
        // updates
        if(val[type]) {
            if(val[type].x !== undefined) { b[type + 'X'] = val[type].x }
            if(val[type].y !== undefined) { b[type + 'Y'] = val[type].y }
            if(val[type].z !== undefined) { b[type + 'Z'] = val[type].z }
        }
    })

    // tween
    __TE__.Tween({
        from : a,
        to : b,
        duration : time,
        ease : ease,
        onComplete : back,
        onUpdate : function(a) {
            Object.keys(a).forEach(function(key) {
                if(key === '_GSAP') { return }
                var type = key.substr(0, key.length - 1)
                var axis = key[key.length - 1].toLocaleLowerCase()
                if(type === '_gsa') { return }
                obj[type][axis] = a[key]
            })
        }
    }).start()
}

let tweenMaterial = function() {
    var args = _args(arguments)
    var type = args.str[0] || 'VALUE'
    var mesh = args.obj[0]
    var data = args.obj[1]
    var time = args.num[0] || 1000
    var ease = args.str[1] || 'power1'
    var back = args.fun[0] || function() {}
    var a, b

    if(type === 'CLONE') {
        // mesh duplicate
        let new_mesh = mesh.clone(false)
        mesh.add(new_mesh)
        // material duplicate
        new_mesh.material = mesh.material.clone()
        // maps array
        let mprr = [
            'alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'emissiveMap',
            'envMap', 'lightMap', 'map', 'normalMap', 'roughnessMap'
        ]
        // clone maps
        mprr.forEach(function(map) {
            if(mesh.material[map]) {
                new_mesh.material[map] = mesh.material[map].clone()
                new_mesh.material[map].needsUpdate = true
            }
        })
        // set maps
        Object.keys(data).forEach(function(key) {
            if(mprr.indexOf(key) > -1) {
                new_mesh.material[key].image = data[key]
            } else {
                new_mesh.material[key] = data[key]
            }
        })
        // transparent
        new_mesh.material.transparent = true
        new_mesh.material.opacity = 0
        new_mesh.material.needsUpdate = true
        // tween
        a = { opacity : 0 }
        b = { opacity : 1, duration : time / 1000, ease : ease }
        GSAP.timeline({
            onComplete : function() {
                // callback
                mesh.material = new_mesh.material
                mesh.remove(new_mesh)
                back()
            },
            onUpdate : function() {
                new_mesh.material.opacity = a.opacity
            }
        }).fromTo(a, a, b)

    }

    if(type === 'VALUE') {
        a = {}
        b = { duration : time / 1000, ease : ease }
        Object.keys(data).forEach(function(key) {
            if(typeof mesh.material[key] === 'object') {
                let obj = mesh.material[key]
                Object.keys(obj).forEach(function(sky) {
                    a[key + '.' + sky] = mesh.material[key][sky]
                    b[key + '.' + sky] = data[key][sky]
                })
            } else {
                a[key] = mesh.material[key]
                b[key] = data[key]
            }
        })
      
        GSAP.timeline({
            onComplete : function() {
                back()
            },
            onUpdate : function() {
                Object.keys(a).forEach(function(key) {
                    if(key.indexOf('.') > -1) {
                        var t = key.split('.')
                        mesh.material[t[0]][t[1]] = a[key]
                    } else {
                        mesh.material[key] = a[key]
                    }
                })
            }
        }).fromTo(a, a, b)

    }


}

// ============================================================================

__TE__.Tween = data => {
    // execeptions
    if(typeof data.onStart !== 'function') { data.onStart = () => {} }
    if(typeof data.onUpdate !== 'function') { data.onUpdate = () => {} }
    if(typeof data.onComplete !== 'function') { data.onComplete = () => {} }
    // fixed values
    Object.keys(data.from).forEach(key => {
        if(data.to[key] === undefined) {
            data.to[key] = data.from[key]
        }
    })
    // add to queue
    __TE__.Tween.queue.push(data)
    // return methods
    return {
        start : () => {
            data.onStart(data.from)
            data.stamp = Date.now()
        }
    }
}

__TE__.Tween.queue = []
__TE__.Tween.stamp = Date.now()

__TE__.Tween.render = () => {
    __TE__.Tween.stamp = Date.now()
    let toRemove = []
    __TE__.Tween.queue.forEach((data, i) => {
        // ended
        if(data === null) { return }
        // waiting
        if(data.stamp === undefined) { return }
        // begin
        if(data.stamp !== undefined && data.state === undefined) {
            data.state = animate.clone(data.from)
        }
        // animate
        let present = __TE__.Tween.solve(data)
        let overflow = false
        Object.keys(data.from).forEach(key => {
            let def = (data.to[key] - data.from[key]) * present
            let old = data.state[key]
            let crr = data.from[key] + def
            // overflow fix
            if(data.from[key] > data.to[key]) {
                // negative direction : overflow || reverse
                if(data.state[key] < data.to[key] || old < crr) {
                    crr = data.to[key]
                    overflow = true
                }
            } else {
                // positive direction : overflow || reverse
                if(data.state[key] > data.to[key] || crr < old) {
                    crr = data.to[key]
                    overflow = true
                }
            }
            data.state[key] = crr
        })
        data.onUpdate(__TE__.Tween.clone(data.state), present)
        // end
        if(present >= 1 || overflow) {
            data.onComplete(__TE__.Tween.clone(data.to), 1)
            toRemove.push(i)
        }
    })
    __TE__.Tween.remove(toRemove)
}

__TE__.Tween.remove = drr => {
    let arr = []
    __TE__.Tween.queue.forEach((k, i) => {
        let r = true
        Object.keys(k.state).forEach(e => { if(k.state[e] !== k.to[e]) { r = false } })
        if(!drr.includes(i) && r !== true) {
            arr.push(k)
        }
    })
    __TE__.Tween.queue = arr
}

__TE__.Tween.clone = data => JSON.parse(JSON.stringify(data))

__TE__.Tween.solve = (data) => {
    let x = (__TE__.Tween.stamp - data.stamp) / data.duration
    let f = __TE__.Tween.easings[data.ease] || __TE__.Tween.easings['easeOutSine']
    return f(x)
}

let pow = (x, y) => Math.pow(x, y)
let sqrt = x => Math.sqrt(x)
let sin = x => Math.sin(x)
let cos = x => Math.cos(x)
let PI = Math.PI

__TE__.Tween.easings = {
    'easeInSine' : x => 1 - cos((x * PI) / 2),
    'easeOutSine' : x => sin((x * PI) / 2),
    'easeInOutSine' : x => -(cos(PI * x) - 1) / 2,
    'easeInQuad' : x => x * x,
    'easeOutQuad' : x => 1 - (1 - x) * (1 - x),
    'easeInOutQuad' : x => x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2,
    'easeInCubic' : x => x * x * x,
    'easeOutCubic' : x => 1 - pow(1 - x, 3),
    'easeInOutCubic' : x => x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2,
    'easeInQuart' : x => x * x * x * x,
    'easeOutQuart' : x => 1 - pow(1 - x, 4),
    'easeInOutQuart' : x => x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2,
    'easeInQuint' : x => x * x * x * x * x,
    'easeOutQuint' : x => 1 - pow(1 - x, 5),
    'easeInOutQuint' : x => x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2,
    'easeInExpo' : x => x === 0 ? 0 : pow(2, 10 * x - 10),
    'easeOutExpo' : x => x === 1 ? 1 : 1 - pow(2, -10 * x),
    'easeInOutExpo' : x => x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2,
    'easeInCirc' : x => 1 - sqrt(1 - pow(x, 2)),
    'easeOutCirc' : x => sqrt(1 - pow(x - 1, 2)),
    'easeInOutCirc' : x => x < 0.5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2,
    'easeInBack' : x => 2.70158 * x * x * x - 1.70158 * x * x,
    'easeOutBack' : x => 1 + 2.70158 * pow(x - 1, 3) + 1.70158 * pow(x - 1, 2),
    'easeInOutBack' : x => x < 0.5 ? (pow(2 * x, 2) * ((2.5949095 + 1) * 2 * x - 2.5949095)) / 2 : (pow(2 * x - 2, 2) * ((2.5949095 + 1) * (x * 2 - 2) + 2.5949095) + 2) / 2
}

// ============================================================================

TrinityEngine.tweenControls = tweenControls
TrinityEngine.tweenControlsXR = tweenControlsXR
TrinityEngine.tweenMaterial = tweenMaterial
TrinityEngine.tweenObject = tweenObject