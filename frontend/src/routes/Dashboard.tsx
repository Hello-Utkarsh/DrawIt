import React, { useEffect, useRef, useState } from 'react'

interface Rectangle {
    type: 'rectangle';
    points: { x: number, y: number };
    width: number;
    height: number;
    lineWidth: number
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
    points: { x: number, y: number }[];
    color: string
    lineWidth: number
}

type shapes = Rectangle | Freehand | Circle;

export default function Dashboard() {
    const backgroundRef = useRef<HTMLCanvasElement | null>(null)
    const [freehandPoints, setFreehand] = useState<{ x: number, y: number }[] | null>(null)
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
    const [redoShapes, setRedoShapes] = useState<shapes[] | undefined>(undefined)
    const [viewportTransform, setTransform] = useState({
        x: 0,
        y: 0,
        backgroundScale: 1,
    })
    const dragStartRef = useRef({ x: 0, y: 0 });
    const [erasedPoints, setErasedPoints] = useState<{ x: number, y: number }[] | null>(null)
    // const [savedCanvas, setSavedCanvas] = useState<ImageData | null>(null)

    const reRender = (renderShapes: shapes[]) => {
        const btx = backgroundRef.current?.getContext("2d");
        btx?.setTransform(1, 0, 0, 1, 0, 0)
        btx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
        btx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
        renderShapes.map((shape) => {
            if (shape.type == 'freehand' && btx) {
                btx.strokeStyle = 'white'
                btx.lineWidth = strokeStyle.lineWidth
                btx.lineCap = 'round'
                btx.beginPath()
                shape.points.map((point) => {
                    btx.lineTo(point.x, point.y);
                })
                btx.stroke()
                btx.closePath()
            }
            if (shape.type == 'circle' && btx) {
                btx.strokeStyle = strokeStyle.color;
                btx.lineWidth = strokeStyle.lineWidth;
                btx.beginPath()
                btx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2)
                btx.stroke();
                btx.closePath();
                btx.closePath()
            }
            if (shape.type == 'rectangle' && btx) {
                console.log(shape)
                btx.beginPath()
                btx.strokeStyle = shape.color;
                btx.lineWidth = shape.lineWidth;
                btx.strokeRect(shape.points.x, shape.points.y, shape.width, shape.height)
                btx.closePath()
            }
        })
        erasedPoints?.map((point) => {
            if (btx) {
                btx.globalCompositeOperation = "destination-out";
                btx.lineWidth = eraserStyle;
                btx.lineCap = "round";
                btx.strokeStyle = 'white'
                btx.beginPath()
                btx.lineTo(point.x, point.y);
                btx.stroke();
                btx.closePath()
                btx.globalCompositeOperation = "source-over";
            }
        })
    }

    const handleUndo = (e: any) => {
        if ((e.ctrlKey || e.metaKey) && e.key == 'z' && shapes) {
            console.log("undo")
            const btx = backgroundRef.current?.getContext("2d");
            btx?.setTransform(1, 0, 0, 1, 0, 0)
            btx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
            btx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
            const undoShapes = shapes.slice(0, -1)
            const deletedShape = shapes[shapes?.length - 1]
            undoShapes?.map((shape) => {
                if (shape.type == 'freehand' && btx) {
                    btx.strokeStyle = 'white'
                    btx.lineWidth = strokeStyle.lineWidth
                    btx.lineCap = 'round'
                    btx.beginPath()
                    shape.points.map((point) => {
                        btx.lineTo(point.x, point.y);
                    })
                    btx.stroke()
                    btx.closePath()
                }
                if (shape.type == 'circle' && btx) {
                    btx.strokeStyle = strokeStyle.color;
                    btx.lineWidth = strokeStyle.lineWidth;
                    btx.beginPath()
                    btx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2)
                    btx.stroke();
                    btx.closePath();
                    btx.closePath()
                }
                if (shape.type == 'rectangle' && btx) {
                    btx.beginPath()
                    btx.strokeStyle = shape.color;
                    btx.lineWidth = shape.lineWidth;
                    btx.strokeRect(shape.points.x, shape.points.y, shape.width, shape.height)
                    btx.closePath()
                }
            })
            setRedoShapes((prev) => {
                if (prev && deletedShape) {
                    return [...prev, deletedShape]
                }
                if (deletedShape) {
                    return [deletedShape]
                }
            })
            setShapes(undoShapes)
        }
    }

    const handleRedo = (e: any) => {
        if ((e.ctrlKey || e.metaKey) && e.key && e.key == 'Z' && redoShapes) {
            const btx = backgroundRef.current?.getContext("2d");
            btx?.setTransform(1, 0, 0, 1, 0, 0)
            btx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
            const redoAddedShape = redoShapes[redoShapes.length - 1]
            if (redoAddedShape) {
                if (redoAddedShape.type == 'freehand' && btx) {
                    btx.strokeStyle = 'white'
                    btx.lineWidth = strokeStyle.lineWidth
                    btx.lineCap = 'round'
                    btx.beginPath()
                    redoAddedShape.points.map((point) => {
                        btx.lineTo(point.x, point.y);
                    })
                    btx.stroke()
                    btx.closePath()
                }
                if (redoAddedShape.type == 'circle' && btx) {
                    btx.strokeStyle = strokeStyle.color;
                    btx.lineWidth = strokeStyle.lineWidth;
                    btx.beginPath()
                    btx.arc(redoAddedShape.centerX, redoAddedShape.centerY, redoAddedShape.radius, 0, Math.PI * 2)
                    btx.stroke();
                    btx.closePath();
                    btx.closePath()
                }
                if (redoAddedShape.type == 'rectangle' && btx) {
                    btx.beginPath()
                    btx.strokeStyle = redoAddedShape.color;
                    btx.lineWidth = redoAddedShape.lineWidth;
                    btx.strokeRect(redoAddedShape.points.x, redoAddedShape.points.y, redoAddedShape.width, redoAddedShape.height)
                    btx.closePath()
                }
            }
            setRedoShapes((prev) => prev ? prev.slice(0, -1) : []);
            setShapes((prev) => (prev ? [...prev, redoAddedShape] : [redoAddedShape]));
        }
    }

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        const btx = backgroundRef.current?.getContext("2d");
        btx?.setTransform(1, 0, 0, 1, 0, 0)
        btx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
        if (tools == 'eraser' && btx && coordinates && mouseClicked) {
            btx.globalCompositeOperation = "destination-out";
            btx.lineWidth = eraserStyle;
            btx.lineCap = "round";
            btx.strokeStyle = 'white'
            btx.beginPath()
            btx.lineTo(coordinates.x, coordinates.y);
            btx.stroke();
            btx.closePath()
            btx.globalCompositeOperation = "source-over";
            setErasedPoints((prev) => {
                if (prev) {
                    return [...prev, { x: coordinates.x, y: coordinates.y }]
                }
                else return [{ x: coordinates.x, y: coordinates.y }]
            })
        }
        if (ctx && mouseClicked && coordinates && canvasRef.current) {
            if (tools == 'pen') {
                ctx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
                ctx.lineWidth = strokeStyle.lineWidth;
                ctx.lineCap = "round";
                ctx.strokeStyle = strokeStyle.color;

                ctx.lineTo(coordinates.x, coordinates.y);
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(coordinates.x, coordinates.y)
                ctx.closePath()
                return
            }

            if (tools == 'circle' && rectStart) {
                if (ctx && tools == 'circle') {
                    ctx?.setTransform(1, 0, 0, 1, 0, 0)
                    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
                    ctx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
                    ctx.strokeStyle = strokeStyle.color;
                    ctx.lineWidth = strokeStyle.lineWidth;
                    const centerX = (rectStart.x + coordinates.x) / 2;
                    const centerY = (rectStart.y + coordinates.y) / 2;
                    const radius = Math.abs(((coordinates.x - rectStart.x) / 2 + (coordinates.y - rectStart.y) / 2) / 2)
                    ctx.beginPath()
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                    ctx.stroke();
                    ctx.closePath();
                    return
                }
            }
            if (tools == 'rectangle' && rectStart) {
                if (ctx && tools == 'rectangle') {
                    ctx?.setTransform(1, 0, 0, 1, 0, 0)
                    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
                    ctx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
                    ctx.strokeStyle = strokeStyle.color;
                    ctx.lineWidth = strokeStyle.lineWidth;
                    const width = coordinates.x - rectStart.x
                    const height = coordinates.y - rectStart.y;
                    ctx.beginPath()
                    ctx.strokeRect(rectStart.x, rectStart.y, width, height)
                    ctx.closePath()
                    return
                }
            }
        }
        if (shapes) {
            window.addEventListener("keydown", handleUndo);
        }
        if (redoShapes) {
            window.addEventListener('keydown', handleRedo)
        }

        if (strokeEdit || eraserEdit) {
            const stroketimeOut = setTimeout(() => {
                setStrokeEdit(false)
                setEraserEdit(false)
            }, 3000);
            return () => clearInterval(stroketimeOut)
        }
        return () => {
            window.removeEventListener("keydown", handleUndo);
            window.removeEventListener("keydown", handleRedo);
        }

    }, [coordinates, tools, strokeEdit, eraserEdit, shapes, viewportTransform])

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setMouseClicked(true);

        // pan logic
        if (tools === "hand") {
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        }

        const ctx = canvasRef.current?.getContext("2d");
        if (tools == 'mouse') {
            const x = (e.clientX - viewportTransform.x) / viewportTransform.backgroundScale;
            const y = (e.clientY - viewportTransform.y) / viewportTransform.backgroundScale;
            console.log(x, y)
        }
        if (ctx && (tools == 'rectangle' || tools == 'circle') && canvasRef.current) {
            const x = (e.clientX - viewportTransform.x) / viewportTransform.backgroundScale;
            const y = (e.clientY - viewportTransform.y) / viewportTransform.backgroundScale;
            setRectStart({ x, y })
        }
        if (ctx && canvasRef.current && tools != 'mouse') {
            const x = (e.clientX - viewportTransform.x) / viewportTransform.backgroundScale;
            const y = (e.clientY - viewportTransform.y) / viewportTransform.backgroundScale;


            ctx.beginPath();
            setCoordinates({ x, y });
            if (tools == 'pen') {
                setFreehand((prev) => {
                    if (prev) {
                        return [...prev, { x, y }]
                    } else {
                        return [{ x, y }]
                    }
                })
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!mouseClicked) return;

        const x = (e.clientX - viewportTransform.x) / viewportTransform.backgroundScale;
        const y = (e.clientY - viewportTransform.y) / viewportTransform.backgroundScale;

        // pan logic
        if (tools === "hand" && shapes) {
            const dx = (e.clientX - dragStartRef.current.x) / viewportTransform.backgroundScale * 0.4;
            const dy = (e.clientY - dragStartRef.current.y) / viewportTransform.backgroundScale * 0.4;

            setTransform((prev) => ({
                x: prev.x + dx,
                y: prev.y + dy,
                backgroundScale: prev.backgroundScale,
            }));

            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY
            };

            reRender(shapes);
        }

        setCoordinates({ x, y });
        if (tools == 'pen') {
            setFreehand((prev) => {
                if (prev) {
                    return [...prev, { x, y }]
                } else {
                    return [{ x, y }]
                }
            })
        }
    };

    const handleMouseUp = () => {
        setRedoShapes([])
        const btx = backgroundRef.current?.getContext("2d");
        const ctx = canvasRef.current?.getContext("2d");
        btx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
        ctx?.setTransform(viewportTransform.backgroundScale, 0, 0, viewportTransform.backgroundScale, viewportTransform.x, viewportTransform.y)
        if (tools == 'pen' && freehandPoints) {
            if (btx) {
                btx.strokeStyle = 'white'
                btx.lineWidth = strokeStyle.lineWidth
                btx.lineCap = 'round'
                btx.beginPath()
                freehandPoints.map((point) => {
                    btx.lineTo(point.x, point.y);
                })
                btx.stroke()
                btx.closePath()
            }
            ctx?.setTransform(1, 0, 0, 1, 0, 0)
            ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
            setShapes((prev) => {
                if (prev != null) {
                    return [...prev, { type: 'freehand', points: freehandPoints, color: strokeStyle.color, lineWidth: strokeStyle.lineWidth }]
                } else {
                    return [{ type: 'freehand', points: freehandPoints, color: strokeStyle.color, lineWidth: strokeStyle.lineWidth }]
                }
            })
            setFreehand(null)
        }
        if (tools == 'rectangle' && coordinates && rectStart && btx) {
            ctx?.setTransform(1, 0, 0, 1, 0, 0)
            ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
            btx.beginPath()
            btx.strokeStyle = strokeStyle.color;
            btx.lineWidth = strokeStyle.lineWidth;
            const width = coordinates.x - rectStart.x
            const height = coordinates.y - rectStart.y;
            btx.strokeRect(rectStart.x, rectStart.y, width, height)
            btx.closePath()
            setShapes((prev) => {
                if (prev != null) {
                    return [...prev, { type: 'rectangle', points: { x: rectStart?.x, y: rectStart?.y }, width: (coordinates.x - rectStart.x), height: (coordinates.y - rectStart.y), lineWidth: strokeStyle.lineWidth, color: strokeStyle.color }]
                }
                else {
                    return [{ type: 'rectangle', points: { x: rectStart?.x, y: rectStart?.y }, width: (coordinates.x - rectStart.x), height: (coordinates.y - rectStart.y), lineWidth: strokeStyle.lineWidth, color: strokeStyle.color }]
                }
            })
        }
        if (tools == 'circle' && rectStart && coordinates && btx) {
            ctx?.setTransform(1, 0, 0, 1, 0, 0)
            ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight)
            btx.strokeStyle = strokeStyle.color;
            btx.lineWidth = strokeStyle.lineWidth;
            const centerX = (rectStart.x + coordinates.x) / 2;
            const centerY = (rectStart.y + coordinates.y) / 2;
            const radius = Math.abs(((coordinates.x - rectStart.x) / 2 + (coordinates.y - rectStart.y) / 2) / 2)
            btx.beginPath()
            btx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            btx.stroke();
            btx.closePath();
            btx.closePath()
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

    const cursorType = () => {
        if (tools == 'rectangle' || tools == 'circle') {
            return "crosshair"
        }
        if (tools == 'hand') {
            if (mouseClicked) {
                return 'grabbing'
            }
            return 'grab'
        }
        else return "default"
    }

    const handleZoom = (e: any) => {
        if (backgroundRef.current && canvasRef.current && shapes) {
            const oldX = viewportTransform.x;
            const oldY = viewportTransform.y;

            const localX = e.clientX;
            const localY = e.clientY;
            const previousScale = viewportTransform.backgroundScale;

            const newScale = viewportTransform.backgroundScale += e.deltaY * 0.001;

            const newX = localX - (localX - oldX) * (newScale / previousScale);
            const newY = localY - (localY - oldY) * (newScale / previousScale);
            setTransform({ x: newX, y: newY, backgroundScale: newScale })
            reRender(shapes)
        }
    }

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
                onWheel={handleZoom}
                style={{ cursor: (cursorType()) }}
            />
            <canvas
                ref={backgroundRef}
                width={window?.innerWidth}
                height={window?.innerHeight}
                className='w-[100vw] h-[100vh] absolute top-0 left-0 -z-10' />
            <div className='bg-zinc-800 w-fit h-fit fixed top-10 px-1 right-10 rounded-lg flex flex-col divide-y-[1px] divide-[#e3e3e8]'>
                <span className='relative'>
                    <img aria-selected={tools == 'pen'} onClick={() => setTools('pen')} src="/pen.png" className='w-8 px-1 py-[6px] my-[6px] rounded-md aria-selected:bg-zinc-600 cursor-pointer' alt="" />
                    <div className='fixed left-10 top-10 text-white text-sm font-normal flex flex-col'>
                        <span aria-selected={tools == 'pen' || tools == 'rectangle' || tools == 'circle'} className="flex-col gap-2 hidden aria-selected:flex rounded-t-md px-3 py-3 bg-zinc-800">
                            <p>Color</p>
                            <span className='flex gap-2'>
                                <div aria-selected={strokeStyle.color == '#fff'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#fff' }))} className="bg-white h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                                <div aria-selected={strokeStyle.color == '#000000'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#000000' }))} className="bg-black h-5 w-5 rounded-[4px] cursor-pointer outline-1 aria-selected:outline outline-offset-2 outline-white" />
                                <div aria-selected={strokeStyle.color == '#dc2626'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#dc2626' }))} className="bg-red-600 h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                                <div aria-selected={strokeStyle.color == '#60a5fa'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#60a5fa' }))} className="bg-blue-400 h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                                <div aria-selected={strokeStyle.color == '#4ade80'} onClick={() => setStrokeStyle((prev) => ({ ...prev, color: '#4ade80' }))} className="bg-green-400 h-5 w-5 rounded-[4px] outline-1 aria-selected:outline outline-offset-2 outline-white cursor-pointer" />
                            </span>
                        </span>
                        <span aria-selected={tools == 'pen' || tools == 'eraser' || tools == 'rectangle' || tools == 'circle'} className="flex-col gap-2 px-3 py-3 rounded-b-md hidden aria-selected:flex bg-zinc-800">
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
                    <img aria-selected={tools == 'hand'} onClick={() => setTools('hand')} src="/hand.png" className='w-8 h-7 py-[2px] my-[6px] rounded-md aria-selected:bg-zinc-600 cursor-pointer mx-auto px-[6px]' alt="" />
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
