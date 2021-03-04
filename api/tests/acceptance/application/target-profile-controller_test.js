const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex, mockLearningContent, learningContentBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | target-profile-controller', () => {

  let server;

  const skillId = 'recArea1_Competence1_Tube1_Skill1';

  const learningContent = {
    areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
    competences: [{
      id: 'recArea1_Competence1',
      areaId: 'recArea1',
      skillIds: [skillId],
      origin: 'Pix',
    }],
    tubes: [{
      id: 'recArea1_Competence1_Tube1',
      competenceId: 'recArea1_Competence1',
    }],
    skills: [{
      id: skillId,
      name: '@recArea1_Competence1_Tube1_Skill1',
      status: 'actif',
      tubeId: 'recArea1_Competence1_Tube1',
      competenceId: 'recArea1_Competence1',
    }],
    challenges: [{
      id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
      skillIds: [skillId],
      skills: ['@recArea1_Competence1_Tube1_Skill1'],
      competenceId: 'recArea1_Competence1',
      status: 'validé',
      locales: ['fr-fr'],
    }],
  };

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/admin/target-profiles', () => {
    let user;

    beforeEach(async () => {
      mockLearningContent(learningContent);

      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('target-profiles_skills').delete();
      await knex('target-profiles').delete();
    });

    it('should return 200', async () => {
      const options = {
        method: 'POST',
        url: '/api/admin/target-profiles',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              'name': 'targetProfileName',
              'is-public': false,
              'owner-organization-id': null,
              'skills-id': [skillId],
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data.relationships.skills.data.length).to.equal(1);
      expect(response.result.data.relationships.skills.data[0].id).to.equal(skillId);
    });
  });

  describe('GET /api/admin/target-profiles/{id}', () => {
    let user;
    let targetProfileId;

    beforeEach(async () => {

      mockLearningContent(learningContent);
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillId });
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    it('should return 200', async () => {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/organizations', () => {
    let user;
    let targetProfileId;
    let organizationId;

    beforeEach(async () => {
      const learningContent = [{
        id: 'recArea0',
        competences: [{
          id: 'recNv8qhaY887jQb2',
          index: '1.3',
          name: 'Traiter des données',
        }],
      }];
      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });
      await databaseBuilder.commit();
    });

    it('should return 200', async () => {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.be.instanceOf(Array);
      expect(response.result.data[0].id).to.equal(organizationId.toString());
    });
  });

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', () => {

    beforeEach(async () => {
      mockLearningContent(learningContent);
    });

    afterEach(() => {
      return knex('target-profile-shares').delete();
    });

    it('should return 204', async () => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfile.id}/attach-organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          'organization-ids': [organization1.id, organization2.id],
        },
      };

      // when
      const response = await server.inject(options);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfile.id });
      const organizationIds = rows.map(({ organizationId }) => organizationId);
      // then
      expect(response.statusCode).to.equal(204);
      expect(organizationIds).to.exactlyContain([organization1.id, organization2.id]);
    });
  });

  describe('PATCH /api/admin/target-profiles/{id}', () => {

    it('should return 204', async () => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/target-profiles/${targetProfile.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              'name': 'CoolPixer',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/badges', () => {
    let user;
    let targetProfileId;
    let badge;

    beforeEach(async () => {
      const learningContent = [{
        id: 'recArea',
        competences: [{
          id: 'recCompetence',
          tubes: [{
            id: 'recTube',
            skills: [{
              id: 'recSkill',
              nom: '@recSkill',
            }],
          }],
        }],
      }];

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill' });
      badge = databaseBuilder.factory.buildBadge({ targetProfileId });
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    it('should return 200', async () => {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/badges`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedData = [{
        type: 'badges',
        id: badge.id.toString(),
        attributes: {
          'alt-message': badge.altMessage,
          'image-url': badge.imageUrl,
          'key': badge.key,
          'message': badge.message,
          'title': badge.title,
        },
      }];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/stages', () => {
    let user;
    let targetProfileId;
    let stage;

    beforeEach(async () => {
      const learningContent = [{
        id: 'recArea',
        competences: [{
          id: 'recCompetence',
          tubes: [{
            id: 'recTube',
            skills: [{
              id: 'recSkill',
              nom: '@recSkill',
            }],
          }],
        }],
      }];

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill' });
      stage = databaseBuilder.factory.buildStage({ targetProfileId });
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    it('should return 200', async () => {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/stages`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedData = [{
        type: 'stages',
        id: stage.id.toString(),
        attributes: {
          'message': stage.message,
          'title': stage.title,
          'threshold': stage.threshold,
        },
      }];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });
});
