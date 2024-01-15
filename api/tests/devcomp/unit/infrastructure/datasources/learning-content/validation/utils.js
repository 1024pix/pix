import Joi from 'joi';

const uuidSchema = Joi.string().guid({ version: 'uuidv4' }).required();

const proposalIdSchema = Joi.string().regex(/^\d+$/);

export { uuidSchema, proposalIdSchema };
