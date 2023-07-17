import { expect, domainBuilder } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';
import { CertificationResult } from '../../../../../../lib/domain/models/CertificationResult.js';
import { CertificationResultsCsvValues } from '../../../../../../lib/infrastructure/utils/csv/certification-results/CertificationResultsCsvValues.js';

describe('Unit | Infrastructure | Utils | Csv | CertificationResultsCsvValues', function () {
  let i18n;
  beforeEach(function () {
    i18n = getI18n();
  });

  describe('#formatPixScore', function () {
    const aCertificationResultData = {
      id: 123,
      lastName: 'Oxford',
      firstName: 'Lili',
      birthdate: '1990-01-04',
      birthplace: 'Torreilles',
      externalId: 'LOLORD',
      createdAt: new Date('2020-01-01'),
      pixScore: 55,
      commentForOrganization: 'RAS',
      competencesWithMark: [],
      complementaryCertificationCourseResults: [],
    };

    context('when complementary certification has been passed', function () {
      it('should return the pix score', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.validated(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatPixScore(certifResult);

        // then
        expect(result).to.equal(55);
      });
    });

    context('when complementary certification is rejected', function () {
      it('should return "0"', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.rejected(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatPixScore(certifResult);

        // then
        expect(result).to.equal('0');
      });
    });

    context('when certification result is in error', function () {
      it('should return "-"', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.error(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatPixScore(certifResult);

        // then
        expect(result).to.equal('-');
      });
    });

    context('when certification result is cancelled', function () {
      it('should return "-"', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.cancelled(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatPixScore(certifResult);

        // then
        expect(result).to.equal('-');
      });
    });
  });

  describe('#formatStatus', function () {
    const aCertificationResultData = {
      id: 123,
      lastName: 'Oxford',
      firstName: 'Lili',
      birthdate: '1990-01-04',
      birthplace: 'Torreilles',
      externalId: 'LOLORD',
      createdAt: new Date('2020-01-01'),
      pixScore: 55,
      commentForOrganization: 'RAS',
      competencesWithMark: [],
      complementaryCertificationCourseResults: [],
    };

    context('when complementary certification is cancelled', function () {
      it('should return the cancelled translation', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.cancelled(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatStatus(certifResult);

        // then
        expect(result).to.equal('Annulée');
      });
    });

    context('when complementary certification has been passed', function () {
      it('should return the validated translation', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.validated(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatStatus(certifResult);

        // then
        expect(result).to.equal('Validée');
      });
    });

    context('when complementary certification is rejected', function () {
      it('should return the rejected translation', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.rejected(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatStatus(certifResult);

        // then
        expect(result).to.equal('Rejetée');
      });
    });

    context('when complementary certification is in error', function () {
      it('should return the error translation', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.error(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatStatus(certifResult);

        // then
        expect(result).to.equal('En erreur');
      });
    });

    context('when complementary certification is in progress', function () {
      it('should return the started translation', function () {
        // given
        const certifResult = domainBuilder.buildCertificationResult.started(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).formatStatus(certifResult);

        // then
        expect(result).to.equal('Démarrée');
      });
    });
  });

  describe('#getCompetenceLevel', function () {
    const aCertificationResultData = {
      id: 123,
      lastName: 'Oxford',
      firstName: 'Lili',
      birthdate: '1990-01-04',
      birthplace: 'Torreilles',
      externalId: 'LOLORD',
      createdAt: new Date('2020-01-01'),
      pixScore: 55,
      commentForOrganization: 'RAS',
      competencesWithMark: [],
      complementaryCertificationCourseResults: [],
    };

    context('when complementary certification has been passed', function () {
      it('should return the competence level', function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult.validated({
          ...aCertificationResultData,
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: 200,
              level: 3,
              score: 33,
              area_code: 'area1',
              competence_code: '1.1',
              competenceId: 'recComp1',
              assessmentResultId: 4,
            }),
          ],
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getCompetenceLevel({
          certificationResult,
          competenceIndex: '1.1',
        });

        // then
        expect(result).to.equal(3);
      });
    });

    context('when complementary certification is rejected', function () {
      it('should return "0"', function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult.rejected({
          ...aCertificationResultData,
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: 200,
              level: 3,
              score: 33,
              area_code: 'area1',
              competence_code: '1.1',
              competenceId: 'recComp1',
              assessmentResultId: 4,
            }),
          ],
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getCompetenceLevel({
          certificationResult,
          competenceIndex: '1.1',
        });

        // then
        expect(result).to.equal(0);
      });
    });

    context('when the competence has failed', function () {
      it('should return "0"', function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult.validated({
          ...aCertificationResultData,
          competencesWithMark: [
            domainBuilder.buildCompetenceMark({
              id: 200,
              level: -1000,
              score: 33,
              area_code: 'area1',
              competence_code: '1.1',
              competenceId: 'recComp1',
              assessmentResultId: 4,
            }),
          ],
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getCompetenceLevel({
          certificationResult,
          competenceIndex: '1.1',
        });

        // then
        expect(result).to.equal(0);
      });
    });

    context('when certification result is in error', function () {
      it('should return "-"', function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult.error(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).getCompetenceLevel({ certificationResult });

        // then
        expect(result).to.equal('-');
      });
    });

    context('when certification result is cancelled', function () {
      it('should return "-"', function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult.cancelled(aCertificationResultData);

        // when
        const result = new CertificationResultsCsvValues(i18n).getCompetenceLevel({ certificationResult });

        // then
        expect(result).to.equal('-');
      });
    });
  });

  describe('#getCommentForOrganization', function () {
    const aCertificationResultData = {
      id: 123,
      lastName: 'Oxford',
      firstName: 'Lili',
      birthdate: '1990-01-04',
      birthplace: 'Torreilles',
      externalId: 'LOLORD',
      createdAt: new Date('2020-01-01'),
      pixScore: 55,
      commentForOrganization: 'RAS',
      competencesWithMark: [],
      complementaryCertificationCourseResults: [],
    };

    context('when complementary certification is rejected', function () {
      it('should return that the certification has been automatically invalidated', function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult.rejected({
          ...aCertificationResultData,
          emitter: CertificationResult.emitters.PIX_ALGO,
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getCommentForOrganization(certificationResult);

        // then
        expect(result).to.equal(
          "Le candidat a répondu faux à plus de 50% des questions posées, cela a invalidé l'ensemble de sa certification, et a donc entraîné un score de 0 pix",
        );
      });
    });

    it('should return the comment', function () {
      // given
      const certificationResult = domainBuilder.buildCertificationResult.validated(aCertificationResultData);

      // when
      const result = new CertificationResultsCsvValues(i18n).getCommentForOrganization(certificationResult);

      // then
      expect(result).to.equal('RAS');
    });
  });

  describe('#getComplementaryCertificationStatus', function () {
    context('when complementary certification is acquired', function () {
      it('should return the validated translation', function () {
        // given
        const sessionComplementaryCertificationsLabel = 'default label';
        const certificationResult = domainBuilder.buildCertificationResult({
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              label: sessionComplementaryCertificationsLabel,
            }),
          ],
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getComplementaryCertificationStatus({
          certificationResult,
          sessionComplementaryCertificationsLabel,
        });

        // then
        expect(result).to.equal('Validée');
      });
    });

    context('when complementary certification is not acquired', function () {
      it('should return the rejected translation', function () {
        // given
        const sessionComplementaryCertificationsLabel = 'default label';
        const certificationResult = domainBuilder.buildCertificationResult({
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: false,
              label: sessionComplementaryCertificationsLabel,
            }),
          ],
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getComplementaryCertificationStatus({
          certificationResult,
          sessionComplementaryCertificationsLabel,
        });

        // then
        expect(result).to.equal('Rejetée');
      });
    });

    context('when complementary certification is not taken', function () {
      it('should return the not taken translation', function () {
        // given
        const sessionComplementaryCertificationsLabel = undefined;
        const certificationResult = domainBuilder.buildCertificationResult({
          complementaryCertificationCourseResults: [],
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getComplementaryCertificationStatus({
          certificationResult,
          sessionComplementaryCertificationsLabel,
        });

        // then
        expect(result).to.equal('Non passée');
      });
    });

    context('when certification result is cancelled', function () {
      it('should return the cancelled translation', function () {
        // given
        const sessionComplementaryCertificationsLabel = 'default label';
        const certificationResult = domainBuilder.buildCertificationResult({
          status: CertificationResult.status.CANCELLED,
        });

        // when
        const result = new CertificationResultsCsvValues(i18n).getComplementaryCertificationStatus({
          certificationResult,
          sessionComplementaryCertificationsLabel,
        });

        // then
        expect(result).to.equal('Annulée');
      });
    });
  });
});
