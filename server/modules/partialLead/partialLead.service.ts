import { IPartialLeadRepository } from '@/server/modules/partialLead/IPartialLeadRepository';
import { PartialLeadSaveSchema, PartialLeadQuerySchema } from '@/server/modules/partialLead/partialLead.validator';
import { z } from 'zod';
import { getDateRangeBounds } from '@/server/utils/timezone';

import { AppError } from '@/server/utils/AppError';
import { HTTP_STATUS, ERROR_CODES } from '@/server/config/constants';

export class PartialLeadService {
  constructor(private repository: IPartialLeadRepository) {}

  async savePartialLead(data: z.infer<typeof PartialLeadSaveSchema>) {
    const email = data.email?.toLowerCase();
    const phoneNumber = data.phoneNumber;

    const exists = await this.repository.existsInUser(email, phoneNumber);
    
    if (exists) {
      throw new AppError('User already exists as a registered learner.', HTTP_STATUS.CONFLICT, ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const updatedLead = await this.repository.upsertPartialLead({
      name: data.name,
      email,
      phoneNumber,
      route: data.route
    });

    // NOTE: Agenda scheduler logic (for abandoned lead whatsapp reminders) 
    // is omitted here as it requires Agenda (or similar job runner) to be configured in this Next.js app.
    // If configured, you would enqueue a job here similar to:
    // await agenda.schedule(moment().add(15, "minutes").format(), "ABANDONED_LEAD_WHATSAPP_REMINDER", { phone, ... });
    
    return { 
      status: 'success', 
      message: 'captured successfully.',
      data: updatedLead
    };
  }

  async getAllPartialLeads(queryData: z.infer<typeof PartialLeadQuerySchema>) {
    const { page, limit, startDate, endDate, status } = queryData;
    const skip = (page - 1) * limit;

    const dbQuery: any = {};
    if (status) {
      dbQuery.status = status;
    }

    if (startDate && endDate) {
      const { start, end } = getDateRangeBounds('custom', startDate, endDate,  'Asia/Kolkata');
      dbQuery.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    const { total, leads } = await this.repository.getPartialLeads(dbQuery, skip, limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      leads
    };
  }
}
