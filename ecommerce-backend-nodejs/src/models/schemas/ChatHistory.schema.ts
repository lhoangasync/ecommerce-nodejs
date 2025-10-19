import { ObjectId } from 'mongodb'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatHistoryType {
  _id?: ObjectId
  user_id: ObjectId
  messages: ChatMessage[]
  created_at: Date
  updated_at: Date
}

export default class ChatHistory {
  _id?: ObjectId
  user_id: ObjectId
  messages: ChatMessage[]
  created_at: Date
  updated_at: Date

  constructor(chatHistory: ChatHistoryType) {
    this._id = chatHistory._id
    this.user_id = chatHistory.user_id
    this.messages = chatHistory.messages
    this.created_at = chatHistory.created_at || new Date()
    this.updated_at = chatHistory.updated_at || new Date()
  }
}
