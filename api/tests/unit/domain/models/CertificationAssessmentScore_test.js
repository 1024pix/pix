const CertificationAssessmentScore = require('../../../../lib/domain/models/CertificationAssessmentScore');
const { expect } = require('../../../test-helper');
const { UNCERTIFIED_LEVEL } = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | CertificationAssessmentScore', () => {

  describe('#get nbPix', () => {

    context('when CertificationAssessmentScore has no competence marks', () => {

      it('should return nbPix 0', () => {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: []
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
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [ { score: 12 }, { score: 13 } ]
        });

        // when
        const actualNbPix = certificationAssessmentScore.nbPix;

        // then
        expect(actualNbPix).to.equal(12 + 13);
      });
    });

  });

  describe('#get level', () => {

    context('when nbPix is 0', () => {

      it('should return UNCERTIFIED_LEVEL as level', () => {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: []
        });

        // when
        const actualLevel = certificationAssessmentScore.level;

        // then
        expect(actualLevel).to.equal(UNCERTIFIED_LEVEL);
      });

    });

    context('when nbPix is greater than 0', () => {

      it('should return null as level', () => {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [ { score: 12 }, { score: 13 } ]
        });

        // when
        const actualLevel = certificationAssessmentScore.level;

        // then
        expect(actualLevel).to.be.null;
      });
    });

  });

  describe('#get status', () => {

    context('when nbPix is 0', () => {

      it('should return REJECTED as status', () => {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: []
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
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [ { score: 12 }, { score: 13 } ]
        });

        // when
        const actualStatus = certificationAssessmentScore.status;

        // then
        expect(actualStatus).to.equal(CertificationAssessmentScore.statuses.VALIDATED);
      });
    });

  });
});
