let modules = TrinityEngine.createScene()

let ground = TrinityEngine.createObject({
    Box : [10, 0.01, 10],
    MeshBasic : { color : '#333' }
}, { name : 'ground' })

modules.scene.add(ground)

let box = TrinityEngine.createObject({
    Box : [0.3, 0.3, 0.3],
    MeshBasic : { color : 'yellow' }
}, { position : { x : 0, y : 1.5, z : -4 } })

modules.scene.add(box)

// TrinityEngine.createEventXR('focusstart', box, () => {
//     box.material.color.r = 255
//     box.material.color.g = 0
//     box.material.color.b = 0
// })

// TrinityEngine.createEventXR('focusend', box, () => {
//     box.material.color.r = 0
//     box.material.color.g = 0
//     box.material.color.b = 255
// })




// TrinityEngine.createEvent('click', ground, e => {
//     TrinityEngine.tweenControls('FIXED', modules.controls,
//         { x : e.point.x, z : e.point.z },
//         e.distance * 150, 'easeOutQuad',
//         () => modules.controls.rotateSpeed = -0.3
//     )
// })

// TrinityEngine.createEventXR('selectstart', ground, e => {
//     TrinityEngine.tweenControlsXR(modules.xr.controls,
//         { x : e.point.x, z : e.point.z },
//         e.distance * 150, 'easeOutQuad',
//         () => console.warn('END')
//     ) 
// })



// let speed = 0.05
// let rspeed = 0.03

// TrinityEngine.createEventXR('axesup', () => {
//     modules.xr.controls.translateZ(speed * -1)
// })
// TrinityEngine.createEventXR('axesdown', () => modules.xr.controls.translateZ(speed))
// TrinityEngine.createEventXR('axesleft', () => modules.xr.controls.rotateY(rspeed))
// TrinityEngine.createEventXR('axesright', () => modules.xr.controls.rotateY(rspeed * -1))






document.body.appendChild(modules.renderer.domElement)
document.body.appendChild(modules.xr.button)

console.log(modules)