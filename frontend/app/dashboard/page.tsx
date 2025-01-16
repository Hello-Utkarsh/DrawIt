'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function page() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mouseClicked, setMouseClicked] = useState(false);
    const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && mouseClicked && coordinates) {
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "white";

            ctx.lineTo(coordinates.x, coordinates.y);
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(coordinates.x, coordinates.y)
        }
    }, [coordinates])

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setMouseClicked(true);

        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.beginPath();
            ctx.moveTo(x, y)
            setCoordinates({ x, y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mouseClicked) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCoordinates({ x, y });
    };

    const handleMouseUp = () => {
        setMouseClicked(false);
        setCoordinates(null);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className='w-[100vw] h-[100vh]'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div >
    )
}
