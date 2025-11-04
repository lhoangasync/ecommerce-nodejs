import React, { useState } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "react-toastify";

// ============ TYPES ============
interface User {
  _id: string;
  name: string;
  role: number;
}

interface Review {
  _id: string;
  user?: User;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  status: "pending" | "approved" | "rejected";
  helpful_count: number;
  seller_response?: {
    message: string;
    created_at: string;
  };
  created_at: string;
}

// ============ REVIEW FORM WITH IMAGE UPLOAD ============
interface ReviewFormProps {
  onSubmit: (
    rating: number,
    comment: string,
    images: string[]
  ) => Promise<void>;
  isSubmitting?: boolean;
  currentUser?: User;
}

export function ReviewForm({
  onSubmit,
  isSubmitting = false,
  currentUser,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async () => {
    await onSubmit(rating, comment, images);
    setComment("");
    setRating(5);
    setImages([]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4">Write your review</h3>

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setRating(r)}
                className="transition-transform hover:scale-110"
                type="button"
              >
                <svg
                  className={`w-8 h-8 ${
                    r <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review content
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience about this product..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
            rows={4}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (Maximum 5 images)
          </label>

          <div className="space-y-3">
            {/* Upload Button - FIXED */}
            {images.length < 5 && (
              <div className="h-[100px] w-[100px] bg-white rounded-md border-2 border-dashed border-gray-300 flex relative hover:border-pink-400 transition-colors">
                <UploadButton
                  className="w-full h-full ut-button:bg-transparent ut-button:text-pink-500 ut-allowed-content:hidden"
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const newImages = [...images, res[0].url];
                    setImages(newImages);
                    toast.success("Image uploaded successfully!");
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload error: ${error.message}`);
                  }}
                  content={{
                    button: <Upload className="w-6 h-6" />,
                  }}
                />
              </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((url, index) => (
                  <div key={index} className="relative w-[100px] h-[100px]">
                    <Image
                      src={url}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="100px"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </>
          ) : (
            "Submit review"
          )}
        </button>
      </div>
    </div>
  );
}
