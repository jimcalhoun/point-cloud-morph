/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
    PointsMaterial,
    Color,
    BufferGeometry,
    Float32BufferAttribute,
    MathUtils
} from 'three'
import {
    EffectComposer,
    DepthOfField,
    Bloom,
    Noise,
    Vignette,
    Glitch
} from "@react-three/postprocessing"
import { GlitchMode } from 'postprocessing'

function fillCube(particles) {
    const positions = []
    const n = 10, n2 = n / 2

    for (let i = 0; i < particles; i++) {
        const x = Math.random() * n - n2
        const y = Math.random() * n - n2
        const z = Math.random() * n - n2
        positions.push(x, y, z)
    }

    return positions
}

function fillSphere(particles) {
    const positions = []
    const scalar = 7

    for (let i = 0; i < particles; i++) {
        const r = Math.sqrt(Math.random()) // random radius (between 0 and sqrt(n))
        const theta = Math.acos(1 - 2 * Math.random()) // random polar angle (between 0 and pi)
        const phi = 2 * Math.PI * Math.random() // random azimuthal angle (between 0 and 2pi)

        const x = r * scalar * Math.sin(theta) * Math.cos(phi)
        const y = r * scalar * Math.sin(theta) * Math.sin(phi)
        const z = r * scalar * Math.cos(theta)

        positions.push(x, y, z)
    }

    return positions
}

function fillPyramid(particles) {
    const positions = []

    const h = 10 // adjust this value to change the height of the pyramid
    const s = 6 // adjust this value to change the base length of the pyramid
    const a = 0, b = 0 // x and z offsets

    for (let i = 0; i < particles; i++) {

        const u = Math.random() * (2 * Math.PI)
        const v = Math.random()
        const w = Math.random() * (2 * Math.PI)

        const x = (s * Math.sin(u)) * (1 - v) + a
        const y = (h * v) - (h / 2)
        const z = (s * Math.sin(w)) * (1 - v) + b

        positions.push(x, y, z)

    }

    return positions
}

function Points(props) {
    const ref = useRef()

    const shape = props.shape
    const shapes = props.shapes

    const pointSize = 0.033
    const color = new Color(0x999999)

    const pGeometry = new BufferGeometry()
    const pMaterial = new PointsMaterial({ size: pointSize, color: color })

    pGeometry.setAttribute('position', new Float32BufferAttribute(shapes[shape], 3))
    pGeometry.computeBoundingSphere()

    const points = pGeometry.getAttribute('position')
    const nPoints = new Float32BufferAttribute(shapes[(shape + 1) % shapes.length], 3)

    useFrame((state, delta) => (ref.current.rotation.y -= delta * .2))

    const lerpT = 0.04

    useFrame(() => {
        for (let i = 0; i < points.count; i++) {
            points.setXYZ(
                i,
                MathUtils.lerp(points.getX(i), nPoints.getX(i), lerpT),
                MathUtils.lerp(points.getY(i), nPoints.getY(i), lerpT),
                MathUtils.lerp(points.getZ(i), nPoints.getZ(i), lerpT)
            )
        }
        ref.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points
            {...props}
            ref={ref}
            geometry={pGeometry}
            material={pMaterial}
        />
    )
}

function SimpleShapeMorph() {
    const particles = 10000

    const [shape, setShape] = useState(0)
    const shapes = [fillCube(particles), fillPyramid(particles), fillSphere(particles)]

    useEffect(() => {
        const changeShape = setInterval(() => {
            setShape((shape) => (shape + 1) % shapes.length)
        }, 6000)
        return () => {
            clearInterval(changeShape)
        }
    })

    return (
        <Canvas id="canvas" camera={{ fov: 90, near: 0.1, far: 1000, position: [0, 0, 16] }}>
            <color attach="background" args={["#181818"]} />
            <fog color="#161616" attach="fog" near={8} far={20} />
            <Suspense fallback={null}>
                <Points shape={shape} shapes={shapes} />
                <OrbitControls enableZoom={false} enablePan={false} />
            </Suspense>
            <EffectComposer multisampling={0} disableNormalPass={true}>
                <DepthOfField
                    focusDistance={0}
                    focalLength={.02}
                    bokehScale={.1}
                    height={480}
                />
                <Noise opacity={0.045} />
                <Bloom
                    luminanceThreshold={0}
                    luminanceSmoothing={0.9}
                    height={300}
                    opacity={1}
                />
                <Vignette eskil={false} offset={0.1} darkness={0.75} />
                <Glitch
                    chromaticAberrationOffset={[0.3, 1.0]}
                    delay={[5.0, 5.0]}
                    duration={[0.6, 1.0]}
                    dtSize={64}
                    columns={.0001}
                    mode={GlitchMode.SPORADIC}
                    strength={[0.1, 0.3]}
                    ratio={.33}
                />
            </EffectComposer>
        </Canvas>
    )
}

export default SimpleShapeMorph
