const { expect, sinon, catchErr } = require('../../../../test-helper');
const csvSerializer = require('../../../../../lib/infrastructure/serializers/csv/csv-serializer');
const logger = require('../../../../../lib/infrastructure/logger');
const _ = require('lodash');
const { FileValidationError } = require('../../../../../lib/domain/errors');

describe('Unit | Serializer | CSV | csv-serializer', function () {
  describe('#serializeLine', function () {
    it('should quote strings', async function () {
      // given
      const safeNumberAsString = '-123456';
      const csvExpected =
        '"String with \'single quotes\'";' + '"String with ""double quotes""";' + safeNumberAsString + '\n';

      // when
      const csv = csvSerializer.serializeLine([
        "String with 'single quotes'",
        'String with "double quotes"',
        safeNumberAsString,
      ]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    it('should format numbers in French locale', async function () {
      // given
      const csvExpected = '123;' + '123,456\n';

      // when
      const csv = csvSerializer.serializeLine([123, 123.456]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    it('should escape formula-likes to prevent CSV injections', async function () {
      // given
      const csvExpected = '"\'=formula-like";' + '"\'@formula-like";' + '"\'+formula-like";' + '"\'-formula-like"\n';

      // when
      const csv = csvSerializer.serializeLine(['=formula-like', '@formula-like', '+formula-like', '-formula-like']);

      // then
      expect(csv).to.equal(csvExpected);
    });

    context('should log errors for invalid format', function () {
      it('given object', async function () {
        // when
        sinon.stub(logger, 'error');
        csvSerializer.serializeLine([{}]);
        // then
        expect(logger.error).to.have.been.calledWith(
          'Unknown value type in _csvSerializeValue: object: [object Object]'
        );
      });

      it('given null', async function () {
        // when
        sinon.stub(logger, 'error');
        csvSerializer.serializeLine([null]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: object: null');
      });

      it('given undefined', async function () {
        // when
        sinon.stub(logger, 'error');
        csvSerializer.serializeLine([undefined]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: undefined: undefined');
      });
    });
  });

  describe('#deserializeForSessionsImport', function () {
    describe('when one or more headers are missing', function () {
      it('should throw an error', async function () {
        const parsedCsvData = [
          {
            '* Nom du site': `Site 1`,
          },
        ];

        // when
        const error = await catchErr(csvSerializer.deserializeForSessionsImport)(parsedCsvData);

        // then
        expect(error).to.be.instanceOf(FileValidationError);
      });
    });

    describe('when there is session information', function () {
      describe('when session information is identical on consecutive lines', function () {
        it('should return a full session object per line', function () {
          // given
          const parsedCsvData = [_lineWithSessionAndNoCandidate(1), _lineWithSessionAndNoCandidate(1)];

          const expectedResult = [
            {
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport(parsedCsvData);

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });

      describe('when session information is identical on none consecutive lines', function () {
        it('should return a full session object per line', function () {
          // given
          const parsedCsvData = [
            _lineWithSessionAndNoCandidate(1),
            _lineWithSessionAndNoCandidate(2),
            _lineWithSessionAndNoCandidate(1),
          ];

          const expectedResult = [
            {
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
            },
            {
              address: 'Site 2',
              room: 'Salle 2',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport(parsedCsvData);

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
      describe('when there is different session information on consecutive lines', function () {
        it('should return a full session object per line', function () {
          // given
          const parsedCsvData = [
            _lineWithSessionAndCandidate({ sessionNumber: 1, candidateNumber: 1 }),
            _lineWithSessionAndCandidate({ sessionNumber: 2, candidateNumber: 1 }),
            _lineWithSessionAndCandidate({ sessionNumber: 1, candidateNumber: 2 }),
          ];

          const expectedResult = [
            {
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [
                {
                  lastName: 'Candidat 1',
                  firstName: 'Candidat 1',
                  birthdate: '1981-03-01',
                  sex: 'M',
                  birthINSEECode: '75015',
                  birthPostalCode: '',
                  birthCity: '',
                  birthCountry: 'France',
                  resultRecipientEmail: 'robindahood@email.fr',
                  email: '',
                  externalId: '',
                  extraTimePercentage: null,
                  billingMode: 'Prépayée',
                  prepaymentCode: '43',
                },
                {
                  lastName: 'Candidat 2',
                  firstName: 'Candidat 2',
                  birthdate: '1981-03-01',
                  sex: 'M',
                  birthINSEECode: '75015',
                  birthPostalCode: '',
                  birthCity: '',
                  birthCountry: 'France',
                  resultRecipientEmail: 'robindahood@email.fr',
                  email: '',
                  externalId: '',
                  extraTimePercentage: null,
                  billingMode: 'Prépayée',
                  prepaymentCode: '43',
                },
              ],
            },
            {
              address: 'Site 2',
              room: 'Salle 2',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [
                {
                  lastName: 'Candidat 1',
                  firstName: 'Candidat 1',
                  birthdate: '1981-03-01',
                  sex: 'M',
                  birthINSEECode: '75015',
                  birthPostalCode: '',
                  birthCity: '',
                  birthCountry: 'France',
                  resultRecipientEmail: 'robindahood@email.fr',
                  email: '',
                  externalId: '',
                  extraTimePercentage: null,
                  billingMode: 'Prépayée',
                  prepaymentCode: '43',
                },
              ],
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport(parsedCsvData);

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
    });

    describe('when there is no session information', function () {
      it('should return a full session object with previous session information and current candidate information if any', function () {
        // given
        const parsedCsvData = [_lineWithSessionAndNoCandidate(1), _lineWithCandidateAndNoSession()];

        const expectedResult = [
          {
            address: 'Site 1',
            room: 'Salle 1',
            date: '2023-05-12',
            time: '01:00',
            examiner: 'Paul',
            description: '',
            certificationCandidates: [
              {
                lastName: 'Pennyworth',
                firstName: 'Alfred',
                birthdate: '1951-03-02',
                sex: 'M',
                birthINSEECode: '75015',
                birthPostalCode: '',
                birthCity: '',
                birthCountry: 'France',
                resultRecipientEmail: 'alfredOfficial@email.fr',
                email: '',
                externalId: '',
                extraTimePercentage: null,
                billingMode: 'Prépayée',
                prepaymentCode: '43',
              },
            ],
          },
        ];

        // when
        const result = csvSerializer
          .deserializeForSessionsImport(parsedCsvData)
          .map((session) => _.omit(session, 'uniqueKey'));

        // then
        expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
      });
    });

    describe('when there is no candidate information', function () {
      it('should return a session object with empty candidate information per csv line', function () {
        // given
        const parsedCsvData = [_lineWithSessionAndNoCandidate(1)];

        const expectedResult = [
          {
            address: 'Site 1',
            room: 'Salle 1',
            date: '2023-05-12',
            time: '01:00',
            examiner: 'Paul',
            description: '',
            certificationCandidates: [],
          },
        ];

        // when
        const result = csvSerializer
          .deserializeForSessionsImport(parsedCsvData)
          .map((session) => _.omit(session, 'uniqueKey'));

        // then
        expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
      });
    });
  });
});

function _lineWithSessionAndNoCandidate(sessionNumber) {
  return {
    '* Nom du site': `Site ${sessionNumber}`,
    '* Nom de la salle': `Salle ${sessionNumber}`,
    '* Date de début': '12/05/2023',
    '* Heure de début (heure locale)': '01:00',
    '* Surveillant(s)': 'Paul',
    'Observations (optionnel)': '',
    '* Nom de naissance': '',
    '* Prénom': '',
    '* Date de naissance (format: jj/mm/aaaa)': '',
    '* Sexe (M ou F)': '',
    'Code Insee': '',
    'Code postal': '',
    'Nom de la commune': '',
    '* Pays': '',
    'E-mail du destinataire des résultats (formateur, enseignant…)': '',
    'E-mail de convocation': '',
    'Identifiant local': '',
    'Temps majoré ?': '',
    'Tarification part Pix': '',
    'Code de prépaiement': '',
  };
}

function _lineWithCandidateAndNoSession() {
  return {
    '* Nom du site': '',
    '* Nom de la salle': '',
    '* Date de début': '',
    '* Heure de début (heure locale)': '',
    '* Surveillant(s)': '',
    'Observations (optionnel)': '',
    '* Nom de naissance': 'Pennyworth',
    '* Prénom': 'Alfred',
    '* Date de naissance (format: jj/mm/aaaa)': '02/03/1951',
    '* Sexe (M ou F)': 'M',
    'Code Insee': '75015',
    'Code postal': '',
    'Nom de la commune': '',
    '* Pays': 'France',
    'E-mail du destinataire des résultats (formateur, enseignant…)': 'alfredOfficial@email.fr',
    'E-mail de convocation': '',
    'Identifiant local': '',
    'Temps majoré ?': '',
    'Tarification part Pix': 'Prépayée',
    'Code de prépaiement': '43',
  };
}

function _lineWithSessionAndCandidate({ sessionNumber, candidateNumber }) {
  return {
    '* Nom du site': `Site ${sessionNumber}`,
    '* Nom de la salle': `Salle ${sessionNumber}`,
    '* Date de début': '12/05/2023',
    '* Heure de début (heure locale)': '01:00',
    '* Surveillant(s)': 'Paul',
    'Observations (optionnel)': '',
    '* Nom de naissance': `Candidat ${candidateNumber}`,
    '* Prénom': `Candidat ${candidateNumber}`,
    '* Date de naissance (format: jj/mm/aaaa)': '01/03/1981',
    '* Sexe (M ou F)': 'M',
    'Code Insee': '75015',
    'Code postal': '',
    'Nom de la commune': '',
    '* Pays': 'France',
    'E-mail du destinataire des résultats (formateur, enseignant…)': 'robindahood@email.fr',
    'E-mail de convocation': '',
    'Identifiant local': '',
    'Temps majoré ?': '',
    'Tarification part Pix': 'Prépayée',
    'Code de prépaiement': '43',
  };
}

function _omitUniqueKey(result) {
  return result.map((session) => _.omit(session, 'uniqueKey'));
}
