"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorCodesField } from "@/components/forms/ColorCodesField";
import { ThemeField } from "@/components/forms/ThemeField";
import OrderDesignItems from "@/components/forms/OrderDesignItems";
import { useToast } from "@/hooks/use-toast";
import { OrderApiService } from "@/lib/api/orderApi";
import { useMasterStore } from "@/store/masterStore";
import { Loader2, CheckCircle2, Copy } from "lucide-react";

const customerOrderSchema = z
  .object({
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
    serviceTypeCode: z.string().min(1, "ประเภทบริการจำเป็น"),

    // Shipping fields (for serviceType 2 and 3)
    isSameAddressAsContact: z.boolean(),
    shippingName: z.string().optional(),
    shippingTel: z.string().optional(),
    shippingAddress: z.string().optional(),

    // Design fields (for serviceType 1 and 3)
    themeCode: z.string().optional(),
    colorCodes: z.array(z.string()).optional(),
    designInfoText: z.string().optional(),

    // Design Items (UI เท่านั้น ยังไม่แมพเข้าข้อมูล orderRepo)
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

    acceptedTerms: z.boolean().refine((val) => val === true, {
      message: "กรุณายอมรับเงื่อนไขการใช้บริการ",
    }),
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
      // For delivery/shipping service types, shipping info is required
      // Check by service type code instead of hardcoded IDs
      const serviceType = data.serviceTypeCode;
      if (serviceType === "PRODUCTION_ONLY" || serviceType === "DESIGN_AND_PRODUCTION") {
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
      const serviceType = data.serviceTypeCode;
      if (serviceType === "PRODUCTION_ONLY" || serviceType === "DESIGN_AND_PRODUCTION") {
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
      const serviceType = data.serviceTypeCode;
      if (serviceType === "PRODUCTION_ONLY" || serviceType === "DESIGN_AND_PRODUCTION") {
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
      const serviceType = data.serviceTypeCode;
      if (serviceType === "DESIGN_ONLY" || serviceType === "DESIGN_AND_PRODUCTION") {
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
      const serviceType = data.serviceTypeCode;
      if (serviceType === "DESIGN_ONLY" || serviceType === "DESIGN_AND_PRODUCTION") {
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

type CustomerOrderFormData = z.infer<typeof customerOrderSchema>;

const CustomerOrderForm = () => {
  const { toast } = useToast();
  const { getOptionsForSelect } = useMasterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const form = useForm<CustomerOrderFormData>({
    resolver: zodResolver(customerOrderSchema),
    defaultValues: {
      fullName: "",
      shopName: "",
      tel: "",
      email: "",
      facebook: "",
      line: "",
      serviceTypeCode: "",
      isSameAddressAsContact: false,
      shippingName: "",
      shippingTel: "",
      shippingAddress: "",
      themeCode: "",
      colorCodes: [],
      designInfoText: "",
      items: undefined,
      acceptedTerms: false,
    },
  });

  const onSubmit = async (data: CustomerOrderFormData) => {
    setIsSubmitting(true);
    try {
      const rawItems = (form.getValues("items") || []) as Array<{
        productCode?: string;
        productOther?: string;
        sizeCode?: string;
        sizeWidth?: string;
        sizeHeight?: string;
        orientationCode?: string;
        coatingCode?: string;
        pageOptionCode?: string;
        imageOptionCode?: string;
        brandOptionCode?: string;
        quantity?: string;
      }>
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
      }))

      const orderData = {
        fullName: data.fullName,
        shopName: data.shopName,
        tel: data.tel,
        email: data.email || null,
        facebook: data.facebook || null,
        line: data.line || null,
        serviceTypeCode: data.serviceTypeCode as 'DESIGN_ONLY' | 'PRODUCTION_ONLY' | 'DESIGN_AND_PRODUCTION',
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

      console.log('📦 Order Data being sent:', orderData);
      console.log('🛠️ Design Items:', designItems);
      console.log('📋 Items count:', orderData.items.length);

      // เรียก Order API Service
      console.log('🔄 About to call OrderApiService.createOrder...');
      const result = await OrderApiService.createOrder(orderData)
      console.log('🎉 Order created successfully! Result:', result);

      // เก็บ order ID และแสดง success dialog
      setOrderId(result.id);
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('🔴 Submit error:', err)
      console.error('🔴 Error details:', JSON.stringify(err, null, 2))
      const error = err as { response?: { data?: { error?: string } }; message?: string }
      const message =
        error?.response?.data?.error || error?.message || 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  // ดึงข้อมูลจาก Supabase
  const serviceTypeOptions = getOptionsForSelect("serviceTypes");
  const themeOptions = getOptionsForSelect("themes");
  const colorOptions = getOptionsForSelect("colors");

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId.toString());
      toast({
        title: "คัดลอกแล้ว",
        description: "คัดลอกรหัสออเดอร์เรียบร้อย",
      });
    }
  };

  const handleNewOrder = () => {
    setShowSuccessDialog(false);
    setOrderId(null);
    form.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
    form.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            แบบฟอร์มสั่งงาน
          </h1>
          <p className="text-gray-600">
            กรุณากรอกข้อมูลให้ครบถ้วน ทางร้านจะติดต่อกลับไปเพื่อยืนยันรายละเอียด
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Loading Overlay */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-lg font-medium">กำลังส่งข้อมูล...</p>
                  <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
                </div>
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลลูกค้า</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
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
                            placeholder="เช่น 0812345678"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              // Allow only numbers and limit to 10 digits
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
                        <FormLabel>E-mail</FormLabel>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ชื่อ Facebook"
                            maxLength={50}
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
                        <FormLabel>Line</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ชื่อ Line"
                            maxLength={50}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ประเภทบริการ</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="serviceTypeCode"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>เลือกประเภทบริการ *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                            {serviceTypeOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.code} id={`service${option.value}`} />
                                <FormLabel
                                  htmlFor={`service${option.value}`}
                                  className="font-normal"
                                >
                                  {option.label}
                                </FormLabel>
                              </div>
                            ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Shipping Information - Show only for delivery services */}
            {(form.watch("serviceTypeCode") === "PRODUCTION_ONLY" ||
              form.watch("serviceTypeCode") === "DESIGN_AND_PRODUCTION") && (
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
                              maxLength={100}
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
                              placeholder="กรุณาใส่เบอร์โทรศัพท์ผู้รับ"
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
            )}

            {/* Design Information - Show only for design services */}
            {(form.watch("serviceTypeCode") === "DESIGN_ONLY" ||
              form.watch("serviceTypeCode") === "DESIGN_AND_PRODUCTION") && (
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลสำหรับออกแบบ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ThemeField control={form.control} name="themeCode" options={themeOptions} />

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
                            placeholder="ข้อมูลเพิ่มเติมสำหรับการออกแบบ เช่น สไตล์ที่ต้องการ, สีที่ชอบ, แนวคิด เป็นต้น"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ข้อมูลสำหรับการออกแบบ: งานชิ้นที่ */}
                  <OrderDesignItems serviceTypeCode={form.watch("serviceTypeCode")} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>เงื่อนไขการใช้บริการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li>1. กรุณาตรวจเช็คความถูกต้องของข้อมูลก่อนส่ง</li>
                    <li>2. ทางร้านจะติดต่อกลับเพื่อยืนยันรายละเอียด</li>
                    <li>3. การแก้ไขแบบได้ไม่เกิน 3 ครั้ง</li>
                  </ul>
                </div>

                <FormField
                  control={form.control}
                  name="acceptedTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          ฉันได้อ่านและยอมรับเงื่อนไขการใช้บริการแล้ว *
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-8"
                disabled={!form.watch("acceptedTerms") || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลออเดอร์"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-green-100">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">ส่งข้อมูลสำเร็จ!</DialogTitle>
              <DialogDescription className="text-center">
                ทางร้านจะติดต่อกลับไปเพื่อยืนยันรายละเอียด
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">รหัสออเดอร์ของคุณ</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-2xl font-bold text-gray-900">#{orderId}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyOrderId}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    คัดลอก
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>📱 เราจะติดต่อกลับผ่านช่องทางที่คุณระบุ:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  {form.getValues("facebook") && (
                    <li>Facebook: {form.getValues("facebook")}</li>
                  )}
                  {form.getValues("line") && (
                    <li>Line: {form.getValues("line")}</li>
                  )}
                  {form.getValues("tel") && (
                    <li>โทรศัพท์: {form.getValues("tel")}</li>
                  )}
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                type="button"
                className="w-full"
                onClick={handleNewOrder}
              >
                สั่งงานใหม่
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCloseDialog}
              >
                ปิด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerOrderForm;
