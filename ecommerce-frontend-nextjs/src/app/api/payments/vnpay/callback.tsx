import { NextRequest, NextResponse } from "next/server";
import { handleVNPayReturn } from "@/api/payment.api";
import { VnpayReturnReqQuery } from "@/types/backend";

/**
 * VNPay IPN (Instant Payment Notification) endpoint
 * Được gọi từ VNPay server để thông báo kết quả thanh toán
 *
 * Route: GET /api/payments/vnpay/ipn
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Lấy tất cả query params từ VNPay
    const vnpayParams: VnpayReturnReqQuery = {
      vnp_Amount: searchParams.get("vnp_Amount") || "",
      vnp_BankCode: searchParams.get("vnp_BankCode") || "",
      vnp_BankTranNo: searchParams.get("vnp_BankTranNo") || undefined,
      vnp_CardType: searchParams.get("vnp_CardType") || undefined,
      vnp_OrderInfo: searchParams.get("vnp_OrderInfo") || "",
      vnp_PayDate: searchParams.get("vnp_PayDate") || "",
      vnp_ResponseCode: searchParams.get("vnp_ResponseCode") || "",
      vnp_TmnCode: searchParams.get("vnp_TmnCode") || "",
      vnp_TransactionNo: searchParams.get("vnp_TransactionNo") || "",
      vnp_TransactionStatus: searchParams.get("vnp_TransactionStatus") || "",
      vnp_TxnRef: searchParams.get("vnp_TxnRef") || "",
      vnp_SecureHash: searchParams.get("vnp_SecureHash") || "",
    };

    // Gọi API backend để xử lý IPN
    const response = await handleVNPayReturn(vnpayParams);

    if (response.success) {
      // Trả về response cho VNPay theo format yêu cầu
      return NextResponse.json({
        RspCode: "00", // 00 = success
        Message: "Confirm Success",
      });
    } else {
      return NextResponse.json({
        RspCode: "99", // 99 = unknown error
        Message: response.error || "Failed to process IPN",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        RspCode: "99",
        Message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
