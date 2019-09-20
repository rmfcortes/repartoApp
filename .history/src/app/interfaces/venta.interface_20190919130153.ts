export interface Pedido {
    cliente: string;
    pedido: ProdsDir;
    usuario: string;
    createdAt: number;
}

export interface ProdsDir {
    direccion: Direccion;
    id: string;
    productos: Producto[];
}

export interface Producto {
    cantidad: number;
    precio: number;
    nombre: string;
}

export interface Direccion {
    lat: number;
    lng: number;
    direccion: string;
}

export interface DatosVenta {
    direccion: string;
    hora: number;
    id: string;
    lat: number;
    lng: number;
    total: number;
}