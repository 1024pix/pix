const CertificationAssessmentScore = require('../../../../lib/domain/models/CertificationAssessmentScore');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationAssessmentScore', () => {

  describe('#get nbPix', () => {

    context('when CertificationAssessmentScore has no competence marks', () => {

      it('should return nbPix 0', () => {
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

    context('when CertificationAssessmentScore has competence marks', () => {

      it('should return the sum of the competence marks score as nbPix', () => {
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

  describe('#get status', () => {

    context('when nbPix is 0', () => {

      it('should return REJECTED as status', () => {
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

    context('when nbPix is greater than 0', () => {

      it('should return VALIDATED as status', () => {
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

  describe('#getCompetenceMarks', () => {

    it('should return the competence marks collection', () => {
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

  describe('#getPercentageCorrectAnswers', () => {

    it('should return the percentageCorrectAnswers', () => {
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
