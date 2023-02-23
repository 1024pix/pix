const Joi = require('joi');
const certificationStatus = require('../../../../lib/domain/read-models/livret-scolaire/CertificateStatus.js');
const competenceResultDoc = require('./competence-result-doc.js');

module.exports = Joi.object({
  id: Joi.number().required().description('ID de la certification pour l’élève'),
  firstName: Joi.string().example('Anne').required().description('Prénom de l’élève'),
  middleName: Joi.string().example('Sophie').required().description('Deuxième nom de l’élève'),
  thirdName: Joi.string().example('Bobby').required().description('Troisième nom de l’élève'),
  lastName: Joi.string().example('Jerry').required().description('Nom de famille de l’élève'),
  birthdate: Joi.date().example('2000-01-29').required().description('Date de naissance de l’élève'),
  nationalStudentId: Joi.string().example('029991043XX').required().description('INE de l’élève'),
  status: Joi.string()
    .example('validated')
    .valid(certificationStatus)
    .required()
    .description(
      "validated: le candidat a obtenu sa certification. rejected: le candidat a eu sa certification rejetée. pending: le candidat a passé sa certification mais elle n'est pas encore publiée"
    ),
  pixScore: Joi.string().example('520').required().description('Nombre de Pix validés par la certification'),
  verificationCode: Joi.string().example('P-Y468ACDE').description('Code d’attestation de la certification'),
  date: Joi.date().example('2020-11-31T12:00:38.133Z').required().description('Date de passage de la certification'),
  deliveredAt: Joi.date().example('2020-12-31T11:00:38.133Z').description('Date de publication de la certification'),
  certificationCenter: Joi.string()
    .example('Collège Kort Colin')
    .required()
    .description('Nom du centre de certification'),
  competenceResult: competenceResultDoc,
});
