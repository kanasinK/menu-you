import { z } from 'zod';

// Base Master Data Schema
export const BaseMasterSchema = z.object({
  id: z.number(),
  code: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Master Data Types
export const ServiceTypeSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ThemeSchema = BaseMasterSchema.extend({
  label: z.string(),
  imageGroupName: z.string(),
  imageUrls: z.array(z.string()),
});

export const ColorSchema = BaseMasterSchema.extend({
  label: z.string(),
  imageName: z.string(),
  hexCode: z.string(),
  imageUrls: z.string(),
});

export const ItemTypeSchema = BaseMasterSchema.extend({
  label: z.string(),
  category: z.string(),
});

export const ItemSizeSchema = BaseMasterSchema.extend({
  label: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  unit: z.string().default('mm'),
});

export const ItemLayoutSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ItemTextureSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ItemSideSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ItemImageSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ItemDecorateSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ItemMaterialSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const ItemToolTypeSchema = BaseMasterSchema.extend({
  label: z.string(),
  category: z.string(),
});

export const StatusSchema = BaseMasterSchema.extend({
  label: z.string(),
  color: z.string(),
});

export const RoleSchema = BaseMasterSchema.extend({
  label: z.string(),
});

export const PaymentStatusSchema = BaseMasterSchema.extend({
  label: z.string(),
  color: z.string(),
});

export const ProductCategorySchema = BaseMasterSchema.extend({
  name: z.string(),
});

export const ProductSchema = BaseMasterSchema.extend({
  name: z.string(),
  categoryId: z.number().nullable(),
  description: z.string().nullable(),
});

export const OrientationSchema = BaseMasterSchema.extend({
  name: z.string(),
});

export const PageOptionSchema = BaseMasterSchema.extend({
  name: z.string(),
});

export const ImageOptionSchema = BaseMasterSchema.extend({
  name: z.string(),
});

export const BrandOptionSchema = BaseMasterSchema.extend({
  name: z.string(),
});

export const CoatingSchema = BaseMasterSchema.extend({
  name: z.string(),
});

export const EquipmentSchema = BaseMasterSchema.extend({
  name: z.string(),
  category: z.string().nullable(),
});

// Member Types
export const MemberSchema = z.object({
  id: z.number().optional(),
  userName: z.string().min(1, 'ชื่อผู้ใช้จำเป็น'),
  nickname: z.string().nullable(),
  email: z.string().email('อีเมลไม่ถูกต้อง').nullable(),
  roleCode: z.string().min(1, 'บทบาทจำเป็น'),
  status: z.boolean().default(true),
  password: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Order Types
export const OrderSchema = z.object({
  id: z.number().optional(),
  code: z.string().optional(),
  fullName: z.string().min(1, 'ชื่อ-นามสกุลจำเป็น'),
  statusCode: z.string().nullable(),
  serviceTypeCode: z.string().nullable(),
  shippingAddress: z.string().nullable(),
  shippingName: z.string().nullable(),
  coPartnerId: z.number().nullable(),
  shopName: z.string().nullable(),
  email: z.string().email('อีเมลไม่ถูกต้อง').nullable(),
  tel: z.string().nullable(),
  facebook: z.string().nullable(),
  line: z.string().nullable(),
  designerOwnerId: z.number().nullable(),
  moodTone: z.array(z.string()).nullable(), // Array of color codes
  themeCode: z.string().nullable(),
  brief: z.string().nullable(), // ข้อมูลเพิ่มเติมการออกแบบเท่านั้น
  price: z.number().nullable(),
  designerBudget: z.number().nullable(),
  fileUrl: z.string().nullable(),
  preProductionOwnerId: z.number().nullable(),
  jobOwnerId: z.number().nullable(),
  discount: z.number().nullable(),
  paymentStatusCode: z.string().nullable(),
  paid: z.number().nullable(),
  shipperOwnerId: z.number().nullable(),
  shippingTel: z.string().nullable(),
  shippingPrice: z.number().nullable(),
  acceptDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OrderItemSchema = z.object({
  id: z.number().optional(),
  productionOwnerId: z.number().nullable(),
  itemTypeOther: z.string().nullable(),
  sizeCode: z.string().nullable(),
  sizeOther: z.string().nullable(),
  layoutCode: z.string().nullable(),
  textureCode: z.string().nullable(),
  sideCode: z.string().nullable(),
  imageCode: z.string().nullable(),
  decorateCode: z.string().nullable(),
  materialCode: z.string().nullable(),
  materialOther: z.string().nullable(),
  quantity: z.number().nullable(),
  itemPrice: z.number().nullable(),
  designerPrice: z.number().nullable(),
  toolTypeCode: z.string().nullable(),
  height: z.number().nullable(),
  itemTypeCode: z.string().nullable(),
  orderId: z.number(),
  width: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MaterialsSchema = z.object({
  id: z.number().optional(),
  orderId: z.number(),
  materialCode: z.string().nullable(),
  materialOther: z.string().nullable(),
  quantity: z.number().nullable(),
  price: z.number().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Claim Types
export const ClaimOrderSchema = z.object({
  id: z.number().optional(),
  orderId: z.number(),
  description: z.string().optional(),
  reporterName: z.string().optional(),
  reportedBy: z.enum(['customer', 'internal']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
  claimType: z.enum(['quality', 'delivery', 'design', 'other']).optional(),
  admin: z.boolean().default(false),
  designer: z.boolean().default(false),
  productionTeam: z.boolean().default(false),
  shipper: z.boolean().default(false),
  preProduction: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClaimOrderItemSchema = z.object({
  id: z.number().optional(),
  claimId: z.string().optional(),
  productionOwnerId: z.number().nullable(),
  itemTypeOther: z.string().nullable(),
  itemTypeCode: z.string().nullable(),
  sizeCode: z.string().nullable(),
  sizeOther: z.string().nullable(),
  layoutCode: z.string().nullable(),
  textureCode: z.string().nullable(),
  sideCode: z.string().nullable(),
  imageCode: z.string().nullable(),
  decorateCode: z.string().nullable(),
  materialCode: z.string().nullable(),
  materialOther: z.string().nullable(),
  quantity: z.number().nullable(),
  itemPrice: z.number().nullable(),
  designerPrice: z.number().nullable(),
  toolTypeCode: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Query Types
export const OrderQuerySchema = z.object({
  q: z.string().optional(),
  statusCode: z.string().optional(),
  paymentStatusCode: z.string().optional(),
  serviceTypeCode: z.string().optional(),
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(10),
  sort: z.string().optional(),
});

// Type exports
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type ItemType = z.infer<typeof ItemTypeSchema>;
export type ItemSize = z.infer<typeof ItemSizeSchema>;
export type ItemLayout = z.infer<typeof ItemLayoutSchema>;
export type ItemTexture = z.infer<typeof ItemTextureSchema>;
export type ItemSide = z.infer<typeof ItemSideSchema>;
export type ItemImage = z.infer<typeof ItemImageSchema>;
export type ItemDecorate = z.infer<typeof ItemDecorateSchema>;
export type ItemMaterial = z.infer<typeof ItemMaterialSchema>;
export type ItemToolType = z.infer<typeof ItemToolTypeSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Orientation = z.infer<typeof OrientationSchema>;
export type PageOption = z.infer<typeof PageOptionSchema>;
export type ImageOption = z.infer<typeof ImageOptionSchema>;
export type BrandOption = z.infer<typeof BrandOptionSchema>;
export type Coating = z.infer<typeof CoatingSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;

export type Member = z.infer<typeof MemberSchema>;

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Materials = z.infer<typeof MaterialsSchema>;

export type ClaimOrder = z.infer<typeof ClaimOrderSchema>;
export type ClaimOrderItem = z.infer<typeof ClaimOrderItemSchema>;

export type OrderQuery = z.infer<typeof OrderQuerySchema>;

// Master Item Interface
export interface MasterItem {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown; // สำหรับ properties เพิ่มเติม
}

// Master Data Collection Type
export interface MasterData {
  serviceTypes: MasterItem[];
  themes: MasterItem[];
  colors: MasterItem[];
  products: MasterItem[];
  sizes: MasterItem[];
  orientations: MasterItem[];
  pageOptions: MasterItem[];
  imageOptions: MasterItem[];
  brandOptions: MasterItem[];
  materials: MasterItem[];
  coatings: MasterItem[];
  equipments: MasterItem[];
  roles: MasterItem[];
  status: MasterItem[];
  paymentStatus: MasterItem[];
  // เพิ่มข้อมูลอื่นๆ ตามต้องการ
  itemTypes: MasterItem[];
  itemSizes: MasterItem[];
  itemLayouts: MasterItem[];
  itemTextures: MasterItem[];
  itemSides: MasterItem[];
  itemImages: MasterItem[];
  itemDecorates: MasterItem[];
  itemMaterials: MasterItem[];
  itemToolTypes: MasterItem[];
  productCategories: MasterItem[];
  toolTypes: MasterItem[];
}

// Legacy Form Schemas (for backward compatibility)
export const ContactSchema = z.object({
  customerName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const ShippingSchema = z.object({
  address: z.string().optional(),
  method: z.enum(["delivery", "pickup"]).default("delivery"),
  cost: z.number().default(0),
  estimatedDate: z.string().optional(),
});

export const DesignInfoSchema = z.object({
  concept: z.string().optional(),
  notes: z.string().optional(),
  files: z.array(z.string()).default([]),
});

// Pagination Type
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}