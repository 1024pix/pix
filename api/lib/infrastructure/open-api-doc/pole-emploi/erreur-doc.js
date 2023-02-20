import Joi from 'joi';

export default Joi.object({
  code: Joi.string().required().description("Code erreur spécifique à l'application."),
  titre: Joi.string().required().description("Un résumé court et lisible de l'erreur"),
  statut: Joi.string().required().description("le code d'état HTTP lié à l'erreur"),
  detail: Joi.string().required().description("Une explication détaillé et lisible de l'erreur"),
}).label('Erreur');
