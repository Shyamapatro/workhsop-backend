import axios from 'axios';
import { logger } from '@/server/utils/logger';

import { config } from '@/server/config/env';

export interface WhatsAppPayload {
  to: string;
  templateName: string;
  parameters?: Array<string | { value: string | number }>;
}

export class AiSensyProvider {
  private removeNonNumericVal(val: string | number): string {
    if (typeof val !== 'string') {
      val = val.toString();
    }
    return val.replace(/[^0-9]/g, '');
  }

  async sendTemplateMessage(payload: WhatsAppPayload) {
    const apiKey = config.aisensyApiKey;
    const projectId = config.aisensyProjectId;
    
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
      const response = await axios.post(
        `https://apis.aisensy.com/project-apis/v1/project/${projectId}/messages`,
        data,
        { headers: { "X-AiSensy-Project-API-Pwd": apiKey, "Content-Type": "application/json" } }
      );
      
      return { success: true, provider: "aisensy", response: response.data };
    } catch (err: any) {
      // Do not throw the error to prevent blocking the signup flow
      return { success: false, error: err.message };
    }
  }
}

export const whatsappProvider = new AiSensyProvider();
