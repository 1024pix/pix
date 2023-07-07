import { expect, sinon, catchErr } from '../../../../test-helper.js';
import * as csvSerializer from '../../../../../lib/infrastructure/serializers/csv/csv-serializer.js';
import { logger } from '../../../../../lib/infrastructure/logger.js';
import _ from 'lodash';
import { FileValidationError } from '../../../../../lib/domain/errors.js';
import { emptySession } from '../../../../../lib/infrastructure/utils/csv/sessions-import.js';

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
    describe('when csv is empty', function () {
      it('should throw an error', async function () {
        const parsedCsvData = [];

        // when
        const error = await catchErr(csvSerializer.deserializeForSessionsImport)({
          parsedCsvData,
          hasBillingMode: true,
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('CSV_HEADERS_NOT_VALID');
      });
    });

    describe('when csv is undefined', function () {
      it('should throw an error', async function () {
        const parsedCsvData = undefined;

        // when
        const error = await catchErr(csvSerializer.deserializeForSessionsImport)({
          parsedCsvData,
          hasBillingMode: true,
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('CSV_HEADERS_NOT_VALID');
      });
    });
    describe('when one or more headers are missing', function () {
      it('should throw an error', async function () {
        const parsedCsvData = [
          {
            '* Nom du site': `Site 1`,
          },
        ];

        // when
        const error = await catchErr(csvSerializer.deserializeForSessionsImport)({
          parsedCsvData,
          hasBillingMode: true,
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('CSV_HEADERS_NOT_VALID');
      });

      context('when billing mode header is missing', function () {
        context('when certification center has billing mode', function () {
          it('should throw an error', async function () {
            const parsedCsvData = [
              {
                'Numéro de session préexistante': '',
                '* Nom du site': '',
                '* Nom de la salle': '',
                '* Date de début (format: JJ/MM/AAAA)': '',
                '* Heure de début (heure locale format: HH:MM)': '',
                '* Surveillant(s)': '',
                'Observations (optionnel)': '',
                '* Nom de naissance': 'Paul',
                '* Prénom': 'Pierre',
                '* Date de naissance (format: JJ/MM/AAAA)': '12/09/1987',
                '* Sexe (M ou F)': 'M',
                'Code INSEE de la commune de naissance': '',
                'Code postal de la commune de naissance': '',
                'Nom de la commune de naissance': '',
                '* Pays de naissance': 'France',
                'E-mail du destinataire des résultats (formateur, enseignant…)': '',
                'E-mail de convocation': '',
                'Identifiant externe': '',
                'Temps majoré ? (exemple format: 33%)': '',
              },
            ];

            // when
            const error = await catchErr(csvSerializer.deserializeForSessionsImport)({
              parsedCsvData,
              hasBillingMode: true,
            });

            // then
            expect(error).to.be.instanceOf(FileValidationError);
            expect(error.code).to.equal('CSV_HEADERS_NOT_VALID');
          });
        });

        context('when certification center does not have the billing mode', function () {
          it('should not throw an error', async function () {
            const parsedCsvData = [
              {
                'Numéro de session préexistante': '',
                '* Nom du site': '',
                '* Nom de la salle': '',
                '* Date de début (format: JJ/MM/AAAA)': '',
                '* Heure de début (heure locale format: HH:MM)': '',
                '* Surveillant(s)': '',
                'Observations (optionnel)': '',
                '* Nom de naissance': 'Paul',
                '* Prénom': 'Pierre',
                '* Date de naissance (format: JJ/MM/AAAA)': '12/09/1987',
                '* Sexe (M ou F)': 'M',
                'Code INSEE de la commune de naissance': '',
                'Code postal de la commune de naissance': '',
                'Nom de la commune de naissance': '',
                '* Pays de naissance': 'France',
                'E-mail du destinataire des résultats (formateur, enseignant…)': '',
                'E-mail de convocation': '',
                'Identifiant externe': '',
                'Temps majoré ? (exemple format: 33%)': '',
              },
            ];

            // when
            const result = await csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: false });

            // then
            expect(result).to.deep.equal([emptySession]);
          });
        });
      });
    });

    describe('when certification center does not have billing mode', function () {
      context('when billing mode header is present', function () {
        it('should throw an error', async function () {
          const parsedCsvData = [
            {
              'Numéro de session préexistante': '',
              '* Nom du site': '',
              '* Nom de la salle': '',
              '* Date de début (format: JJ/MM/AAAA)': '',
              '* Heure de début (heure locale format: HH:MM)': '',
              '* Surveillant(s)': '',
              'Observations (optionnel)': '',
              '* Nom de naissance': 'Paul',
              '* Prénom': 'Pierre',
              '* Date de naissance (format: JJ/MM/AAAA)': '12/09/1987',
              '* Sexe (M ou F)': 'M',
              'Code INSEE de la commune de naissance': '',
              'Code postal de la commune de naissance': '',
              'Nom de la commune de naissance': '',
              '* Pays de naissance': 'France',
              'E-mail du destinataire des résultats (formateur, enseignant…)': '',
              'E-mail de convocation': '',
              'Identifiant externe': '',
              'Temps majoré ? (exemple format: 33%)': '',
              '* Tarification part Pix (Gratuite, Prépayée ou Payante)': '',
              'Code de prépaiement (si Tarification part Pix Prépayée)': '',
            },
          ];

          // when
          const error = await catchErr(csvSerializer.deserializeForSessionsImport)({
            parsedCsvData,
            hasBillingMode: false,
          });

          // then
          expect(error).to.be.instanceOf(FileValidationError);
          expect(error.code).to.equal('CSV_HEADERS_NOT_VALID');
        });
      });
    });

    describe('when importing sessions', function () {
      describe('when every mandatory information is missing', function () {
        it('should not throw an error', async function () {
          const parsedCsvData = [
            {
              'Numéro de session préexistante': '',
              '* Nom du site': '',
              '* Nom de la salle': '',
              '* Date de début (format: JJ/MM/AAAA)': '',
              '* Heure de début (heure locale format: HH:MM)': '',
              '* Surveillant(s)': '',
              'Observations (optionnel)': '',
              '* Nom de naissance': 'Paul',
              '* Prénom': 'Pierre',
              '* Date de naissance (format: JJ/MM/AAAA)': '12/09/1987',
              '* Sexe (M ou F)': 'M',
              'Code INSEE de la commune de naissance': '',
              'Code postal de la commune de naissance': '',
              'Nom de la commune de naissance': '',
              '* Pays de naissance': 'France',
              'E-mail du destinataire des résultats (formateur, enseignant…)': '',
              'E-mail de convocation': '',
              'Identifiant externe': '',
              'Temps majoré ? (exemple format: 33%)': '',
              '* Tarification part Pix (Gratuite, Prépayée ou Payante)': '',
              'Code de prépaiement (si Tarification part Pix Prépayée)': '',
            },
          ];

          // when
          const result = await csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(result).to.deep.equal([emptySession]);
        });
      });
    });

    describe('when there is session information', function () {
      describe('when session time is empty', function () {
        it('should return null for time', function () {
          // given
          const sessionLine = _line({
            sessionId: '',
            address: `Site 1`,
            room: `Salle 1`,
            date: '12/05/2023',
            time: '',
            examiner: 'Paul',
            description: '',
          });

          const parsedCsvData = [sessionLine];

          const expectedResult = [
            {
              sessionId: undefined,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: null,
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
              line: 2,
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });

      describe('when session date format is incorrect', function () {
        it('should return original date', function () {
          // given
          const sessionLine = _line({
            sessionId: '',
            address: `Site 1`,
            room: `Salle 1`,
            date: 'wrong format',
            time: '',
            examiner: 'Paul',
            description: '',
          });

          const parsedCsvData = [sessionLine];

          const expectedResult = [
            {
              sessionId: undefined,
              address: 'Site 1',
              room: 'Salle 1',
              date: 'wrong format',
              time: null,
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
              line: 2,
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });

      describe('when session information is identical on consecutive lines', function () {
        it('should return a full session object per line', function () {
          // given
          const parsedCsvData = [
            _lineWithSessionAndNoCandidate({ sessionNumber: 1 }),
            _lineWithSessionAndNoCandidate({ sessionNumber: 1 }),
          ];

          const expectedResult = [
            {
              sessionId: undefined,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
              line: 2,
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });

        describe('when the are multiple different supervisors per session', function () {
          it('should return the session with an array of supervisors', function () {
            // given
            const parsedCsvData = [
              _lineWithSessionAndNoCandidate({ sessionNumber: 1, examiner: 'Big' }),
              _lineWithSessionAndNoCandidate({ sessionNumber: 1, examiner: 'Jim' }),
            ];

            const expectedResult = [
              {
                sessionId: undefined,
                address: 'Site 1',
                room: 'Salle 1',
                date: '2023-05-12',
                time: '01:00',
                examiner: 'Big, Jim',
                description: '',
                certificationCandidates: [],
                line: 2,
              },
            ];

            // when
            const result = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

            // then
            expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
          });
        });
      });

      describe('when session information is identical on none consecutive lines', function () {
        it('should return a full session object per line', function () {
          // given
          const parsedCsvData = [
            _lineWithSessionAndNoCandidate({ sessionNumber: 1 }),
            _lineWithSessionAndNoCandidate({ sessionNumber: 2 }),
            _lineWithSessionAndNoCandidate({ sessionNumber: 1 }),
          ];

          const expectedResult = [
            {
              sessionId: undefined,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
              line: 2,
            },
            {
              sessionId: undefined,
              address: 'Site 2',
              room: 'Salle 2',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              certificationCandidates: [],
              line: 3,
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              sessionId: undefined,
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
                  complementaryCertification: null,
                  line: 2,
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
                  complementaryCertification: null,
                  line: 4,
                },
              ],
              line: 2,
            },
            {
              sessionId: undefined,
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
                  complementaryCertification: null,
                  line: 3,
                },
              ],
              line: 3,
            },
          ];

          // when
          const result = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
    });

    describe('when there is a sessionId', function () {
      context('when there is certification candidate information', function () {
        it('should return data', function () {
          // given
          const parsedCsvData = [
            _lineWithSessionIdAndCandidate({
              sessionId: 1,
              candidateNumber: 1,
            }),
            _lineWithSessionIdAndCandidate({
              sessionId: 1,
              candidateNumber: 2,
            }),
          ];

          const expectedResult = [
            {
              sessionId: 1,
              examiner: '',
              line: 2,
              certificationCandidates: [
                {
                  lastName: 'Candidat 1',
                  firstName: 'Candidat 1',
                  birthdate: '1981-03-01',
                  birthINSEECode: '75015',
                  birthPostalCode: '',
                  billingMode: 'Prépayée',
                  birthCity: '',
                  birthCountry: 'France',
                  email: '',
                  externalId: '',
                  extraTimePercentage: null,
                  prepaymentCode: '43',
                  resultRecipientEmail: 'robindahood@email.fr',
                  sex: 'M',
                  complementaryCertification: null,
                  line: 2,
                },
                {
                  lastName: 'Candidat 2',
                  firstName: 'Candidat 2',
                  birthdate: '1981-03-01',
                  birthINSEECode: '75015',
                  birthPostalCode: '',
                  billingMode: 'Prépayée',
                  birthCity: '',
                  birthCountry: 'France',
                  email: '',
                  externalId: '',
                  extraTimePercentage: null,
                  prepaymentCode: '43',
                  resultRecipientEmail: 'robindahood@email.fr',
                  sex: 'M',
                  complementaryCertification: null,
                  line: 3,
                },
              ],
            },
          ];

          // when
          const result = csvSerializer
            .deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true })
            .map((session) => _.omit(session, 'uniqueKey'));

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
    });

    describe('when there is no session information', function () {
      context('when there is a previous session line in csv', function () {
        it('should return a full session object with previous session information and current candidate information if any', function () {
          // given
          const parsedCsvData = [
            _lineWithSessionAndNoCandidate({ sessionNumber: 1 }),
            _lineWithCandidateAndNoSession(),
          ];

          const expectedResult = [
            {
              sessionId: undefined,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              line: 2,
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
                  complementaryCertification: null,
                  line: 3,
                },
              ],
            },
          ];

          // when
          const result = csvSerializer
            .deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true })
            .map((session) => _.omit(session, 'uniqueKey'));

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
    });

    describe('when there is candidate information', function () {
      describe('when there is prepayment code information', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          { prepaymentCode: '', expectedParsedPrepaymentCode: null },
          { prepaymentCode: '1234', expectedParsedPrepaymentCode: '1234' },
        ].forEach(({ prepaymentCode, expectedParsedPrepaymentCode }) => {
          it(`should return ${expectedParsedPrepaymentCode} when prepaymenCode is ${prepaymentCode}`, function () {
            // given
            const csvLine = [_lineWithCandidateAndBillingInformation({ prepaymentCode })];

            // when
            const result = csvSerializer
              .deserializeForSessionsImport({ parsedCsvData: csvLine, hasBillingMode: true })
              .map((session) => _.omit(session, 'uniqueKey'));

            // then
            const expectedResult = [
              {
                sessionId: undefined,
                address: 'Site toto',
                room: 'Salle toto',
                date: '2023-05-12',
                time: '01:00',
                examiner: '',
                description: '',
                line: 2,
                certificationCandidates: [
                  {
                    lastName: 'Pennyworth',
                    firstName: 'Alfred',
                    birthdate: '1951-03-02',
                    birthINSEECode: '',
                    birthPostalCode: '',
                    birthCity: '',
                    birthCountry: '',
                    resultRecipientEmail: '',
                    email: '',
                    externalId: '',
                    extraTimePercentage: null,
                    billingMode: '',
                    prepaymentCode: expectedParsedPrepaymentCode,
                    sex: '',
                    complementaryCertification: null,
                    line: 2,
                  },
                ],
              },
            ];
            expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
          });
        });
      });

      it('should return a session object with candidate information per csv line', function () {
        // given
        const parsedCsvData = [
          _lineWithSessionAndCandidateWithComplementaryCertification({
            sessionNumber: 1,
            candidateNumber: 1,
            complementaryCertification: 'oui',
          }),
        ];

        const expectedResult = [
          {
            sessionId: undefined,
            address: 'Site 1',
            room: 'Salle 1',
            date: '2023-05-12',
            time: '01:00',
            examiner: 'Paul',
            description: '',
            line: 2,
            certificationCandidates: [
              {
                lastName: 'Candidat 1',
                firstName: 'Candidat 1',
                birthdate: '1981-03-01',
                birthINSEECode: '75015',
                birthPostalCode: '',
                billingMode: 'Prépayée',
                birthCity: '',
                birthCountry: 'France',
                email: '',
                externalId: '',
                extraTimePercentage: null,
                prepaymentCode: '43',
                resultRecipientEmail: 'robindahood@email.fr',
                sex: 'M',
                complementaryCertification: 'Pix certif complementaire',
                line: 2,
              },
            ],
          },
        ];

        // when
        const result = csvSerializer
          .deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true })
          .map((session) => _.omit(session, 'uniqueKey'));

        // then
        expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
      });

      describe('when some mandatory candidate fields are missing', function () {
        it('should return the parsed session with associated incomplete candidate', function () {
          const candidateWithoutLastName = {
            lastName: '',
            firstName: `Candidat 1`,
            birthdate: '01/03/1981',
            sex: 'M',
            birthINSEECode: '75015',
            birthPostalCode: '',
            birthCity: '',
            birthCountry: 'France',
            resultRecipientEmail: 'robindahood@email.fr',
            email: '',
            externalId: '',
            extraTimePercentage: '',
            billingMode: 'Prépayée',
            prepaymentCode: '43',
            complementaryCertification: null,
          };

          const candidateWithoutFirstName = {
            lastName: 'Nom du candidat',
            firstName: '',
            birthdate: '01/03/1981',
            sex: 'M',
            birthINSEECode: '75015',
            birthPostalCode: '',
            birthCity: '',
            birthCountry: 'France',
            resultRecipientEmail: 'robindahood@email.fr',
            email: '',
            externalId: '',
            extraTimePercentage: '',
            billingMode: 'Prépayée',
            prepaymentCode: '43',
            complementaryCertification: null,
          };

          const candidateWithoutBirthdate = {
            lastName: 'Nom du candidat',
            firstName: 'Candidat 1',
            birthdate: '',
            sex: 'M',
            birthINSEECode: '75015',
            birthPostalCode: '',
            birthCity: '',
            birthCountry: 'France',
            resultRecipientEmail: 'robindahood@email.fr',
            email: '',
            externalId: '',
            extraTimePercentage: '',
            billingMode: 'Prépayée',
            prepaymentCode: '43',
            complementaryCertification: null,
          };

          const candidateWithoutSex = {
            lastName: 'Nom du candidat',
            firstName: 'Candidat 1',
            birthdate: '01/03/1981',
            sex: '',
            birthINSEECode: '75015',
            birthPostalCode: '',
            birthCity: '',
            birthCountry: 'France',
            resultRecipientEmail: 'robindahood@email.fr',
            email: '',
            externalId: '',
            extraTimePercentage: '',
            billingMode: 'Prépayée',
            prepaymentCode: '43',
            complementaryCertification: null,
          };

          const candidateWithoutBillingMode = {
            lastName: 'Nom du candidat',
            firstName: `Candidat 1`,
            birthdate: '01/03/1981',
            sex: 'M',
            birthINSEECode: '75015',
            birthPostalCode: '',
            birthCity: '',
            birthCountry: 'France',
            resultRecipientEmail: 'robindahood@email.fr',
            email: '',
            externalId: '',
            extraTimePercentage: '',
            billingMode: '',
            prepaymentCode: '43',
            complementaryCertification: null,
          };

          const candidateWithoutBirthCountry = {
            lastName: 'Nom du candidat',
            firstName: 'Candidat 1',
            birthdate: '01/03/1981',
            sex: 'M',
            birthINSEECode: '75015',
            birthPostalCode: '',
            birthCity: '',
            birthCountry: '',
            resultRecipientEmail: 'robindahood@email.fr',
            email: '',
            externalId: '',
            extraTimePercentage: '',
            billingMode: 'Prépayée',
            prepaymentCode: '43',
            complementaryCertification: null,
          };

          // given
          const parsedCsvData = [
            _line({
              sessionId: '',
              address: `Site 1`,
              room: `Salle 1`,
              date: '12/05/2023',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              ...candidateWithoutLastName,
            }),
            _line({
              sessionId: '',
              address: 'Site 1',
              room: 'Salle 1',
              date: '12/05/2023',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              ...candidateWithoutFirstName,
            }),
            _line({
              sessionId: '',
              address: 'Site 1',
              room: 'Salle 1',
              date: '12/05/2023',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              ...candidateWithoutBirthdate,
            }),
            _line({
              sessionId: '',
              address: 'Site 1',
              room: 'Salle 1',
              date: '12/05/2023',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              ...candidateWithoutSex,
            }),
            _line({
              sessionId: '',
              address: `Site 1`,
              room: `Salle 1`,
              date: '12/05/2023',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              ...candidateWithoutBillingMode,
            }),
            _line({
              sessionId: '',
              address: `Site 1`,
              room: `Salle 1`,
              date: '12/05/2023',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              ...candidateWithoutBirthCountry,
            }),
          ];

          // when
          const [result] = csvSerializer.deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(result.certificationCandidates).to.have.length(6);
        });
      });

      describe('when there is no candidate information', function () {
        it('should return a session object with empty candidate information per csv line', function () {
          // given
          const parsedCsvData = [_lineWithSessionAndNoCandidate({ sessionNumber: 1 })];

          const expectedResult = [
            {
              sessionId: undefined,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-05-12',
              time: '01:00',
              examiner: 'Paul',
              description: '',
              line: 2,
              certificationCandidates: [],
            },
          ];

          // when
          const result = csvSerializer
            .deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true })
            .map((session) => _.omit(session, 'uniqueKey'));

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
    });

    it('should return data with lines', function () {
      // given
      const parsedCsvData = [
        _lineWithSessionIdAndCandidate({
          sessionId: 1,
          candidateNumber: 1,
        }),
        _lineWithSessionAndCandidate({
          sessionNumber: 404,
          candidateNumber: 2,
        }),
        _lineWithSessionAndCandidate({
          sessionNumber: 404,
          candidateNumber: 3,
        }),
        _lineWithCandidateAndNoSession(),
      ];

      // when
      const [firstSession, secondSession] = csvSerializer.deserializeForSessionsImport({
        parsedCsvData,
        hasBillingMode: true,
      });

      // then
      expect(firstSession.line).to.equal(2);
      expect(firstSession.certificationCandidates[0].line).to.equal(2);

      expect(secondSession.line).to.equal(3);
      expect(secondSession.certificationCandidates[0].line).to.equal(3);
      expect(secondSession.certificationCandidates[1].line).to.equal(4);
      expect(secondSession.certificationCandidates[2].line).to.equal(5);
    });
  });
});

function _line({
  sessionId = '',
  address = '',
  room = '',
  date = '',
  time = '',
  examiner = '',
  description = '',
  lastName = '',
  firstName = '',
  birthdate = '',
  sex = '',
  birthINSEECode = '',
  birthPostalCode = '',
  birthCity = '',
  birthCountry = '',
  resultRecipientEmail = '',
  email = '',
  externalId = '',
  extraTimePercentage = '',
  billingMode = '',
  prepaymentCode = '',
  complementaryCertification = '',
}) {
  return {
    'Numéro de session préexistante': sessionId,
    '* Nom du site': address,
    '* Nom de la salle': room,
    '* Date de début (format: JJ/MM/AAAA)': date,
    '* Heure de début (heure locale format: HH:MM)': time,
    '* Surveillant(s)': examiner,
    'Observations (optionnel)': description,
    '* Nom de naissance': lastName,
    '* Prénom': firstName,
    '* Date de naissance (format: JJ/MM/AAAA)': birthdate,
    '* Sexe (M ou F)': sex,
    'Code INSEE de la commune de naissance': birthINSEECode,
    'Code postal de la commune de naissance': birthPostalCode,
    'Nom de la commune de naissance': birthCity,
    '* Pays de naissance': birthCountry,
    'E-mail du destinataire des résultats (formateur, enseignant…)': resultRecipientEmail,
    'E-mail de convocation': email,
    'Identifiant externe': externalId,
    'Temps majoré ? (exemple format: 33%)': extraTimePercentage,
    '* Tarification part Pix (Gratuite, Prépayée ou Payante)': billingMode,
    'Code de prépaiement (si Tarification part Pix Prépayée)': prepaymentCode,
    "Pix certif complementaire ('oui' ou laisser vide)": complementaryCertification,
  };
}

function _lineWithSessionAndNoCandidate({ sessionNumber, examiner = 'Paul' }) {
  return _line({
    address: `Site ${sessionNumber}`,
    room: `Salle ${sessionNumber}`,
    date: '12/05/2023',
    time: '01:00',
    examiner,
    description: '',
  });
}

function _lineWithCandidateAndBillingInformation({ prepaymentCode }) {
  return _line({
    address: `Site toto`,
    room: `Salle toto`,
    date: '12/05/2023',
    time: '01:00',
    lastName: 'Pennyworth',
    firstName: 'Alfred',
    birthdate: '02/03/1951',
    prepaymentCode,
  });
}

function _lineWithCandidateAndNoSession() {
  return _line({
    lastName: 'Pennyworth',
    firstName: 'Alfred',
    birthdate: '02/03/1951',
    sex: 'M',
    birthINSEECode: '75015',
    birthPostalCode: '',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'alfredOfficial@email.fr',
    email: '',
    externalId: '',
    extraTimePercentage: '',
    billingMode: 'Prépayée',
    prepaymentCode: '43',
  });
}

function _lineWithSessionAndCandidate({ sessionNumber, candidateNumber }) {
  return _line({
    address: `Site ${sessionNumber}`,
    room: `Salle ${sessionNumber}`,
    date: '12/05/2023',
    time: '01:00',
    examiner: 'Paul',
    description: '',
    lastName: `Candidat ${candidateNumber}`,
    firstName: `Candidat ${candidateNumber}`,
    birthdate: '01/03/1981',
    sex: 'M',
    birthINSEECode: '75015',
    birthPostalCode: '',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'robindahood@email.fr',
    email: '',
    externalId: '',
    extraTimePercentage: '',
    billingMode: 'Prépayée',
    prepaymentCode: '43',
  });
}

function _lineWithSessionIdAndCandidate({ sessionId, candidateNumber }) {
  return _line({
    sessionId,
    description: '',
    lastName: `Candidat ${candidateNumber}`,
    firstName: `Candidat ${candidateNumber}`,
    birthdate: '01/03/1981',
    sex: 'M',
    birthINSEECode: '75015',
    birthPostalCode: '',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'robindahood@email.fr',
    email: '',
    externalId: '',
    extraTimePercentage: '',
    billingMode: 'Prépayée',
    prepaymentCode: '43',
  });
}

function _lineWithSessionAndCandidateWithComplementaryCertification({
  sessionNumber,
  candidateNumber,
  complementaryCertification,
}) {
  return _line({
    address: `Site ${sessionNumber}`,
    room: `Salle ${sessionNumber}`,
    date: '12/05/2023',
    time: '01:00',
    examiner: 'Paul',
    description: '',
    lastName: `Candidat ${candidateNumber}`,
    firstName: `Candidat ${candidateNumber}`,
    birthdate: '01/03/1981',
    sex: 'M',
    birthINSEECode: '75015',
    birthPostalCode: '',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'robindahood@email.fr',
    email: '',
    externalId: '',
    extraTimePercentage: '',
    billingMode: 'Prépayée',
    prepaymentCode: '43',
    complementaryCertification,
  });
}

function _omitUniqueKey(result) {
  return result.map((session) => _.omit(session, 'uniqueKey'));
}
