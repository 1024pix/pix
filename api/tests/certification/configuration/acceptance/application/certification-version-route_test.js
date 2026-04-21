import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Certification | Configuration | API | certification-version-route', function () {
  let superAdmin;

  beforeEach(async function () {
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
  });

  describe('GET /api/admin/certification-versions/{scope}/active', function () {
    it('should get the active certification version for a given scope and return 200', async function () {
      const challengesConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 20,
        limitToOneQuestionPerTube: false,
        defaultCandidateCapacity: -3,
      });

      const existingVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          { competence: '1.1', values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }] },
        ],
        challengesConfiguration,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-versions/${SCOPES.CORE}/active`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(String(existingVersion.id));
      expect(response.result.data.attributes.scope).to.equal(SCOPES.CORE);
      expect(response.result.data.attributes['assessment-duration']).to.equal(DEFAULT_SESSION_DURATION_MINUTES);
      expect(response.result.data.attributes['challenges-configuration']).to.deep.equal(challengesConfiguration);
    });

    it('should return 404 when no active version exists for the scope', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/certification-versions/${SCOPES.CORE}/active`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(404);
    });
  });
});
