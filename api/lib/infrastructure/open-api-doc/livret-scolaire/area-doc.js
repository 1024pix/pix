import Joi from 'joi';

const joiObject = Joi.object({
  id: Joi.number().example('1').required().description('ID unique de la compétence (ex : “1”, “4”)'),
  name: Joi.string().example('1. Information et données').required().description('Titre du domaine'),
});

export { joiObject as areaDoc };
