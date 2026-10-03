export interface WhatsAppPayload {
  to: string;
  templateName: string;
  parameters?: Array<string | { value: string | number }>;
}

export interface IWhatsappProvider {
  sendTemplateMessage(payload: WhatsAppPayload): Promise<{ success: boolean; provider: string; response?: any; error?: string }>;
}
