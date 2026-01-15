"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";
import { useMasterStore } from "@/store/masterStore";
import { useMemberStore } from "@/store/memberStore";
import { useToast } from "@/hooks/use-toast";
import { ColorCodesField } from "@/components/forms/ColorCodesField";
import { ThemeField } from "@/components/forms/ThemeField";
import OrderDesignItems from "@/components/forms/OrderDesignItems";

const orderFormSchema = z
  .object({
    // Main form fields
    serviceTypeCode: z.string().min(1, "ประเภทบริการจำเป็น"),
    themeCode: z.string().optional(),
    colorCodes: z.array(z.string()).optional(),
    status: z.string().min(1, "สถานะจำเป็น"),
    paymentStatus: z.string().min(1, "สถานะการชำระเงินจำเป็น"),
    assigneeId: z.string().min(1, "ผู้รับผิดชอบจำเป็น"),
    // Additional fields from web form
    fullName: z
      .string()
      .min(1, "ชื่อ-นามสกุลจำเป็น")
      .max(100, "ชื่อ-นามสกุลยาวเกินไป")
      .regex(/^[ก-๙a-zA-Z\s]+$/, "ชื่อ-นามสกุลควรเป็นตัวอักษรเท่านั้น"),
    shopName: z.string().min(1, "ชื่อร้านจำเป็น").max(100, "ชื่อร้านยาวเกินไป"),
    tel: z
      .string()
      .min(1, "เบอร์โทรศัพท์จำเป็น")
      .regex(
        /^0\d{8,9}$/,
        "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)"
      ),
    email: z
      .string()
      .email("รูปแบบอีเมลไม่ถูกต้อง")
      .optional()
      .or(z.literal("")),
    facebook: z.string().max(50, "ชื่อ Facebook ยาวเกินไป").optional(),
    line: z.string().max(50, "ชื่อ Line ยาวเกินไป").optional(),
    isSameAddressAsContact: z.boolean(),
    shippingName: z.string().optional(),
    shippingTel: z
      .string()
      .regex(/^0\d{8,9}$/, "เบอร์โทรศัพท์ผู้รับไม่ถูกต้อง")
      .optional()
      .or(z.literal("")),
    shippingAddress: z.string().optional(),
    designInfoText: z.string().optional(),

    // Design Items (UI เท่านั้น ยังไม่แมพเข้าข้อมูลหลัก)
    items: z
      .array(
        z.object({
          productCode: z.string().optional(),
          productOther: z.string().optional(),
          sizeCode: z.string().optional(),
          sizeWidth: z.string().optional(),
          sizeHeight: z.string().optional(),
          orientationCode: z.string().optional(),
          coatingCode: z.string().optional(),
          pageOptionCode: z.string().optional(),
          imageOptionCode: z.string().optional(),
          brandOptionCode: z.string().optional(),
          quantity: z.string().optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      // At least one contact method (Facebook or Line) is required
      return data.facebook || data.line;
    },
    {
      message: "กรุณากรอก Facebook หรือ Line อย่างน้อย 1 ช่องทาง",
      path: ["facebook"],
    }
  )
  .refine(
    (data) => {
      // For delivery/shipping service types, shipping name is required
      if (
        data.serviceTypeCode === "PRODUCTION_ONLY" ||
        data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
      ) {
        return data.shippingName && data.shippingName.trim().length > 0;
      }
      return true;
    },
    {
      message: "ชื่อผู้รับจำเป็นสำหรับบริการจัดส่ง",
      path: ["shippingName"],
    }
  )
  .refine(
    (data) => {
      // For delivery/shipping service types, shipping tel is required
      if (
        data.serviceTypeCode === "PRODUCTION_ONLY" ||
        data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
      ) {
        return data.shippingTel && /^0\d{8,9}$/.test(data.shippingTel);
      }
      return true;
    },
    {
      message: "เบอร์โทรศัพท์ผู้รับจำเป็นและต้องถูกต้องสำหรับบริการจัดส่ง",
      path: ["shippingTel"],
    }
  )
  .refine(
    (data) => {
      // For delivery/shipping service types, shipping address is required
      if (
        data.serviceTypeCode === "PRODUCTION_ONLY" ||
        data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
      ) {
        return data.shippingAddress && data.shippingAddress.trim().length > 0;
      }
      return true;
    },
    {
      message: "ที่อยู่จัดส่งจำเป็นสำหรับบริการจัดส่ง",
      path: ["shippingAddress"],
    }
  )
  .refine(
    (data) => {
      // For design service types, theme is required
      if (
        data.serviceTypeCode === "DESIGN_ONLY" ||
        data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
      ) {
        return data.themeCode;
      }
      return true;
    },
    {
      message: "ธีมจำเป็นสำหรับบริการออกแบบ",
      path: ["themeCode"],
    }
  )
  .refine(
    (data) => {
      // For design service types, colors are required (1-3 colors)
      if (
        data.serviceTypeCode === "DESIGN_ONLY" ||
        data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
      ) {
        return (
          data.colorCodes &&
          data.colorCodes.length >= 1 &&
          data.colorCodes.length <= 3
        );
      }
      return true;
    },
    {
      message: "กรุณาเลือกสี 1-3 สีสำหรับบริการออกแบบ",
      path: ["colorCodes"],
    }
  );

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  orderId?: string;
}

const OrderForm = ({ orderId }: OrderFormProps) => {
  const router = useRouter();
  const { selectedOrder, selectOrder, createOrder, updateOrder } =
    useOrderStore();
  const { getOptionsForSelect, isLoaded: masterLoaded } = useMasterStore();
  const { getActiveMembersOptions } = useMemberStore();
  const { toast } = useToast();

  const isEditing = Boolean(orderId);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema) as unknown as any,
    defaultValues: {
      // Main form fields
      serviceTypeCode: "",
      themeCode: "",
      colorCodes: [],
      status: "PENDING",
      paymentStatus: "PENDING",
      assigneeId: "",
      fullName: "",
      shopName: "",
      tel: "",
      email: "",
      facebook: "",
      line: "",
      isSameAddressAsContact: false,
      shippingName: "",
      shippingTel: "",
      shippingAddress: "",
      designInfoText: "",
      items: [],
    },
  });

  useEffect(() => {
    if (isEditing && orderId) {
      selectOrder(orderId);
    }
  }, [orderId, isEditing, selectOrder]);

  useEffect(() => {
    if (isEditing && selectedOrder && masterLoaded) {
      const resetData = {
        // Main form fields
        serviceTypeCode: (selectedOrder as any).serviceTypeCode ?? "",
        themeCode: (selectedOrder as any).themeCode ?? "",
        colorCodes: (selectedOrder as any).colorCodes ?? [],
        status: String(
          (selectedOrder as any).statusCode ??
            (selectedOrder as any).status ??
            ""
        ),
        paymentStatus: String(
          (selectedOrder as any).paymentStatusCode ??
            (selectedOrder as any).paymentStatus ??
            ""
        ),
        assigneeId: String(
          (selectedOrder as any).designerOwnerId ??
            (selectedOrder as any).assigneeId ??
            ""
        ),
        fullName: selectedOrder.fullName || "",
        shopName: selectedOrder.shopName || "",
        tel: selectedOrder.tel || "",
        email: selectedOrder.email || "",
        facebook: selectedOrder.facebook || "",
        line: selectedOrder.line || "",
        isSameAddressAsContact:
          (selectedOrder as any).isSameAddressAsContact ?? false,
        shippingName: (selectedOrder as any).shippingName || "",
        shippingTel: (selectedOrder as any).shippingTel || "",
        shippingAddress: (selectedOrder as any).shippingAddress || "",
        designInfoText: (selectedOrder as any).designInfoText || "",
        // Items from order_item
        items: ((selectedOrder as any).items || []).map((item: any) => ({
          productCode: item.productCode || "",
          productOther: item.productOther || "",
          sizeCode: item.sizeCode || "",
          sizeWidth: item.sizeWidth ? String(item.sizeWidth) : "",
          sizeHeight: item.sizeHeight ? String(item.sizeHeight) : "",
          orientationCode: item.orientationCode || "",
          coatingCode: item.coatingCode || "",
          pageOptionCode: item.pageOptionCode || "",
          imageOptionCode: item.imageOptionCode || "",
          brandOptionCode: item.brandOptionCode || "",
          quantity: item.quantity ? String(item.quantity) : "",
        })),
      };
      form.reset(resetData);
    }
  }, [isEditing, selectedOrder, masterLoaded, form]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      const rawItems = (form.getValues("items") || []) as Array<any>;
      const designItems = rawItems.map((it) => ({
        productCode: it.productCode || null,
        productOther: it.productOther || null,
        sizeCode: it.sizeCode || null,
        sizeWidth: it.sizeWidth ? Number(it.sizeWidth) : null,
        sizeHeight: it.sizeHeight ? Number(it.sizeHeight) : null,
        orientationCode: it.orientationCode || null,
        coatingCode: it.coatingCode || null,
        pageOptionCode: it.pageOptionCode || null,
        imageOptionCode: it.imageOptionCode || null,
        brandOptionCode: it.brandOptionCode || null,
        quantity: it.quantity ? Number(it.quantity) : null,
      }));

      if (isEditing && selectedOrder) {
        // Map form fields to API fields for update
        const updateData = {
          fullName: data.fullName,
          shopName: data.shopName,
          tel: data.tel,
          email: data.email || null,
          facebook: data.facebook || null,
          line: data.line || null,
          serviceTypeCode: data.serviceTypeCode,
          statusCode: data.status, // form uses 'status', API uses 'statusCode'
          paymentStatusCode: data.paymentStatus, // form uses 'paymentStatus', API uses 'paymentStatusCode'
          shippingName: data.shippingName || null,
          shippingTel: data.shippingTel || null,
          shippingAddress: data.shippingAddress || null,
          themeCode: data.themeCode || null,
          colorCodes: data.colorCodes || [],
          designInfoText: data.designInfoText || null,
          designerOwnerId: data.assigneeId ? Number(data.assigneeId) : null,
          // Include items for design service types
          items:
            data.serviceTypeCode === "DESIGN_ONLY" ||
            data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
              ? designItems
              : [],
        };

        await updateOrder(
          String((selectedOrder as any).id ?? ""),
          updateData as any
        );
        toast({
          title: "สำเร็จ",
          description: "อัปเดตออเดอร์เรียบร้อย",
        });
      } else {
        // Create new order
        const createData = {
          fullName: data.fullName,
          shopName: data.shopName,
          tel: data.tel,
          email: data.email || null,
          facebook: data.facebook || null,
          line: data.line || null,
          serviceTypeCode: data.serviceTypeCode,
          shippingName: data.shippingName || null,
          shippingTel: data.shippingTel || null,
          shippingAddress: data.shippingAddress || null,
          themeCode: data.themeCode || null,
          colorCodes: data.colorCodes || [],
          designInfoText: data.designInfoText || null,
          items:
            data.serviceTypeCode === "DESIGN_ONLY" ||
            data.serviceTypeCode === "DESIGN_AND_PRODUCTION"
              ? designItems
              : [],
        };
        await createOrder(createData as any);
        toast({
          title: "สำเร็จ",
          description: "สร้างออเดอร์ใหม่เรียบร้อย",
        });
      }
      router.push("/orders");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกออเดอร์ได้",
        variant: "destructive",
      });
    }
  };

  const serviceTypeOptions = getOptionsForSelect("serviceTypes");
  const themeOptions = getOptionsForSelect("themes");
  const colorOptions = getOptionsForSelect("colors");
  const statusOptions = getOptionsForSelect("status");
  const paymentStatusOptions = getOptionsForSelect("paymentStatus");
  const memberOptions = getActiveMembersOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? "แก้ไขออเดอร์" : "สร้างออเดอร์ใหม่"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "แก้ไขข้อมูลออเดอร์" : "เพิ่มออเดอร์ใหม่เข้าสู่ระบบ"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลลูกค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อ-นามสกุล *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="กรุณาใส่ชื่อ-นามสกุล"
                            maxLength={100}
                            {...field}
                            onChange={(e) => {
                              // Allow only Thai and English letters and spaces
                              const value = e.target.value.replace(
                                /[^ก-๙a-zA-Z\s]/g,
                                ""
                              );
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อร้าน *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="กรุณาใส่ชื่อร้าน"
                            maxLength={100}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เบอร์โทรศัพท์ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="กรุณาใส่เบอร์โทรศัพท์ (เช่น 0812345678)"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 10) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail ที่ใช้ส่งข้อมูล</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            {...field}
                            onChange={(e) => {
                              // Convert to lowercase for email
                              field.onChange(e.target.value.toLowerCase());
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel>
                    ช่องทางติดต่อล่าสุดกับทางร้าน * (กรุณากรอกอย่างน้อย 1
                    ช่องทาง)
                  </FormLabel>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อ Facebook ที่ใช้ส่งข้อมูล</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="กรุณาใส่ชื่อ Facebook"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="line"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อ Line ที่ใช้ส่งข้อมูล</FormLabel>
                          <FormControl>
                            <Input placeholder="กรุณาใส่ชื่อ Line" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลออเดอร์</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="serviceTypeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ประเภทบริการ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกประเภทบริการ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.code}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สถานะ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.code}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>การชำระเงิน</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานะการชำระ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentStatusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.code}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้รับผิดชอบ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {memberOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Shipping Information - Only show for delivery/shipping service types */}
          {form.watch("serviceTypeCode") === "PRODUCTION_ONLY" ||
          form.watch("serviceTypeCode") === "DESIGN_AND_PRODUCTION" ? (
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลสำหรับจัดส่งสินค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isSameAddressAsContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              const fullName = form.getValues("fullName");
                              const tel = form.getValues("tel");
                              form.setValue("shippingName", fullName);
                              form.setValue("shippingTel", tel);
                            } else {
                              form.setValue("shippingName", "");
                              form.setValue("shippingTel", "");
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          ชื่อ/เบอร์โทรศัพท์เดียวกับผู้ติดต่อ
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="shippingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อผู้รับ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="กรุณาใส่ชื่อผู้รับ"
                            disabled={form.watch("isSameAddressAsContact")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingTel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เบอร์โทรศัพท์ผู้รับ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="กรุณาใส่เบอร์โทรศัพท์ผู้รับ (เช่น 0812345678)"
                            maxLength={10}
                            disabled={form.watch("isSameAddressAsContact")}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 10) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่จัดส่ง *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="กรุณาใส่ที่อยู่จัดส่ง"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Theme and Color Selection - Only show for design service types */}
          {form.watch("serviceTypeCode") === "DESIGN_ONLY" ||
          form.watch("serviceTypeCode") === "DESIGN_AND_PRODUCTION" ? (
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลภาพรวมสำหรับออกแบบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ThemeField
                  control={form.control}
                  name="themeCode"
                  options={themeOptions}
                />

                <ColorCodesField
                  control={form.control}
                  name="colorCodes"
                  options={colorOptions}
                />

                <FormField
                  control={form.control}
                  name="designInfoText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ข้อมูลเพิ่มเติมการออกแบบ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ข้อมูลเพิ่มเติมสำหรับการออกแบบ"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ข้อมูลสำหรับการออกแบบ: งานชิ้นที่ (นำมาจาก webcopy/order.js -> createDesign) */}
                <OrderDesignItems
                  serviceTypeCode={form.watch("serviceTypeCode")}
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อกำหนด และเงื่อนไขการใช้บริการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span>1.</span>
                  <span>
                    กรุณาตรวจเช็ค &quot;ความถูกต้องของข้อมูลและคำสะกด&quot;
                    หรือข้อมูลอื่นๆอีกครั้งก่อนคอนเฟิร์ม
                    หากลูกค้าคอนเฟิร์มแล้วจะไม่สามารถแก้ไขหรือเคลมสินค้าได้ทุกกรณี
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>2.</span>
                  <span>
                    หากมีการเพิ่มรูปภาพ หรือข้อมูลอื่นๆหลังจากการส่งแบบครั้งที่
                    1 จะมีค่าใช้จ่ายเพิ่มเติมตามความเหมาะสม
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>3.</span>
                  <span>
                    กรณีงานออกแบบจากทางร้าน สามารถแก้ไขแบบได้ไม่เกิน 3 ครั้ง
                    (ภายในธีมงานที่กำหนดเบื้องต้น)
                    กรณีลูกค้าต้องการเปลี่ยนแปลงธีมงานหรือรูปแบบงานใหม่
                    จะมีค่าใช้จ่ายเพิ่มเติม
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>4.</span>
                  <span>
                    กรณีลูกค้าให้ทางร้านออกแบบให้ จะได้รับไฟล์ JPG หรือ PDF x3
                    เท่านั้น
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>5.</span>
                  <span>
                    ทางร้านจะเร่ิมออกแบบและผลิต
                    หลังจากที่แอดมินได้รับการคอนเฟิร์มยอด
                    และแจ้งรับทราบเรื่องแล้วเท่านั้น
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>6.</span>
                  <span>
                    กรณีสินค้าเสียหายจากการขนส่งหรือกรณีอื่นๆ จำเป็นต้องใช้ VDO
                    ขณะแกะสินค้าครั้งแรกในการเคลมสินค้าเท่านั้น
                  </span>
                </div>
                <div className="flex gap-2">
                  <span>7.</span>
                  <span>
                    หากไม่เป็นไปตามเงื่อนไข
                    ทางร้านไม่สามารถรับผิดชอบต่อสินค้าได้ทุกกรณี
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/orders")}
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "อัปเดต" : "สร้างออเดอร์"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OrderForm;
