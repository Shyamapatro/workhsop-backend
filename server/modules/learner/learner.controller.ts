import { LearnerService } from '@/server/modules/learner/learner.service';
import { formatSuccess, formatError } from '@/server/utils/response';
import { HTTP_STATUS, ERROR_CODES } from '@/server/config/constants';
import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@/server/utils/logger';

import { SignupSchema, LearnerDetailsQuerySchema } from '@/server/modules/learner/learner.validator';
import { z } from 'zod';

export class LearnerController {
  constructor(private service: LearnerService) {}

  async signup(req: FastifyRequest<any>, reply: FastifyReply) {
    const body = req.body as z.infer<typeof SignupSchema>;

    const clientIp = (req.headers['x-forwarded-for'] as string) || (req.headers['x-real-ip'] as string) || req.ip;
    const userAgent = req.headers['user-agent'] || undefined;

    const result = await this.service.registerLearner(body, clientIp, userAgent);

    return reply.status(result.status === 'new' ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).send(formatSuccess(result, 'Your information has been successfully saved. Thank you!'));
  }

  async getLearnerDetails(req: FastifyRequest<any>, reply: FastifyReply) {
    const query = req.query as z.infer<typeof LearnerDetailsQuerySchema>;
    
    const result = await this.service.getLearnerDetails(query);
    return reply.status(HTTP_STATUS.OK).send(formatSuccess(result.data, 'Learner details loaded successfully.', { pagination: result.pagination }));
  }

  async getWorkshopCommunityLink(req: FastifyRequest<any>, reply: FastifyReply) {
    const route = (req.query as any)?.route;
    
    try {
      const data = await this.service.getWorkshopCommunityLink(route);
      
      if (!data) {
        return reply.status(HTTP_STATUS.NOT_FOUND).send(formatError('Workshop link not found', ERROR_CODES.RESOURCE_NOT_FOUND));
      }
      
      return reply.status(HTTP_STATUS.OK).send(formatSuccess(data, 'Workshop link fetched successfully.'));
    } catch (error) {
      logger.error(error, 'Error fetching workshop community link');
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(formatError('Failed to fetch workshop link', ERROR_CODES.UNKNOWN_ERROR));
    }
  }

  async saveWorkshopCommunityLink(req: FastifyRequest<any>, reply: FastifyReply) {
    const body = req.body as z.infer<typeof import('./learner.validator').WorkshopCommunityLinkSaveSchema>;
    try {
      const result = await this.service.saveWorkshopCommunityLink(body);
      return reply.status(HTTP_STATUS.OK).send(formatSuccess(result, 'Workshop link saved successfully.'));
    } catch (error) {
      logger.error(error, 'Error saving workshop community link');
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(formatError('Failed to save workshop link', ERROR_CODES.UNKNOWN_ERROR));
    }
  }
}
