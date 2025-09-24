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
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Plus, XIcon, Tags, Globe, FileText } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";

import { toast } from "react-toastify";
import CKEditor from "@/components/shared/CKEditor";
import { addBrand } from "@/api/brand.api";
import { AddBrandReqBody } from "@/types/backend";
import slugify from "slugify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .nonempty("Name cannot be empty"),
  slug: z.string().optional(),

  country: z.string().optional(),
  desc: z.string().optional(),
  img: z.string().optional(),
});

function BrandAdd() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      country: "",
      desc: "",
      img: "",
    },
  });

  const addBrandMutation = useMutation({
    mutationFn: (body: AddBrandReqBody) => addBrand(body),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data?.message);
        queryClient.invalidateQueries({ queryKey: ["brands"] });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   setIsSubmitting(true);
  //   try {
  //     const payload: AddBrandReqBody = {
  //       name: values.name,
  //       slug:
  //         values.slug || slugify(values.name, { lower: true, locale: "vi" }),
  //       country: values.country || "",
  //       desc: values.desc || "",
  //       img: values.img || "",
  //     };

  //     const res = await addBrand(payload);
  //     if (res.success) {
  //       toast.success("Brand added successfully!");
  //       router.refresh();
  //     } else {
  //       toast.error(res.error);
  //     }
  //   } catch (error) {
  //     console.error("Failed to add brand:", error);
  //     toast.error("Failed to add brand. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: AddBrandReqBody = {
      name: values.name,
      slug: values.slug || slugify(values.name, { lower: true, locale: "vi" }),
      country: values.country || "",
      desc: values.desc || "",
      img: values.img || "",
    };
    addBrandMutation.mutate(payload);
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  const imageWatch = form.watch("img");

  return (
    <Dialog onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button type="button" className="bg-green-500 hover:bg-green-600">
          Add Brand <Plus className="size-5 ml-2" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-0 grid grid-rows-[auto_1fr_auto] max-h-[90vh]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            autoComplete="off"
            className="contents"
          >
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl text-green-500">
                Create New Brand
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 grid gap-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Tags className="size-4" />
                        <FormLabel>Brand Name</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g., Paula's Choice" {...field} />
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
                        <Tags className="size-4" />
                        <FormLabel>Slug</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g., paulas-choice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Country */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Globe className="size-4" />
                        <FormLabel>Country</FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="e.g., Japan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brand Image */}
                <FormField
                  control={form.control}
                  name="img"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Image</FormLabel>
                      <FormControl>
                        <div className="h-[100px] w-[100px] bg-white rounded-md border border-gray-500 border-dashed flex relative">
                          {!imageWatch ? (
                            <UploadButton
                              className="w-full h-full ut-button:text-primary "
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                form.setValue("img", res[0].ufsUrl);
                                toast.success("Image uploaded!");
                              }}
                              onUploadError={(error: Error) => {
                                toast.error(`Upload Error: ${error.message}`);
                              }}
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <Image
                                alt="Brand image preview"
                                src={imageWatch}
                                fill
                                className="rounded-sm object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => form.setValue("img", "")}
                                className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full"
                                aria-label="Remove brand image"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4" />
                      <FormLabel>Description</FormLabel>
                    </div>
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
                disabled={addBrandMutation.isPending}
              >
                {addBrandMutation.isPending ? "Saving..." : "Save Brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default BrandAdd;
