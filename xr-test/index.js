let modules = TrinityEngine.createScene('#888')

let ground = TrinityEngine.createObject({
    Box : [10, 0.01, 10],
    MeshBasic : { color : '#333' }
}, { name : 'ground' })

modules.scene.add(ground)

let box = TrinityEngine.createObject({
    Box : [1, 1, 1],
    MeshBasic : { color : 'yellow' }
}, { position : { x : 0, y : 1.5, z : -4 } })

modules.scene.add(box)



TrinityEngine.createEventXR('button:xr-standard-squeeze:start', () => {
    box.material.color.r = 255
    box.material.color.g = 0
    box.material.color.b = 0
}, 'left')

TrinityEngine.createEventXR('button:xr-standard-squeeze:end', () => {
    box.material.color.r = 0
    box.material.color.g = 0
    box.material.color.b = 255
}, 'left')




TrinityEngine.createEventXR('device:xr-collide:start', box, (e) => {
    box.material.color.r = 0
    box.material.color.g = 255
    box.material.color.b = 0
    console.log(e)
}, 'left')



document.body.appendChild(modules.renderer.domElement)
document.body.appendChild(modules.xr.button)

console.log(modules)











