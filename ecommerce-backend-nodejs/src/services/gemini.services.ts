import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
  }

  // Tạo system prompt cho cosmetic consultant
  private createSystemPrompt(): string {
    return `Bạn là chuyên gia tư vấn mỹ phẩm chuyên nghiệp với kiến thức sâu về skincare và làm đẹp.

NHIỆM VỤ:
- Tư vấn sản phẩm mỹ phẩm phù hợp với nhu cầu khách hàng
- Phân tích tình trạng da và đưa ra lời khuyên
- Giải thích thành phần và công dụng sản phẩm
- Hướng dẫn quy trình chăm sóc da

NGUYÊN TẮC:
1. Luôn thân thiện, nhiệt tình và chuyên nghiệp
2. Đặt câu hỏi để hiểu rõ nhu cầu khách hàng
3. Đưa ra lời khuyên dựa trên kiến thức khoa học
4. Không đưa ra lời khuyên y tế, nếu cần hãy gợi ý khách tham khảo bác sĩ da liễu
5. Trả lời ngắn gọn, súc tích (tối đa 300 từ)

LOẠI DA:
- Da khô (Dry): thiếu ẩm, căng rát
- Da dầu (Oily): bóng nhờn, dễ mụn
- Da hỗn hợp (Combination): vùng T dầu, má khô
- Da nhạy cảm (Sensitive): dễ kích ứng, đỏ
- Da thường (Normal): cân bằng

VẤN ĐỀ DA THƯỜNG GẶP:
- Mụn (Acne)
- Thâm nám (Dark spots, Hyperpigmentation)
- Lão hóa (Anti-aging, Wrinkles)
- Khô da (Dehydration)
- Lỗ chân lông to (Large pores)
- Da không đều màu (Uneven skin tone)

THÀNH PHẦN PHỔ BIẾN:
- Hyaluronic Acid: giữ ẩm
- Niacinamide: làm sáng, kiểm soát dầu
- Retinol: chống lão hóa
- Vitamin C: làm sáng, chống oxy hóa
- Salicylic Acid: trị mụn
- AHA/BHA: tẩy tế bào chết
- Centella Asiatica: làm dịu, phục hồi

Hãy trả lời bằng tiếng Việt một cách tự nhiên và thân thiện.`
  }

  // Phân tích tin nhắn với Gemini để hiểu sâu hơn
  async analyzeMessage(
    userMessage: string,
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<{
    analysis: string
    skinType?: string
    concerns: string[]
    productTypes: string[]
    suggestions: string
  }> {
    try {
      const prompt = `${this.createSystemPrompt()}

LỊCH SỬ TRÒ CHUYỆN:
${chatHistory.map((msg) => `${msg.role === 'user' ? 'Khách hàng' : 'Tư vấn viên'}: ${msg.content}`).join('\n')}

TIN NHẮN MỚI: "${userMessage}"

Hãy phân tích tin nhắn và trả về JSON với format sau:
{
  "analysis": "Phân tích ngắn gọn về nhu cầu khách hàng",
  "skinType": "loại da nếu xác định được (dry/oily/combination/sensitive/normal) hoặc null",
  "concerns": ["danh sách các vấn đề da"],
  "productTypes": ["các loại sản phẩm cần tìm"],
  "suggestions": "Gợi ý và lời khuyên chi tiết cho khách hàng"
}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON từ response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback nếu không parse được
      return {
        analysis: text,
        concerns: [],
        productTypes: [],
        suggestions: text
      }
    } catch (error) {
      console.error('Gemini analysis error:', error)
      return {
        analysis: 'Đang phân tích...',
        concerns: [],
        productTypes: [],
        suggestions: 'Tôi sẽ tìm sản phẩm phù hợp cho bạn.'
      }
    }
  }

  // Tạo phản hồi tự nhiên với Gemini
  async generateResponse(
    userMessage: string,
    productRecommendations: any[],
    chatHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      const productsInfo = productRecommendations
        .map(
          (rec, idx) => `
${idx + 1}. ${rec.product.name} (${rec.product.brand.name})
   - Giá: ${Math.min(...rec.product.variants.map((v: any) => v.price)).toLocaleString()}đ
   - Đánh giá: ${rec.product.rating}/5 ⭐
   - Phù hợp vì: ${rec.reason.join(', ')}
   - Mô tả: ${rec.product.description || 'Không có mô tả'}
`
        )
        .join('\n')

      const prompt = `${this.createSystemPrompt()}

LỊCH SỬ TRÒ CHUYỆN:
${chatHistory.map((msg) => `${msg.role === 'user' ? 'Khách hàng' : 'Tư vấn viên'}: ${msg.content}`).join('\n')}

KHÁCH HÀNG VỪA HỎI: "${userMessage}"

CÁC SẢN PHẨM PHÙ HỢP TÌM ĐƯỢC:
${productsInfo || 'Không tìm thấy sản phẩm phù hợp'}

HÃY:
1. Trả lời câu hỏi của khách hàng một cách tự nhiên và thân thiện
2. Giới thiệu các sản phẩm phù hợp (nếu có)
3. Giải thích tại sao sản phẩm phù hợp
4. Đưa ra lời khuyên sử dụng (nếu cần)
5. Hỏi thêm để tư vấn tốt hơn (nếu cần)

Trả lời ngắn gọn (200-300 từ), dễ hiểu, giọng điệu thân thiện như đang chat với bạn bè.
Sử dụng emoji phù hợp để tạo cảm giác gần gũi 😊`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini response error:', error)
      return this.createFallbackResponse(productRecommendations)
    }
  }

  // Phản hồi dự phòng khi Gemini lỗi
  private createFallbackResponse(recommendations: any[]): string {
    if (recommendations.length === 0) {
      return 'Xin lỗi, hiện tại tôi chưa tìm được sản phẩm phù hợp với yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn về loại da và vấn đề bạn đang gặp phải không? 😊'
    }

    let message = `Tôi đã tìm được ${recommendations.length} sản phẩm phù hợp với bạn:\n\n`

    recommendations.forEach((rec, idx) => {
      const minPrice = Math.min(...rec.product.variants.map((v: any) => v.price))
      message += `${idx + 1}. **${rec.product.name}** (${rec.product.brand.name})\n`
      message += `   💰 Giá: ${minPrice.toLocaleString()}đ\n`
      message += `   ⭐ Đánh giá: ${rec.product.rating}/5\n`
      message += `   ✨ ${rec.reason[0]}\n\n`
    })

    message += 'Bạn muốn biết thêm chi tiết về sản phẩm nào không? 😊'
    return message
  }

  // Giải thích thành phần sản phẩm
  async explainIngredients(ingredients: string): Promise<string> {
    try {
      const prompt = `${this.createSystemPrompt()}

Hãy giải thích ngắn gọn và dễ hiểu về các thành phần sau trong sản phẩm mỹ phẩm:

${ingredients}

Với mỗi thành phần quan trọng, hãy nói:
- Công dụng chính
- Phù hợp với loại da nào
- Lưu ý khi sử dụng (nếu có)

Trả lời ngắn gọn, dễ hiểu (tối đa 200 từ).`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini ingredients error:', error)
      return 'Xin lỗi, tôi không thể phân tích thành phần lúc này.'
    }
  }

  // Tạo routine chăm sóc da
  async createSkincareRoutine(skinType: string, concerns: string[], availableProducts: any[]): Promise<string> {
    try {
      const productsInfo = availableProducts
        .map((p) => `- ${p.name} (${p.category?.name || 'Unknown category'})`)
        .join('\n')

      const prompt = `${this.createSystemPrompt()}

Hãy tạo quy trình chăm sóc da (skincare routine) cho:
- Loại da: ${skinType}
- Vấn đề da: ${concerns.join(', ')}

CÁC SẢN PHẨM CÓ SẴN:
${productsInfo}

Hãy đề xuất quy trình:
1. Buổi sáng (Morning routine)
2. Buổi tối (Evening routine)

Với mỗi bước:
- Tên bước
- Sản phẩm gợi ý (từ danh sách trên)
- Cách dùng ngắn gọn

Trả lời dễ hiểu, thực tế (tối đa 300 từ).`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini routine error:', error)
      return 'Xin lỗi, tôi không thể tạo quy trình chăm sóc da lúc này.'
    }
  }

  // So sánh sản phẩm
  async compareProducts(products: any[]): Promise<string> {
    try {
      const productsInfo = products
        .map(
          (p, idx) => `
SẢN PHẨM ${idx + 1}: ${p.name} (${p.brand?.name})
- Giá: ${Math.min(...p.variants.map((v: any) => v.price)).toLocaleString()}đ
- Đánh giá: ${p.rating}/5
- Thành phần chính: ${p.ingredients || 'Không có thông tin'}
- Mô tả: ${p.description || 'Không có mô tả'}
`
        )
        .join('\n')

      const prompt = `${this.createSystemPrompt()}

Hãy so sánh các sản phẩm sau:

${productsInfo}

So sánh về:
- Ưu điểm của từng sản phẩm
- Phù hợp với ai
- Đánh giá về giá cả
- Gợi ý lựa chọn

Trả lời khách quan, dễ hiểu (tối đa 300 từ).`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini compare error:', error)
      return 'Xin lỗi, tôi không thể so sánh sản phẩm lúc này.'
    }
  }
}

const geminiService = new GeminiService()
export default geminiService
