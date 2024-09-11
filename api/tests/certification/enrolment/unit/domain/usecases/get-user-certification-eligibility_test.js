import { getUserCertificationEligibility } from '../../../../../../src/certification/enrolment/domain/usecases/get-user-certification-eligibility.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Usecases | get-user-certification-eligibility', function () {
  const userId = 123;
  const limitDate = new Date('2024-09-06');
  let dependencies;
  const placementProfileService = {};

  beforeEach(function () {
    placementProfileService.getPlacementProfile = sinon.stub();
    dependencies = {
      userId,
      limitDate,
      placementProfileService,
    };
  });

  context('certificability', function () {
    context('when user is certifiable', function () {
      it('returns a user certification eligibility with is certifiable set to true', async function () {
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
          domainBuilder.buildPlacementProfile.buildCertifiable({
            profileDate: limitDate,
            userId,
          }),
        );

        const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

        expect(userCertificationEligibility).to.deep.equal(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            id: userId,
            isCertifiable: true,
            certificationEligibilities: [],
          }),
        );
      });
    });
    context('when user is not certifiable', function () {
      it('returns a user certification eligibility with is certifiable set to false', async function () {
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate }).resolves(
          domainBuilder.buildPlacementProfile({
            profileDate: limitDate,
            userId,
            userCompetences: [domainBuilder.buildUserCompetence({ estimatedLevel: 1, pixScore: 1 })],
          }),
        );

        const userCertificationEligibility = await getUserCertificationEligibility(dependencies);

        expect(userCertificationEligibility).to.deep.equal(
          domainBuilder.certification.enrolment.buildUserCertificationEligibility({
            id: userId,
            isCertifiable: false,
            certificationEligibilities: [],
          }),
        );
      });
    });
  });
});
