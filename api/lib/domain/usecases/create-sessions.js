const sessionValidator = require('../validators/session-validator');
const { EntityValidationError } = require('../errors');
const { UnprocessableEntityError } = require('../../application/http-errors');

module.exports = async function createSessions({ data }) {
  if (data.length === 0) {
    throw new UnprocessableEntityError('No data in table');
  }
  try {
    data.forEach((session) => {
      const sessionToValidate = {
        address: session['* Nom du site'],
        room: session['* Nom de la salle'],
        date: session['* Date de début'],
        time: session['* Heure de début (heure locale)'],
        examiner: session['* Surveillant(s)'],
        description: session['Observations (optionnel)'],
      };
      sessionValidator.validate(sessionToValidate);
    });
  } catch (e) {
    throw new EntityValidationError(e);
  }
  return;
};
