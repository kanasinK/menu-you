import { Control } from 'react-hook-form'
import { useState } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ThemeOption = {
  value: string
  label: string
  code: string
  imageUrls?: string | string[]
}

interface ThemeFieldProps {
  control: Control<any>
  name: string
  options: ThemeOption[]
  label?: string
}

export function ThemeField({ control, name, options, label = 'ธีมงาน/ออกแบบ *' }: ThemeFieldProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-4">
                {options.map((option) => {
                  const id = `${name}-${option.code}`

                  return (
                    <div
                      key={option.code}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      aria-pressed={field.value === option.code}
                    >
                      <RadioGroupItem value={option.code} id={id} className="mt-1" />
                      <div className="flex-1">
                        <FormLabel htmlFor={id} className="font-normal cursor-pointer block">
                          {option.label}
                        </FormLabel>
                        {option.imageUrls && Array.isArray(option.imageUrls) && (
                          <span className="mt-2 flex w-full">
                            {option.imageUrls.map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`${option.label} - ตัวอย่าง ${index + 1}`}
                                className="w-full rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ width: `${100 / (option.imageUrls?.length || 1)}%` }}
                                onClick={() => handleImageClick(imageUrl)}
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>ตัวอย่างธีมงาน</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4 flex justify-center items-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="ตัวอย่างธีมงานขนาดใหญ่"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
