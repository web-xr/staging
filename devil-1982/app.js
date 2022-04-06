const app = {}

app.modules = [
    // three
    'threejs/THREE.js',
    // loaders
    'threejs/loaders/GLTFLoader.js',
    'threejs/loaders/FBXLoader.js',
    'threejs/libs/fflate.min.js',
    'threejs/loaders/OBJLoader.js',
    'threejs/loaders/MTLLoader.js',
    'threejs/loaders/DDSLoader.js',
    'threejs/loaders/PLYLoader.js',
    // shaders
    'threejs/shaders/CopyShader.js',
    'threejs/shaders/SSRShader.js',
    'threejs/shaders/SSAOShader.js',
    'threejs/shaders/LuminosityHighPassShader.js',
    // controls
    'threejs/controls/OrbitControls.js',
    // postprocessing
    'threejs/postprocessing/EffectComposer.js',
    'threejs/postprocessing/RenderPass.js',
    'threejs/postprocessing/OutlinePass.js',
    'threejs/postprocessing/ShaderPass.js',
    'threejs/postprocessing/SSRPass.js',
    'threejs/postprocessing/SSAOPass.js',
    'threejs/math/SimplexNoise.js',
    'threejs/postprocessing/UnrealBloomPass.js',
    // webxr
    'threejs/webxr/VRButton.js',
    'threejs/webxr/XRControllerModelFactory.js',
    'threejs/libs/motion-controllers.module.js',
    // gsap
    'gsap/gsap.js'
]

app.scripts = [
    // trinity
    'engine/import.js',
    'engine/check.js',
    'engine/create.js',
    'engine/find.js',
    'engine/load.js',
    'engine/setup.js',
    'engine/tween.js',
    'engine/xr.js',
    // project
    'index.js'
]

app.element = Array.from(document.querySelectorAll('script')).pop()
app.version = app.element.getAttribute('version') || '5.0'
app.locator = app.element.getAttribute('root') || './'

app.run = () => {
    let index = 0
    let files = []

    app.modules.forEach(src => files.push(app.locator + src))
    app.scripts.forEach(src => files.push(src))

    const loadFile = () => {
        if(index < files.length) {
            const script = document.createElement('script')
            script.src = files[index++]
            script.addEventListener('load', loadFile)
            document.head.appendChild(script)
        }
    }

    loadFile()
}

app.build = (root = './source/') => {
    let index = 0
    let files = []
    let jsdat = `let app = { locator : '${root}' }\n\n`
    let htdat = ''
    app.scripts.forEach(src => files.push(src))
    fetch('./index.html').then(resp => resp.text()).then(html => {
        html = html.replace('<!-- index.js -->', '<scr'+'ipt src="./index.js"></script>')
        let jsarr = ''
        app.modules.forEach((mod, i) => {
            if(i === app.modules.length - 1) {
                jsarr += `    <scr`+`ipt src="${root + mod}"></script>`
            } else {
                jsarr += `    <scr`+`ipt src="${root + mod}"></script>\n`
            }
        })

        html = html.replace('    <scri'+'pt src="./app.js" root="./source/"></script>', jsarr)
        htdat = html
        loadFile()
    })
    const loadFile = () => {
        if(index < files.length) {
            fetch(files[index++]).then(resp => resp.text()).then(js => {
                jsdat += js + '\n\n'
                loadFile()
            })
        } else {
            console.log([htdat, jsdat])
        }
    }
}

app.run()