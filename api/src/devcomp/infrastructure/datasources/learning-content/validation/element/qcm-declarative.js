import Joi from 'joi';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackNeutralSchema } from './feedback-neutral-schema.js';
import { proposalContentSchema, shortProposalContentSchema } from './proposal-content-schema.js';

const qcmDeclarativeElementSchema = Joi.alternatives().conditional(Joi.object({ hasShortProposals: true }).unknown(), {
  then: _getQcmDeclarativeSchemaWithProposalContentSchema(shortProposalContentSchema),
  otherwise: _getQcmDeclarativeSchemaWithProposalContentSchema(proposalContentSchema),
});

export { qcmDeclarativeElementSchema };

function _getQcmDeclarativeSchemaWithProposalContentSchema(proposalContentSchema) {
  return Joi.object({
    id: uuidSchema,
    type: Joi.string().valid('qcm-declarative').required(),
    instruction: htmlSchema.required(),
    hasShortProposals: Joi.boolean().optional().default(false).required(),
    proposals: Joi.array()
      .items({
        id: proposalIdSchema.required(),
        content: proposalContentSchema.required(),
        feedback: feedbackNeutralSchema.required(),
      })
      .required(),
  });
}
