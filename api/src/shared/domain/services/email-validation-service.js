import Joi from 'joi';

const emailSchema = Joi.object({
  email: Joi.string().email(),
});

export const validateEmailSyntax = (email) => {
  const { error } = emailSchema.validate({ email });
  return !error;
};

export default { validateEmailSyntax };
