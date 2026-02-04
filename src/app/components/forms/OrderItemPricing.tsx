"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  calculateItemPrice,
  formatNumber,
  parsePrice,
} from "@/lib/priceCalculator";

interface OrderItemPricingProps {
  index: number;
  name?: string;
  readOnly?: boolean;
}

/**
 * Component สำหรับแสดงและแก้ไขราคาต่อชิ้นงาน
 * ใช้ใน OrderDesignItems สำหรับ admin/staff
 */
export function OrderItemPricing({
  index,
  name = "items",
  readOnly = false,
}: OrderItemPricingProps) {
  const { control } = useFormContext();

  // Watch ค่าที่ต้องใช้คำนวณ
  const quantity = useWatch({ control, name: `${name}.${index}.quantity` });
  const itemPrice = useWatch({ control, name: `${name}.${index}.itemPrice` });
  const designerPrice = useWatch({
    control,
    name: `${name}.${index}.designerPrice`,
  });

  // คำนวณราคา
  const priceResult = useMemo(() => {
    return calculateItemPrice({
      quantity: parsePrice(quantity),
      itemPrice: parsePrice(itemPrice),
      designerPrice: parsePrice(designerPrice),
    });
  }, [quantity, itemPrice, designerPrice]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="text-md font-medium text-gray-700">ราคา</h4>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ราคาผลิตต่อชิ้น */}
        <FormField
          control={control}
          name={`${name}.${index}.itemPrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">ราคาผลิต/ชิ้น</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0"
                  disabled={readOnly}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="text-right"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ค่าผลิตรวม (คำนวณอัตโนมัติ) */}
        <div className="space-y-2">
          <Label className="text-gray-700">ค่าผลิตรวม</Label>
          <Input
            value={formatNumber(priceResult.sumItemPrice)}
            disabled
            className="text-right bg-muted"
          />
        </div>

        {/* ค่าออกแบบ */}
        <FormField
          control={control}
          name={`${name}.${index}.designerPrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">ค่าออกแบบ</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0"
                  disabled={readOnly}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="text-right"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ราคารวมต่อชิ้นงาน (คำนวณอัตโนมัติ) */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">ราคารวม</Label>
          <Input
            value={formatNumber(priceResult.totalPrice)}
            disabled
            className="text-right bg-primary/10 font-semibold"
          />
        </div>
      </div>
    </div>
  );
}

export default OrderItemPricing;
