"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./globals.css";

const banners = [
  { id: 1, image: "/images/bn1.jpg" },
  { id: 2, image: "/images/bn2.jpg" },
  { id: 3, image: "/images/bn3.jpg" },
  { id: 4, image: "/images/bn4.jpg" },
  { id: 5, image: "/images/bn5.jpg" },
  { id: 6, image: "/images/bn6.jpg" },
  { id: 7, image: "/images/bn7.jpg" },

];

export default function HeroBanner() {
  return (
    <section className="relative rounded-2xl overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop
        className="w-full h-[300px] md:h-[500px]"
      >
        {banners.map((item) => (
          <SwiperSlide key={item.id}>
            <img
              src={item.image}
              alt={`Banner ${item.id}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
