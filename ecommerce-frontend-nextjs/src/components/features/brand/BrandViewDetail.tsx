// components/features/brand/BrandViewDetails.tsx
"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Brand } from "@/types/backend";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Globe, Tag, Calendar, Clock } from "lucide-react";

interface BrandViewDetailsProps {
  brand: Brand;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BrandViewDetails({
  brand,
  open,
  onOpenChange,
}: BrandViewDetailsProps) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[500px] rounded-none flex flex-col">
        <DrawerHeader className="p-6 border-b">
          <DrawerTitle className="text-2xl font-bold text-primary">
            {brand.name}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <Image
                src={
                  brand.img ||
                  "https://plus.unsplash.com/premium_photo-1676194560725-bf17a3162d2b?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                alt={brand.name}
                width={128}
                height={128}
                className="rounded-lg object-cover border-2 border-primary/20 shadow-md"
              />
            </div>
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-foreground">
                {brand.name}
              </h2>
              {brand.country && (
                <Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
                  <Globe className="mr-2 h-4 w-4" />
                  {brand.country}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground italic">
                {brand.slug}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailRow
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="Created At"
              value={formatDate(brand.created_at)}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4 text-primary" />}
              label="Last Updated"
              value={formatDate(brand.updated_at)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 border-b pb-2">
              Description
            </h3>
            <div
              className="prose dark:prose-invert max-w-none mt-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  brand.desc ||
                  "<p class='italic text-muted-foreground'>No description provided.</p>",
              }}
            />
          </div>
        </div>

        <DrawerFooter className="p-6 border-t flex-shrink-0">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    {icon && <div className="mt-1">{icon}</div>}
    <div className="flex flex-col">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-md font-semibold text-foreground">{value}</span>
    </div>
  </div>
);
