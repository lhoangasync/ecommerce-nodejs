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
import { Plus, XIcon, Tags } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";

import { toast } from "react-toastify";
import { AddCategoryReqBody } from "@/types/backend";
import slugify from "slugify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "@/api/category.api";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .nonempty("Name cannot be empty"),
  slug: z.string().optional(),
  img: z.string().optional(),
});

function CategoryAdd() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      img: "",
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: (body: AddCategoryReqBody) => addCategory(body),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.data?.message);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: AddCategoryReqBody = {
      name: values.name,
      slug: values.slug || slugify(values.name, { lower: true, locale: "vi" }),
      img: values.img || "",
    };
    addCategoryMutation.mutate(payload);
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
          Add Category <Plus className="size-5 ml-2" />
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
                Create New Category
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
                        <FormLabel>Category Name</FormLabel>
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
                {/* Brand Image */}
                <FormField
                  control={form.control}
                  name="img"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Image</FormLabel>
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
                disabled={addCategoryMutation.isPending}
              >
                {addCategoryMutation.isPending ? "Saving..." : "Save Brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryAdd;
