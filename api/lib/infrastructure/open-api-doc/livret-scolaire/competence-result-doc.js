import Joi from 'joi';

const joiObject = Joi.object({
  level: Joi.number().example('4').required().description('Niveau obtenu pour la compétence'),
  competenceId: Joi.string()
    .example('1.1')
    .required()
    .description(
      'ID unique de la compétence : il fait directement référence à l’attribut id du Resource Object Competence'
    ),
}).description('Tableau des niveaux validés par compétence');

export { joiObject };
