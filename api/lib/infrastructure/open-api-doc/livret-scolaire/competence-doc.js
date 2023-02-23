const Joi = require('joi');

const areaDoc = require('./area-doc.js');

module.exports = Joi.object({
  id: Joi.number().example('1.1').required().description('ID unique de la compétence (ex : “1.1”, “4.3”)'),
  name: Joi.string()
    .example('Mener une recherche et une veille d’information')
    .required()
    .description('Nom de la compétence'),
  area: areaDoc,
});
