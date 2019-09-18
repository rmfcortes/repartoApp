export interface Compra {
    cantidad: number;
    costo: number;
    descripcion: string;
    fecha?: Date;
    key?: string;
    nombre: string;
    proveedor: string;
    tipo: string;
    total: number;
    url?: string;
    viaje: string;
}

export interface Cliente {
    lat: number;
    lng: number;
    clienteId: string;
}
