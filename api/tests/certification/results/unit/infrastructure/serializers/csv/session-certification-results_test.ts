import { expect } from 'chai';
import { I18n } from 'i18n';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../../../src/certification/results/domain/constants.ts';
import { CertificationResultForCsv } from '../../../../../../../src/certification/results/domain/read-models/CertificationResultForCsv.ts';
import { serialize } from '../../../../../../../src/certification/results/infrastructure/serializers/csv/session-certification-results.ts';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';

describe('Certification | Results | Unit | Infrastructure | Serializer | CSV | session-certification-results', function () {
  let i18n: I18n;
  beforeEach(function () {
    i18n = getI18n('fr') as I18n;
  });

  context('#serialize', function () {
    context('CORE', function () {
      const expectedCsvHeaders =
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';

      context('when certification is cancelled', function () {
        it('writes the appropriate certification in the csv', function () {
          // given
          const certificationResult = new CertificationResultForCsv({
            certificationId: 123,
            firstName: 'jean',
            lastName: 'coulignant',
            birthdate: '1986-07-14',
            birthplace: 'puit-en-velin',
            externalId: 'uuid',
            framework: Frameworks.CORE,
            status: CERTIFICATION_RESULT_STATUSES.CANCELLED,
            reachedMeshIndex: null,
            pixScore: null,
            competenceMarks: [],
            hasAcquiredClea: null,
            commentForOrganization: 'c super',
            commentByAutoJury: null,
            sessionId: 123654,
            certificationCenter: 'autre part',
            startedAt: new Date('2023-01-08'),
          });

          // when
          const csv = serialize([certificationResult], i18n);

          // then
          const expectedContent =
            '\uFEFF' +
            expectedCsvHeaders +
            '"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"Pix";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"c super";"123654";"autre part";"08/01/2023"';

          expect(csv).to.equal(expectedContent);
        });
      });

      context('when certification is rejected', function () {
        it('writes the appropriate certification in the csv', function () {
          // given
          const certificationResult = new CertificationResultForCsv({
            certificationId: 123,
            firstName: 'jean',
            lastName: 'coulignant',
            birthdate: '1986-07-14',
            birthplace: 'puit-en-velin',
            externalId: 'uuid',
            framework: Frameworks.CORE,
            status: CERTIFICATION_RESULT_STATUSES.REJECTED,
            reachedMeshIndex: null,
            pixScore: null,
            competenceMarks: [],
            hasAcquiredClea: null,
            commentForOrganization: 'c super',
            commentByAutoJury: null,
            sessionId: 123654,
            certificationCenter: 'autre part',
            startedAt: new Date('2023-01-08'),
          });

          // when
          const csv = serialize([certificationResult], i18n);

          // then
          const expectedContent =
            '\uFEFF' +
            expectedCsvHeaders +
            '"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"Pix";"Non obtenue";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"c super";"123654";"autre part";"08/01/2023"';

          expect(csv).to.equal(expectedContent);
        });
      });

      context('when certification is validated', function () {
        [
          { pixScore: 1, reachedMeshIndex: 0, expectedMeshLabel: '-' },
          { pixScore: 5, reachedMeshIndex: 1, expectedMeshLabel: 'Novice 1' },
          { pixScore: 10, reachedMeshIndex: 2, expectedMeshLabel: 'Novice 2' },
          { pixScore: 15, reachedMeshIndex: 3, expectedMeshLabel: 'Indépendant 1' },
          { pixScore: 20, reachedMeshIndex: 4, expectedMeshLabel: 'Indépendant 2' },
          { pixScore: 25, reachedMeshIndex: 5, expectedMeshLabel: 'Avancé 1' },
          { pixScore: 30, reachedMeshIndex: 6, expectedMeshLabel: 'Avancé 2' },
          { pixScore: 35, reachedMeshIndex: 7, expectedMeshLabel: 'Expert 1' },
          { pixScore: 40, reachedMeshIndex: 8, expectedMeshLabel: 'Expert 2' },
        ].forEach(({ pixScore, reachedMeshIndex, expectedMeshLabel }) => {
          it('writes the appropriate certification in the csv', function () {
            // given
            const certificationResult = new CertificationResultForCsv({
              certificationId: 123,
              firstName: 'jean',
              lastName: 'coulignant',
              birthdate: '1986-07-14',
              birthplace: 'puit-en-velin',
              externalId: 'uuid',
              framework: Frameworks.CORE,
              status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
              reachedMeshIndex,
              pixScore,
              competenceMarks: [
                {
                  competenceCode: '1.1',
                  level: 1,
                },
                {
                  competenceCode: '1.2',
                  level: 2,
                },
                {
                  competenceCode: '1.3',
                  level: 3,
                },
                {
                  competenceCode: '2.1',
                  level: 4,
                },
                {
                  competenceCode: '2.2',
                  level: 7,
                },
                {
                  competenceCode: '2.3',
                  level: 3,
                },
                {
                  competenceCode: '2.4',
                  level: 5,
                },
                {
                  competenceCode: '3.1',
                  level: 2,
                },
                {
                  competenceCode: '3.2',
                  level: 4,
                },
                {
                  competenceCode: '3.3',
                  level: 5,
                },
                {
                  competenceCode: '3.4',
                  level: 1,
                },
                {
                  competenceCode: '4.1',
                  level: 6,
                },
                {
                  competenceCode: '4.2',
                  level: 2,
                },
                {
                  competenceCode: '4.3',
                  level: 1,
                },
                {
                  competenceCode: '5.1',
                  level: 4,
                },
                {
                  competenceCode: '5.2',
                  level: 0,
                },
              ],
              hasAcquiredClea: null,
              commentForOrganization: 'c super',
              commentByAutoJury: null,
              sessionId: 123654,
              certificationCenter: 'autre part',
              startedAt: new Date('2023-01-08'),
            });

            // when
            const csv = serialize([certificationResult], i18n);

            // then
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              `"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"Pix";"Validée";"${expectedMeshLabel}";"${pixScore}";"1";"2";"3";"4";"7";"3";"5";"2";"4";"5";"1";"6";"2";"1";"4";"0";"c super";"123654";"autre part";"08/01/2023"`;

            expect(csv).to.equal(expectedContent);
          });
        });
      });
    });

    context('CléA', function () {
      const expectedCsvHeaders =
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Certification CléA";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';

      context('when certification is cancelled', function () {
        it('writes the appropriate certification in the csv', function () {
          // given
          const certificationResult = new CertificationResultForCsv({
            certificationId: 123,
            firstName: 'jean',
            lastName: 'coulignant',
            birthdate: '1986-07-14',
            birthplace: 'puit-en-velin',
            externalId: 'uuid',
            framework: Frameworks.CLEA,
            status: CERTIFICATION_RESULT_STATUSES.CANCELLED,
            reachedMeshIndex: null,
            pixScore: null,
            competenceMarks: [],
            hasAcquiredClea: false,
            commentForOrganization: 'c super',
            commentByAutoJury: null,
            sessionId: 123654,
            certificationCenter: 'autre part',
            startedAt: new Date('2023-01-08'),
          });

          // when
          const csv = serialize([certificationResult], i18n);

          // then
          const expectedContent =
            '\uFEFF' +
            expectedCsvHeaders +
            '"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"CléA Numérique by Pix";"Annulée";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"c super";"123654";"autre part";"08/01/2023"';

          expect(csv).to.equal(expectedContent);
        });
      });

      context('when certification, core part, is rejected', function () {
        it('writes the appropriate certification in the csv', function () {
          // given
          const certificationResult = new CertificationResultForCsv({
            certificationId: 123,
            firstName: 'jean',
            lastName: 'coulignant',
            birthdate: '1986-07-14',
            birthplace: 'puit-en-velin',
            externalId: 'uuid',
            framework: Frameworks.CLEA,
            status: CERTIFICATION_RESULT_STATUSES.REJECTED,
            reachedMeshIndex: null,
            pixScore: null,
            competenceMarks: [],
            hasAcquiredClea: false,
            commentForOrganization: 'c super',
            commentByAutoJury: null,
            sessionId: 123654,
            certificationCenter: 'autre part',
            startedAt: new Date('2023-01-08'),
          });

          // when
          const csv = serialize([certificationResult], i18n);

          // then
          const expectedContent =
            '\uFEFF' +
            expectedCsvHeaders +
            '"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"CléA Numérique by Pix";"Non obtenue";"Non obtenue";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"c super";"123654";"autre part";"08/01/2023"';

          expect(csv).to.equal(expectedContent);
        });
      });

      context('when certification, core part, is validated', function () {
        [
          { pixScore: 1, reachedMeshIndex: 0, expectedMeshLabel: '-' },
          { pixScore: 5, reachedMeshIndex: 1, expectedMeshLabel: 'Novice 1' },
          { pixScore: 10, reachedMeshIndex: 2, expectedMeshLabel: 'Novice 2' },
          { pixScore: 15, reachedMeshIndex: 3, expectedMeshLabel: 'Indépendant 1' },
          { pixScore: 20, reachedMeshIndex: 4, expectedMeshLabel: 'Indépendant 2' },
          { pixScore: 25, reachedMeshIndex: 5, expectedMeshLabel: 'Avancé 1' },
          { pixScore: 30, reachedMeshIndex: 6, expectedMeshLabel: 'Avancé 2' },
          { pixScore: 35, reachedMeshIndex: 7, expectedMeshLabel: 'Expert 1' },
          { pixScore: 40, reachedMeshIndex: 8, expectedMeshLabel: 'Expert 2' },
        ].forEach(({ pixScore, reachedMeshIndex, expectedMeshLabel }) => {
          [
            { hasAcquiredClea: true, expectedCleaLabel: 'Validée' },
            { hasAcquiredClea: false, expectedCleaLabel: 'Non obtenue' },
          ].forEach(({ hasAcquiredClea, expectedCleaLabel }) => {
            it('writes the appropriate certification in the csv', function () {
              // given
              const certificationResult = new CertificationResultForCsv({
                certificationId: 123,
                firstName: 'jean',
                lastName: 'coulignant',
                birthdate: '1986-07-14',
                birthplace: 'puit-en-velin',
                externalId: 'uuid',
                framework: Frameworks.CLEA,
                status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
                reachedMeshIndex,
                pixScore,
                competenceMarks: [
                  {
                    competenceCode: '1.1',
                    level: 1,
                  },
                  {
                    competenceCode: '1.2',
                    level: 2,
                  },
                  {
                    competenceCode: '1.3',
                    level: 3,
                  },
                  {
                    competenceCode: '2.1',
                    level: 4,
                  },
                  {
                    competenceCode: '2.2',
                    level: 7,
                  },
                  {
                    competenceCode: '2.3',
                    level: 3,
                  },
                  {
                    competenceCode: '2.4',
                    level: 5,
                  },
                  {
                    competenceCode: '3.1',
                    level: 2,
                  },
                  {
                    competenceCode: '3.2',
                    level: 4,
                  },
                  {
                    competenceCode: '3.3',
                    level: 5,
                  },
                  {
                    competenceCode: '3.4',
                    level: 1,
                  },
                  {
                    competenceCode: '4.1',
                    level: 6,
                  },
                  {
                    competenceCode: '4.2',
                    level: 2,
                  },
                  {
                    competenceCode: '4.3',
                    level: 1,
                  },
                  {
                    competenceCode: '5.1',
                    level: 4,
                  },
                  {
                    competenceCode: '5.2',
                    level: 0,
                  },
                ],
                hasAcquiredClea,
                commentForOrganization: 'c super',
                commentByAutoJury: null,
                sessionId: 123654,
                certificationCenter: 'autre part',
                startedAt: new Date('2023-01-08'),
              });

              // when
              const csv = serialize([certificationResult], i18n);

              // then
              const expectedContent =
                '\uFEFF' +
                expectedCsvHeaders +
                `"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"CléA Numérique by Pix";"Validée";"${expectedCleaLabel}";"${expectedMeshLabel}";"${pixScore}";"1";"2";"3";"4";"7";"3";"5";"2";"4";"5";"1";"6";"2";"1";"4";"0";"c super";"123654";"autre part";"08/01/2023"`;

              expect(csv).to.equal(expectedContent);
            });
          });
        });
      });
    });

    context('PIX+', function () {
      const expectedCsvHeaders =
        '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';

      context('PIX+ CANCELLED', function () {
        [
          { framework: Frameworks.EDU_CPE, expectedCertificationLabel: 'Pix+ Édu CPE' },
          { framework: Frameworks.EDU_1ER_DEGRE, expectedCertificationLabel: 'Pix+ Édu 1er degré' },
          { framework: Frameworks.EDU_2ND_DEGRE, expectedCertificationLabel: 'Pix+ Édu 2nd degré' },
          { framework: Frameworks.PRO_SANTE, expectedCertificationLabel: 'Pix+ Pro Santé' },
          { framework: Frameworks.DROIT, expectedCertificationLabel: 'Pix+ Droit' },
        ].forEach(({ framework, expectedCertificationLabel }) => {
          it(`writes the appropriate certification in the csv for ${framework}`, function () {
            // given
            const certificationResult = new CertificationResultForCsv({
              certificationId: 123,
              firstName: 'jean',
              lastName: 'coulignant',
              birthdate: '1986-07-14',
              birthplace: 'puit-en-velin',
              externalId: 'uuid',
              framework,
              status: CERTIFICATION_RESULT_STATUSES.CANCELLED,
              reachedMeshIndex: null,
              pixScore: null,
              competenceMarks: [],
              hasAcquiredClea: null,
              commentForOrganization: 'c super',
              commentByAutoJury: null,
              sessionId: 123654,
              certificationCenter: 'autre part',
              startedAt: new Date('2023-01-08'),
            });

            // when
            const csv = serialize([certificationResult], i18n);

            // then
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              `"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"${expectedCertificationLabel}";"Annulée";"-";"c super";"123654";"autre part";"08/01/2023"`;

            expect(csv).to.equal(expectedContent);
          });
        });
      });

      context('PIX+ REJECTED', function () {
        [
          {
            framework: Frameworks.EDU_CPE,
            expectedCertificationLabel: 'Pix+ Édu CPE',
            expectedStatus: 'Non admissible',
          },
          {
            framework: Frameworks.EDU_1ER_DEGRE,
            expectedCertificationLabel: 'Pix+ Édu 1er degré',
            expectedStatus: 'Non admissible',
          },
          {
            framework: Frameworks.EDU_2ND_DEGRE,
            expectedCertificationLabel: 'Pix+ Édu 2nd degré',
            expectedStatus: 'Non admissible',
          },
          { framework: Frameworks.PRO_SANTE, expectedCertificationLabel: 'Pix+ Pro Santé', expectedStatus: '-' },
          { framework: Frameworks.DROIT, expectedCertificationLabel: 'Pix+ Droit', expectedStatus: '-' },
        ].forEach(({ framework, expectedCertificationLabel, expectedStatus }) => {
          it(`writes the appropriate certification in the csv for ${framework}`, function () {
            // given
            const certificationResult = new CertificationResultForCsv({
              certificationId: 123,
              firstName: 'jean',
              lastName: 'coulignant',
              birthdate: '1986-07-14',
              birthplace: 'puit-en-velin',
              externalId: 'uuid',
              framework,
              status: CERTIFICATION_RESULT_STATUSES.REJECTED,
              reachedMeshIndex: null,
              pixScore: null,
              competenceMarks: [],
              hasAcquiredClea: null,
              commentForOrganization: 'c super',
              commentByAutoJury: null,
              sessionId: 123654,
              certificationCenter: 'autre part',
              startedAt: new Date('2023-01-08'),
            });

            // when
            const csv = serialize([certificationResult], i18n);

            // then
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              `"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"${expectedCertificationLabel}";"Non obtenue";"${expectedStatus}";"c super";"123654";"autre part";"08/01/2023"`;

            expect(csv).to.equal(expectedContent);
          });
        });
      });

      context('PIX+ VALIDATED', function () {
        [
          {
            framework: Frameworks.EDU_CPE,
            expectedCertificationLabel: 'Pix+ Édu CPE',
            reachedMeshIndex: 0,
            expectedStatus: 'Admissible',
          },
          {
            framework: Frameworks.EDU_1ER_DEGRE,
            expectedCertificationLabel: 'Pix+ Édu 1er degré',
            reachedMeshIndex: 0,
            expectedStatus: 'Admissible',
          },
          {
            framework: Frameworks.EDU_2ND_DEGRE,
            expectedCertificationLabel: 'Pix+ Édu 2nd degré',
            reachedMeshIndex: 0,
            expectedStatus: 'Admissible',
          },
          {
            framework: Frameworks.PRO_SANTE,
            expectedCertificationLabel: 'Pix+ Pro Santé',
            reachedMeshIndex: 0,
            expectedStatus: 'Indépendant',
          },
          {
            framework: Frameworks.PRO_SANTE,
            expectedCertificationLabel: 'Pix+ Pro Santé',
            reachedMeshIndex: 1,
            expectedStatus: 'Confirmé',
          },
          {
            framework: Frameworks.PRO_SANTE,
            expectedCertificationLabel: 'Pix+ Pro Santé',
            reachedMeshIndex: 2,
            expectedStatus: 'Avancé',
          },
          {
            framework: Frameworks.PRO_SANTE,
            expectedCertificationLabel: 'Pix+ Pro Santé',
            reachedMeshIndex: 3,
            expectedStatus: 'Expert',
          },
          {
            framework: Frameworks.DROIT,
            expectedCertificationLabel: 'Pix+ Droit',
            reachedMeshIndex: 0,
            expectedStatus: 'Indépendant',
          },
          {
            framework: Frameworks.DROIT,
            expectedCertificationLabel: 'Pix+ Droit',
            reachedMeshIndex: 1,
            expectedStatus: 'Confirmé',
          },
          {
            framework: Frameworks.DROIT,
            expectedCertificationLabel: 'Pix+ Droit',
            reachedMeshIndex: 2,
            expectedStatus: 'Avancé',
          },
          {
            framework: Frameworks.DROIT,
            expectedCertificationLabel: 'Pix+ Droit',
            reachedMeshIndex: 3,
            expectedStatus: 'Expert',
          },
        ].forEach(({ framework, expectedCertificationLabel, reachedMeshIndex, expectedStatus }) => {
          it(`writes the appropriate certification in the csv for ${framework}`, function () {
            // given
            const certificationResult = new CertificationResultForCsv({
              certificationId: 123,
              firstName: 'jean',
              lastName: 'coulignant',
              birthdate: '1986-07-14',
              birthplace: 'puit-en-velin',
              externalId: 'uuid',
              framework,
              status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
              reachedMeshIndex,
              pixScore: null,
              competenceMarks: [],
              hasAcquiredClea: null,
              commentForOrganization: 'c super',
              commentByAutoJury: null,
              sessionId: 123654,
              certificationCenter: 'autre part',
              startedAt: new Date('2023-01-08'),
            });

            // when
            const csv = serialize([certificationResult], i18n);

            // then
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              `"123";"jean";"coulignant";"14/07/1986";"puit-en-velin";"uuid";"${expectedCertificationLabel}";"Validée";"${expectedStatus}";"c super";"123654";"autre part";"08/01/2023"`;

            expect(csv).to.equal(expectedContent);
          });
        });
      });
    });

    context('session with multiple results', function () {
      it('renders all lines in csv with correct headers', function () {
        const expectedCsvHeaders =
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Certification CléA";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';
        const coreCertificationResult = new CertificationResultForCsv({
          certificationId: 123,
          firstName: 'jean-CORE',
          lastName: 'coulignant-CORE',
          birthdate: '1986-07-14',
          birthplace: 'puit-en-velin-CORE',
          externalId: 'uuid-CORE',
          framework: Frameworks.CORE,
          status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
          reachedMeshIndex: 1,
          pixScore: 43,
          competenceMarks: [
            {
              competenceCode: '1.1',
              level: 1,
            },
            {
              competenceCode: '1.2',
              level: 2,
            },
            {
              competenceCode: '1.3',
              level: 3,
            },
            {
              competenceCode: '2.1',
              level: 4,
            },
            {
              competenceCode: '2.2',
              level: 7,
            },
            {
              competenceCode: '2.3',
              level: 3,
            },
            {
              competenceCode: '2.4',
              level: 5,
            },
            {
              competenceCode: '3.1',
              level: 2,
            },
            {
              competenceCode: '3.2',
              level: 4,
            },
            {
              competenceCode: '3.3',
              level: 5,
            },
            {
              competenceCode: '3.4',
              level: 1,
            },
            {
              competenceCode: '4.1',
              level: 6,
            },
            {
              competenceCode: '4.2',
              level: 2,
            },
            {
              competenceCode: '4.3',
              level: 1,
            },
            {
              competenceCode: '5.1',
              level: 4,
            },
            {
              competenceCode: '5.2',
              level: 0,
            },
          ],
          hasAcquiredClea: null,
          commentForOrganization: 'c super-CORE',
          commentByAutoJury: null,
          sessionId: 1,
          certificationCenter: 'autre part-CORE',
          startedAt: new Date('2023-01-08'),
        });
        const cleaCertificationResult = new CertificationResultForCsv({
          certificationId: 223,
          firstName: 'jean-CLEA',
          lastName: 'coulignant-CLEA',
          birthdate: '1986-07-14',
          birthplace: 'puit-en-velin-CLEA',
          externalId: 'uuid-CLEA',
          framework: Frameworks.CLEA,
          status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
          reachedMeshIndex: 3,
          pixScore: 60,
          competenceMarks: [
            {
              competenceCode: '1.1',
              level: 1,
            },
            {
              competenceCode: '1.2',
              level: 2,
            },
            {
              competenceCode: '1.3',
              level: 3,
            },
            {
              competenceCode: '2.1',
              level: 4,
            },
            {
              competenceCode: '2.2',
              level: 7,
            },
            {
              competenceCode: '2.3',
              level: 3,
            },
            {
              competenceCode: '2.4',
              level: 5,
            },
            {
              competenceCode: '3.1',
              level: 2,
            },
            {
              competenceCode: '3.2',
              level: 4,
            },
            {
              competenceCode: '3.3',
              level: 5,
            },
            {
              competenceCode: '3.4',
              level: 1,
            },
            {
              competenceCode: '4.1',
              level: 6,
            },
            {
              competenceCode: '4.2',
              level: 2,
            },
            {
              competenceCode: '4.3',
              level: 1,
            },
            {
              competenceCode: '5.1',
              level: 4,
            },
            {
              competenceCode: '5.2',
              level: 0,
            },
          ],
          hasAcquiredClea: true,
          commentForOrganization: 'c super-CLEA',
          commentByAutoJury: null,
          sessionId: 1,
          certificationCenter: 'autre part-CLEA',
          startedAt: new Date('2023-01-08'),
        });
        const eduCertificationResult = new CertificationResultForCsv({
          certificationId: 333,
          firstName: 'jean-EDU',
          lastName: 'coulignant-EDU',
          birthdate: '1986-07-14',
          birthplace: 'puit-en-velin-EDU',
          externalId: 'uuid-EDU',
          framework: Frameworks.EDU_2ND_DEGRE,
          status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
          reachedMeshIndex: 0,
          pixScore: null,
          competenceMarks: [],
          hasAcquiredClea: null,
          commentForOrganization: 'c super-EDU',
          commentByAutoJury: null,
          sessionId: 1,
          certificationCenter: 'autre part-EDU',
          startedAt: new Date('2023-01-08'),
        });

        const csv = serialize([coreCertificationResult, cleaCertificationResult, eduCertificationResult], i18n);

        const expectedContent =
          '\uFEFF' +
          expectedCsvHeaders +
          `"123";"jean-CORE";"coulignant-CORE";"14/07/1986";"puit-en-velin-CORE";"uuid-CORE";"Pix";"Validée";"Non passée";"Novice 1";"43";"1";"2";"3";"4";"7";"3";"5";"2";"4";"5";"1";"6";"2";"1";"4";"0";"c super-CORE";"1";"autre part-CORE";"08/01/2023"\n` +
          `"223";"jean-CLEA";"coulignant-CLEA";"14/07/1986";"puit-en-velin-CLEA";"uuid-CLEA";"CléA Numérique by Pix";"Validée";"Validée";"Indépendant 1";"60";"1";"2";"3";"4";"7";"3";"5";"2";"4";"5";"1";"6";"2";"1";"4";"0";"c super-CLEA";"1";"autre part-CLEA";"08/01/2023"\n` +
          `"333";"jean-EDU";"coulignant-EDU";"14/07/1986";"puit-en-velin-EDU";"uuid-EDU";"Pix+ Édu 2nd degré";"Validée";"Non passée";"Admissible";;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"c super-EDU";"1";"autre part-EDU";"08/01/2023"`;
        expect(csv).to.equal(expectedContent);
      });
    });

    context('comment for organization', function () {
      it('renders the appropriate comment', function () {
        const eduCertificationResult1 = new CertificationResultForCsv({
          certificationId: 333,
          firstName: 'jean-EDU1',
          lastName: 'coulignant-EDU1',
          birthdate: '1986-07-14',
          birthplace: 'puit-en-velin-EDU1',
          externalId: 'uuid-EDU',
          framework: Frameworks.EDU_2ND_DEGRE,
          status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
          reachedMeshIndex: 0,
          pixScore: null,
          competenceMarks: [],
          hasAcquiredClea: null,
          commentForOrganization: 'c super-EDU1',
          commentByAutoJury: null,
          sessionId: 1,
          certificationCenter: 'autre part-EDU',
          startedAt: new Date('2023-01-08'),
        });
        const eduCertificationResult2 = new CertificationResultForCsv({
          certificationId: 444,
          firstName: 'jean-EDU2',
          lastName: 'coulignant-EDU2',
          birthdate: '1986-07-14',
          birthplace: 'puit-en-velin-EDU2',
          externalId: 'uuid-EDU',
          framework: Frameworks.EDU_2ND_DEGRE,
          status: CERTIFICATION_RESULT_STATUSES.REJECTED,
          reachedMeshIndex: 0,
          pixScore: null,
          competenceMarks: [],
          hasAcquiredClea: null,
          commentForOrganization: 'c super-EDU2',
          commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
          sessionId: 1,
          certificationCenter: 'autre part-EDU',
          startedAt: new Date('2023-01-08'),
        });
        const eduCertificationResult3 = new CertificationResultForCsv({
          certificationId: 555,
          firstName: 'jean-EDU3',
          lastName: 'coulignant-EDU3',
          birthdate: '1986-07-14',
          birthplace: 'puit-en-velin-EDU3',
          externalId: 'uuid-EDU',
          framework: Frameworks.EDU_2ND_DEGRE,
          status: CERTIFICATION_RESULT_STATUSES.VALIDATED,
          reachedMeshIndex: 0,
          pixScore: null,
          competenceMarks: [],
          hasAcquiredClea: null,
          commentForOrganization: null,
          commentByAutoJury: null,
          sessionId: 1,
          certificationCenter: 'autre part-EDU',
          startedAt: new Date('2023-01-08'),
        });

        const csv = serialize([eduCertificationResult1, eduCertificationResult2, eduCertificationResult3], i18n);

        const expectedCsvHeaders =
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';
        const expectedContent =
          '\uFEFF' +
          expectedCsvHeaders +
          `"333";"jean-EDU1";"coulignant-EDU1";"14/07/1986";"puit-en-velin-EDU1";"uuid-EDU";"Pix+ Édu 2nd degré";"Validée";"Admissible";"c super-EDU1";"1";"autre part-EDU";"08/01/2023"\n` +
          `"444";"jean-EDU2";"coulignant-EDU2";"14/07/1986";"puit-en-velin-EDU2";"uuid-EDU";"Pix+ Édu 2nd degré";"Non obtenue";"Non admissible";"Le nombre de questions répondues par le candidat pendant son test de certification est insuffisant et ne nous permet pas de lui délivrer une certification.";"1";"autre part-EDU";"08/01/2023"\n` +
          `"555";"jean-EDU3";"coulignant-EDU3";"14/07/1986";"puit-en-velin-EDU3";"uuid-EDU";"Pix+ Édu 2nd degré";"Validée";"Admissible";;"1";"autre part-EDU";"08/01/2023"`;
        expect(csv).to.equal(expectedContent);
      });
    });
  });
});
