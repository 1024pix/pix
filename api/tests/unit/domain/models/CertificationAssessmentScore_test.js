const CertificationAssessmentScore = require('../../../../lib/domain/models/CertificationAssessmentScore');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | CertificationAssessmentScore', function() {

  describe('#get nbPix', function() {

    context('when CertificationAssessmentScore has no competence marks', function() {

      it('should return nbPix 0', function() {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [],
        });

        // when
        const actualNbPix = certificationAssessmentScore.nbPix;

        // then
        expect(actualNbPix).to.equal(0);
      });

    });

    context('when CertificationAssessmentScore has competence marks', function() {

      it('should return the sum of the competence marks score as nbPix', function() {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [ { score: 12 }, { score: 13 } ],
        });

        // when
        const actualNbPix = certificationAssessmentScore.nbPix;

        // then
        expect(actualNbPix).to.equal(12 + 13);
      });
    });

  });

  describe('#get status', function() {

    context('when nbPix is 0', function() {

      it('should return REJECTED as status', function() {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [],
        });

        // when
        const status = certificationAssessmentScore.status;

        // then
        expect(status).to.equal(CertificationAssessmentScore.statuses.REJECTED);
      });

    });

    context('when nbPix is greater than 0', function() {

      it('should return VALIDATED as status', function() {
        // given
        const certificationAssessmentScore = new CertificationAssessmentScore({
          competenceMarks: [ { score: 12 }, { score: 13 } ],
        });

        // when
        const actualStatus = certificationAssessmentScore.status;

        // then
        expect(actualStatus).to.equal(CertificationAssessmentScore.statuses.VALIDATED);
      });
    });

  });
});
