export interface Producto {
    foto: string;
    nombre: string;
    precio: number;
    unidad: string;
    cantidad?: number;
    agregado?: boolean;
}

export interface ProductoCarga {
    precio: number;
    nombre: string;
    inicial: number;
    actual: number;
    cantidad?: number;
    agregado?: boolean;
}

export interface ResumenViaje {
    venta: number;
    gasto: number;
}
