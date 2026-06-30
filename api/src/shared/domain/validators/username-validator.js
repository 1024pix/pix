import Joi from 'joi';

const pattern = /^([a-z]+[.]+[a-z]+[0-9]{4})$/;

/** @type {Joi.StringSchema<string>} */
export const UsernameSchema = Joi.string().pattern(pattern);
