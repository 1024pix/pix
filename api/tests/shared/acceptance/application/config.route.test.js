import { config } from '../../../../src/shared/config.js';
import { createServer, expect, sinon } from '../../../test-helper.js';

describe('Acceptance | Shared | Application | Route | config', function () {
  let server;
  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/config', function () {
    const options = {
      method: 'GET',
      url: '/api/config',
    };

    it('returns HTTP status code 200 with config', async function () {
      // given
      sinon.stub(config.authentication, 'permitPixAdminLoginFromPassword').value(true);
      // There is no effect in stubbing config.autonomousCourse.autonomousCoursesOrganizationId
      // because all the code uses constants.AUTONOMOUS_COURSES_ORGANIZATION_ID
      // sinon.stub(config.autonomousCourse, 'autonomousCoursesOrganizationId').value(987654);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        featureToggles: {
          areModuleShortIdUrlsEnabled: false,
          dynamicFeatureToggleSystem: false,
          isAsyncQuestRewardingCalculationEnabled: false,
          isPixPlusCandidateA11yEnabled: false,
          isQuestEnabled: true,
          isSelfAccountDeletionEnabled: true,
          isSurveyEnabledForCombinedCourses: true,
          isTextToSpeechButtonEnabled: true,
          usePixOrgaNewAuthDesign: false,
        },
        permitPixAdminLoginFromPassword: true,
        autonomousCoursesOrganizationId: 9000000,
      });
    });
  });
});
