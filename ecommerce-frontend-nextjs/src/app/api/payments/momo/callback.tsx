import { NextRequest, NextResponse } from "next/server";
import { handleMoMoCallback } from "@/api/payment.api";
import { MomoCallbackReqBody } from "@/types/backend";

/**
 * MoMo IPN (Instant Payment Notification) endpoint
 * Được gọi từ MoMo server để thông báo kết quả thanh toán
 *
 * Route: POST /api/payments/momo/ipn
 */
export async function POST(request: NextRequest) {
  try {
    const body: MomoCallbackReqBody = await request.json();

    // Gọi API backend để xử lý IPN
    const response = await handleMoMoCallback(body);

    if (response.success) {
      // Trả về response cho MoMo theo format yêu cầu
      return NextResponse.json({
        partnerCode: body.partnerCode,
        orderId: body.orderId,
        requestId: body.requestId,
        resultCode: 0, // 0 = success
        message: "success",
        responseTime: Date.now(),
      });
    } else {
      return NextResponse.json({
        partnerCode: body.partnerCode,
        orderId: body.orderId,
        requestId: body.requestId,
        resultCode: 1, // 1 = failed
        message: response.error || "Failed to process IPN",
        responseTime: Date.now(),
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        resultCode: 1,
        message: "Internal server error",
        responseTime: Date.now(),
      },
      { status: 500 }
    );
  }
}
