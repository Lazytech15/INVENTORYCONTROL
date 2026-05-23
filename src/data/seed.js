import { addDays, subDays, format } from 'date-fns'

const today = new Date()

export const CATEGORIES = ['Electronics', 'Apparel', 'Home Goods', 'Food & Bev', 'Office', 'Tools']

export const SUPPLIERS = [
  { id: 'sup-1', name: 'TechSource PH',   contact: 'techsource@ph.com',  phone: '+63 917 111 2222' },
  { id: 'sup-2', name: 'FashionLink',      contact: 'orders@fashionlink.ph', phone: '+63 918 333 4444' },
  { id: 'sup-3', name: 'HomeBase Dist.',   contact: 'supply@homebase.ph', phone: '+63 919 555 6666' },
  { id: 'sup-4', name: 'BrewLink Corp.',   contact: 'orders@brewlink.ph', phone: '+63 920 777 8888' },
  { id: 'sup-5', name: 'OfficePro PH',     contact: 'sales@officepro.ph', phone: '+63 921 999 0000' },
]

export const USERS = [
  { id: 'u1', name: 'Admin User',   email: 'admin@stockmaster.ph',   password: 'admin123',   role: 'admin'   },
  { id: 'u2', name: 'Maria Santos', email: 'manager@stockmaster.ph', password: 'manager123', role: 'manager' },
  { id: 'u3', name: 'Juan Dela Cruz',email: 'staff@stockmaster.ph',  password: 'staff123',   role: 'staff'   },
]

export const INITIAL_PRODUCTS = [
  { id: 'p1',  sku: 'EL-0042', name: 'USB-C Hub 7-Port',       category: 'Electronics', qty: 4,   reorderAt: 20, costPrice: 850,   salePrice: 1200,  supplierId: 'sup-1', barcode: '8901234567890', description: '7-port USB-C hub with PD charging' },
  { id: 'p2',  sku: 'AP-0187', name: 'Slim Jogger Pants (M)',  category: 'Apparel',     qty: 11,  reorderAt: 25, costPrice: 350,   salePrice: 649,   supplierId: 'sup-2', barcode: '8902345678901', description: 'Slim-fit jogger pants size M' },
  { id: 'p3',  sku: 'HG-0063', name: 'Ceramic Mug Set x6',    category: 'Home Goods',  qty: 8,   reorderAt: 15, costPrice: 420,   salePrice: 750,   supplierId: 'sup-3', barcode: '8903456789012', description: 'Set of 6 ceramic mugs' },
  { id: 'p4',  sku: 'EL-0091', name: 'Wireless Earbuds Pro',  category: 'Electronics', qty: 16,  reorderAt: 30, costPrice: 1200,  salePrice: 1899,  supplierId: 'sup-1', barcode: '8904567890123', description: 'True wireless earbuds with ANC' },
  { id: 'p5',  sku: 'FB-0024', name: 'Premium Instant Coffee', category: 'Food & Bev',  qty: 5,   reorderAt: 40, costPrice: 180,   salePrice: 299,   supplierId: 'sup-4', barcode: '8905678901234', description: 'Premium blend instant coffee 200g' },
  { id: 'p6',  sku: 'AP-0203', name: 'Classic Polo Shirt (L)', category: 'Apparel',     qty: 19,  reorderAt: 20, costPrice: 280,   salePrice: 499,   supplierId: 'sup-2', barcode: '8906789012345', description: 'Classic polo shirt size L' },
  { id: 'p7',  sku: 'OF-0011', name: 'A4 Bond Paper (500s)',  category: 'Office',      qty: 120, reorderAt: 50, costPrice: 180,   salePrice: 250,   supplierId: 'sup-5', barcode: '8907890123456', description: '500 sheets A4 80gsm bond paper' },
  { id: 'p8',  sku: 'EL-0055', name: 'HDMI Cable 2m',         category: 'Electronics', qty: 45,  reorderAt: 15, costPrice: 150,   salePrice: 299,   supplierId: 'sup-1', barcode: '8908901234567', description: '4K HDMI 2.0 cable 2 meters' },
  { id: 'p9',  sku: 'HG-0077', name: 'Bamboo Cutting Board',  category: 'Home Goods',  qty: 22,  reorderAt: 10, costPrice: 220,   salePrice: 399,   supplierId: 'sup-3', barcode: '8909012345678', description: 'Large bamboo cutting board' },
  { id: 'p10', sku: 'FB-0038', name: 'Green Tea 25-bag',      category: 'Food & Bev',  qty: 88,  reorderAt: 30, costPrice: 85,    salePrice: 149,   supplierId: 'sup-4', barcode: '8910123456789', description: 'Premium green tea 25 teabags' },
  { id: 'p11', sku: 'AP-0144', name: 'Sports Socks (3-pack)', category: 'Apparel',     qty: 55,  reorderAt: 20, costPrice: 120,   salePrice: 199,   supplierId: 'sup-2', barcode: '8911234567890', description: 'Athletic socks 3-pack assorted' },
  { id: 'p12', sku: 'OF-0029', name: 'Ballpen Set (12pcs)',   category: 'Office',      qty: 200, reorderAt: 60, costPrice: 55,    salePrice: 99,    supplierId: 'sup-5', barcode: '8912345678901', description: 'Black ballpen set 12 pieces' },
]

// Generate last 30 days of movements
export const generateMovements = (products) => {
  const movements = []
  let id = 1
  products.forEach(p => {
    for (let d = 29; d >= 0; d--) {
      const date = subDays(today, d)
      if (Math.random() > 0.4) {
        movements.push({
          id: `mv-${id++}`,
          productId: p.id,
          sku: p.sku,
          productName: p.name,
          type: Math.random() > 0.4 ? 'outbound' : 'inbound',
          qty: Math.floor(Math.random() * 20) + 1,
          date: format(date, 'yyyy-MM-dd'),
          note: Math.random() > 0.5 ? 'Regular sale' : 'Restock',
          userId: USERS[Math.floor(Math.random() * USERS.length)].id,
        })
      }
    }
  })
  return movements
}

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: 'po-001',
    poNumber: 'PO-2024-001',
    supplierId: 'sup-1',
    status: 'delivered',
    createdAt: format(subDays(today, 20), 'yyyy-MM-dd'),
    deliveredAt: format(subDays(today, 15), 'yyyy-MM-dd'),
    items: [
      { productId: 'p1', sku: 'EL-0042', name: 'USB-C Hub 7-Port', qty: 50, unitCost: 850 },
      { productId: 'p4', sku: 'EL-0091', name: 'Wireless Earbuds Pro', qty: 30, unitCost: 1200 },
    ],
    notes: 'Urgent restock for electronics',
  },
  {
    id: 'po-002',
    poNumber: 'PO-2024-002',
    supplierId: 'sup-2',
    status: 'pending',
    createdAt: format(subDays(today, 3), 'yyyy-MM-dd'),
    deliveredAt: null,
    items: [
      { productId: 'p2', sku: 'AP-0187', name: 'Slim Jogger Pants (M)', qty: 40, unitCost: 350 },
      { productId: 'p6', sku: 'AP-0203', name: 'Classic Polo Shirt (L)', qty: 30, unitCost: 280 },
    ],
    notes: 'Seasonal restock',
  },
]