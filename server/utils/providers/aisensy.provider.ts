import axios from 'axios';
import { logger } from '@/server/utils/logger';
import { IWhatsappProvider, WhatsAppPayload } from './whatsapp.types';

export class AiSensyProvider implements IWhatsappProvider {
  private removeNonNumericVal(val: string | number): string {
    if (typeof val !== 'string') {
      val = val.toString();
    }
    return val.replace(/[^0-9]/g, '');
  }

  async sendTemplateMessage(payload: WhatsAppPayload) {
     logger.info(`Sending template message `);
   
    const apiKey = process.env.AISENSY_API_KEY;
    const projectId = process.env.AISENSY_PROJECT_ID;
    
    const templateParams = (payload.parameters || []).map(p => {
      if (typeof p === 'object' && p !== null) {
        return p.value !== undefined && p.value !== null ? String(p.value) : "";
      }
      return p !== undefined && p !== null ? String(p) : "";
    });

    const data: any = {
      to: this.removeNonNumericVal(payload.to),
      type: "template",
      recipient_type: "individual",
      template: {
        name: payload.templateName,
        language: { code: "en" },
      }
    };

    if (templateParams.length > 0) {
      data.template.components = [
        {
          type: "body",
          parameters: templateParams.map(param => ({
            type: "text",
            text: param
          }))
        }
      ];
    }
    
    try {
      if(!projectId || !apiKey) {
        logger.error("Missing API key or Project ID for AiSensyProvider");
        return { success: false, provider: "aisensy", error: "Missing API key or Project ID" };
      }
      const response = await axios.post(
        `https://apis.aisensy.com/project-apis/v1/project/${projectId}/messages`,
        data,
        { headers: { "X-AiSensy-Project-API-Pwd": apiKey, "Content-Type": "application/json" } }
      );
      
      logger.info(`WhatsApp message sent to ${data.to} via AiSensy`);
      return { success: true, provider: "aisensy", response: response.data };
    } catch (err: any) {
      logger.error(err, `Failed to send WhatsApp message to ${data.to} via AiSensy`);
      return { success: false, provider: "aisensy", error: err.message };
    }
  }
}
