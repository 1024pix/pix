import _ from 'lodash';

import { deserializeForSessionsImport } from '../../../../../../../src/certification/enrolment/infrastructure/serializers/csv/sessions-csv-serializer.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { emptySession } from '../../../../../../../src/certification/shared/infrastructure/utils/csv/sessions-import.js';
import { FileValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | Infrastructure | Serializers | CSV | sessions-csv-serializer', function () {
  describe('#deserializeForSessionsImport', function () {
    describe('when one or more headers are missing', function () {
      it('should throw an error', async function () {
        const parsedCsvData = [{ '* Nom du site': `Site 1` }];

        // when
        const error = await catchErr(deserializeForSessionsImport)({
          parsedCsvData,
          hasBillingMode: true,
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('CSV_DATA_REQUIRED');
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
            const error = await catchErr(deserializeForSessionsImport)({
              parsedCsvData,
              hasBillingMode: true,
            });

            // then
            expect(error).to.be.instanceOf(FileValidationError);
            expect(error.code).to.equal('CSV_DATA_REQUIRED');
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
            const result = await deserializeForSessionsImport({ parsedCsvData, hasBillingMode: false });

            // then
            expect(result).to.deep.equal([emptySession]);
          });
        });
      });
    });

    describe('when a header corresponding to a complementary certification subscription is present', function () {
      describe('when the certification center does not have necessary habilitations', function () {
        it('should throw a FileValidationError', async function () {
          // given
          const parsedCsvDataWithCleASubscription = [
            {
              'Numéro de session préexistante': '',
              '* Nom du site': 'Site CléA',
              '* Nom de la salle': 'Salle CléA',
              '* Date de début (format: JJ/MM/AAAA)': '01/01/4000',
              '* Heure de début (heure locale format: HH:MM)': '12:00',
              '* Surveillant(s)': 'Surveillant A',
              'Observations (optionnel)': '',
              '* Nom de naissance': 'Testeur',
              '* Prénom': 'Toto',
              '* Date de naissance (format: JJ/MM/AAAA)': '01/01/2000',
              '* Sexe (M ou F)': 'M',
              'Code INSEE de la commune de naissance': '',
              'Code postal de la commune de naissance': '75001',
              'Nom de la commune de naissance': 'PARIS',
              '* Pays de naissance': 'FRANCE',
              'E-mail du destinataire des résultats (formateur, enseignant…)': '',
              'E-mail de convocation': '',
              'Identifiant externe': '',
              'Temps majoré ? (exemple format: 33%)': '',
              '* Tarification part Pix (Gratuite, Prépayée ou Payante)': 'Gratuite',
              'Code de prépaiement (si Tarification part Pix Prépayée)': '',
              "CléA Numérique ('oui' ou laisser vide)": 'Oui',
            },
          ];
          const habilitationsWithoutCleA = [
            domainBuilder.certification.shared.buildComplementaryCertification({
              id: 53,
              label: 'Pix+ Droit',
              key: 'DROIT',
            }),
            domainBuilder.certification.shared.buildComplementaryCertification({
              id: 54,
              label: 'Pix+ Édu 1er degré',
              key: 'EDU_1ER_DEGRE',
            }),
            domainBuilder.certification.shared.buildComplementaryCertification({
              id: 55,
              label: 'Pix+ Édu 2nd degré',
              key: 'EDU_2ND_DEGRE',
            }),
          ];

          // when
          const error = await catchErr(deserializeForSessionsImport)({
            parsedCsvData: parsedCsvDataWithCleASubscription,
            hasBillingMode: true,
            certificationCenterHabilitations: habilitationsWithoutCleA,
          });

          // then
          expect(error).to.be.instanceOf(FileValidationError);
          expect(error.code).to.equal('CSV_HEADERS_NOT_VALID');
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
          const error = await catchErr(deserializeForSessionsImport)({
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
          const result = await deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              candidates: [],
              line: 2,
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              candidates: [],
              line: 2,
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              candidates: [],
              line: 2,
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });

        describe('when the are multiple different invigilators per session', function () {
          it('should return the session with an array of invigilators', function () {
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
                candidates: [],
                line: 2,
              },
            ];

            // when
            const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              candidates: [],
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
              candidates: [],
              line: 3,
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              candidates: [
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
                  subscriptionKeys: [],
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
                  subscriptionKeys: [],
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
              candidates: [
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
                  subscriptionKeys: [],
                  line: 3,
                },
              ],
              line: 3,
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

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
              candidates: [
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
                  subscriptionKeys: [],
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
                  subscriptionKeys: [],
                  line: 3,
                },
              ],
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true }).map((session) =>
            _.omit(session, 'uniqueKey'),
          );

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
              candidates: [
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
                  subscriptionKeys: [],
                  line: 3,
                },
              ],
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true }).map((session) =>
            _.omit(session, 'uniqueKey'),
          );

          // then
          expect(_omitUniqueKey(result)).to.deep.equal(expectedResult);
        });
      });
    });

    describe('when there is candidate information', function () {
      describe('when there is prepayment code information', function () {
        [
          { prepaymentCode: '', expectedParsedPrepaymentCode: null },
          { prepaymentCode: '1234', expectedParsedPrepaymentCode: '1234' },
        ].forEach(({ prepaymentCode, expectedParsedPrepaymentCode }) => {
          it(`should return ${expectedParsedPrepaymentCode} when prepaymenCode is ${prepaymentCode}`, function () {
            // given
            const csvLine = [_lineWithCandidateAndBillingInformation({ prepaymentCode })];

            // when
            const result = deserializeForSessionsImport({ parsedCsvData: csvLine, hasBillingMode: true }).map(
              (session) => _.omit(session, 'uniqueKey'),
            );

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
                candidates: [
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
                    subscriptionKeys: [],
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
          lineWithSessionAndCandidateWithComplementaryCertificationSubscription({
            sessionNumber: 1,
            candidateNumber: 1,
            shouldSubscribeToComplementaryCertification: 'oui',
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
            candidates: [
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
                subscriptionKeys: [ComplementaryCertificationKeys.CLEA],
                line: 2,
              },
            ],
          },
        ];

        const habilitations = [
          domainBuilder.certification.shared.buildComplementaryCertification({
            id: 52,
            label: 'CléA Numérique',
            key: 'CLEA',
          }),
        ];

        // when
        const result = deserializeForSessionsImport({
          parsedCsvData,
          hasBillingMode: true,
          certificationCenterHabilitations: habilitations,
        }).map((session) => _.omit(session, 'uniqueKey'));

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
            complementaryCertifications: [],
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
          const [result] = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true });

          // then
          expect(result.candidates).to.have.lengthOf(6);
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
              candidates: [],
            },
          ];

          // when
          const result = deserializeForSessionsImport({ parsedCsvData, hasBillingMode: true }).map((session) =>
            _.omit(session, 'uniqueKey'),
          );

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
      const [firstSession, secondSession] = deserializeForSessionsImport({
        parsedCsvData,
        hasBillingMode: true,
      });

      // then
      expect(firstSession.line).to.equal(2);
      expect(firstSession.candidates[0].line).to.equal(2);

      expect(secondSession.line).to.equal(3);
      expect(secondSession.candidates[0].line).to.equal(3);
      expect(secondSession.candidates[1].line).to.equal(4);
      expect(secondSession.candidates[2].line).to.equal(5);
    });

    // to prevent examiner missing error (details: https://1024pix.atlassian.net/wiki/spaces/DC/blog/edit-v2/4806377475)
    describe('when examiner is missing', function () {
      it('should throw an error', async function () {
        const parsedCsvData = [
          {
            'Numéro de session préexistante': '',
            '* Nom du site': 'bla',
            '* Nom de la salle': 'bla',
            '* Date de début (format: JJ/MM/AAAA)': '18/12/2024',
            '* Heure de début (heure locale format: HH:MM)': '09:00',
            '* Surveillant(s)': 'moi',
            'Observations (optionnel)': '',
            '* Nom de naissance': 'A',
            '* Prénom': 'A',
            '* Date de naissance (format: JJ/MM/AAAA)': '01/01/2000',
            '* Sexe (M ou F)': 'F',
            'Code INSEE de la commune de naissance': '75115',
            'Code postal de la commune de naissance': '',
            'Nom de la commune de naissance': '',
            '* Pays de naissance': 'FRANCE',
            'E-mail du destinataire des résultats (formateur, enseignant…)': '',
            'E-mail de convocation': '',
            'Identifiant externe': '',
            'Temps majoré ? (exemple format: 33%)': '',
            '* Tarification part Pix (Gratuite, Prépayée ou Payante)': 'Gratuite',
            'Code de prépaiement (si Tarification part Pix Prépayée)': '',
            "Pix certif complementaire ('oui' ou laisser vide)": '',
          },
          {
            'Numéro de session préexistante': '',
            '* Nom du site': 'bla',
            '* Nom de la salle': 'bla',
            '* Date de début (format: JJ/MM/AAAA)': '18/12/2024',
            '* Heure de début (heure locale format: HH:MM)': '09:00',
            '* Surveillant(s)': undefined,
            'Observations (optionnel)': '',
            '* Nom de naissance': 'A',
            '* Prénom': 'A',
            '* Date de naissance (format: JJ/MM/AAAA)': '01/01/2000',
            '* Sexe (M ou F)': 'F',
            'Code INSEE de la commune de naissance': '75115',
            'Code postal de la commune de naissance': '',
            'Nom de la commune de naissance': '',
            '* Pays de naissance': 'FRANCE',
            'E-mail du destinataire des résultats (formateur, enseignant…)': '',
            'E-mail de convocation': '',
            'Identifiant externe': '',
            'Temps majoré ? (exemple format: 33%)': '',
            '* Tarification part Pix (Gratuite, Prépayée ou Payante)': 'Gratuite',
            'Code de prépaiement (si Tarification part Pix Prépayée)': '',
            "Pix certif complementaire ('oui' ou laisser vide)": '',
          },
        ];

        const error = await catchErr(deserializeForSessionsImport)({
          parsedCsvData,
          hasBillingMode: true,
        });

        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('CSV_DATA_REQUIRED');
      });
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
  shouldSubscribeToComplementaryCertification = '',
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
    "CléA Numérique ('oui' ou laisser vide)": shouldSubscribeToComplementaryCertification,
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

function lineWithSessionAndCandidateWithComplementaryCertificationSubscription({
  sessionNumber,
  candidateNumber,
  shouldSubscribeToComplementaryCertification,
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
    shouldSubscribeToComplementaryCertification,
  });
}

function _omitUniqueKey(result) {
  return result.map((session) => _.omit(session, 'uniqueKey'));
}
