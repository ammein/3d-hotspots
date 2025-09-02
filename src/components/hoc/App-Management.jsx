import { useEffect, useRef, useState } from "react"
import useFontFaceObserver from "use-font-face-observer"
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import tw from "tailwind-styled-components"
import Button from "@/components/Button"

/**
 * HOC for App Components
 * @param {React.Component} WrappedComponent 
 * @returns {React.Component}
 */
const withAppManagement = (WrappedComponent) => {
    return function AppManagement(props) {
        const wrappedRef = useRef()
        const [progress, setProgress] = useState(0)
        const progressRef = useRef({
            value: 0
        })
        const isFontLoaded = useFontFaceObserver([
            {
                family: "3ds Bold",
                weight: "700"
            },
            {
                family: "3ds Bold Italic",
                weight: "700",
                style: "italic"
            },
            {
                family: "3ds Semibold",
                weight: "600"
            },
            {
                family: "3ds Semibold Italic",
                weight: "600",
                style: "italic"
            },
            {
                family: "3ds Regular",
                weight: "400"
            },
            {
                family: "3ds Italic",
                weight: "400",
                style: "italic"
            },
            {
                family: "3ds Light",
                weight: "300"
            },
            {
                family: "3ds Light Italic",
                weight: "300",
                style: "italic"
            }
        ])

        useGSAP(() => {
            if(isFontLoaded) {
                gsap.to(progressRef.current, {
                    value: 100,
                    duration: .9,
                    onUpdate: (val) => setProgress(val * 100),
                    onUpdateParams: [progressRef.current.value]
                })
            }
        }, {
            dependencies:  [isFontLoaded],
            scope: wrappedRef
        })
        
        return (
            <>
                <Button disabled={progress !== 100} style={{
                        display: progress !== 100 ? "block" : "none"
                    }}>{progress + "% Loading <Asset Name>"}</Button>
                <WrappedComponent ref={wrappedRef} progress={progress} {...props}/>
            </>
        )
    }
}

export default withAppManagement