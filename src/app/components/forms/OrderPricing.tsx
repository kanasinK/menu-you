"use client";

import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  calculateOrderPrice,
  formatNumber,
  parsePrice,
  OrderItemPrice,
  MaterialPrice,
} from "@/lib/priceCalculator";

interface OrderPricingProps {
  readOnly?: boolean;
}

interface ItemData {
  quantity?: string | number;
  itemPrice?: string | number;
  designerPrice?: string | number;
}

interface MaterialData {
  quantity?: string | number;
  price?: string | number;
}

export function OrderPricing({ readOnly = false }: OrderPricingProps) {
  const form = useFormContext();
  const { control } = form;

  // ใช้ useWatch เพื่อ subscribe การเปลี่ยนแปลงของ nested fields
  const items = useWatch({ control, name: "items" });
  const materials = useWatch({ control, name: "materials" });
  const discount = useWatch({ control, name: "discount" });
  const shippingPrice = useWatch({ control, name: "shippingPrice" });
  const paid = useWatch({ control, name: "paid" });

  const itemsForCalc: OrderItemPrice[] = useMemo(() => {
    const watchedItems = (items || []) as ItemData[];
    return watchedItems.map((item) => ({
      quantity: parsePrice(item?.quantity),
      itemPrice: parsePrice(item?.itemPrice),
      designerPrice: parsePrice(item?.designerPrice),
    }));
  }, [items]);

  const materialsForCalc: MaterialPrice[] = useMemo(() => {
    const watchedMaterials = (materials || []) as MaterialData[];
    return watchedMaterials.map((material) => ({
      quantity: parsePrice(material?.quantity),
      price: parsePrice(material?.price),
    }));
  }, [materials]);

  const priceResult = useMemo(() => {
    return calculateOrderPrice({
      items: itemsForCalc,
      materials: materialsForCalc,
      discount: parsePrice(discount),
      shippingPrice: parsePrice(shippingPrice),
      paid: parsePrice(paid),
    });
  }, [itemsForCalc, materialsForCalc, discount, shippingPrice, paid]);

  useEffect(() => {
    form.setValue("price", priceResult.grandTotal, { shouldDirty: false });
  }, [priceResult.grandTotal, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>สรุปราคา</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ราคารวมชิ้นงาน</Label>
            <Input
              value={formatNumber(priceResult.itemsTotal)}
              disabled
              className="text-right bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>ราคารวมอุปกรณ์</Label>
            <Input
              value={formatNumber(priceResult.materialsTotal)}
              disabled
              className="text-right bg-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>ราคารวมทั้งหมด</Label>
          <Input
            value={formatNumber(priceResult.subtotal)}
            disabled
            className="text-right bg-muted font-medium"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>ส่วนลด</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            disabled={readOnly}
            {...form.register("discount", { valueAsNumber: true })}
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label>ราคาหลังหักส่วนลด</Label>
          <Input
            value={formatNumber(priceResult.afterDiscount)}
            disabled
            className="text-right bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label>ค่าขนส่ง</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            disabled={readOnly}
            {...form.register("shippingPrice", { valueAsNumber: true })}
            className="text-right"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-lg font-semibold">ราคารวมสุทธิ</Label>
          <Input
            value={formatNumber(priceResult.grandTotal)}
            disabled
            className="text-right bg-primary/10 font-bold text-lg"
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ชำระแล้ว</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              disabled={readOnly}
              {...form.register("paid", { valueAsNumber: true })}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label>คงเหลือ</Label>
            <Input
              value={formatNumber(priceResult.remaining)}
              disabled
              className={`text-right bg-muted font-medium ${
                priceResult.remaining > 0
                  ? "text-destructive"
                  : "text-green-600"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderPricing;
