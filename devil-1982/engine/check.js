let checkControls = function(controls) {
    let t = controls.target
    let c = controls.object.position
    window.addEventListener('keydown', function(e) {
        if(e.key === '`') {
            let x = ''
            x += '{\n'
            x += '  target : { x : '+ t.x +', y : '+ t.y +', z : '+ t.z +' },\n'
            x += '  camera : { x : '+ c.x +', y : '+ c.y +', z : '+ c.z +' }\n'
            x += '}'
            console.log(x)
        }
    })
}

let checkTransform = function(object) {
    let p = object.position
    let r = object.rotation
    let s = object.scale
    window.addEventListener('keydown', function(e) {
        
        if(e.key === '`') {
            let x = ''
            x += '{\n'
            x += '  position : { x : '+ p.x +', y : '+ p.y +', z : '+ p.z +' },\n'
            x += '  rotation : { x : '+ r.x +', y : '+ r.y +', z : '+ r.z +' },\n'
            x += '  scale    : { x : '+ s.x +', y : '+ s.y +', z : '+ s.z +' }\n'
            x += '}'
            console.log(x)
        }

        let speed = 0.001
        
        if(e.shiftKey) {
            speed = 0.01
            e.preventDefault()
        }

        if(e.ctrlKey)  {
            speed = 0.1
            e.preventDefault()
        }

        if(e.key === '+') {
            object.scale.set(
                object.scale.x + speed,
                object.scale.y + speed,
                object.scale.z + speed
            )
        }

        if(e.key === '-') {
            object.scale.set(
                object.scale.x - speed,
                object.scale.y - speed,
                object.scale.z - speed
            )
        }

        if(e.key === '*') {
            object.rotation.set(
                object.rotation.x,
                object.rotation.y + Math.PI / 4,
                object.rotation.z
            )
        }

        if(e.key === '/') {
            object.rotation.set(
                object.rotation.x,
                object.rotation.y - Math.PI / 4,
                object.rotation.z
            )
        }

        if(e.key === '7') {
            object.position.set(
                object.position.x,
                object.position.y - speed,
                object.position.z
            )
        }

        if(e.key === '9') {
            object.position.set(
                object.position.x,
                object.position.y + speed,
                object.position.z
            )
        }

        if(e.key === '2') { object.position.z += speed }
        if(e.key === '8') { object.position.z -= speed }
        if(e.key === '6') { object.position.x += speed }
        if(e.key === '4') { object.position.x -= speed }

    })
}

let checkObjects = function(object, property) {
    TrinityEngine.findByType(object, 'Mesh', true).forEach(function(mesh) {
        TrinityEngine.createEvent('click', mesh, function(e) {
            if(property !== undefined) {
                console.log(e.object[property], e.object, e)
            } else { console.log(e.object, e) }
        })
    })
}

TrinityEngine.checkControls = checkControls
TrinityEngine.checkTransform = checkTransform
TrinityEngine.checkObjects = checkObjects