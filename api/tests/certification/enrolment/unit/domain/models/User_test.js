import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Model | User', function () {
  describe('#has', function () {
    it('should return false when user has no organization learner ids at all', function () {
      // given
      const user = domainBuilder.certification.enrolment.buildUser({ organizationLearnerIds: [] });

      // when
      const hasOrgaLearnerId = user.has({ organizationLearnerId: 123 });

      // then
      expect(hasOrgaLearnerId).to.be.false;
    });

    it('should return false when user does not have the given organizationLearnerId in its ids', function () {
      // given
      const user = domainBuilder.certification.enrolment.buildUser({ organizationLearnerIds: [456, 789] });

      // when
      const hasOrgaLearnerId = user.has({ organizationLearnerId: 123 });

      // then
      expect(hasOrgaLearnerId).to.be.false;
    });

    it('should return true when user has the given organizationLearnerId in its ids', function () {
      // given
      const user = domainBuilder.certification.enrolment.buildUser({ organizationLearnerIds: [456, 789, 123] });

      // when
      const hasOrgaLearnerId = user.has({ organizationLearnerId: 123 });

      // then
      expect(hasOrgaLearnerId).to.be.true;
    });
  });
});
