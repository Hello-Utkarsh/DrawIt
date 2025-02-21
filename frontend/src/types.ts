export interface Rectangle {
    type: 'rectangle';
    start: { x: number, y: number };
    width: number;
    height: number;
    lineWidth: number
    color: string
}

export interface Text {
    type: 'text'
    content: string
    start: { x: number, y: number }
    end: { x: number, y: number }
    fontSize: number
    color: string
}

export interface Line {
    type: 'line'
    start: { x: number, y: number }
    end: { x: number, y: number }
    lineWidth: number
    color: string
}

export interface Circle {
    type: 'circle'
    centerX: number
    centerY: number
    radius: number
    color: string
    lineWidth: number
}

export interface Freehand {
    type: 'freehand';
    points: { x: number, y: number }[];
    color: string
    lineWidth: number
}

export interface Arrow {
    type: 'arrow'
    start: { x: number, y: number }
    end: { x: number, y: number }
    color: string
    lineWidth: number
}

export type shapes = Rectangle | Freehand | Circle | Line | Arrow | Text;