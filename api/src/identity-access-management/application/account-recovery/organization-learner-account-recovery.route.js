import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { studentIdentifierType } from '../../../shared/domain/types/identifiers-type.js';
import { scoOrganizationLearnerController } from './organization-learner-account-recovery.controller.js';

export const organizationLearnerAccountRecoveryRoutes = [
  {
    method: 'POST',
    path: '/api/sco-organization-learners/account-recovery',
    config: {
      auth: false,
      handler: scoOrganizationLearnerController.checkScoAccountRecovery,
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              'ine-ina': studentIdentifierType,
              birthdate: Joi.date().format('YYYY-MM-DD').required(),
            },
          },
        }).options({ allowUnknown: true }),
      },
      notes: [
        "- Recherche d'un ancien élève par son ine/ina, prénom, nom, date de naissance \n" +
          '- On renvoie les informations permettant de récupérer son compte Pix.',
      ],
      tags: ['api', 'sco-organization-learners', 'account-recovery'],
    },
  },
  {
    method: 'POST',
    path: '/api/account-recovery',
    config: {
      auth: false,
      handler: scoOrganizationLearnerController.sendEmailForScoAccountRecovery,
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              'ine-ina': studentIdentifierType,
              birthdate: Joi.date().format('YYYY-MM-DD').required(),
              email: Joi.string().email().required(),
            },
          },
        }),
        options: {
          allowUnknown: true,
        },
      },
      notes: ["- Permet d'envoyer un mail de demande d'ajout de mot de passe pour récupérer son compte Pix."],
      tags: ['api', 'sco-organization-learners', 'account-recovery'],
    },
  },
];
