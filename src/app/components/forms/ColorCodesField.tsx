import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

type ColorOption = {
  value: string;
  label: string;
  code: string;
  imageUrls?: string | string[];
};

interface ColorCodesFieldProps {
  control: Control<any>;
  name: string;
  options: ColorOption[];
  label?: string;
  max?: number;
}

export function ColorCodesField({
  control,
  name,
  options,
  label = "โทนสี (เลือกได้ 1-3 สี) *",
  max = 3,
}: ColorCodesFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {options.map((color) => (
              <FormField
                key={color.value}
                control={control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center space-y-2 p-3 border rounded-lg hover:bg-gray-50">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(color.code)}
                        disabled={
                          (field.value?.length ?? 0) >= max &&
                          !field.value?.includes(color.code)
                        }
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            if (currentValues.length < max) {
                              field.onChange([...currentValues, color.code]);
                            }
                          } else {
                            field.onChange(
                              currentValues.filter(
                                (val: string) => val !== color.code
                              )
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal text-center">
                      <div className="flex flex-col items-center space-y-2">
                        {color.imageUrls &&
                          typeof color.imageUrls === "string" && (
                            <img
                              src={color.imageUrls}
                              alt={`${color.label} - ตัวอย่างสี`}
                              className="w-12 h-12 object-cover rounded-full border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}

                        {color.label}
                      </div>
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
