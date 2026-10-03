import { PartialLeadService } from '@/server/modules/partialLead/partialLead.service';
import { formatSuccess, formatError } from '@/server/utils/response';
import { HTTP_STATUS, ERROR_CODES } from '@/server/config/constants';
import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@/server/utils/logger';

import { PartialLeadSaveSchema, PartialLeadQuerySchema } from '@/server/modules/partialLead/partialLead.validator';
import { z } from 'zod';

export class PartialLeadController {
  constructor(private service: PartialLeadService) {}

  async savePartialLead(req: FastifyRequest<any>, reply: FastifyReply) {
    const body = req.body as z.infer<typeof PartialLeadSaveSchema>;

    const result = await this.service.savePartialLead(body);
    
    return reply.status(HTTP_STATUS.OK).send(formatSuccess(result.data, result.message));
  }

  async getAllPartialLeads(req: FastifyRequest<any>, reply: FastifyReply) {
    const query = req.query as z.infer<typeof PartialLeadQuerySchema>;
    
    const { leads, ...pagination } = await this.service.getAllPartialLeads(query);
    return reply.status(HTTP_STATUS.OK).send(formatSuccess(leads, 'Partial leads fetched successfully.', { pagination }));
  }
}
