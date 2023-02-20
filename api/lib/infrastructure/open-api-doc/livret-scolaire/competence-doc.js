import Joi from 'joi';
import areaDoc from './area-doc';

export default Joi.object({
  id: Joi.number().example('1.1').required().description('ID unique de la compétence (ex : “1.1”, “4.3”)'),
  name: Joi.string()
    .example('Mener une recherche et une veille d’information')
    .required()
    .description('Nom de la compétence'),
  area: areaDoc,
});
