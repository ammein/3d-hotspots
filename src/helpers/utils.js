import { degToRad } from 'three/src/math/MathUtils.js'
import { Vector3, Matrix4, Quaternion } from 'three'

/**
 * Random Hash Generator
 * @param {number} length 
 * @returns {string}
 */
export const randomHash = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * World To Screen Position
 * 
 * @example
 * // Suppose you want the label to “stick” in the left 20% of the viewport relative to where the 3D object projects. You can calculate:
 * // world position → screen
 * const screenPos = worldToScreen(obj.getWorldPosition(new THREE.Vector3()), camera, renderer)
 * // shift into left area: clamp or remap
 * const leftX = Math.min(screenPos.x, renderer.domElement.width * 0.2)
 *
 * @param {import('three').Vector3} worldPos 
 * @param {import('three').Camera} camera 
 * @param {import('three/src/renderers/WebGLRenderer.js').WebGLRenderer} renderer 
 * @returns {{ x: number, y: number, z: number }}
 * 
 */
export const worldToScreen = (worldPos, camera, renderer) => {
    const vector = worldPos.clone().project(camera) // NDC: -1..1
    const halfWidth = renderer.domElement.width / 2
    const halfHeight = renderer.domElement.height / 2

    return {
        x: (vector.x * halfWidth) + halfWidth,
        y: -(vector.y * halfHeight) + halfHeight,
        z: vector.z // depth in NDC
    }
}

/**
 * Get Depth from Object World Location
 * @param {import('three').Object3D} object 
 * @param {import('three').Camera} camera 
 * @returns {number}
 */
export const getDepthFromObject = (object, camera) => {
    const ndc = object.getWorldPosition(new Vector3()).project(camera)
    return (ndc.z + 1) / 2
}

/**
 * Get Text Scale
 * 
 * @example
 * import { Text, Html } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef } from 'react'

const Label = ({ target }) => {
    const textRef = useRef()
    const { camera, size } = useThree()

    useFrame(() => {
        if (!target.current) return
        const worldPos = target.current.getWorldPosition(new THREE.Vector3())

        // --- scale text size ---
        const dist = camera.position.distanceTo(worldPos)
        const vFOV = THREE.MathUtils.degToRad(camera.fov)
        const pixelsPerUnit = size.height / (2 * Math.tan(vFOV / 2) * dist)
        const scale = 20 / pixelsPerUnit // want 20px high
        textRef.current.scale.setScalar(scale)

        // --- anchor to left area ---
        const ndc = worldPos.clone().project(camera)
        ndc.x = -0.9 // force left side of viewport
        ndc.unproject(camera)
        textRef.current.position.copy(ndc)
    })

    return (
        <Text ref={textRef} fontSize={1} color="white">
        Hello
        </Text>
    )
}

 * 
 * @param {import('three').Vector3} worldPos 
 * @param {import('three').Camera} camera 
 * @param {import('three/src/renderers/WebGLRenderer.js').WebGLRenderer} renderer 
 * @param {number} desiredPxHeight 
 * @returns {number}
 */
export const getTextScale = (worldPos, camera, renderer, desiredPxHeight = 20) => {
    const dist = camera.position.distanceTo(worldPos)
    const vFOV = degToRad(camera.fov) // vertical fov in radians
    const h = renderer.domElement.height

    // size of 1 world unit at distance `dist` in screen pixels
    const pixelsPerUnit = h / (2 * Math.tan(vFOV / 2) * dist)

    // scale so that text's height matches desiredPxHeight
    return desiredPxHeight / pixelsPerUnit
}

const worldUp = new Vector3(0, 1, 0);
const fallbackUp = new Vector3(0, 0, 1);

const lookDir = new Vector3();
const right = new Vector3();
const up = new Vector3();

/**
 * Stable Look At
 * @param {import('three').Object3D} object 
 * @param {import('three').Vector3} cameraPosition 
 */
export const stableLookAt = (object, cameraPosition) => {
    // 1. Calculate look direction from object to camera
    lookDir.subVectors(cameraPosition, object.position).normalize();

    // 2. Check if lookDir is collinear with worldUp (dot close to ±1)
    if (Math.abs(lookDir.dot(worldUp)) > 0.999) {
        // Use fallback up vector to avoid gimbal lock
        up.copy(fallbackUp);
    } else {
        up.copy(worldUp);
    }

    // 3. Calculate right vector
    right.crossVectors(up, lookDir).normalize();

    // 4. Recalculate true up vector to ensure orthogonality
    up.crossVectors(lookDir, right).normalize();

    // 5. Build rotation matrix from right, up, and forward (lookDir)
    const m = new Matrix4();
    m.makeBasis(right, up, lookDir);

    // 6. Set object's quaternion from rotation matrix
    const q = new Quaternion();
    q.setFromRotationMatrix(m);
    object.quaternion.copy(q);
}


/**
 * Calculate Current Value For Ruler
 * @param {number} scrollPosition 
 * @param {number} stepWidth 
 * @param {number} gapBetweenItems 
 * @param {number} min 
 * @param {number} max 
 * @param {number} step 
 * @param {number} fractionDigits .toFixed() convert to string function
 * @returns 
 */
export const calculateCurrentValue = (
    scrollPosition,
    stepWidth,
    gapBetweenItems,
    min,
    max,
    step,
    fractionDigits
) => {
    const index = Math.round(scrollPosition / (stepWidth + gapBetweenItems));
    return Math.min(Math.max(index * step + min, min), max).toFixed(
        fractionDigits
    );
};


/**
 * Convert String Cases
 * @param {string} str 
 * @param {'snake' | 'kebab' | 'camel' | 'sentence' | 'pascal' | 'title'} toCase 
 * @author https://www.30secondsofcode.org/js/s/string-case-conversion/
 * @link https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/string-case-conversion.md
 * @returns 
 */
export const convertCase = (str, toCase = 'camel') => {
    if (!str) return '';
    const delimiter =
        toCase === 'snake'
            ? '_'
            : toCase === 'kebab'
                ? '-'
                : ['title', 'sentence'].includes(toCase)
                    ? ' '
                    : '';
    const transform = ['camel', 'pascal'].includes(toCase)
        ? x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()
        : ['snake', 'kebab'].includes(toCase)
            ? x => x.toLowerCase()
            : toCase === 'title'
                ? x => x.slice(0, 1).toUpperCase() + x.slice(1)
                : x => x;
    const finalTransform =
        toCase === 'camel'
            ? x => x.slice(0, 1).toLowerCase() + x.slice(1)
            : toCase === 'sentence'
                ? x => x.slice(0, 1).toUpperCase() + x.slice(1)
                : x => x;
    const words = str.match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
    );
    return finalTransform(words.map(transform).join(delimiter));
};