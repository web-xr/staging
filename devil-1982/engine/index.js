import {
    createScene,
    createEffect,
    createEvent,
    createLight,
    createObject
} from './_create';

import {
    findAll,
    findById,
    findByName,
    findByType,
    findByProperty,
    findByMaterialName,
    findByMaterialProperty
} from './_find';

import {
    loadAll,
    loadAjax,
    loadImage,
    loadBitmap,
    loadModel,
    loadTexture
} from './_load';

import {
    setupControls,
    setupObject,
    setupScene,
    setupMaterial
} from './_setup';

import {
    tweenControls,
    tweenMaterial,
    tweenObject
} from './_tween';

import { THREE, GSAP, TWEEN } from '../import';

let TrinityEngine = {
        createScene : createScene,
        createEffect : createEffect,
        createEvent : createEvent,
        createObject : createObject,
        createLight : createLight,
        findAll : findAll,
        findById : findById,
        findByName : findByName,
        findByType : findByType,
        findByProperty : findByProperty,
        findByMaterialName : findByMaterialName,
        findByMaterialProperty : findByMaterialProperty,
        loadAll : loadAll,
        loadAjax : loadAjax,
        loadImage : loadImage,
        loadBitmap : loadBitmap,
        loadModel : loadModel,
        loadTexture : loadTexture,
        setupControls : setupControls,
        setupObject : setupObject,
        setupScene : setupScene,
        setupMaterial : setupMaterial,
        tweenControls : tweenControls,
        tweenMaterial : tweenMaterial,
        tweenObject : tweenObject
};

export { TrinityEngine, THREE, GSAP, TWEEN };