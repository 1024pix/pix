const { expect, sinon, domainBuilder } = require('../../../test-helper');
const BookshelfAssessmentResults = require('../../../../lib/infrastructure/orm-models/AssessmentResult');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | BookshelfAssessmentResult', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        emitter: '',
        status: null,
      };
    });

    describe('the status field', () => {

      it('should only accept specific values', () => {
        // given
        rawData.status = 'not_a_correct_status';
        const certification = new BookshelfAssessmentResults(rawData);

        // when
        const promise = certification.save();

        // then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const status = err.data['status'];
            expect(status).to.exist.and.to.deep.equal(['Le status de la certification n\'est pas valide']);
          });
      });
    });
  });

  describe('#buildStartedAssessmentResult', () => {

    it('should return true if the campaign is of type ASSESSMENT', () => {
      // given
      const assessmentId = 123;

      // when
      const result = AssessmentResult.buildStartedAssessmentResult({ assessmentId });

      // then
      const startedAssessmentResult = {
        id: undefined,
        assessmentId,
        status: Assessment.states.STARTED,
        commentForCandidate: undefined,
        commentForOrganization: undefined,
        commentForJury: undefined,
        createdAt: undefined,
        emitter: undefined,
        juryId: undefined,
        pixScore: undefined,
        competenceMarks: [],
      };
      expect(result).to.be.instanceOf(AssessmentResult);
      expect(result).to.deep.equal(startedAssessmentResult);
    });
  });

  describe('#isValidated', () => {

    it('should return true if the assessment result is validated', () => {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.validated();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    it('should return false if the assessment result is rejected', () => {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.rejected();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.false;
    });

    it('should return false if the assessment result is in error', () => {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.error();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.false;
    });

    it('should return false if the assessment result is started', () => {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.started();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.false;
    });
  });
});
