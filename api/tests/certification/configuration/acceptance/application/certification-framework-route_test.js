import { Frameworks } from '../../../../../src/certification/configuration/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  mockLearningContent,
} from '../../../../test-helper.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';

describe('Acceptance | Application | Certification | ComplementaryCertification | certification-framework-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certification-frameworks', function () {
    it('should return 200 HTTP status code with all frameworks', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/certification-frameworks',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      const coreStartDate = new Date('2025-01-15');

      databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: coreStartDate,
        expirationDate: null,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.deep.members([
        {
          type: 'certification-frameworks',
          id: Frameworks.CORE,
          attributes: {
            name: Frameworks.CORE,
            'active-version-start-date': coreStartDate,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.DROIT,
          attributes: {
            name: Frameworks.DROIT,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_1ER_DEGRE,
          attributes: {
            name: Frameworks.EDU_1ER_DEGRE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_2ND_DEGRE,
          attributes: {
            name: Frameworks.EDU_2ND_DEGRE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_CPE,
          attributes: {
            name: Frameworks.EDU_CPE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.PRO_SANTE,
          attributes: {
            name: Frameworks.PRO_SANTE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.CLEA,
          attributes: {
            name: Frameworks.CLEA,
            'active-version-start-date': null,
          },
        },
      ]);
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/active-consolidated-framework', function () {
    it('should return the active consolidated framework', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const minimalLearningContent = [
        {
          id: 'recAreaCore',
          competences: [
            {
              id: 'recCompCore',
              thematics: [
                {
                  id: 'recThemCore',
                  tubes: [
                    {
                      id: 'recTubeCore',
                      skills: [
                        { id: 'skillCore@web1', challenges: [{ id: 'recChallenge1', langues: ['Franco Français'] }] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      await mockLearningContent(learningContentObjects);

      const certificationVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: Scopes.CORE,
        startDate: new Date('2025-01-15'),
        expirationDate: null,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: 'recChallenge1',
        discriminant: 1.5,
        difficulty: 2.3,
        createdAt: new Date('2025-01-15'),
        versionId: certificationVersion.id,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: 'anotherScopeChallenge',
        versionId: databaseBuilder.factory.buildCertificationVersion({ scope: Scopes.DROIT }).id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${Scopes.CORE}/active-consolidated-framework`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: Scopes.CORE,
        type: 'certification-consolidated-frameworks',
        attributes: {
          'complementary-certification-key': Scopes.CORE,
          version: String(certificationVersion.id),
        },
        relationships: {
          areas: {
            data: [
              {
                id: 'recAreaCore',
                type: 'areas',
              },
            ],
          },
        },
      });
      expect(response.result.included).to.have.lengthOf(5);
    });
  });
});
