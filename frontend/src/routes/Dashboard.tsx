import React, { useEffect, useRef, useState } from 'react'

interface Rectangle {
    type: 'rectangle';
    points: { x: number, y: number }; // Single point for rectangle or circle
    width: number;
    height: number;
    strokeWidth: number
    color: string
}

interface Circle {
    type: 'circle'
    centerX: number
    centerY: number
    radius: number
    color: string
    lineWidth: number
}

interface Freehand {
    type: 'freehand';
    points: { x: number, y: number }[]; // Array of points for freehand
}

type shapes = Rectangle | Freehand | Circle;

export default function Dashboard() {
    const [tools, setTools] = useState('mouse')
    const [strokeStyle, setStrokeStyle] = useState({ color: '#fff', lineWidth: 3 })
    const [eraserStyle, setEraser] = useState(3)
    const [strokeEdit, setStrokeEdit] = useState(false)
    const [eraserEdit, setEraserEdit] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mouseClicked, setMouseClicked] = useState(false);
    const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null)
    const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);
    const [shapes, setShapes] = useState<shapes[]>()

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && mouseClicked && coordinates && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            shapes?.map((shape) => {
                if (shape.type == 'rectangle') {
                    ctx.lineWidth = shape.strokeWidth
                    ctx.strokeStyle = shape.color
                    ctx.strokeRect(shape.points.x, shape.points.y, shape.width, shape.height)
                }
                if (shape.type == 'circle') {
                    ctx.strokeStyle = shape.color;
                    ctx.lineWidth = shape.lineWidth;
                    ctx.beginPath()
                    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2)
                    ctx.stroke();
                    ctx.closePath();
                }
            })
            if (tools == 'pen') {
                ctx.lineWidth = strokeStyle.lineWidth;
                ctx.lineCap = "round";
                ctx.strokeStyle = strokeStyle.color;


                ctx.lineTo(coordinates.x, coordinates.y);
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(coordinates.x, coordinates.y)
            }
            if (tools == 'eraser') {
                ctx.globalCompositeOperation = "destination-out";
                ctx.lineWidth = eraserStyle;
                ctx.lineCap = "round";
                ctx.strokeStyle = 'white'
                ctx.lineTo(coordinates.x, coordinates.y);
                ctx.stroke();
                ctx.globalCompositeOperation = "source-over";
            }
            if (tools == 'circle' && rectStart) {
                if (ctx && tools == 'circle') {
                    ctx.strokeStyle = strokeStyle.color;
                    ctx.lineWidth = strokeStyle.lineWidth;
                    const centerX = (rectStart.x + coordinates.x) / 2;
                    const centerY = (rectStart.y + coordinates.y) / 2;
                    const radius = Math.abs(((coordinates.x - rectStart.x) / 2 + (coordinates.y - rectStart.y) / 2) / 2)
                    ctx.beginPath()
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                    ctx.stroke();
                    ctx.closePath();
                }
            }
            if (tools == 'rectangle' && rectStart) {
                if (ctx && tools == 'rectangle') {
                    ctx.strokeStyle = strokeStyle.color;
                    ctx.lineWidth = strokeStyle.lineWidth;
                    const width = coordinates.x - rectStart.x
                    const height = coordinates.y - rectStart.y;
                    ctx.strokeRect(rectStart.x, rectStart.y, width, height)
                    return
                }
            }
        }
        if (strokeEdit || eraserEdit) {
            const stroketimeOut = setTimeout(() => {
                setStrokeEdit(false)
                setEraserEdit(false)
            }, 3000);
            return () => clearInterval(stroketimeOut)
        }

    }, [coordinates, tools, strokeEdit, eraserEdit])

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setMouseClicked(true);

        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && (tools == 'rectangle' || tools == 'circle') && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setRectStart({ x, y })
        }
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
        if (tools == 'rectangle' && rectStart && coordinates) {
            setShapes((prev) => {
                if (prev != null) {
                    return [...prev, { type: 'rectangle', points: { x: rectStart?.x, y: rectStart?.y }, width: (coordinates.x - rectStart.x), height: (coordinates.y - rectStart.y), strokeWidth: strokeStyle.lineWidth, color: strokeStyle.color }]
                }
                else {
                    return [{ type: 'rectangle', points: { x: rectStart?.x, y: rectStart?.y }, width: (coordinates.x - rectStart.x), height: (coordinates.y - rectStart.y), strokeWidth: strokeStyle.lineWidth, color: strokeStyle.color }]
                }
            })
        }
        if (tools == 'circle' && rectStart && coordinates) {
            const centerX = (rectStart.x + coordinates.x) / 2;
            const centerY = (rectStart.y + coordinates.y) / 2;
            const radius = Math.abs(((coordinates.x - rectStart.x) / 2 + (coordinates.y - rectStart.y) / 2) / 2)
            setShapes((prev) => {
                if (prev != null) {
                    return [...prev, { type: 'circle', centerX, centerY, radius, color: strokeStyle.color, lineWidth: strokeStyle.lineWidth }]
                }
                else {
                    return [{ type: 'circle', centerX, centerY, radius, color: strokeStyle.color, lineWidth: strokeStyle.lineWidth }]
                }
            })
        }
        setMouseClicked(false);
        setCoordinates(null);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={window?.innerWidth}
                height={window?.innerHeight}
                className='w-[100vw] h-[100vh]'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={(tools == 'rectangle' || tools == 'circle') ? { cursor: 'crosshair' } : undefined}
            />
            <div className='bg-zinc-800 w-fit h-fit fixed top-10 px-1 right-10 rounded-lg flex flex-col divide-y-[1px] divide-[#e3e3e8]'>
                <span className='relative'>
                    <img aria-selected={tools == 'pen'} onClick={() => setTools('pen')} src="/pen.png" className='w-8 px-1 py-[6px] my-[6px] rounded-md aria-selected:bg-zinc-600 cursor-pointer' alt="" />
                    <div className='fixed left-10 top-10 text-white text-sm font-normal flex flex-col'>
                        <span aria-selected={tools == 'pen' || tools == 'rectangle'} className="flex-col gap-2 hidden aria-selected:flex rounded-t-md px-3 py-3 bg-zinc-800">
                            <p>Color</p>
                            <span className='flex gap-2'>
                                <div aria-selected={strokeStyle.color == '#fff'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#fff' }))} className="bg-white h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                                <div aria-selected={strokeStyle.color == '#000000'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#000000' }))} className="bg-black h-5 w-5 rounded-[4px] cursor-pointer outline-1 aria-selected:outline outline-offset-2 outline-white" />
                                <div aria-selected={strokeStyle.color == '#dc2626'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#dc2626' }))} className="bg-red-600 h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                                <div aria-selected={strokeStyle.color == '#60a5fa'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#60a5fa' }))} className="bg-blue-400 h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                                <div aria-selected={strokeStyle.color == '#4ade80'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#4ade80' }))} className="bg-green-400 h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                            </span>
                        </span>
                        <span aria-selected={tools == 'pen' || tools == 'eraser' || tools == 'rectangle'} className="flex-col gap-2 px-3 py-3 rounded-b-md hidden aria-selected:flex bg-zinc-800">
                            <p>Stroke Width</p>
                            <span className='flex gap-2 items-center'>
                                <input min={1} max={20} defaultValue={strokeEdit ? strokeStyle.lineWidth : eraserStyle} onChange={(e) => {
                                    if (tools == 'pen') {
                                        setStrokeStyle((prev) => ({ ...prev, lineWidth: Number(e.target.value) }))
                                    }
                                    if (tools == 'eraser') {
                                        setEraser(Number(e.target.value))
                                    }
                                }} onInput={() => {
                                    if (tools == 'pen') {
                                        setStrokeEdit(true)
                                    }
                                    if (tools == 'eraser') {
                                        setEraserEdit(true)
                                    }
                                }} type="range" />
                            </span>
                        </span>
                    </div>
                </span>
                <span className='relative'>
                    <img aria-selected={tools == 'eraser'} onClick={() => setTools('eraser')} src="/eraser.png" className='w-8 px-1 py-[6px] my-[6px] rounded-md aria-selected:bg-zinc-600 cursor-pointer' alt="" />
                    <div></div>
                </span>
                <span className='relative'>
                    <img aria-selected={tools == 'mouse'} onClick={() => setTools('mouse')} src="/pointer.png" className='w-8 px-1 py-[6px] my-[6px] rounded-md aria-selected:bg-zinc-600 cursor-pointer' alt="" />
                    <div></div>
                </span>
                <span className='relative'>
                    <img aria-selected={tools == 'rectangle'} onClick={() => setTools('rectangle')} src="/rectangle.png" className='w-8 h-8 py-[2px] my-[6px] rounded-md aria-selected:bg-zinc-600 cursor-pointer' alt="" />
                    <div></div>
                </span>
                <span className='relative'>
                    <div aria-selected={tools == 'circle'} onClick={() => setTools('circle')} className='aria-selected:bg-zinc-600 py-[4px] my-[5px] rounded-md'>
                        <div className='w-4 h-4 mx-auto rounded-full cursor-pointer border-2 border-[#e3e3e8]' />
                    </div>
                </span>
            </div>
            {(strokeEdit || eraserEdit) && (
                <div
                    style={{
                        width: `${strokeEdit ? strokeStyle.lineWidth : eraserStyle}px`,
                        height: `${strokeEdit ? strokeStyle.lineWidth : eraserStyle}px`,
                        backgroundColor: strokeStyle.color,
                        borderRadius: "50%",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        pointerEvents: "none",
                    }}
                />
            )}
        </div >
    )
}
