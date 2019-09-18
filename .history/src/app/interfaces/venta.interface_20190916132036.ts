export interface PedidoCliente {
    client: string;
    pedido: Pedido;
}

export interface Pedido {
    direccion: Direccion;
    pedido: Producto;
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