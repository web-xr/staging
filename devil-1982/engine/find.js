let findAll = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var out = []
    function recMesh(obj) {
        out.push(obj)
        if(obj.children !== undefined) {
            obj.children.forEach(child => {
                recMesh(child)
            })
        }
    }
    recMesh(model)
    return out
}

let findById = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var name  = args.str[0]
    var mult  = args.boo[0]

    var out = []
    function recMesh(obj) {
        if(obj.uuid === name) {
            out.push(obj)
        }
        if(obj.children !== undefined) {
            obj.children.forEach(child => {
                recMesh(child)
            })
        }
    }
    recMesh(model)

    if(mult) { return out }
    else { return out[0] }
}

let findByName = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var name  = args.str[0]
    var mult  = args.boo[0]

    var out = []
    function recMesh(obj) {
        if(obj.name === name) {
            out.push(obj)
        }
        if(obj.children !== undefined) {
            obj.children.forEach(child => {
                recMesh(child)
            })
        }
    }
    recMesh(model)

    if(mult) { return out }
    else { return out[0] }
}

let findByMaterialName = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var name  = args.str[0]
    var mult  = args.boo[0]

    var out = []
    model.traverse(function(child) {
        if(child.isMesh && child.material) {
            if(Array.isArray(child.material)) {
                child.material.forEach(k => {
                    if(k.name === name) { out.push(k) }
                })
            } else  {
                if(child.material.name === name) { out.push(child.material) }
            }
        }
    })

    if(mult) { return out }
    else { return out[0] }
}

let findByType = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var type  = args.str[0]
    var mult  = args.boo[0]

    var out = []
    function recMesh(obj) {
        if(obj.type === type) {
            out.push(obj)
        }
        if(obj.children !== undefined) {
            obj.children.forEach(child => {
                recMesh(child)
            })
        }
    }
    recMesh(model)

    if(mult) { return out }
    else { return out[0] }
}

let findByProperty = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var data  = args.obj[1]
    var mult  = args.boo[0]

    var out = []
    function recMesh(obj) {
        Object.keys(data).forEach(function(key) {
            if(obj[key] === data[key]) { out.push(obj) }
        })
        if(obj.children !== undefined) {
            obj.children.forEach(child => {
                recMesh(child)
            })
        }
    }
    recMesh(model)

    if(mult) { return out }
    else { return out[0] }
}

let findByMaterialProperty = function() {
    var args = _args(arguments)
    var model = args.obj[0]
    var data  = args.obj[1]
    var mult  = args.boo[0]

    var out = []
    function recMesh(obj) {
        if(obj.material !== undefined) {
            Object.keys(data).forEach(function(key) {
                if(obj.material[key] === data[key]) { out.push(obj) }
            })
        }
        if(obj.children !== undefined) {

            obj.children.forEach(child => {
                recMesh(child)
            })
        }
    }
    recMesh(model)

    if(mult) { return out }
    else { return out[0] }
}

// ==========================================================================

TrinityEngine.findAll = findAll
TrinityEngine.findById = findById
TrinityEngine.findByName = findByName
TrinityEngine.findByType = findByType
TrinityEngine.findById = findById
TrinityEngine.findByProperty = findByProperty
TrinityEngine.findByMaterialName = findByMaterialName
TrinityEngine.findByMaterialProperty = findByMaterialProperty