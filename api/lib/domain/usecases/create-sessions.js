const sessionValidator = require('../validators/session-validator');
const { EntityValidationError } = require('../errors');
const { UnprocessableEntityError } = require('../../application/http-errors');

module.exports = async function createSessions({ data }) {
  if (data.length === 0) {
    throw new UnprocessableEntityError('No data in table');
  }

  const sessionsToValidate = data.map((data) => {
    return {
      certificationCenterId: '',
      certifcenter: '',
      accessCode: '',
      address: data['* Nom du site'],
      room: data['* Nom de la salle'],
      date: data['* Date de début'],
      time: data['* Heure de début (heure locale)'],
      examiner: data['* Surveillant(s)'],
      description: data['Observations (optionnel)'],
    };
  });

  try {
    sessionsToValidate.forEach((sessionToValidate) => sessionValidator.validate(sessionToValidate));
  } catch (e) {
    throw new EntityValidationError(e);
  }
  return;
};
