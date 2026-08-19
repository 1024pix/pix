import Joi from 'joi';

import { htmlNotAllowedSchema, htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';

const blockInputSchema = Joi.object({
  input: htmlNotAllowedSchema.required().description('Identifiant unique obligatoire (non visible dans le module)'),
  type: Joi.string()
    .valid('input')
    .required()
    .description("Le type input permet d'afficher un champ éditable par l'utilisateur."),
  inputType: Joi.string()
    .valid('text', 'number')
    .required()
    .description(
      "Le type number affiche un champ qui n'accepte que les chiffres. Le type text affiche un champ textuel classique.",
    ),
  size: Joi.number()
    .positive()
    .required()
    .description('Largeur du champ. Indiquez une valeur correspondant au nombre de caractères attendu.'),
  display: Joi.string()
    .valid('inline', 'block')
    .required()
    .description(
      "Type d'affichage du champ. En inline, le champ apparaîtra sur la même ligne que les autres propositions. En block, il se mettra à la ligne suivante.",
    ),
  placeholder: htmlNotAllowedSchema
    .allow('')
    .required()
    .description("Texte de substitution qui s'affiche dans le champ avant qu'il soit édité."),
  ariaLabel: htmlNotAllowedSchema
    .required()
    .description(
      "Description du champ nécessaire à l’accessibilité (non visible dans le module, lu par les lecteurs d'écran).",
    ),
  tolerances: Joi.array()
    .unique()
    .items(Joi.string().valid('t1', 't2', 't3'))
    .required()
    .description(
      "Les tolérances permettent de valider une réponse malgré les erreurs. (T1 - Espaces, casse & accents, T2 - Ponctuation et T3 - Distance d'édition).",
    ),
  solutions: Joi.array()
    .items(
      Joi.alternatives(
        Joi.string().min(1).required().description('Contenu (type texte) de la solution.'),
        Joi.number().min(1).required().description('Contenu (type nombre) de la solution.'),
      ),
    )
    .required()
    .description('Solution(s) du champ.'),
}).required();

const blockSelectSchema = Joi.object({
  type: Joi.string()
    .valid('select')
    .required()
    .description("Le type select permet d'afficher un sélecteur avec plusieurs options."),
  input: htmlNotAllowedSchema.required().description('Identifiant unique obligatoire (non visible dans le module)'),
  display: Joi.string()
    .valid('inline', 'block')
    .required()
    .description(
      "Type d'affichage du champ. En inline, le champ apparaîtra sur la même ligne que les autres propositions. En block, il se mettra à la ligne suivante.",
    ),
  placeholder: htmlNotAllowedSchema
    .allow('')
    .required()
    .default('- Sélectionner -')
    .description("Texte de substitution qui s'affiche dans le champ lorsqu’aucune option n'est sélectionnée."),
  ariaLabel: htmlNotAllowedSchema
    .required()
    .description(
      "Description du champ nécessaire à l’accessibilité (non visible dans le module, lu par les lecteurs d'écran).",
    ),
  tolerances: Joi.array().empty().required().description('Les tolérances ne concernent que les QROCm de type input.'),
  options: Joi.array()
    .items(
      Joi.object({
        id: proposalIdSchema.description("Identifiant de l'option. Caractères autorisés : tout chiffre (0 à 9)."),
        content: htmlNotAllowedSchema.required().description("Contenu de l'option."),
      }),
    )
    .required()
    .description('Options du champ.'),
  solutions: Joi.array()
    .items(proposalIdSchema.description("Coller ici l'dentifiant (id) de l'option"))
    .required()
    .description('Solution(s) du champ.'),
}).required();

const blockTextSchema = Joi.object({
  type: Joi.string().valid('text').required(),
  content: htmlSchema,
}).required();

const qrocmElementSchema = Joi.object({
  id: uuidSchema,
  type: Joi.string().valid('qrocm').required(),
  instruction: htmlSchema.required().description('Consigne du QROCm'),
  proposals: Joi.array()
    .items(
      Joi.alternatives().conditional('.type', {
        switch: [
          { is: 'text', then: blockTextSchema },
          { is: 'input', then: blockInputSchema },
          { is: 'select', then: blockSelectSchema },
        ],
      }),
    )
    .required()
    .description(
      'Propositions qui vont s’afficher les unes à la suite des autres dans le module (dans l’ordre de contribution)',
    ),
  feedbacks: Joi.object({
    valid: feedbackSchema,
    invalid: feedbackSchema,
  }).required(),
});

export { blockInputSchema, blockSelectSchema, qrocmElementSchema };
