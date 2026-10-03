import { FastifyInstance } from 'fastify';
import { PartialLeadRepository } from '@/server/modules/partialLead/partialLead.repository';
import { PartialLeadService } from '@/server/modules/partialLead/partialLead.service';
import { PartialLeadController } from '@/server/modules/partialLead/partialLead.controller';

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { PartialLeadSaveSchema, PartialLeadQuerySchema } from '@/server/modules/partialLead/partialLead.validator';

export default async function partialLeadRoutes(fastify: FastifyInstance) {
  const repo = new PartialLeadRepository();
  const service = new PartialLeadService(repo);
  const controller = new PartialLeadController(service);

  const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

  typedFastify.post(
    '/api/partial-lead',
    { schema: { body: PartialLeadSaveSchema } },
    (req, reply) => controller.savePartialLead(req, reply)
  );

  typedFastify.get(
    '/api/partial-lead',
    { schema: { querystring: PartialLeadQuerySchema } },
    (req, reply) => controller.getAllPartialLeads(req, reply)
  );
}
