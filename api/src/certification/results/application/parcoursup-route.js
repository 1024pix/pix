import Joi from 'joi';

import {
  certificationVerificationCodeType,
  studentIdentifierType,
} from '../../../shared/domain/types/identifiers-type.js';
import { jwtApplicationAuthenticationStrategyName } from '../../../shared/infrastructure/authentication-strategy-names.js';
import { responseObjectErrorDoc } from '../../../shared/infrastructure/open-api-doc/response-object-error-doc.js';
import { parcoursupController } from './parcoursup-controller.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/application/parcoursup/certification/search',
      config: {
        auth: { strategy: jwtApplicationAuthenticationStrategyName, access: { scope: 'parcoursup' } },
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
        handler: parcoursupController.getCertificationResultForParcoursup,
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
              certificationId: Joi.number()
                .integer()
                .positive()
                .description('Identifiant unique de la certification')
                .example(123456),
              certificationCodeVerification: Joi.string()
                .description('Code de vérification de la certification')
                .example('P-XYZXYZ'),
              organizationUai: Joi.string()
                .description(
                  'UAI/RNE (Unité Administrative Immatriculée anciennement Répertoire National des Établissements)',
                )
                .example('SOMEGREATSCHOOL123'),
              ine: Joi.string()
                .description('INE (identifiant national élève, étudiant ou apprenti)')
                .example('SOMEGREATSTUDENT456'),
              lastName: Joi.string().description('Nom de famille de l‘élève').example('Doe'),
              firstName: Joi.string().description('Prénom de l‘élève').example('Jane'),
              middleName: Joi.string().description('Deuxième prénom de l‘élève').example('Diane'),
              thirdName: Joi.string().description('Troisième prénom de l‘élève').example('Beth'),
              birthdate: Joi.date().description('Date de naissance au format AAAA-MM-JJ').example('2008-01-01'),
              status: Joi.string().description('Statut de la certification').example('validated'),
              pixScore: Joi.number().min(0).max(1024).description('Score global en nombre de pix').example('255'),
              globalLevel: Joi.string()
                .description('Niveau global de la certification, défini en fonction du score global Pix obtenu')
                .example('Intermédiaire 1'),
              certificationDate: Joi.date().description('Date de passage de la certification').example('2026-01-01'),
              certificationIssuedAt: Joi.date()
                .description('Date de délivrance de la certification')
                .example('2026-01-15'),
              maxReachablePixScore: Joi.number()
                .integer()
                .positive()
                .description('Score en pix atteignable au maximum par le candidat lors du passage de certification')
                .example(895),
              maxGlobalLevel: Joi.string()
                .description('Niveau global atteignable au maximum par le candidat lors du passage de certification')
                .example('Expert 1'),
              competences: Joi.array()
                .items(
                  Joi.object({
                    code: Joi.string().description('Code de la compétence').example('1.1'),
                    name: Joi.string().description('Nom de la compétence').example('Lacer ses chaussures'),
                    level: Joi.number().min(0).max(8).description('Niveau obtenu sur la compétence').example(3),
                    areaName: Joi.string().description('Domaine de la compétence').example("S'habiller"),
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
    {
      method: 'GET',
      path: '/api/application/parcoursup/info',
      config: {
        auth: { strategy: jwtApplicationAuthenticationStrategyName, access: { scope: 'parcoursup' } },
        handler: parcoursupController.getInfo,
        tags: ['api', 'parcoursup'],
        notes: [
          '**Cette route est accessible uniquement à Parcoursup**\n' +
            'Permet de récupérer les dates de dernière mise à jour des données mises à disposition',
        ],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              sentAt: Joi.date().description('Date à laquelle le client a interrogé ce endpoint'),
              lastUpdatedAtCurrentSchoolYear: Joi.date().description(
                "Date de dernière mise à jour des données contenant les certifications de l'année scolaire en cours",
              ),
              lastUpdatedAtVerificationCode: Joi.date().description(
                'Date de dernière mise à jour des données contenant les certifications par code de vérification, toute année confondue',
              ),
            }),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
            404: responseObjectErrorDoc,
            409: responseObjectErrorDoc,
          },
        },
      },
    },
    {
      method: 'GET',
      path: '/api/application/parcoursup/certification/latest-certification-by-uai',
      config: {
        auth: { strategy: jwtApplicationAuthenticationStrategyName, access: { scope: 'parcoursup' } },
        handler: parcoursupController.getLatestCertificationByUai,
        tags: ['api', 'parcoursup'],
        notes: [
          '**Cette route est accessible uniquement à Parcoursup**\n' +
            'Permet de récupérer pour chaque établissement la date de dernière délivrance de certificat',
        ],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object()
              .pattern(
                /^.*$/,
                Joi.date()
                  .description('Date de dernière délivrance de certification pour cet établissement')
                  .example('2026-01-15'),
              )
              .description(
                "Objet dont les clés sont des UAI d'établissement et les valeurs contiennent la date de dernière délivrance de certification",
              )
              .example({
                UAI_A: '2026-12-01',
                UAI_B: '2025-11-01',
                UAI_C: '2024-02-01',
              }),
            401: responseObjectErrorDoc,
            403: responseObjectErrorDoc,
            404: responseObjectErrorDoc,
            409: responseObjectErrorDoc,
          },
        },
      },
    },
  ]);
}
export const parcoursupRoute = { name: 'certification/results/parcoursup-api', register };
