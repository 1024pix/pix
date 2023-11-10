import Joi from 'joi';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { certificationAttestationController } from './certification-attestation-controller.js';
import { LOCALE } from '../../../shared/domain/constants.js';
const { FRENCH_SPOKEN, ENGLISH_SPOKEN } = LOCALE;

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/attestation/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.certificationCourseId,
          }),
          query: Joi.object({
            isFrenchDomainExtension: Joi.boolean().required(),
            lang: Joi.string().valid(FRENCH_SPOKEN, ENGLISH_SPOKEN),
          }),
        },
        handler: certificationAttestationController.getPDFAttestation,
        notes: [
          '- **Route accessible par un user authentifié**\n' +
            '- Récupération des informations d’une attestation de certification au format PDF' +
            ' via un id de certification et un user id',
        ],
        tags: ['api', 'certifications', 'PDF'],
      },
    },
  ]);
};

const name = 'certification-attestation-api';
export { register, name };
