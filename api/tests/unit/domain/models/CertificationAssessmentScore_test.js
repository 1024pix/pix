import CertificationAssessmentScore from '../../../../lib/domain/models/CertificationAssessmentScore';
import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | CertificationAssessmentScore', function () {
  describe('#get nbPix', function () {
    context('when CertificationAssessmentScore has no competence marks', function () {
      it('should return nbPix 0', function () {
        // given
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          competenceMarks: [],
        });

        // when
        const actualNbPix = certificationAssessmentScore.nbPix;

        // then
        expect(actualNbPix).to.equal(0);
      });
    });

    context('when CertificationAssessmentScore has competence marks', function () {
      it('should return the sum of the competence marks score as nbPix', function () {
        // given
        const competenceMark1 = domainBuilder.buildCompetenceMark({
          score: 13,
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({
          score: 12,
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          competenceMarks: [competenceMark1, competenceMark2],
        });

        // when
        const actualNbPix = certificationAssessmentScore.nbPix;

        // then
        expect(actualNbPix).to.equal(25);
      });
    });
  });

  describe('#get status', function () {
    context('when nbPix is 0', function () {
      it('should return REJECTED as status', function () {
        // given
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          competenceMarks: [],
        });

        // when
        const status = certificationAssessmentScore.status;

        // then
        expect(status).to.equal(CertificationAssessmentScore.statuses.REJECTED);
      });
    });

    context('when nbPix is greater than 0', function () {
      it('should return VALIDATED as status', function () {
        // given
        const competenceMark = domainBuilder.buildCompetenceMark({
          score: 13,
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          competenceMarks: [competenceMark],
        });

        // when
        const actualStatus = certificationAssessmentScore.status;

        // then
        expect(actualStatus).to.equal(CertificationAssessmentScore.statuses.VALIDATED);
      });
    });
  });

  describe('#getCompetenceMarks', function () {
    it('should return the competence marks collection', function () {
      // given
      const competenceMark1 = domainBuilder.buildCompetenceMark({
        score: 13,
      });
      const competenceMark2 = domainBuilder.buildCompetenceMark({
        score: 12,
      });
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        competenceMarks: [competenceMark1, competenceMark2],
      });

      // when
      const competenceMarks = certificationAssessmentScore.getCompetenceMarks();

      // then
      expect(competenceMarks).to.deep.equal([competenceMark1, competenceMark2]);
    });
  });

  describe('#getPercentageCorrectAnswers', function () {
    it('should return the percentageCorrectAnswers', function () {
      // given
      const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
        percentageCorrectAnswers: 55,
      });

      // when
      const percentageCorrectAnswers = certificationAssessmentScore.getPercentageCorrectAnswers();

      // then
      expect(percentageCorrectAnswers).to.equal(55);
    });
  });
});
