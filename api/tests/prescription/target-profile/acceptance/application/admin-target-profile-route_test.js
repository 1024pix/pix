import * as TargetProfile from '../../../../../src/shared/domain/models/TargetProfile.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
  learningContentBuilder,
  MockDate,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | TargetProfile | Application | Route | admin-target-profile', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/admin/target-profiles/{targetProfileId}', function () {
    const skillId = 'recArea1_Competence1_Tube1_Skill1';
    const tubeId = 'recArea1_Competence1_Tube1';

    const learningContent = {
      areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
      competences: [
        {
          id: 'recArea1_Competence1',
          areaId: 'recArea1',
          skillIds: [skillId],
          origin: 'Pix',
        },
      ],
      thematics: [],
      tubes: [
        {
          id: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
      ],
      skills: [
        {
          id: skillId,
          name: '@recArea1_Competence1_Tube1_Skill1',
          status: 'actif',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
      ],
      challenges: [
        {
          id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
          skillId: skillId,
          competenceId: 'recArea1_Competence1',
          status: 'validé',
          locales: ['fr-fr'],
        },
      ],
    };

    beforeEach(async function () {
      await mockLearningContent(learningContent);
    });

    describe('when there is no tube to update', function () {
      it('should return 204', async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const user = databaseBuilder.factory.buildUser.withRole();
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/admin/target-profiles/${targetProfile.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              attributes: {
                name: 'CoolPixer',
                'internal-name': 'CoolPixer internal',
                description: 'Amazing description',
                comment: 'Amazing comment',
                category: 'OTHER',
                'image-url': 'http://valid-uri.com/image.png',
                'are-knowledge-elements-resettable': false,
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

    describe('when there is some tube update and the target profile is not linked with campaign', function () {
      it('should return 204', async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const targetProfileTube = databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfile.id,
          tubeId,
          level: 1,
        });
        const user = databaseBuilder.factory.buildUser.withRole();
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/admin/target-profiles/${targetProfile.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          payload: {
            data: {
              attributes: {
                name: 'nom changé',
                'internal-name': 'nom changé',
                category: 'COMPETENCES',
                description: 'description changée.',
                comment: 'commentaire changé.',
                'image-url': null,
                tubes: [{ id: targetProfileTube.tubeId, level: 99 }],
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
  });

  describe('GET /api/admin/target-profiles/{id}', function () {
    let user;
    const skillId = 'recArea1_Competence1_Tube1_Skill1';
    const tubeId = 'recArea1_Competence1_Tube1';
    const learningContent = {
      areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
      competences: [
        {
          id: 'recArea1_Competence1',
          areaId: 'recArea1',
          skillIds: [skillId],
          origin: 'Pix',
        },
      ],
      thematics: [],
      tubes: [
        {
          id: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
      ],
      skills: [
        {
          id: skillId,
          name: '@recArea1_Competence1_Tube1_Skill1',
          status: 'actif',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
        },
      ],
      challenges: [
        {
          id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
          skillId: skillId,
          competenceId: 'recArea1_Competence1',
          status: 'validé',
          locales: ['fr-fr'],
        },
      ],
    };

    beforeEach(async function () {
      await mockLearningContent(learningContent);
      user = databaseBuilder.factory.buildUser.withRole();
    });

    it('should return the target-profile corresponding to the given {id} and 200 status code', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        name: 'Savoir tout faire',
        internalName: 'Savoir tout faire',
        imageUrl: 'https://test',
        isSimplifiedAccess: false,
        createdAt: new Date('2020-01-01'),
        outdated: false,
        description: 'Une description',
        comment: 'Un beau profil cible',
        category: 'TEST',
        migration_status: 'N/A',
        areKnowledgeElementsResettable: false,
      });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfile.id, tubeId, level: 7 });

      databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      await databaseBuilder.commit();
      const expectedTargetProfile = {
        'are-knowledge-elements-resettable': false,
        'capped-tubes': [],
        category: 'TEST',
        'tubes-count': 1,
        comment: 'Un beau profil cible',
        'estimated-time': null,
        description: 'Une description',
        'created-at': new Date('2020-01-01'),
        'has-linked-campaign': true,
        'has-linked-autonomous-course': false,
        'image-url': 'https://test',
        'is-simplified-access': false,
        name: 'Savoir tout faire',
        'internal-name': 'Savoir tout faire',
        outdated: false,
        'max-level': -Infinity,
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfile.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes).to.deep.equal(expectedTargetProfile);
    });

    it('should return the target profile with certifiable badges and 200 status code', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        name: 'Super Profil Cible',
      });
      databaseBuilder.factory.buildBadge({
        id: 1,
        targetProfileId: targetProfile.id,
        isCertifiable: true,
        title: 'Badge certifiable',
      });
      databaseBuilder.factory.buildBadge({
        id: 2,
        targetProfileId: targetProfile.id,
        isCertifiable: false,
        title: 'Badge non certifiable',
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfile.id}?filter[badges]=certifiable`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes).to.deep.equal({
        name: 'Super Profil Cible',
      });
      expect(response.result.included[0].attributes).to.deep.equal({
        'is-certifiable': true,
        title: 'Badge certifiable',
      });
    });
  });

  describe('download target profile informations', function () {
    let user;
    let targetProfileId;

    beforeEach(async function () {
      MockDate.set(new Date('2020-11-01'));

      const learningContent = learningContentBuilder([
        {
          id: 'recFramework1',
          name: 'Mon référentiel 1',
          areas: [
            {
              id: 'recArea1',
              name: 'area1_name',
              title_i18n: { fr: 'domaine1_TitreFr', en: 'area1_TitleEn' },
              color: 'area1_color',
              code: 'area1_code',
              frameworkId: 'recFramework1',
              competences: [
                {
                  id: 'recCompetence2',
                  name_i18n: { fr: 'competence2_nomFr', en: 'competence2_nameEn' },
                  index: 2,
                  description_i18n: { fr: 'competence2_descriptionFr', en: 'competence2_descriptionEn' },
                  origin: 'Pix',
                  thematics: [
                    {
                      id: 'recThematic2',
                      name_i18n: {
                        fr: 'thematique2_nomFr',
                        en: 'thematic2_nameEn',
                      },
                      index: '20',
                      tubes: [
                        {
                          id: 'recTube2',
                          name: '@tube2_name',
                          title: '@tube2_title',
                          description: '@tube2_description',
                          practicalTitle_i18n: { fr: 'tube2_practicalTitleFr', en: 'tube2_practicalTitleEn' },
                          practicalDescription_i18n: {
                            fr: 'tube2_practicalDescriptionFr',
                            en: 'tube2_practicalDescriptionEn',
                          },
                          isMobileCompliant: false,
                          isTabletCompliant: true,
                          skills: [
                            {
                              id: 'recSkill2',
                              name: '@tube2_name1',
                              status: 'actif',
                              level: 1,
                              pixValue: 34,
                              version: 76,
                            },
                            {
                              id: 'recSkill3',
                              name: '@tube2_name2',
                              status: 'archivé',
                              level: 2,
                              pixValue: 56,
                              version: 54,
                            },
                            {
                              id: 'recSkill4',
                              status: 'périmé',
                            },
                          ],
                        },
                        {
                          id: 'recTube3',
                          name: '@tube3_name',
                          title: '@tube3_title',
                          description: '@tube3_description',
                          practicalTitle_i18n: { fr: 'tube3_practicalTitleFr', en: 'tube3_practicalTitleEn' },
                          practicalDescription_i18n: {
                            fr: 'tube3_practicalDescriptionFr',
                            en: 'tube3_practicalDescriptionEn',
                          },
                          isMobileCompliant: true,
                          isTabletCompliant: true,
                          skills: [
                            {
                              id: 'recSkill5',
                              name: '@tube3_name5',
                              status: 'archivé',
                              level: 5,
                              pixValue: 44,
                              version: 55,
                            },
                            {
                              id: 'recSkill6',
                              status: 'périmé',
                            },
                            {
                              id: 'recSkill7',
                              status: 'périmé',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
      await mockLearningContent(learningContent);

      targetProfileId = databaseBuilder.factory.buildTargetProfile({ name: 'Roxane est très jolie' }).id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 2 });
      user = databaseBuilder.factory.buildUser.withRole();
      return databaseBuilder.commit();
    });

    afterEach(function () {
      MockDate.reset();
    });

    describe('GET /api/admin/target-profiles/{id}/content-json', function () {
      it('should return 200 and the json file', async function () {
        const options = {
          method: 'GET',
          url: `/api/admin/target-profiles/${targetProfileId}/content-json`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.payload).to.equal(
          '[{"id":"recTube2","level":2,"frameworkId":"recFramework1","skills":["recSkill2"]}]',
        );
        expect(response.headers['content-disposition']).to.equal(
          'attachment; filename=20201101_profil_cible_roxane_est_tres_jolie.json',
        );
        expect(response.headers['content-type']).to.equal('application/json;charset=utf-8');
      });
    });

    describe('GET /api/admin/target-profiles/{id}/learning-content-pdf?language=fr', function () {
      it('should return 200 and the pdf file', async function () {
        const options = {
          method: 'GET',
          url: `/api/admin/target-profiles/${targetProfileId}/learning-content-pdf?language=fr`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-disposition']).to.equal(
          'attachment; filename=20201101_profil_cible_roxane_est_tres_jolie.pdf',
        );
        expect(response.headers['content-type']).to.equal('application/pdf');
      });
    });
  });

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', function () {
    it('should return 200', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const user = databaseBuilder.factory.buildUser.withRole();
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfileId}/attach-organizations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          'organization-ids': [organization1.id, organization2.id],
        },
      };

      // when
      const response = await server.inject(options);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfileId });
      const organizationIds = rows.map(({ organizationId }) => organizationId);
      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationIds).to.exactlyContain([organization1.id, organization2.id]);
    });
  });

  describe('POST /api/admin/target-profiles/{id}/copy-organizations', function () {
    it('should return 204', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const userId = databaseBuilder.factory.buildUser.withRole().id;
      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      const organizationId2 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({
        targetProfileId: existingTargetProfileId,
        organizationId: organizationId1,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        targetProfileId: existingTargetProfileId,
        organizationId: organizationId2,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfileId}/copy-organizations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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

  describe('POST /api/admin/organizations/{organizationId}/attach-target-profiles', function () {
    let userId;
    let organizationId;
    let alreadyAttachedTargetProfileId;
    let toAttachTargetProfileId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      alreadyAttachedTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      toAttachTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId,
        targetProfileId: alreadyAttachedTargetProfileId,
      });
      await databaseBuilder.commit();
    });

    context('when target profiles to attach exists', function () {
      it('should attach target profiles to organization', async function () {
        // given
        const options = {
          method: 'POST',
          url: `/api/admin/organizations/${organizationId}/attach-target-profiles`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload: {
            'target-profile-ids': [alreadyAttachedTargetProfileId, toAttachTargetProfileId],
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const attachedTargetProfileIds = await knex('target-profile-shares')
          .pluck('targetProfileId')
          .where({ organizationId })
          .orderBy('targetProfileId', 'ASC');
        expect(response.statusCode).to.equal(204);
        expect(attachedTargetProfileIds).to.deepEqualArray([alreadyAttachedTargetProfileId, toAttachTargetProfileId]);
      });
    });

    context('when a target profile does not exist', function () {
      it('should return a 404 error without attaching any target profile', async function () {
        // given
        const options = {
          method: 'POST',
          url: `/api/admin/organizations/${organizationId}/attach-target-profiles`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          payload: {
            'target-profile-ids': [alreadyAttachedTargetProfileId, 6000, toAttachTargetProfileId],
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const attachedTargetProfileIds = await knex('target-profile-shares')
          .pluck('targetProfileId')
          .where({ organizationId })
          .orderBy('targetProfileId', 'ASC');
        expect(response.statusCode).to.equal(404);
        expect(attachedTargetProfileIds).to.deepEqualArray([alreadyAttachedTargetProfileId]);
      });
    });
  });

  describe('DELETE /api/admin/target-profiles/{targetProfileId}/detach-organizations', function () {
    it('should return 200 after successfully detaching organizations from target profile', async function () {
      // given
      const server = await createServer();
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const user = databaseBuilder.factory.buildUser.withRole();
      const organization1Id = databaseBuilder.factory.buildOrganization().id;
      const organization2Id = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: organization1Id });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: organization2Id });

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/target-profiles/${targetProfileId}/detach-organizations`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              'organization-ids': [organization1Id, organization2Id],
            },
          },
        },
      };

      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/admin/target-profiles/{targetProfileId}/outdate', function () {
    it('should return 204', async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/target-profiles/${targetProfile.id}/outdate`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              outdated: true,
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

  describe('PUT /api/admin/target-profiles/{targetProfileId}/simplified-access', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const user = databaseBuilder.factory.buildUser.withRole();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/target-profiles/${targetProfile.id}/simplified-access`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        JSON.stringify({
          data: {
            type: 'target-profiles',
            id: targetProfile.id.toString(),
            attributes: { 'is-simplified-access': true },
          },
        }),
      );
    });
  });

  describe('POST /api/admin/target-profiles/{id}/copy', function () {
    let user;

    beforeEach(function () {
      user = databaseBuilder.factory.buildUser.withRole();
      const learningContentForTest = {
        skills: [
          {
            id: 'recSkill1',
            name: 'skill1',
            status: 'actif',
            tubeId: 'recTube1',
          },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContentForTest);
      return databaseBuilder.commit();
    });

    it('should return the new target profile id and 200 status code', async function () {
      // given
      const tubeId = 'recArea1_Competence1_Tube1';
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const targetProfileTube = databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfile.id,
        tubeId,
        level: 1,
      });

      const badge = databaseBuilder.factory.buildBadge({ key: 'FIRST_BADGE', targetProfileId: targetProfile.id });
      const badgeCriterion = databaseBuilder.factory.buildBadgeCriterion({ badgeId: badge.id });
      const stage = databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfile.id}/copy`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });

      // then
      const { id: targetProfileId, name: targetProfileName } = await knex('target-profiles')
        .where('id', response.result)
        .first();
      const {
        id: targetProfileTubeId,
        tubeId: copiedTubeId,
        targetProfileId: tubeTargetProfileId,
      } = await knex('target-profile_tubes').where({ targetProfileId }).first();

      const { id: badgeId } = await knex('badges').where({ targetProfileId }).first();
      const { id: badgeCriterionId, name: badgeCriterionName } = await knex('badge-criteria')
        .where({ badgeId })
        .first();
      const { id: stageId, message } = await knex('stages').where({ targetProfileId }).first();

      expect(response.statusCode).to.equal(200);

      expect(targetProfileName).to.equal('[Copie] ' + targetProfile.name);
      expect(targetProfileId).not.to.equal(targetProfile.id);

      expect(targetProfileTubeId).not.to.equal(targetProfileTube.id);
      expect(copiedTubeId).to.equal(targetProfileTube.tubeId);
      expect(tubeTargetProfileId).to.equal(targetProfileId);

      expect(badgeId).not.to.equal(badge.id);
      expect(badgeCriterionId).not.to.equal(badgeCriterion.id);
      expect(badgeCriterionName).to.equal(badgeCriterion.name);

      expect(stageId).not.to.equal(stage.id);
      expect(message).to.equal(stage.message);
    });
  });

  describe('GET /api/admin/organizations/{id}/target-profile-summaries', function () {
    let userId;
    let organizationId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfile({
        id: 1,
        name: 'Super profil cible',
        outdated: false,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId,
        targetProfileId: 1,
      });
      await databaseBuilder.commit();
    });

    it('should return serialized target profile summaries', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/target-profile-summaries`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
    });
  });

  describe('GET /api/admin/target-profile-summaries', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildTargetProfile({
        id: 1,
        name: 'Super profil cible',
        outdated: false,
        category: TargetProfile.categories.OTHER,
      });
      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/admin/target-profile-summaries`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/target-profiles', function () {
    let user;

    beforeEach(function () {
      user = databaseBuilder.factory.buildUser.withRole();
      const learningContentForTest = {
        skills: [
          {
            id: 'recSkill1',
            name: 'skill1',
            status: 'actif',
            tubeId: 'recTube1',
          },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContentForTest);
      return databaseBuilder.commit();
    });

    it('should return 200', async function () {
      // given
      databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/admin/target-profiles',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              name: 'targetProfileName',
              'internal-name': 'internalTargetProfileName',
              category: 'OTHER',
              description: 'coucou maman',
              comment: 'coucou papa',
              'image-url': 'http://some/image.ok',
              tubes: [{ id: 'recTube1', level: 5 }],
              'are-knowledge-elements-resettable': true,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const { id: targetProfileId, areKnowledgeElementsResettable } = await knex('target-profiles')
        .select('id', 'areKnowledgeElementsResettable')
        .first();
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'target-profiles',
          id: `${targetProfileId}`,
        },
      });
      expect(areKnowledgeElementsResettable).to.be.true;
    });
  });
});
