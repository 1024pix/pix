import { constants } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../test-helper.js';

describe('Acceptance | API | Autonomous Course', function () {
  let server;
  let userId;
  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser.withRole().id;
    await databaseBuilder.commit();
    server = await createServer();

    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: 'recNv8qhaY887jQb2',
            index: '1.3',
            name: 'Traiter des données',
          },
        ],
        skills: [
          {
            id: skillWeb1Id,
            name: skillWeb1Name,
            status: 'actif',
            competenceId: 'recCompetence',
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    await mockLearningContent(learningContentObjects);
  });

  describe('POST /api/autonomous-course', function () {
    context('When user is authenticated', function () {
      let targetProfileId;

      beforeEach(async function () {
        sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
        });
        targetProfileId = databaseBuilder.factory.buildTargetProfile({
          isSimplifiedAccess: true,
        }).id;
        databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });

        databaseBuilder.factory.buildMembership({ organizationId, userId });

        await databaseBuilder.commit();
      });

      context('when the organization owns the target profile', function () {
        it('should return 201', async function () {
          // when
          const autonomousCourseAttributes = {
            'internal-title': 'Titre pour usage interne',
            'public-title': 'Titre pour usage public',
            'target-profile-id': targetProfileId,
            'custom-landing-page-text': 'customLandingPageText',
          };
          const payload = {
            data: {
              type: 'autonomous-courses',
              attributes: autonomousCourseAttributes,
            },
          };

          const options = {
            method: 'POST',
            url: '/api/admin/autonomous-courses',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload,
          };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.type).to.equal('autonomous-courses');
          expect(response.result.data.id).to.be.not.null;

          const campaign = await knex('campaigns').where({ id: response.result.data.id }).first();
          expect(campaign).to.exist;
        });
      });
    });
  });

  describe('GET /api/admin/autonomous-courses', function () {
    it('should get a paginated list of autonomous courses', async function () {
      // given
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

      const organizationId = databaseBuilder.factory.buildOrganization({
        id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
      }).id;

      const targetProfileId = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: true,
      }).id;
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });

      const autonomousCourse1 = databaseBuilder.factory.buildCampaign({
        name: 'First autonomous course',
        organizationId,
        targetProfileId,
      });
      const autonomousCourse2 = databaseBuilder.factory.buildCampaign({
        name: 'Second autonomous course',
        organizationId,
        targetProfileId,
      });
      databaseBuilder.factory.buildCampaign({
        name: 'Campaign not linked to autonomous courses organization',
      });

      await databaseBuilder.commit();

      const expectedResponse = {
        data: [
          {
            type: 'autonomous-course-list-items',
            id: `${autonomousCourse1.id}`,
            attributes: {
              name: autonomousCourse1.name,
              'created-at': autonomousCourse1.createdAt,
              'archived-at': null,
            },
          },
          {
            type: 'autonomous-course-list-items',
            id: `${autonomousCourse2.id}`,
            attributes: {
              name: autonomousCourse2.name,
              'created-at': autonomousCourse2.createdAt,
              'archived-at': null,
            },
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          rowCount: 2,
          pageCount: 1,
          hasCampaigns: true,
        },
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/autonomous-courses',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(2);
      expect(response.result.data).to.deep.have.members(expectedResponse.data);
    });
  });

  describe('GET /api/admin/autonomous-courses/{autonomousCourseId}', function () {
    let targetProfileId;
    let organizationId;

    beforeEach(async function () {
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({
        id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
      });
      targetProfileId = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: true,
      }).id;
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });

      await databaseBuilder.commit();
    });

    it('should get a autonomous course with the specific id', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const { id: autonomousCourseId, ...autonomousCourseAttributes } = databaseBuilder.factory.buildCampaign({
        name: 'Nom interne parcours autonome',
        title: 'Nom externe parcours autonome',
        code: 'PARCOURS1',
        type: 'ASSESSMENT',
        organizationId: organizationId,
        ownerId: userId,
        targetProfileId: targetProfileId,
        customLandingPageText: "un texte de page d'accueil",
        createdAt: new Date('2020-01-02'),
      });
      await databaseBuilder.commit();

      const expectedResponse = {
        type: 'autonomous-courses',
        id: `${autonomousCourseId}`,
        attributes: {
          'internal-title': autonomousCourseAttributes.name,
          'public-title': autonomousCourseAttributes.title,
          'custom-landing-page-text': autonomousCourseAttributes.customLandingPageText,
          'created-at': new Date('2020-01-02'),
          code: autonomousCourseAttributes.code,
        },
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/autonomous-courses/${autonomousCourseId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.equal(expectedResponse.id);
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('PATCH /api/admin/autonomous-courses/{autonomousCourseId}', function () {
    let targetProfileId;
    let organizationId;

    beforeEach(async function () {
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({
        id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
      });
      targetProfileId = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: true,
      }).id;
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });

      await databaseBuilder.commit();
    });

    it('should update the autonomous course', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const { id: autonomousCourseId } = databaseBuilder.factory.buildCampaign({
        name: 'Nom interne parcours autonome',
        title: 'Nom externe parcours autonome',
        code: 'PARCOURS1',
        type: 'ASSESSMENT',
        organizationId: organizationId,
        ownerId: userId,
        targetProfileId: targetProfileId,
        customLandingPageText: "un texte de page d'accueil",
        createdAt: new Date('2020-01-02'),
      });
      await databaseBuilder.commit();

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/admin/autonomous-courses/${autonomousCourseId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            type: 'autonomous-courses',
            attributes: {
              'internal-title': 'Nouveau nom',
              'public-title': 'Nouveau titre',
              'custom-landing-page-text': "Nouveau texte de page d'accueil",
            },
          },
        },
      });

      // then
      const { id, name, title, customLandingPageText } = await knex('campaigns')
        .select(['id', 'name', 'title', 'customLandingPageText'])
        .where({ id: autonomousCourseId })
        .first();
      expect(id).to.equal(autonomousCourseId);
      expect(name).to.equal('Nouveau nom');
      expect(title).to.equal('Nouveau titre');
      expect(customLandingPageText).to.equal("Nouveau texte de page d'accueil");

      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/admin/autonomous-courses/target-profiles', function () {
    let mainOrganization, otherOrganization;
    let targetProfiles;

    beforeEach(async function () {
      sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);
      const userId = databaseBuilder.factory.buildUser().id;

      mainOrganization = databaseBuilder.factory.buildOrganization({
        id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
      });
      otherOrganization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId: mainOrganization.id, userId });

      const validTargetProfile1 = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: true,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId: mainOrganization.id,
        targetProfileId: validTargetProfile1.id,
      });

      const validTargetProfile2 = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: true,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId: mainOrganization.id,
        targetProfileId: validTargetProfile2.id,
      });

      const targetProfileFromAnotherOrganization = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: true,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId: otherOrganization.id,
        targetProfileId: targetProfileFromAnotherOrganization.id,
      });

      const targetProfileNotSimplifiedAccess = databaseBuilder.factory.buildTargetProfile({
        isSimplifiedAccess: false,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId: mainOrganization.id,
        targetProfileId: targetProfileNotSimplifiedAccess.id,
      });

      targetProfiles = [
        validTargetProfile1,
        validTargetProfile2,
        targetProfileFromAnotherOrganization,
        targetProfileNotSimplifiedAccess,
      ];

      await databaseBuilder.commit();
    });

    it('should get all simplified-access target-profiles from autonomous-courses specific organization', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/admin/autonomous-courses/target-profiles`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const expectedResult = [
        {
          attributes: {
            name: targetProfiles[0].name,
            category: targetProfiles[0].category,
          },
          id: targetProfiles[0].id.toString(),
          type: 'autonomous-course-target-profiles',
        },
        {
          attributes: {
            name: targetProfiles[1].name,
            category: targetProfiles[1].category,
          },
          id: targetProfiles[1].id.toString(),
          type: 'autonomous-course-target-profiles',
        },
      ];

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(2);
      expect(response.result.data).to.deep.have.members(expectedResult);
    });
  });
});
