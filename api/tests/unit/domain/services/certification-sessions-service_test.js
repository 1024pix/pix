const { expect, domainBuilder } = require('../../../test-helper');
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

  describe('#associateSessionIdToParsedData', function () {
    context('when there is one session', function () {
      context('when there is one candidate information', function () {
        it('should return an array of parsedData with matching session id', function () {
          // given
          const savedSessions = [
            domainBuilder.buildSession({
              id: 201,
              certificationCenterId: 101,
              certificationCenter: 'Centre sans candidat',
              address: 'site1',
              room: 'salle1',
              examiner: 'surveillant un',
              date: '2022-01-01',
              time: '01:00',
              description: 'non',
            }),
          ];

          const parsedCsvData = [
            {
              '* Nom du site': 'site1',
              '* Nom de la salle': 'salle1',
              '* Date de début': '2022-01-01',
              '* Heure de début (heure locale)': '01:00',
              '* Surveillant(s)': 'surveillant un',
              'Observations (optionnel)': 'non',
              ' * Nom de naissance': 'Man',
              '* Prénom': 'Iron',
              '* Date de naissance (format: jj/mm/aaaa)': '01/01/2000',
              '* Sexe (M ou F)': 'M',
              'Code Insee': '75115',
              'Code postal': '',
              'Nom de la commune': '',
              '* Pays': 'France',
              'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
              'E-mail de convocation': 'convocation@email.com',
              'Identifiant local': '12345R',
              'Temps majoré ?': '10',
            },
          ];

          const expectedData = [
            {
              sessionId: '201',
              '* Nom du site': 'site1',
              '* Nom de la salle': 'salle1',
              '* Date de début': '2022-01-01',
              '* Heure de début (heure locale)': '01:00',
              '* Surveillant(s)': 'surveillant un',
              'Observations (optionnel)': 'non',
              ' * Nom de naissance': 'Man',
              '* Prénom': 'Iron',
              '* Date de naissance (format: jj/mm/aaaa)': '01/01/2000',
              '* Sexe (M ou F)': 'M',
              'Code Insee': '75115',
              'Code postal': '',
              'Nom de la commune': '',
              '* Pays': 'France',
              'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
              'E-mail de convocation': 'convocation@email.com',
              'Identifiant local': '12345R',
              'Temps majoré ?': '10',
            },
          ];

          // when
          const result = certificationSessionsService.associateSessionIdToParsedData(parsedCsvData, savedSessions);

          // then
          expect(result).to.deep.equal(expectedData);
        });
      });
    });
    context('when there are two sessions with multiple candidate', function () {
      it('should return an array of parsedData with matching session id', function () {
        // given

        const savedSessions = [
          domainBuilder.buildSession({
            id: 201,
            certificationCenterId: 101,
            certificationCenter: 'Centre avec un candidat',
            address: 'site1',
            room: 'salle1',
            examiner: 'surveillant un',
            date: '2022-01-01',
            time: '01:00',
            description: 'non',
          }),
          domainBuilder.buildSession({
            id: 202,
            certificationCenterId: 101,
            certificationCenter: 'Centre avec deux candidats',
            address: 'site2',
            room: 'salle2',
            examiner: 'surveillant deux',
            date: '2022-01-02',
            time: '02:00',
            description: 'oui',
          }),
        ];

        const parsedCsvData = [
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
            ' * Nom de naissance': 'Man',
            '* Prénom': 'Iron',
            '* Date de naissance (format: jj/mm/aaaa)': '01/01/2000',
            '* Sexe (M ou F)': 'M',
            'Code Insee': '75115',
            'Code postal': '',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12345R',
            'Temps majoré ?': '10',
          },
          {
            '* Nom du site': 'site2',
            '* Nom de la salle': 'salle2',
            '* Date de début': '2022-01-02',
            '* Heure de début (heure locale)': '02:00',
            '* Surveillant(s)': 'surveillant deux',
            'Observations (optionnel)': 'oui',
            ' * Nom de naissance': 'Black',
            '* Prénom': 'Widow',
            '* Date de naissance (format: jj/mm/aaaa)': '02/01/2000',
            '* Sexe (M ou F)': 'F',
            'Code Insee': '75115',
            'Code postal': '',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12346R',
            'Temps majoré ?': '10',
          },
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
            ' * Nom de naissance': 'Super',
            '* Prénom': 'Women',
            '* Date de naissance (format: jj/mm/aaaa)': '03/01/2000',
            '* Sexe (M ou F)': 'F',
            'Code Insee': '75115',
            'Code postal': '',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12316R',
            'Temps majoré ?': '10',
          },
        ];

        const expectedData = [
          {
            sessionId: '201',
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
            ' * Nom de naissance': 'Man',
            '* Prénom': 'Iron',
            '* Date de naissance (format: jj/mm/aaaa)': '01/01/2000',
            '* Sexe (M ou F)': 'M',
            'Code Insee': '75115',
            'Code postal': '',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12345R',
            'Temps majoré ?': '10',
          },
          {
            sessionId: '202',
            '* Nom du site': 'site2',
            '* Nom de la salle': 'salle2',
            '* Date de début': '2022-01-02',
            '* Heure de début (heure locale)': '02:00',
            '* Surveillant(s)': 'surveillant deux',
            'Observations (optionnel)': 'oui',
            ' * Nom de naissance': 'Black',
            '* Prénom': 'Widow',
            '* Date de naissance (format: jj/mm/aaaa)': '02/01/2000',
            '* Sexe (M ou F)': 'F',
            'Code Insee': '75115',
            'Code postal': '',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12346R',
            'Temps majoré ?': '10',
          },
          {
            sessionId: '201',
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
            ' * Nom de naissance': 'Super',
            '* Prénom': 'Women',
            '* Date de naissance (format: jj/mm/aaaa)': '03/01/2000',
            '* Sexe (M ou F)': 'F',
            'Code Insee': '75115',
            'Code postal': '',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12316R',
            'Temps majoré ?': '10',
          },
        ];

        // when
        const result = certificationSessionsService.associateSessionIdToParsedData(parsedCsvData, savedSessions);

        // then
        expect(result).to.deep.equal(expectedData);
      });
    });
  });
});
