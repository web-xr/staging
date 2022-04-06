let TrinityEngine = {
    _glob : {
        root : 'root',
        xr : { profile : { layouts : {} } }
    }
}

let __TE__ = {}

let POSTPROCESSING = {
    EffectComposer : THREE.EffectComposer,
    RenderPass : THREE.RenderPass,
    OutlinePass : THREE.OutlinePass,
    SSRPass : THREE.SSRPass,
    SSAOPass : THREE.SSAOPass,
    UnrealBloomPass : THREE.UnrealBloomPass
};

let LOADERS = {
    GLTFLoader : THREE.GLTFLoader,
    FBXLoader : THREE.FBXLoader,
    OBJLoader : THREE.OBJLoader,
    MTLLoader : THREE.MTLLoader,
    DDSLoader : THREE.DDSLoader,
    PLYLoader : THREE.PLYLoader
}

let CONTROLS = {
    OrbitControls : THREE.OrbitControls
}

let GSAP = gsap

let _args = function(arr) {
	var out = { "obj" : [], "str" : [], "num" : [], "fun" : [], "boo" : [] };
	if(arr === undefined) { return out; }
    Array.from(arr).forEach(arg => {
		var typ = (typeof arg).toString().substring(0, 3);
		if(out[typ] === undefined) { out[typ] = [] }
		out[typ].push(arg)
    })
	return out
}