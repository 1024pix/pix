const { expect } = require('../../../test-helper');
const certificationSessionsService = require('../../../../lib/domain/services/certification-sessions-service');

describe('Unit | Service | certification-sessions-service', function () {
  describe('#groupBySessions', function () {
    context('when there are unique sessions each line', function () {
      it('should return a list of unique sessions', function () {
        // given
        const sessions = [
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
          },
          {
            '* Nom du site': 'site2',
            '* Nom de la salle': 'salle2',
            '* Date de début': '2022-02-02',
            '* Heure de début (heure locale)': '02:00',
            '* Surveillant(s)': 'surveillant deux',
            'Observations (optionnel)': 'non',
          },
        ];

        const expectedSessions = sessions;

        // when
        const result = certificationSessionsService.groupBySessions(sessions);

        // then
        expect(result).to.deep.equal(expectedSessions);
      });
    });

    context('when there are two non following lines with the same session information', function () {
      it('should return a list of two unique sessions', function () {
        // given
        const data = [
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
          },
          {
            '* Nom du site': 'site2',
            '* Nom de la salle': 'salle2',
            '* Date de début': '2022-02-02',
            '* Heure de début (heure locale)': '02:00',
            '* Surveillant(s)': 'surveillant deux',
            'Observations (optionnel)': 'non',
          },
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
          },
        ];

        const expectedData = [
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
          },
          {
            '* Nom du site': 'site2',
            '* Nom de la salle': 'salle2',
            '* Date de début': '2022-02-02',
            '* Heure de début (heure locale)': '02:00',
            '* Surveillant(s)': 'surveillant deux',
            'Observations (optionnel)': 'non',
          },
        ];

        // when
        const result = certificationSessionsService.groupBySessions(data);

        // then
        expect(result).to.deep.equal(expectedData);
      });
    });
  });
});
