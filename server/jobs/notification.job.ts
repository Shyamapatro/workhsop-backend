import { Agenda, Job } from 'agenda';
import { logger } from '@/server/utils/logger';
import { WhatsappProviderFactory } from '@/server/utils/providers/whatsapp.factory';

// 1. Strict Types for compile-time safety
export type NotificationType = 'welcome' | '2hr_reminder' | '24hr_reminder';

export interface IWorkshopNotificationData {
  notificationType: NotificationType;
  phone: string;
  templateName: string;
  params: string[];
}

// 2. Strategy Pattern: Map each notification type to its specific business logic
// This completely eliminates messy if/else blocks as your application scales.
const notificationHandlers: Record<NotificationType, (data: IWorkshopNotificationData) => Promise<void>> = {
  welcome: async (data) => {
    logger.debug('Executing pre-processing logic specific to welcome messages...');
    // e.g. update user.welcomeSent = true in DB
  },
  '2hr_reminder': async (data) => {
    logger.debug('Executing pre-processing logic specific to 2-hour reminders...');
    // e.g. verify if the user hasn't cancelled their registration
  },
  
  '24hr_reminder': async (data) => {
    logger.debug('Executing pre-processing logic specific to 24-hour reminders...');
  }
};

export const defineNotificationJobs = (agenda: Agenda) => {
  agenda.define<IWorkshopNotificationData>(
    'WORKSHOP_NOTIFICATION', 
    { priority: 20, concurrency: 20 }, // High priority, allow parallel processing
    async (job: Job<IWorkshopNotificationData>) => {
      const data = job.attrs.data;
      const { notificationType, phone, templateName, params } = data;
      
      logger.info(`📲 Executing [${notificationType}] notification for ${phone}`);
      
      try {
        // 1. Find and execute specific handler
        const handler = notificationHandlers[notificationType];
        if (!handler) {
          throw new Error(`Unsupported notification type: ${notificationType}`);
        }
        await handler(data); // Run any pre-processing

        // 2. DRY execution: Single API call handles all notification types
        const provider = await WhatsappProviderFactory.getActiveProvider();
        const result = await provider.sendTemplateMessage({
          to: phone,
          templateName,
          parameters: params,
        });
        
        if (result.success) {
          logger.info(`✅ Successfully sent ${notificationType} notification to ${phone}`);
        } else {
          logger.error(`❌ Failed to send [${notificationType}] to ${phone}. Provider Error: ${result.error}`);
        }
      } catch (error: any) {
        logger.error(error, `❌ Failed to execute [${notificationType}] notification job for ${phone}`);
      }
    }
  );
};
