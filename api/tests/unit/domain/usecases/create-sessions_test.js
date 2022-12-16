const { expect, catchErr } = require('../../../test-helper');
const createSessions = require('../../../../lib/domain/usecases/create-sessions');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');

describe('Unit | UseCase | create-sessions', function () {
  context('when session fields are correct', function () {
    it('should validate data for session', async function () {
      // given
      const data = [
        {
          'N° de session': '',
          '* Nom du site': 'site',
          '* Nom de la salle': 'salle',
          '* Date de début': '2022-12-22',
          '* Heure de début (heure locale)': '12:00',
          '* Surveillant(s)': 'surveillant',
          'Observations (optionnel)': 'non',
          '* Nom de naissance': '',
          '* Prénom': '',
          '* Date de naissance (format: jj/mm/aaaa)': '',
        },
      ];

      // when
      await createSessions({ data });

      // then
      expect(createSessions).to.be.ok;
    });
  });

  context('when session fields are not correct', function () {
    it('should throw an error', async function () {
      // given
      const data = [
        {
          'N° de session': '',
          '* Nom du site': 'site',
          '* Nom de la salle': 'salle',
          '* Date de début': '',
          '* Heure de début (heure locale)': '12:00',
          '* Surveillant(s)': 'surveillant',
          'Observations (optionnel)': 'non',
        },
      ];

      // when
      const err = await catchErr(createSessions)({ data });

      // then
      expect(err).to.be.instanceOf(EntityValidationError);
    });
  });

  context('when there is no session data', function () {
    it('should throw an error', async function () {
      // given
      const data = [];

      // when
      const err = await catchErr(createSessions)({ data });

      // then
      expect(err).to.be.instanceOf(UnprocessableEntityError);
    });
  });
});
