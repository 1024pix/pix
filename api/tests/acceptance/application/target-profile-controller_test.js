const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex, mockLearningContent, learningContentBuilder } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | target-profile-controller', function() {

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

  beforeEach(async function() {
    server = await createServer();
  });

  describe('POST /api/admin/target-profiles', function() {
    let user;

    beforeEach(async function() {
      mockLearningContent(learningContent);

      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    afterEach(async function() {
      await knex('target-profiles_skills').delete();
      await knex('target-profiles').delete();
    });

    it('should return 200', async function() {
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

  describe('GET /api/admin/target-profiles/{id}', function() {
    let user;
    let targetProfileId;

    beforeEach(async function() {

      mockLearningContent(learningContent);
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillId });
      user = databaseBuilder.factory.buildUser.withPixRolePixMaster();

      await databaseBuilder.commit();
    });

    it('should return 200', async function() {
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

  describe('GET /api/admin/target-profiles/{id}/organizations', function() {
    let user;
    let targetProfileId;
    let organizationId;

    beforeEach(async function() {
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

    it('should return 200', async function() {
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

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', function() {

    beforeEach(function() {
      mockLearningContent(learningContent);
    });

    afterEach(function() {
      return knex('target-profile-shares').delete();
    });

    it('should return 204', async function() {
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

  describe('POST /api/admin/target-profiles/{id}/copy-organizations', function() {

    beforeEach(function() {
      mockLearningContent(learningContent);
    });

    afterEach(function() {
      return knex('target-profile-shares').delete();
    });

    it('should return 204', async function() {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      const organizationId2 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: existingTargetProfileId, organizationId: organizationId1 });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: existingTargetProfileId, organizationId: organizationId2 });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfileId}/copy-organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          'target-profile-id': existingTargetProfileId,
        },
      };

      // when
      const response = await server.inject(options);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfileId });
      const organizationIds = rows.map(({ organizationId }) => organizationId);

      // then
      expect(response.statusCode).to.equal(204);
      expect(organizationIds).to.exactlyContain([organizationId1, organizationId2]);
    });
  });

  describe('PATCH /api/admin/target-profiles/{id}', function() {

    it('should return 204', async function() {
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

  describe('PUT /api/admin/target-profiles/{id}/outdate', function() {

    it('should return 204', async function() {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/target-profiles/${targetProfile.id}/outdate`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              'outdated': true,
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

  describe('GET /api/admin/target-profiles/{id}/badges', function() {
    let user;
    let targetProfileId;
    let badge;

    beforeEach(async function() {
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

    it('should return 200', async function() {
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
          'is-certifiable': false,
          'image-url': badge.imageUrl,
          'key': badge.key,
          'message': badge.message,
          'title': badge.title,
        },
      }];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/stages', function() {
    let user;
    let targetProfileId;
    let stage;

    beforeEach(async function() {
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

    it('should return 200', async function() {
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
          'prescriber-title': stage.prescriberTitle,
          'prescriber-description': stage.prescriberDescription,
        },
      }];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });
});
