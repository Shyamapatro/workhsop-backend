import { FastifyInstance } from 'fastify';
import { formatSuccess } from '@/server/utils/response';
import partialLeadRoutes from '@/server/modules/partialLead/partialLead.route';
import learnerRoutes from '@/server/modules/learner/learner.route';

import mongoose from 'mongoose';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/health', async (req, reply) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const data = {
      uptime: process.uptime(),
      database: dbStatus
    };

    return reply.status(200).send(formatSuccess(data, 'Server is healthy.'));
  });

  fastify.register(partialLeadRoutes);
  fastify.register(learnerRoutes);
}
