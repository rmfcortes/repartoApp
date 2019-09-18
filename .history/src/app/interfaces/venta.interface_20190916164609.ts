export interface Pedido {
    cliente: string;
    pedido: ProdsDir;
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