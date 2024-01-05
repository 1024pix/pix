import Joi from 'joi';

const uuidSchema = Joi.string().guid().required();

const proposalIdSchema = Joi.string().regex(/^\d+$/);

export { uuidSchema, proposalIdSchema };
