export interface Producto {
    id: string;
    foto: string;
    nombre: string;
    precio: any;
    unidad: string;
    cantidad?: number;
    agregado?: boolean;
}

export interface ProductoCarga {
    precio: any;
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
