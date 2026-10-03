import { FastifyInstance } from 'fastify';
import { LearnerRepository } from '@/server/modules/learner/learner.repository';
import { LearnerService } from '@/server/modules/learner/learner.service';
import { LearnerController } from '@/server/modules/learner/learner.controller';

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SignupSchema, LearnerDetailsQuerySchema, WorkshopCommunityLinkQuerySchema, WorkshopCommunityLinkSaveSchema } from '@/server/modules/learner/learner.validator';

export default async function learnerRoutes(fastify: FastifyInstance) {
  const repo = new LearnerRepository();
  const service = new LearnerService(repo);
  const controller = new LearnerController(service);

  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.post(
    '/api/workshop-signup',
    { schema: { body: SignupSchema } },
    (req, reply) => controller.signup(req, reply)
  );

  typedFastify.get(
    '/api/workshop-community-link',
    { schema: { querystring: WorkshopCommunityLinkQuerySchema } },
    (req, reply) => controller.getWorkshopCommunityLink(req, reply)
  );

  typedFastify.post(
    '/api/workshop-community-link',
    { schema: { body: WorkshopCommunityLinkSaveSchema } },
    (req, reply) => controller.saveWorkshopCommunityLink(req, reply)
  );

  typedFastify.get(
    '/api/learner-details',
    { schema: { querystring: LearnerDetailsQuerySchema } },
    (req, reply) => controller.getLearnerDetails(req, reply)
  );
}
