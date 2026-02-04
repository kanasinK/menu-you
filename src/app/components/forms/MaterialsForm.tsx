"use client";

import { useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMasterStore } from "@/store/masterStore";
import {
  calculateMaterialPrice,
  formatNumber,
  parsePrice,
} from "@/lib/priceCalculator";

interface MaterialsFormProps {
  name?: string;
  readOnly?: boolean;
}

const emptyMaterial = {
  materialCode: "",
  materialOther: "",
  quantity: "",
  price: "",
  note: "",
};

/**
 * Component สำหรับจัดการอุปกรณ์/วัสดุเพิ่มเติม
 */
export function MaterialsForm({
  name = "materials",
  readOnly = false,
}: MaterialsFormProps) {
  const { control } = useFormContext();
  const { getOptionsForSelect } = useMasterStore();

  const materialOptions = getOptionsForSelect("itemMaterials");

  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>อุปกรณ์/วัสดุเพิ่มเติม</CardTitle>
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            onClick={() => append(emptyMaterial)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            เพิ่มอุปกรณ์
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            ยังไม่มีอุปกรณ์เพิ่มเติม
          </p>
        ) : (
          fields.map((field, index) => (
            <MaterialItem
              key={field.id}
              index={index}
              name={name}
              materialOptions={materialOptions}
              onRemove={() => remove(index)}
              readOnly={readOnly}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface MaterialItemProps {
  index: number;
  name: string;
  materialOptions: Array<{ value: string; label: string; code: string }>;
  onRemove: () => void;
  readOnly: boolean;
}

function MaterialItem({
  index,
  name,
  materialOptions,
  onRemove,
  readOnly,
}: MaterialItemProps) {
  const { control } = useFormContext();

  // Watch ค่าที่ต้องใช้คำนวณ
  const materialCode = useWatch({
    control,
    name: `${name}.${index}.materialCode`,
  });
  const quantity = useWatch({ control, name: `${name}.${index}.quantity` });
  const price = useWatch({ control, name: `${name}.${index}.price` });

  const isOther = materialCode === "OTHER";

  // คำนวณราคารวม
  const totalPrice = useMemo(() => {
    const result = calculateMaterialPrice({
      quantity: parsePrice(quantity),
      price: parsePrice(price),
    });
    return result.totalPrice;
  }, [quantity, price]);

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">อุปกรณ์ {index + 1}</h4>
        {!readOnly && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ประเภทอุปกรณ์ */}
        <FormField
          control={control}
          name={`${name}.${index}.materialCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>อุปกรณ์</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={readOnly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอุปกรณ์" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materialOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.code}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* จำนวน */}
        <FormField
          control={control}
          name={`${name}.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>จำนวน</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  disabled={readOnly}
                  {...field}
                  className="text-right"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ราคาต่อชิ้น */}
        <FormField
          control={control}
          name={`${name}.${index}.price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ราคา/ชิ้น</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0"
                  disabled={readOnly}
                  {...field}
                  className="text-right"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ราคารวม */}
        <div className="space-y-2">
          <Label>ราคารวม</Label>
          <Input
            value={formatNumber(totalPrice)}
            disabled
            className="text-right bg-muted font-medium"
          />
        </div>
      </div>

      {/* อุปกรณ์อื่นๆ */}
      {isOther && (
        <FormField
          control={control}
          name={`${name}.${index}.materialOther`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ระบุอุปกรณ์</FormLabel>
              <FormControl>
                <Input
                  placeholder="โปรดระบุอุปกรณ์"
                  disabled={readOnly}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      {/* หมายเหตุ */}
      <FormField
        control={control}
        name={`${name}.${index}.note`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
            <FormControl>
              <Input placeholder="หมายเหตุ" disabled={readOnly} {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}

export default MaterialsForm;
