"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Plus,
  XIcon,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Warehouse,
  Trash2,
} from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "react-toastify";
import CKEditor from "@/components/shared/CKEditor";
import { addProduct } from "@/api/product.api";
import { AddProductReqBody, Variant } from "@/types/backend";
import slugify from "slugify";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getAllBrands } from "@/api/brand.api";
import { getAllCategories } from "@/api/category.api";

const variantSchema = z.object({
  id: z.string(),
  shade_color: z.string().optional(),
  volume_size: z.string().optional(),
  price: z.number().min(0, "Price must be greater than 0"),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.string()).optional(),
  stock_quantity: z.number().min(0, "Stock quantity must be 0 or greater"),
  is_available: z.boolean(),
});

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .min(2, "Name must be at least 2 characters."),
  slug: z.string().optional(),
  description: z.string().optional(),
  brand_id: z.string().min(1, "Brand is required"),
  category_id: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional(),
  how_to_use: z.string().optional(),
  tags: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  skin_type: z
    .array(z.enum(["dry", "oily", "combination", "sensitive", "normal"]))
    .optional(),
  origin: z.string().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type ProductFormData = z.infer<typeof formSchema>;

function ProductAdd() {
  const [open, setOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: crypto.randomUUID(),
      price: 0,
      sku: "",
      stock_quantity: 0,
      is_available: true,
      images: [],
    },
  ]);

  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      brand_id: "",
      category_id: "",
      images: [],
      how_to_use: "",
      tags: [],
      ingredients: "",
      skin_type: [],
      origin: "",
      variants: variants,
    },
  });

  // Fetch brands and categories
  const { data: brandsResponse } = useQuery({
    queryKey: ["brands"],
    queryFn: () => getAllBrands(1, 100),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(1, 100),
  });

  const brands = brandsResponse?.data?.items ?? [];
  const categories = categoriesResponse?.data?.items ?? [];

  const addProductMutation = useMutation({
    mutationFn: (body: AddProductReqBody) => addProduct(body),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data?.message);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(values: ProductFormData) {
    const payload: AddProductReqBody = {
      name: values.name,
      slug: values.slug || slugify(values.name, { lower: true, locale: "vi" }),
      description: values.description || "",
      brand_id: values.brand_id,
      category_id: values.category_id,
      images: imageUrls,
      how_to_use: values.how_to_use || "",
      tags: currentTags,
      ingredients: values.ingredients,
      skin_type: values.skin_type,
      origin: values.origin,
      variants: variants,
    };
    addProductMutation.mutate(payload);
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setImageUrls([]);
      setCurrentTags([]);
      setTagInput("");
      setVariants([
        {
          id: crypto.randomUUID(),
          price: 0,
          sku: "",
          stock_quantity: 0,
          is_available: true,
          images: [],
        },
      ]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      const newTags = [...currentTags, tagInput.trim()];
      setCurrentTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    setCurrentTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newImages);
    form.setValue("images", newImages);
  };

  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(),
      price: 0,
      sku: "",
      stock_quantity: 0,
      is_available: true,
      images: [],
    };
    const newVariants = [...variants, newVariant];
    setVariants(newVariants);
    form.setValue("variants", newVariants);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
      form.setValue("variants", newVariants);
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
    form.setValue("variants", newVariants);
  };

  const handleVariantImageUpload = (variantIndex: number, imageUrl: string) => {
    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      images: [...(newVariants[variantIndex].images || []), imageUrl],
    };
    setVariants(newVariants);
    form.setValue("variants", newVariants);
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      images:
        newVariants[variantIndex].images?.filter((_, i) => i !== imageIndex) ||
        [],
    };
    setVariants(newVariants);
    form.setValue("variants", newVariants);
  };

  return (
    <Dialog onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button type="button" className="bg-green-500 hover:bg-green-600">
          Add Product <Plus className="size-5 ml-2" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-6xl p-0 grid grid-rows-[auto_1fr_auto] max-h-[90vh]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            autoComplete="off"
            className="contents"
          >
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl text-green-500">
                Create New Product
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 grid gap-6 overflow-y-auto">
              {/* Basic Product Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Package className="size-4" />
                        <FormLabel>Product Name</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g., Vitamin C Serum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Tag className="size-4" />
                        <FormLabel>Slug</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g., vitamin-c-serum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand */}
                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Origin */}
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., South Korea" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Skin Type */}
              <FormField
                control={form.control}
                name="skin_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Skin Type (Select multiple if applicable)
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "dry",
                          "oily",
                          "combination",
                          "sensitive",
                          "normal",
                        ].map((type) => (
                          <Badge
                            key={type}
                            variant={
                              field.value?.includes(type as any)
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer"
                            onClick={() => {
                              const currentTypes = field.value || [];
                              const newTypes = currentTypes.includes(
                                type as any
                              )
                                ? currentTypes.filter((t) => t !== type)
                                : [...currentTypes, type as any];
                              field.onChange(newTypes);
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Images */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="size-4" />
                      <FormLabel>Product Images</FormLabel>
                    </div>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="h-[100px] w-[100px] bg-white rounded-md border border-gray-500 border-dashed flex relative">
                          <UploadButton
                            className="w-full h-full ut-button:text-primary"
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                              const newImages = [...imageUrls, res[0].url];
                              setImageUrls(newImages);
                              form.setValue("images", newImages);
                              toast.success("Image uploaded!");
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(`Upload Error: ${error.message}`);
                            }}
                          />
                        </div>
                        {imageUrls.length > 0 && (
                          <div className="grid grid-cols-4 gap-4">
                            {imageUrls.map((url, index) => (
                              <div key={index} className="relative">
                                <Image
                                  alt={`Product image ${index + 1}`}
                                  src={url}
                                  width={100}
                                  height={100}
                                  className="rounded-sm object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full"
                                  aria-label="Remove image"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddTag}>
                            Add
                          </Button>
                        </div>
                        {currentTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {currentTags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-2"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="text-xs hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ingredients */}
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <CKEditor
                        initialData={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variants Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Product Variants</h3>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          SKU
                        </label>
                        <Input
                          placeholder="e.g., VS-50ML-001"
                          value={variant.sku}
                          onChange={(e) =>
                            updateVariant(index, "sku", e.target.value)
                          }
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Price
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Stock
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.stock_quantity}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "stock_quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      {/* Available Switch */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Available
                        </label>
                        <Switch
                          checked={variant.is_available}
                          onCheckedChange={(checked) =>
                            updateVariant(index, "is_available", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shade Color */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Shade/Color (Optional)
                        </label>
                        <Input
                          placeholder="e.g., Light Beige, Rose Gold"
                          value={variant.shade_color || ""}
                          onChange={(e) =>
                            updateVariant(index, "shade_color", e.target.value)
                          }
                        />
                      </div>

                      {/* Volume Size */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Volume/Size (Optional)
                        </label>
                        <Input
                          placeholder="e.g., 50ml, 100ml"
                          value={variant.volume_size || ""}
                          onChange={(e) =>
                            updateVariant(index, "volume_size", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Variant Images (Optional)
                      </label>
                      <div className="space-y-2">
                        <div className="h-[80px] w-[80px] bg-white rounded-md border border-gray-300 border-dashed flex relative">
                          <UploadButton
                            className="w-full h-full ut-button:text-xs ut-button:text-primary"
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                              handleVariantImageUpload(index, res[0].url);
                              toast.success("Variant image uploaded!");
                            }}
                            onUploadError={(error: Error) => {
                              toast.error(`Upload Error: ${error.message}`);
                            }}
                          />
                        </div>
                        {variant.images && variant.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {variant.images.map((url, imageIndex) => (
                              <div key={imageIndex} className="relative">
                                <Image
                                  alt={`Variant ${index + 1} image ${
                                    imageIndex + 1
                                  }`}
                                  src={url}
                                  width={60}
                                  height={60}
                                  className="rounded object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeVariantImage(index, imageIndex)
                                  }
                                  className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-white bg-red-500 rounded-full text-xs"
                                  aria-label="Remove variant image"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <CKEditor
                        initialData={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* How to Use */}
              <FormField
                control={form.control}
                name="how_to_use"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How to Use</FormLabel>
                    <FormControl>
                      <CKEditor
                        initialData={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="p-6 pt-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600"
                disabled={addProductMutation.isPending}
              >
                {addProductMutation.isPending ? "Saving..." : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductAdd;
