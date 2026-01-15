"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMasterStore } from "@/store/masterStore";

interface OrderDesignItemsProps {
  serviceTypeCode: string;
  name?: string;
}

// [Assumption]: ใช้ code ค่า "OTHER" และ "CUSTOM" สำหรับตัวเลือก "อื่นๆ" และ "กำหนดเอง"

const isDesignService = (serviceTypeCode: string) =>
  serviceTypeCode === "DESIGN_ONLY" ||
  serviceTypeCode === "DESIGN_AND_PRODUCTION";

export const OrderDesignItems = ({
  serviceTypeCode,
  name = "items",
}: OrderDesignItemsProps) => {
  const form = useFormContext();
  const { control, watch } = form;

  const { getOptionsForSelect } = useMasterStore();

  const products = getOptionsForSelect("products");
  const sizes = getOptionsForSelect("itemSizes");
  const orientations = getOptionsForSelect("orientations");
  const coatings = getOptionsForSelect("itemTextures"); // แก้ไขจาก coatings เป็น itemTextures
  const pageOptions = getOptionsForSelect("pageOptions");
  const imageOptions = getOptionsForSelect("imageOptions");
  const brandOptions = getOptionsForSelect("brandOptions");

  const { fields, append, remove } = useFieldArray({ control, name });

  // เพิ่มรายการเริ่มต้นอัตโนมัติเมื่อเลือกบริการออกแบบและยังไม่มี item
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isDesignService(serviceTypeCode) && fields.length === 0) {
        append({
          productCode: "",
          productOther: "",
          sizeCode: "",
          sizeWidth: "",
          sizeHeight: "",
          orientationCode: "",
          coatingCode: "",
          pageOptionCode: "",
          imageOptionCode: "",
          brandOptionCode: "",
          quantity: "",
        });
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceTypeCode, fields.length]);

  if (!isDesignService(serviceTypeCode)) return null;

  const renderRadioGroup = (
    fieldName: string,
    label: string,
    options: Array<{ value: string; label: string; code: string }>,
    idx: number
  ) => (
    <FormField
      control={control}
      name={`${name}.${idx}.${fieldName}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value as string}
              onValueChange={field.onChange}
              className="flex flex-col space-y-2"
            >
              {options.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={opt.code}
                    id={`${fieldName}-${idx}-${opt.value}`}
                  />
                  <FormLabel
                    htmlFor={`${fieldName}-${idx}-${opt.value}`}
                    className="font-normal"
                  >
                    {opt.label}
                  </FormLabel>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-8">
      {fields.map((field, index) => {
        const productCode: string = watch(`${name}.${index}.productCode`);
        const sizeCode: string = watch(`${name}.${index}.sizeCode`);
        const isOtherProduct = productCode === "OTHER";
        const isCustomSize = sizeCode === "CUSTOM";

        return (
          <Card key={field.id} className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  ข้อมูลสำหรับการออกแบบ: งานชิ้นที่{" "}
                  <span className="text-blue-600 font-bold">{index + 1}</span>
                </CardTitle>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="shadow-md"
                  >
                    ลบชิ้นงาน
                  </Button>
                  {index === fields.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        append({
                          productCode: "",
                          productOther: "",
                          sizeCode: "",
                          sizeWidth: "",
                          sizeHeight: "",
                          orientationCode: "",
                          coatingCode: "",
                          pageOptionCode: "",
                          imageOptionCode: "",
                          brandOptionCode: "",
                          quantity: "",
                        })
                      }
                      className="bg-green-600 hover:bg-green-700 shadow-md"
                    >
                      เพิ่มชิ้นงาน
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* ส่วนประเภทงาน */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  ประเภทงาน
                </h3>
                {renderRadioGroup("productCode", "", products, index)}

                {isOtherProduct && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <FormField
                      control={control}
                      name={`${name}.${index}.productOther`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            โปรดระบุประเภทงาน
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="โปรดระบุประเภทงานที่ต้องการ"
                              {...field}
                              className="mt-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* ส่วนขนาด */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  ขนาดที่ต้องการ
                </h3>
                {renderRadioGroup("sizeCode", "", sizes, index)}

                {isCustomSize && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-md font-medium text-gray-700 mb-4">
                      กำหนดขนาดเอง
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={control}
                        name={`${name}.${index}.sizeWidth`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              กว้าง (cm)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="เช่น 10"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9.]/g,
                                    ""
                                  );
                                  field.onChange(value);
                                }}
                                className="mt-1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`${name}.${index}.sizeHeight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              สูง (cm)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="เช่น 15"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9.]/g,
                                    ""
                                  );
                                  field.onChange(value);
                                }}
                                className="mt-1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ส่วนลักษณะงานและเคลือบ */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  ลักษณะงานและเคลือบ
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {renderRadioGroup(
                    "orientationCode",
                    "ลักษณะงาน",
                    orientations,
                    index
                  )}
                  {renderRadioGroup(
                    "coatingCode",
                    "ประเภทเคลือบ/ผิวสัมผัส",
                    coatings,
                    index
                  )}
                </div>
              </div>

              {/* ส่วนตัวเลือกเพิ่มเติม */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  ตัวเลือกเพิ่มเติม
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {renderRadioGroup(
                    "pageOptionCode",
                    "งานพิมพ์ หน้าเดียว/หน้าหลัง",
                    pageOptions,
                    index
                  )}
                  {renderRadioGroup(
                    "imageOptionCode",
                    "รูปภาพ",
                    imageOptions,
                    index
                  )}
                  {renderRadioGroup(
                    "brandOptionCode",
                    "โลโก้/ชื่อร้าน",
                    brandOptions,
                    index
                  )}
                </div>
              </div>

              {/* ส่วนจำนวน */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
                  จำนวน
                </h3>
                <div className="max-w-xs">
                  <FormField
                    control={control}
                    name={`${name}.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          จำนวน (แผ่น)
                        </FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="เช่น 100"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              field.onChange(value);
                            }}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderDesignItems;
