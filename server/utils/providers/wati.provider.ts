import { logger } from '@/server/utils/logger';
import { IWhatsappProvider, WhatsAppPayload } from './whatsapp.types';

export class WatiProvider implements IWhatsappProvider {
  async sendTemplateMessage(payload: WhatsAppPayload) {
    // Stub implementation for Wati
    // You would integrate Wati's actual API here
    logger.info(`WhatsApp message sent to ${payload.to} via Wati (STUB)`);
    return { success: true, provider: "wati", response: "stub" };
  }
}
