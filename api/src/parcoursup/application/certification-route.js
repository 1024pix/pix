import Joi from 'joi';

import {
  certificationVerificationCodeType,
  studentIdentifierType,
} from '../../shared/domain/types/identifiers-type.js';
import { responseObjectErrorDoc } from '../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { certificationController } from './certification-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/application/parcoursup/certification/search',
      config: {
        auth: 'jwt-parcoursup',
        validate: {
          payload: Joi.alternatives()
            .try(
              Joi.object({
                ine: studentIdentifierType
                  .required()
                  .description('INE (identifiant national élève, étudiant ou apprenti)'),
              }),
              Joi.object({
                organizationUai: Joi.string()
                  .required()
                  .description(
                    'UAI/RNE (Unité Administrative Immatriculée anciennement Répertoire National des Établissements)',
                  ),
                lastName: Joi.string().required().description('Nom de famille de l‘élève'),
                firstName: Joi.string().required().description('Prénom de l‘élève'),
                birthdate: Joi.string()
                  .pattern(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
                  .required()
                  .description('Date de naissance au format AAAA-MM-JJ'),
              }),
              Joi.object({
                verificationCode: certificationVerificationCodeType
                  .required()
                  .description('Code de vérification du certificat Pix à vérifier'),
              }),
            )
            .required(),
        },
        handler: certificationController.getCertificationResult,
        tags: ['api', 'parcoursup'],
        notes: [
          '**Cette route est accessible uniquement à Parcoursup**\n' +
            '- Avec un INE, récupère la dernière certification de l‘année en cours pour l‘élève identifié\n' +
            '- Avec un UAI, nom, prénom et date de naissance, récupère la dernière certification de l‘année en cours pour l‘élève identifié\n' +
            '- Avec un code de vérification, récupère la certification correspondante',
        ],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              organizationUai: Joi.string().description(
                'UAI/RNE (Unité Administrative Immatriculée anciennement Répertoire National des Établissements)',
              ),
              ine: Joi.string().description('INE (identifiant national élève, étudiant ou apprenti)'),
              lastName: Joi.string().description('Nom de famille de l‘élève'),
              firstName: Joi.string().description('Prénom de l‘élève'),
              birthdate: Joi.date().description('Date de naissance au format AAAA-MM-JJ'),
              status: Joi.string().description('Statut de la certification'),
              pixScore: Joi.number().min(0).max(1024).description('Score en nombre de pix'),
              certificationDate: Joi.date().description('Date de passage de la certification'),
              competences: Joi.array()
                .items(
                  Joi.object({
                    code: Joi.string().description('Code de la compétence'),
                    name: Joi.string().description('Nom de la compétence'),
                    level: Joi.number().min(0).max(8).description('Niveau obtenu sur la compétence'),
                    areaName: Joi.string().description('Domaine de la compétence'),
                  }).label('Competence-Result-Object'),
                )
                .description('Résultats par compétence')
                .label('Competence-Results-Array'),
            }).label('Certification-Result-Object'),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
            404: responseObjectErrorDoc,
            409: responseObjectErrorDoc,
          },
        },
      },
    },
  ]);
};
const name = 'parcoursup-api';
export { name, register };
