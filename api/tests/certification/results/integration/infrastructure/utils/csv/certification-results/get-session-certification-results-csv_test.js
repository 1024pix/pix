import sinon from 'sinon';

import { SessionForResultsSharing } from '../../../../../../../../src/certification/results/domain/read-models/SessionForResultsSharing.js';
import { getSessionCertificationResultsCsv } from '../../../../../../../../src/certification/results/infrastructure/utils/csv/certification-results/get-session-certification-results-csv.js';
import { AlgorithmEngineVersion } from '../../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { getI18n } from '../../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../../tooling/domain-builder/domain-builder.js';

const i18n = getI18n();
const translate = i18n.__;

describe('Certification | Results | Integration | Infrastructure | Utils | certification-results | get-session-certification-results-csv', function () {
  let sessionForResultsSharingRepository;

  beforeEach(function () {
    sessionForResultsSharingRepository = { get: sinon.stub() };
  });

  context('#getSessionCertificationResultsCsv', function () {
    context('v2', function () {
      context('when no certification has passed complementary certifications', function () {
        it('should return correct csvContent without complementary certification informations', async function () {
          // given
          const sessionData = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 777,
            certificationCenter: 'CentreCertif',
          });
          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '1.1', level: 0 }),
            domainBuilder.buildCompetenceMark({ competence_code: '1.2', level: 1 }),
            domainBuilder.buildCompetenceMark({ competence_code: '1.3', level: 5 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 0 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];

          const certifResult = domainBuilder.buildCertificationResult.validated({
            id: 123,
            lastName: 'Oxford',
            firstName: 'Lili',
            birthdate: '1990-01-04',
            birthplace: 'Torreilles',
            externalId: 'LOLORD',
            createdAt: new Date('2020-01-01'),
            pixScore: 55,
            version: AlgorithmEngineVersion.V2,
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              fallbackComment: 'RAS',
            }),
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [],
          });

          const certificationResults = [certifResult];

          // when
          sessionForResultsSharingRepository.get.withArgs(sessionData.id).resolves(
            new SessionForResultsSharing({
              id: sessionData.id,
              date: sessionData.date,
              time: sessionData.time,
              certificationCenter: sessionData.certificationCenter,
            }),
          );
          const result = await getSessionCertificationResultsCsv({
            sessionId: sessionData.id,
            certificationResults,
            i18n,
            sessionForResultsSharingRepository,
          });

          // then
          const expectedFilename = '20210101_1430_resultats_session_777.csv';
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
            '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Pix";"Validée";"-";55;0;1;5;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";0;0;"RAS";777;"CentreCertif";"01/01/2020"';
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });

        context('when certification has been rejected', function () {
          context('when the reason is insufficient correct answers', function () {
            it('should return correct csvContent with auto jury comment for organization', async function () {
              // given
              const sessionData = domainBuilder.certification.sessionManagement.buildSessionManagement({
                id: 777,
                certificationCenter: 'CentreCertif',
              });

              const competencesWithMark = [
                domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
                domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
              ];

              const certificationResult = domainBuilder.buildCertificationResult.rejected({
                id: 456,
                lastName: 'Cambridge',
                firstName: 'Tom',
                birthdate: '1993-05-21',
                birthplace: 'TheMoon',
                externalId: 'TOTODGE',
                createdAt: new Date('2020-02-02'),
                version: AlgorithmEngineVersion.V2,
                pixScore: 66,
                commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
                }),
                competencesWithMark: competencesWithMark,
                complementaryCertificationCourseResults: [],
              });
              const certificationResults = [certificationResult];

              // when
              sessionForResultsSharingRepository.get.withArgs(sessionData.id).resolves(
                new SessionForResultsSharing({
                  id: sessionData.id,
                  date: sessionData.date,
                  time: sessionData.time,
                  certificationCenter: sessionData.certificationCenter,
                }),
              );
              const result = await getSessionCertificationResultsCsv({
                sessionId: sessionData.id,
                certificationResults,
                i18n,
                sessionForResultsSharingRepository,
              });

              // then
              const expectedFilename = '20210101_1430_resultats_session_777.csv';
              const expectedContent =
                '\uFEFF' +
                '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
                `456;"Tom";"Cambridge";"21/05/1993";"TheMoon";"TOTODGE";"Pix";"Non obtenue";"-";0;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"${translate('jury.comment.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS.organization')}";777;"CentreCertif";"02/02/2020"`;
              expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
            });
          });
        });

        context('when the reason is not enough answers', function () {
          it('should return correct csvContent with auto jury comment for organization', async function () {
            // given
            const sessionData = domainBuilder.certification.sessionManagement.buildSessionManagement({
              id: 777,
              certificationCenter: 'CentreCertif',
            });

            const competencesWithMark = [
              domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
              domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
            ];

            const automaticallyRejectedCertificationResult = domainBuilder.buildCertificationResult.rejected({
              id: 456,
              lastName: 'Cambridge',
              firstName: 'Tom',
              birthdate: '1993-05-21',
              birthplace: 'TheMoon',
              externalId: 'TOTODGE',
              createdAt: new Date('2020-02-02'),
              pixScore: 66,
              version: AlgorithmEngineVersion.V2,
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
              competencesWithMark: competencesWithMark,
              complementaryCertificationCourseResults: [],
            });
            const certificationResults = [automaticallyRejectedCertificationResult];

            // when
            sessionForResultsSharingRepository.get.withArgs(sessionData.id).resolves(
              new SessionForResultsSharing({
                id: sessionData.id,
                date: sessionData.date,
                time: sessionData.time,
                certificationCenter: sessionData.certificationCenter,
              }),
            );
            const result = await getSessionCertificationResultsCsv({
              sessionId: sessionData.id,
              certificationResults,
              i18n,
              sessionForResultsSharingRepository,
            });

            // then
            const expectedFilename = '20210101_1430_resultats_session_777.csv';
            const expectedContent =
              '\uFEFF' +
              '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
              `456;"Tom";"Cambridge";"21/05/1993";"TheMoon";"TOTODGE";"Pix";"Non obtenue";"-";0;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"${translate('jury.comment.REJECTED_DUE_TO_LACK_OF_ANSWERS.organization')}";777;"CentreCertif";"02/02/2020"`;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });
      });

      context('when certification is cancelled', function () {
        it('should return correct csvContent with cancelled status and dashes as Pix scores', async function () {
          // given
          const sessionData = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 777,
            certificationCenter: 'CentreCertif',
          });
          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];
          const certifResult = domainBuilder.buildCertificationResult.cancelled({
            id: 123,
            lastName: 'Oxford',
            firstName: 'Lili',
            birthdate: '1990-01-04',
            birthplace: 'Torreilles',
            externalId: 'LOLORD',
            createdAt: new Date('2020-01-01'),
            pixScore: 55,
            version: AlgorithmEngineVersion.V2,
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              fallbackComment: 'RAS',
            }),
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [],
          });

          const certificationResults = [certifResult];

          // when
          sessionForResultsSharingRepository.get.withArgs(sessionData.id).resolves(
            new SessionForResultsSharing({
              id: sessionData.id,
              date: sessionData.date,
              time: sessionData.time,
              certificationCenter: sessionData.certificationCenter,
            }),
          );
          const result = await getSessionCertificationResultsCsv({
            sessionId: sessionData.id,
            certificationResults,
            i18n,
            sessionForResultsSharingRepository,
          });

          // then
          const expectedFilename = '20210101_1430_resultats_session_777.csv';
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
            '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Pix";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"RAS";777;"CentreCertif";"01/01/2020"';
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });
      });

      context('when at least one certification course is in error', function () {
        it('should return correct csvContent with error status and dashes as Pix scores', async function () {
          // given
          const sessionData = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 777,
            certificationCenter: 'CentreCertif',
          });
          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];
          const certifResult = domainBuilder.buildCertificationResult.error({
            id: 123,
            lastName: 'Oxford',
            firstName: 'Lili',
            birthdate: '1990-01-04',
            birthplace: 'Torreilles',
            externalId: 'LOLORD',
            createdAt: new Date('2020-01-01'),
            pixScore: 55,
            version: AlgorithmEngineVersion.V2,
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              fallbackComment: 'RAS',
            }),
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [],
          });

          const certificationResults = [certifResult];

          // when
          sessionForResultsSharingRepository.get.withArgs(sessionData.id).resolves(
            new SessionForResultsSharing({
              id: sessionData.id,
              date: sessionData.date,
              time: sessionData.time,
              certificationCenter: sessionData.certificationCenter,
            }),
          );
          const result = await getSessionCertificationResultsCsv({
            sessionId: sessionData.id,
            certificationResults,
            i18n,
            sessionForResultsSharingRepository,
          });

          // then
          const expectedFilename = '20210101_1430_resultats_session_777.csv';
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
            '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Pix";"En erreur";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"RAS";777;"CentreCertif";"01/01/2020"';
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });
      });

      context('when there are several complementary certifications', function () {
        it('should return correct csvContent with complementary informations', async function () {
          // given
          const sessionData = domainBuilder.certification.sessionManagement.buildSessionManagement({
            id: 777,
            certificationCenter: 'CentreCertif',
          });
          const competencesWithMark = [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ];
          const certifResult = domainBuilder.buildCertificationResult.validated({
            id: 123,
            lastName: 'Oxford',
            firstName: 'Lili',
            birthdate: '1990-01-04',
            birthplace: 'Torreilles',
            externalId: 'LOLORD',
            createdAt: new Date('2020-01-01'),
            pixScore: 55,
            version: AlgorithmEngineVersion.V2,
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              fallbackComment: 'RAS',
            }),
            competencesWithMark: competencesWithMark,
            complementaryCertificationCourseResults: [
              domainBuilder.buildComplementaryCertificationCourseResult({
                id: 1,
                acquired: false,
                label: 'Pix+ Bandjo Maître',
              }),
              domainBuilder.buildComplementaryCertificationCourseResult({
                id: 2,
                acquired: true,
                label: 'Pix+ Bandjo Expert',
              }),
            ],
          });

          const certificationResults = [certifResult];

          // when
          sessionForResultsSharingRepository.get.withArgs(sessionData.id).resolves(
            new SessionForResultsSharing({
              id: sessionData.id,
              date: sessionData.date,
              time: sessionData.time,
              certificationCenter: sessionData.certificationCenter,
            }),
          );
          const result = await getSessionCertificationResultsCsv({
            sessionId: sessionData.id,
            certificationResults,
            i18n,
            sessionForResultsSharingRepository,
          });

          // then
          const expectedFilename = '20210101_1430_resultats_session_777.csv';
          const expectedContent =
            '\uFEFF' +
            '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Certification Pix+ Bandjo Maître";"Certification Pix+ Bandjo Expert";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n' +
            '123;"Lili";"Oxford";"04/01/1990";"Torreilles";"LOLORD";"Pix";"Validée";"Non obtenue";"Validée";"-";55;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";3;0;"RAS";777;"CentreCertif";"01/01/2020"';
          expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
        });
      });
    });

    context('v3', function () {
      let session, baseCertificationData, expectedCsvStart, expectedCsvEnd;

      beforeEach(function () {
        session = domainBuilder.certification.sessionManagement.buildSessionManagement({
          id: 1,
          date: '2021-01-01',
          time: '15:00:00',
          certificationCenter: 'Université des Pixous',
        });
        sessionForResultsSharingRepository.get.withArgs(session.id).resolves(
          new SessionForResultsSharing({
            id: session.id,
            date: session.date,
            time: session.time,
            certificationCenter: session.certificationCenter,
          }),
        );
        baseCertificationData = {
          id: 20,
          firstName: 'Buffy',
          lastName: 'Summers',
          birthplace: 'Guéret',
          birthdate: '1985-02-22',
          externalId: 'LOLOYAYA',
          createdAt: new Date('2021-02-02'),
          sessionId: session.id,
          version: AlgorithmEngineVersion.V3,
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: 'RAS',
          }),
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({ competence_code: '5.1', level: 3 }),
            domainBuilder.buildCompetenceMark({ competence_code: '5.2', level: -1 }),
          ],
        };
        expectedCsvStart = '20;"Buffy";"Summers";"22/02/1985";"Guéret";"LOLOYAYA"';
        expectedCsvEnd = ';"RAS";1;"Université des Pixous";"02/02/2021"';
      });

      context('CORE', function () {
        const expectedCsvHeaders =
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';
        beforeEach(function () {
          baseCertificationData.framework = Frameworks.CORE;
        });

        context('when certification is cancelled', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.cancelled({
              ...baseCertificationData,
              pixScore: 123,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"Pix";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is in error', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.error({
              ...baseCertificationData,
              pixScore: 123,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"Pix";"En erreur";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is rejected', function () {
          it('forces pixScore to 0 and write no competence marks result', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.rejected({
              ...baseCertificationData,
              pixScore: 55,
              reachedMeshIndex: null,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"Pix";"Non obtenue";"-";0;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
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
            it(`writes the appropriate certification in the csv when pixScore is ${pixScore} and reachedMeshIndex is ${reachedMeshIndex}}`, async function () {
              // given
              const certificationResult = domainBuilder.buildCertificationResult.validated({
                ...baseCertificationData,
                pixScore,
                reachedMeshIndex,
              });

              // when
              const result = await getSessionCertificationResultsCsv({
                sessionId: session.id,
                sessionForResultsSharingRepository,
                certificationResults: [certificationResult],
                i18n,
              });

              // then
              const expectedFilename = '20210101_1500_resultats_session_1.csv';
              const expectedContent =
                '\uFEFF' +
                expectedCsvHeaders +
                expectedCsvStart +
                `;"Pix";"Validée";"${expectedMeshLabel}";${pixScore};"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";3;0` +
                expectedCsvEnd;
              expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
            });
          });
        });
      });

      context('CléA', function () {
        const expectedCsvHeaders =
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Certification CléA";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';
        beforeEach(function () {
          baseCertificationData.framework = Frameworks.CLEA;
          baseCertificationData.complementaryCertificationCourseResults = [
            domainBuilder.buildComplementaryCertificationCourseResult({ acquired: true, label: 'CléA' }),
          ];
        });

        context('when certification is cancelled', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.cancelled({
              ...baseCertificationData,
              pixScore: 123,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"CléA Numérique by Pix";"Annulée";"Annulée";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is in error', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.error({
              ...baseCertificationData,
              pixScore: 123,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"CléA Numérique by Pix";"En erreur";"En erreur";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is rejected', function () {
          it('forces pixScore to 0 and write no competence marks result', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.rejected({
              ...baseCertificationData,
              pixScore: 55,
              reachedMeshIndex: null,
              complementaryCertificationCourseResults: [
                domainBuilder.buildComplementaryCertificationCourseResult({ acquired: false, label: 'CléA' }),
              ],
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"CléA Numérique by Pix";"Non obtenue";"Non obtenue";"-";0;"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
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
            it(`writes the appropriate certification in the csv when pixScore is ${pixScore} and reachedMeshIndex is ${reachedMeshIndex}}`, async function () {
              // given
              const certificationResult = domainBuilder.buildCertificationResult.validated({
                ...baseCertificationData,
                pixScore,
                reachedMeshIndex,
              });

              // when
              const result = await getSessionCertificationResultsCsv({
                sessionId: session.id,
                sessionForResultsSharingRepository,
                certificationResults: [certificationResult],
                i18n,
              });

              // then
              const expectedFilename = '20210101_1500_resultats_session_1.csv';
              const expectedContent =
                '\uFEFF' +
                expectedCsvHeaders +
                expectedCsvStart +
                `;"CléA Numérique by Pix";"Validée";"Validée";"${expectedMeshLabel}";${pixScore};"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";3;0` +
                expectedCsvEnd;
              expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
            });
          });
        });
      });

      context('Pix+ EDU', function () {
        const expectedCsvHeaders =
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';
        beforeEach(function () {
          baseCertificationData.framework = Frameworks.EDU_1ER_DEGRE;
          baseCertificationData.pixScore = null;
          baseCertificationData.complementaryCertificationCourseResults = [];
        });

        context('when certification is cancelled', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.cancelled({
              ...baseCertificationData,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' + expectedCsvHeaders + expectedCsvStart + ';"Pix+ Édu 1er degré";"Annulée";"-"' + expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is in error', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.error({
              ...baseCertificationData,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"Pix+ Édu 1er degré";"En erreur";"-"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is rejected', function () {
          it('forces a below the minimum mesh result', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.rejected({
              ...baseCertificationData,
              reachedMeshIndex: 0,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' +
              expectedCsvHeaders +
              expectedCsvStart +
              ';"Pix+ Édu 1er degré";"Non obtenue";"Non admissible"' +
              expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is validated', function () {
          [{ reachedMeshIndex: 0, expectedResult: 'Admissible' }].forEach(({ reachedMeshIndex, expectedResult }) => {
            it(`writes the appropriate certification in the csv when reachedMeshIndex is ${reachedMeshIndex}}`, async function () {
              // given
              const certificationResult = domainBuilder.buildCertificationResult.validated({
                ...baseCertificationData,
                reachedMeshIndex,
              });

              // when
              const result = await getSessionCertificationResultsCsv({
                sessionId: session.id,
                sessionForResultsSharingRepository,
                certificationResults: [certificationResult],
                i18n,
              });

              // then
              const expectedFilename = '20210101_1500_resultats_session_1.csv';
              const expectedContent =
                '\uFEFF' +
                expectedCsvHeaders +
                expectedCsvStart +
                `;"Pix+ Édu 1er degré";"Validée";"${expectedResult}"` +
                expectedCsvEnd;
              expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
            });
          });
        });
      });

      context('Pix+ DROIT', function () {
        const expectedCsvHeaders =
          '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Niveau";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"\n';
        beforeEach(function () {
          baseCertificationData.framework = Frameworks.DROIT;
          baseCertificationData.pixScore = null;
          baseCertificationData.complementaryCertificationCourseResults = [];
        });

        context('when certification is cancelled', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.cancelled({
              ...baseCertificationData,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' + expectedCsvHeaders + expectedCsvStart + ';"Pix+ Droit";"Annulée";"-"' + expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is in error', function () {
          it('writes the appropriate certification in the csv', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.error({
              ...baseCertificationData,
              reachedMeshIndex: 2,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' + expectedCsvHeaders + expectedCsvStart + ';"Pix+ Droit";"En erreur";"-"' + expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is rejected', function () {
          it('forces a below the minimum mesh result', async function () {
            // given
            const certificationResult = domainBuilder.buildCertificationResult.rejected({
              ...baseCertificationData,
              reachedMeshIndex: 0,
            });

            // when
            const result = await getSessionCertificationResultsCsv({
              sessionId: session.id,
              sessionForResultsSharingRepository,
              certificationResults: [certificationResult],
              i18n,
            });

            // then
            const expectedFilename = '20210101_1500_resultats_session_1.csv';
            const expectedContent =
              '\uFEFF' + expectedCsvHeaders + expectedCsvStart + ';"Pix+ Droit";"Non obtenue";"-"' + expectedCsvEnd;
            expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
          });
        });

        context('when certification is validated', function () {
          [
            { reachedMeshIndex: 0, expectedResult: 'Indépendant' },
            { reachedMeshIndex: 1, expectedResult: 'Confirmé' },
            { reachedMeshIndex: 2, expectedResult: 'Avancé' },
            { reachedMeshIndex: 3, expectedResult: 'Expert' },
          ].forEach(({ reachedMeshIndex, expectedResult }) => {
            it(`writes the appropriate certification in the csv when reachedMeshIndex is ${reachedMeshIndex}}`, async function () {
              // given
              const certificationResult = domainBuilder.buildCertificationResult.validated({
                ...baseCertificationData,
                reachedMeshIndex,
              });

              // when
              const result = await getSessionCertificationResultsCsv({
                sessionId: session.id,
                sessionForResultsSharingRepository,
                certificationResults: [certificationResult],
                i18n,
              });

              // then
              const expectedFilename = '20210101_1500_resultats_session_1.csv';
              const expectedContent =
                '\uFEFF' +
                expectedCsvHeaders +
                expectedCsvStart +
                `;"Pix+ Droit";"Validée";"${expectedResult}"` +
                expectedCsvEnd;
              expect(result).to.deep.equal({ filename: expectedFilename, content: expectedContent });
            });
          });
        });
      });
    });
  });
});
