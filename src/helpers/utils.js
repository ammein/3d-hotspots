import { degToRad } from 'three/src/math/MathUtils.js'
import { Vector3 } from 'three'

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

function Label({ target }) {
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
