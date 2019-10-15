export interface Producto {
    id: string;
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
    id: string;
    cantidad?: number;
    agregado?: boolean;
    precioEspecial?: number;
}

export interface ResumenViaje {
    venta: number;
    gasto: number;
}
