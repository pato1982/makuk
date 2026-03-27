// Zonas de despacho Makuk
// Los precios son en pesos chilenos (CLP)

export const SHIPPING_ZONES = [
  {
    id: 'rm_central',
    name: 'RM - Comunas Centrales',
    price: 3600,
    communes: ['Santiago', 'Providencia', 'La Florida'],
  },
  {
    id: 'rm_periferia1',
    name: 'RM - Periferia 1',
    price: 6000,
    communes: ['Colina', 'Buin', 'San Bernardo', 'Maipú', 'Padre Hurtado'],
  },
  {
    id: 'rm_periferia2',
    name: 'RM - Periferia 2',
    price: 6900,
    communes: ['Melipilla', 'Talagante', 'Lo Barnechea', 'Chicureo', 'Huechuraba', 'Quilicura', 'Las Condes'],
  },
];

export const DEFAULT_SHIPPING_PRICE = 7000;
export const DEFAULT_SHIPPING_NAME = 'Otras regiones';

export function getShippingCost(commune) {
  if (!commune) return { zone: DEFAULT_SHIPPING_NAME, price: DEFAULT_SHIPPING_PRICE };
  const normalized = commune.trim().toLowerCase();
  for (const zone of SHIPPING_ZONES) {
    if (zone.communes.some(c => c.toLowerCase() === normalized)) {
      return { zone: zone.name, price: zone.price };
    }
  }
  return { zone: DEFAULT_SHIPPING_NAME, price: DEFAULT_SHIPPING_PRICE };
}
