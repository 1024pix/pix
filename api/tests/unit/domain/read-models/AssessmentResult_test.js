const { expect } = require('../../../test-helper');
const AssessmentResult = require('../../../../lib/domain/read-models/AssessmentResult');
const { states } = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Read-Models | AssessmentResult', () => {

  describe('#buildStartedAssessmentResult', () => {
    it('should return true if the campaign is of type ASSESSMENT', () => {
      // given
      const assessmentId = 123;

      // when
      const result = AssessmentResult.buildStartedAssessmentResult({ assessmentId });

      // then
      const startedAssessmentResult = {
        assessmentId,
        status: states.STARTED,
        commentForCandidate: null,
        commentForOrganization: null,
        commentForJury: null,
        juryId: null,
        pixScore: null,
        competencesWithMark: [],
      };
      expect(result).to.be.instanceOf(AssessmentResult);
      expect(result).to.deep.equal(startedAssessmentResult);
    });
  });
});
