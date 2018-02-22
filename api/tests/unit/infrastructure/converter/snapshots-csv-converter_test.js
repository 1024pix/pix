const { expect } = require('../../../test-helper');
const snapshotsConverter = require('../../../../lib/infrastructure/converter/snapshots-csv-converter');
const Organization = require('../../../../lib/domain/models/Organization');
const Competence = require('../../../../lib/domain/models/Competence');

describe('Unit | Serializer | CSV | snapshots-converter', () => {

  let organization;
  let competences;
  let jsonSnapshots;

  beforeEach(() => {
    organization = new Organization({ type: 'SUP' });

    competences = [
      new Competence({ id: 21, index: '2.1', name: 'Interagir' }),
      new Competence({ id: 41, index: '4.1', name: 'Sécuriser l’environnement numérique' }),
    ];

    const profile1WithEmptyCompetence = '{"included":[{"type":"areas","attributes":{"name":"4. Protection et sécurite"}},{"type":"competences","attributes":{"name":"Securiser l’environnement numerique","index":"4.1","level": 3}},{"type":"competences","attributes":{"name":"Interagir","index":"2.1","level": 4,"course-id":""}}]}';

    const profile2 = {
      'included': [{
        'type': 'areas',
        'attributes': { 'name': '4. Protection et sécurité' }
      }, {
        'type': 'competences',
        'attributes': { 'name': 'Sécuriser l’environnement numérique', 'index': '4.1', 'level': -1 }
      }, {
        'type': 'competences',
        'attributes': { 'name': 'Interagir', 'index': '2.1', 'level': 2, 'course-id': '' }
      }]
    };

    jsonSnapshots = [{
      id: 2,
      score: '22',
      profile: profile1WithEmptyCompetence,
      createdAt: '2017-10-13 09:00:59',
      studentCode: 'UNIV123',
      campaignCode: 'CAMPAIGN123',
      testsFinished: 2,
      user: {
        firstName: 'PrenomUser',
        lastName: 'NomUser',
      }
    },
    {
      id: 1,
      score: null,
      profile: profile2,
      createdAt: '2017-10-12 16:55:50',
      studentCode: 'AAA',
      campaignCode: 'EEE',
      testsFinished: 1,
      user: {
        firstName: 'PrenomUser',
        lastName: 'NomUser',
      }
    }];
  });

  const expectedTextHeadersCSV = '\uFEFF"Nom";"Prénom";"Numéro Étudiant";"Code Campagne";"Date";"Score Pix";"Tests Réalisés";"Interagir";"Sécuriser l’environnement numérique"\n';
  const expectedTextCSVFirstUser = '"NomUser";"PrenomUser";"UNIV123";"CAMPAIGN123";13/10/2017;22;="2/2";4;3\n';
  const expectedTextCSVSecondUser = '"NomUser";"PrenomUser";"AAA";"EEE";12/10/2017;;="1/2";2;\n';

  describe('#convertJsonToCsv()', () => {

    it('should return a CSV String with at least the headers line when there is no shared profiles', () => {
      // when
      const result = snapshotsConverter.convertJsonToCsv(organization, competences, []);

      // then
      expect(result).to.be.a('string');
      expect(result).to.equal(expectedTextHeadersCSV);

    });

    describe('First row of the table', () => {

      it('should display headers information', () => {
        // when
        const result = snapshotsConverter.convertJsonToCsv(organization, competences, jsonSnapshots);

        // then
        expect(result).to.contains(expectedTextHeadersCSV);
      });

      it('should display "Numéro Étudiant" when organization has type "SUP"', () => {
        // given
        organization.type = 'SUP';

        // when
        const result = snapshotsConverter.convertJsonToCsv(organization, competences, jsonSnapshots);

        // then
        expect(result).to.contains('"Numéro Étudiant"');
      });

      it('should display "Numéro INE" when organization has type "SCO"', () => {
        // given
        organization.type  = 'SCO';

        // when
        const result = snapshotsConverter.convertJsonToCsv(organization, competences, jsonSnapshots);

        // then
        expect(result).to.contains('"Numéro INE"');
      });

      it('should display "ID-Pix" when organization has type "PRO"', () => {
        // given
        organization.type  = 'PRO';

        // when
        const result = snapshotsConverter.convertJsonToCsv(organization, competences, jsonSnapshots);

        // then
        expect(result).to.contains('"ID-Pix"');
      });

    });

    describe('Shared profile data rows', () => {

      it('should set information for users', () => {
        // when
        const result = snapshotsConverter.convertJsonToCsv(organization, competences, jsonSnapshots);

        // then
        expect(result).to.contains(expectedTextCSVFirstUser);
        expect(result).to.contains(expectedTextCSVSecondUser);
      });

      it('should return string with headers and users informations in this exact order', () => {
        // when
        const result = snapshotsConverter.convertJsonToCsv(organization, competences, jsonSnapshots);

        // then
        expect(result).to.contains(expectedTextHeadersCSV + expectedTextCSVFirstUser + expectedTextCSVSecondUser);
      });
    });
  });
});
