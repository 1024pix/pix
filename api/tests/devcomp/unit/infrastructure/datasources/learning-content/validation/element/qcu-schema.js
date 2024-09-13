import Joi from 'joi';

import { htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';

const qcuElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qcu').required(),
  instruction: htmlSchema.required(),
  proposals: Joi.array()
    .items({
      id: proposalIdSchema.required(),
      content: htmlSchema.required(),
      feedback: htmlSchema,
    })
    .required(),
  feedbacks: Joi.object({
    valid: htmlSchema,
    invalid: htmlSchema,
  }),
  solution: proposalIdSchema.required(),
}).custom((qcuElement, helpers) => {
  const hasGlobalFeedbacks = qcuElement.feedbacks !== undefined;
  const hasSpecificFeedbacks = qcuElement.proposals.some((proposal) => proposal.feedback !== undefined);
  if (hasGlobalFeedbacks && hasSpecificFeedbacks) {
    return helpers.message('Un QCU ne peut pas avoir à la fois des feedbacks spécifiques et globales');
  }
  if (hasSpecificFeedbacks) {
    const someProposalsDoNotHaveSpecificFeedback = qcuElement.proposals.some(
      (proposal) => proposal.feedback === undefined,
    );
    if (someProposalsDoNotHaveSpecificFeedback) {
      return helpers.message('Dans ce QCU, au moins une proposition ne possède pas de feedback spécifique');
    }
  }
  if (!hasGlobalFeedbacks && !hasSpecificFeedbacks) {
    return helpers.message("Dans ce QCU, il n'y a ni feedbacks spécifiques, ni feedbacks globales");
  }

  return qcuElement;
});

export { qcuElementSchema };
