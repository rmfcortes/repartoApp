export interface Pedido {
    cliente: string;
    pedido: ProdsDir;
    minutos?: number;
    segundos?: number;
    msgPend?: boolean;
}

export interface ProdsDir {
    direccion: Direccion;
    id: string;
    createdAt: number;
    productos: Producto[];
    usuario: string;
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
    hora: number;
    id?: string;
    lat: number;
    lng: number;
    total: number;
}

export interface ClienteDesatendido {
    cliente: string;
    lat: number;
    lng: number;
    ultimaCompra: string;
}