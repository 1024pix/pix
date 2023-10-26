import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  knex,
  mockLearningContent,
  sinon,
} from '../../../test-helper.js';

import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import { Campaign } from '../../../../lib/domain/models/Campaign.js';
import { CampaignTypes } from '../../../../lib/domain/models/CampaignTypes.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import _ from 'lodash';
import { buildLearningContent } from '../../../tooling/learning-content-builder/build-learning-content.js';
import { buildFramework } from '../../../tooling/domain-builder/factory/build-framework.js';
import { buildSkill } from '../../../tooling/domain-builder/factory/build-skill.js';
import { buildTube } from '../../../tooling/domain-builder/factory/build-tube.js';
import { buildArea } from '../../../tooling/domain-builder/factory/build-area.js';
import { buildCompetence } from '../../../tooling/domain-builder/factory/build-competence.js';
import { buildThematic } from '../../../tooling/domain-builder/factory/build-thematic.js';

describe('Integration | Repository | Campaign', function () {
  describe('#areKnowledgeElementsResettable', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { multipleSendings: true, areKnowledgeElementsResettable: true, expected: true },
      { multipleSendings: true, areKnowledgeElementsResettable: false, expected: false },
      { multipleSendings: false, areKnowledgeElementsResettable: true, expected: false },
      { multipleSendings: false, areKnowledgeElementsResettable: false, expected: false },
    ].forEach(({ multipleSendings, areKnowledgeElementsResettable, expected }) => {
      it(`should return ${expected} if campaign multipleSendings equal ${multipleSendings} and target profiles areKnowledgeElementsResettable equal ${areKnowledgeElementsResettable}`, async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({ areKnowledgeElementsResettable }).id;

        const campaignId = databaseBuilder.factory.buildCampaign({
          code: 'BADOIT710',
          multipleSendings,
          targetProfileId,
          type: 'ASSESSMENT',
        }).id;
        await databaseBuilder.commit();

        // when
        const canReset = await campaignRepository.areKnowledgeElementsResettable({
          id: campaignId,
        });

        // then
        expect(canReset).to.equal(expected);
      });
    });
  });

  describe('#findTubes', function () {
    it('should return the tubes for the campaign', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'toto' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tata' });
      databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'foo' });

      const campaignId = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        multipleSendings: true,
        targetProfileId,
        type: 'ASSESSMENT',
      }).id;
      await databaseBuilder.commit();

      // when
      const tubes = await campaignRepository.findTubes({ campaignId });

      // then
      expect(tubes).to.have.lengthOf(2);
      expect(tubes).to.have.members(['toto', 'tata']);
    });
  });

  describe('#findAllSkills', function () {
    it('should return the skills for the campaign', async function () {
      // given
      const framework = buildFramework({ id: 'frameworkId', name: 'someFramework' });
      const competenceId = 'competenceId';
      const skill1 = {
        id: 'recSK123',
        name: '@sau3',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId1',
        version: 1,
        level: 3,
      };
      const skill2 = {
        id: 'recSK456',
        name: '@sau4',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId2',
        version: 1,
        level: 4,
      };
      const skill3 = {
        id: 'recSK789',
        name: '@sau7',
        pixValue: 3,
        competenceId,
        tutorialIds: [],
        learningMoreTutorialIds: [],
        tubeId: 'tubeId3',
        version: 1,
        level: 7,
      };
      const tube1 = buildTube({ id: 'tubeId1', competenceId, skills: [skill1] });
      const tube2 = buildTube({ id: 'tubeId2', competenceId, skills: [skill2] });
      const tube3 = buildTube({ id: 'tubeId3', competenceId, skills: [skill3] });
      const area = buildArea({ id: 'areaId', frameworkId: framework.id });
      const competence = buildCompetence({ id: 'competenceId', area, tubes: [tube1, tube2, tube3] });
      const thematic = buildThematic({
        id: 'thematicId',
        competenceId: 'competenceId',
        tubeIds: ['tubeId1', 'tubeId2', 'tubeId3'],
      });
      competence.thematics = [thematic];
      area.competences = [competence];
      framework.areas = [area];
      const learningContent = buildLearningContent([framework]);
      mockLearningContent(learningContent);

      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId1' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId2' });
      databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'tubeId3' });

      const campaignId = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        multipleSendings: true,
        targetProfileId,
        type: 'ASSESSMENT',
      }).id;
      await databaseBuilder.commit();

      // When
      const skills = await campaignRepository.findAllSkills({ campaignId });

      // Then
      expect(skills).to.have.lengthOf(2);
      const expectedSkill1 = buildSkill({ ...skill1, difficulty: skill1.level });
      const expectedSkill2 = buildSkill({ ...skill2, difficulty: skill2.level });
      expect(skills).to.have.deep.members([expectedSkill1, expectedSkill2]);
    });
  });

  describe('#isCodeAvailable', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildCampaign({ code: 'BADOIT710' });
      await databaseBuilder.commit();
    });

    it('should resolve true if the code is available', async function () {
      // when
      const isCodeAvailable = await campaignRepository.isCodeAvailable('FRANCE998');

      // then
      expect(isCodeAvailable).to.be.true;
    });

    it('should resolve false if the code is not available', async function () {
      // when
      const isCodeAvailable = await campaignRepository.isCodeAvailable('BADOIT710');

      // then
      expect(isCodeAvailable).to.be.false;
    });
  });

  describe('#getByCode', function () {
    let campaign;
    beforeEach(async function () {
      campaign = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        createdAt: new Date('2018-02-06T14:12:45Z'),
        externalIdHelpImageUrl: 'some url',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      });
      await databaseBuilder.commit();
    });

    it('should resolve the campaign relies to the code', async function () {
      // when
      const actualCampaign = await campaignRepository.getByCode('BADOIT710');

      // then
      const checkedAttributes = [
        'id',
        'name',
        'code',
        'type',
        'createdAt',
        'archivedAt',
        'customLandingPageText',
        'idPixLabel',
        'externalIdHelpImageUrl',
        'alternativeTextToExternalIdHelpImage',
        'title',
      ];
      expect(_.pick(actualCampaign, checkedAttributes)).to.deep.equal(_.pick(campaign, checkedAttributes));
    });

    it('should resolve null if the code do not correspond to any campaign ', async function () {
      // when
      const result = await campaignRepository.getByCode('BIDULEFAUX');

      // then
      expect(result).to.be.null;
    });
  });

  describe('#save', function () {
    afterEach(async function () {
      await knex('campaign_skills').delete();
      return knex('campaigns').delete();
    });

    context('when campaign is of type ASSESSMENT', function () {
      it('should save the given campaign with type ASSESSMENT', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        await databaseBuilder.commit();

        const campaignToSave = {
          name: 'Evaluation niveau 1 recherche internet',
          code: 'BCTERD153',
          customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
          creatorId,
          ownerId,
          organizationId,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
          targetProfileId,
          title: 'Parcours recherche internet',
        };

        // when
        const savedCampaign = await campaignRepository.save(campaignToSave);

        // then
        expect(savedCampaign).to.be.instanceof(Campaign);
        expect(savedCampaign.id).to.exist;

        expect(savedCampaign).to.deep.include(
          _.pick(campaignToSave, [
            'name',
            'code',
            'title',
            'type',
            'customLandingPageText',
            'creator',
            'organization',
            'targetProfile',
            'multipleSendings',
            'ownerId',
          ]),
        );
      });

      context('when target profile has tubes', function () {
        it('should save the active skills of the target profile as campaign skills', async function () {
          // given
          const learningContent = {
            areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
            competences: [
              {
                id: 'recCompetence1',
                areaId: 'recArea1',
                tubeIds: ['recTube1', 'recTube2', 'recTube3'],
              },
            ],
            tubes: [
              {
                id: 'recTube1',
                skillIds: ['recArchivedSkill1Tube1', 'recActiveSkill2Tube1', 'recActiveSkill3Tube1'],
              },
              {
                id: 'recTube2',
                skillIds: ['recActiveSkill2Tube2', 'recArchivedSkill4Tube2', 'recActiveSkill6Tube2'],
              },
              {
                id: 'recTube3',
                skillIds: ['recArchivedSkill1Tube3', 'recArchivedSkill3Tube3', 'recActiveSkill8Tube3'],
              },
              {
                id: 'recTube4',
                skillIds: ['recSkillTube4'],
              },
            ],
            skills: [
              {
                id: 'recArchivedSkill1Tube1',
                name: 'archivedSkill1Tube1_1',
                status: 'archivé',
                level: 1,
                tubeId: 'recTube1',
              },
              {
                id: 'recActiveSkill2Tube1',
                name: 'activeSkill2Tube1_2',
                status: 'actif',
                level: 2,
                tubeId: 'recTube1',
              },
              {
                id: 'recActiveSkill3Tube1',
                name: 'activeSkill3Tube1_3',
                status: 'actif',
                level: 3,
                tubeId: 'recTube1',
              },
              {
                id: 'recActiveSkill2Tube2',
                name: 'activeSkill2Tube2_2',
                status: 'actif',
                level: 2,
                tubeId: 'recTube2',
              },
              {
                id: 'recArchivedSkill4Tube2',
                name: 'archivedSkill4Tube2_4',
                status: 'archivé',
                level: 4,
                tubeId: 'recTube2',
              },
              {
                id: 'recActiveSkill6Tube2',
                name: 'activeSkill6Tube2_6',
                status: 'actif',
                level: 6,
                tubeId: 'recTube2',
              },
              {
                id: 'recArchivedSkill1Tube3',
                name: 'archivedSkill1Tube3_1',
                status: 'archivé',
                level: 1,
                tubeId: 'recTube3',
              },
              {
                id: 'recArchivedSkill3Tube3',
                name: 'archivedSkill3Tube3_3',
                status: 'archivé',
                level: 3,
                tubeId: 'recTube3',
              },
              {
                id: 'recActiveSkill8Tube3',
                name: 'activeSkill8Tube3_8',
                status: 'actif',
                level: 8,
                tubeId: 'recTube3',
              },
              {
                id: 'recSkillTube4',
                name: 'skillTube4_1',
                status: 'actif',
                level: 1,
                tubeId: 'recTube4',
              },
            ],
          };
          mockLearningContent(learningContent);
          const user = databaseBuilder.factory.buildUser();
          const creatorId = user.id;
          const ownerId = databaseBuilder.factory.buildUser().id;
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 2 });
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 8 });
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube3', level: 3 });
          // random tube
          databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'recTube4' });
          await databaseBuilder.commit();

          const campaignToSave = {
            name: 'Evaluation niveau 1 recherche internet',
            code: 'BCTERD153',
            customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
            creatorId,
            ownerId,
            organizationId,
            multipleSendings: true,
            type: CampaignTypes.ASSESSMENT,
            targetProfileId,
            title: 'Parcours recherche internet',
          };

          // when
          const savedCampaign = await campaignRepository.save(campaignToSave);

          // then
          const skillIds = await knex('campaign_skills')
            .pluck('skillId')
            .where('campaignId', savedCampaign.id)
            .orderBy('skillId', 'ASC');
          expect(skillIds).to.deepEqualArray(['recActiveSkill2Tube1', 'recActiveSkill2Tube2', 'recActiveSkill6Tube2']);
        });
      });

      it('should not save anything if something goes wrong between campaign creation and skills computation', async function () {
        // given
        const skillRepository = {
          findActiveByTubeId: sinon.stub().rejects(new Error('Forcing rollback')),
        };
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
          competences: [
            {
              id: 'recCompetence1',
              areaId: 'recArea1',
              tubeIds: ['recTube1', 'recTube2', 'recTube3'],
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              skillIds: ['recSkill1'],
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              name: 'recSkill1',
              status: 'actif',
              level: 1,
              tubeId: 'recTube1',
            },
          ],
        };
        mockLearningContent(learningContent);
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 2 });
        await databaseBuilder.commit();
        const campaignToSave = {
          name: 'Evaluation niveau 1 recherche internet',
          code: 'BCTERD153',
          customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
          creatorId,
          ownerId,
          organizationId,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
          targetProfileId,
          title: 'Parcours recherche internet',
        };

        // when
        await catchErr(campaignRepository.save)(campaignToSave, { skillRepository });

        // then
        const skillIds = await knex('campaign_skills').pluck('skillId');
        const campaignIds = await knex('campaigns').pluck('id');
        expect(skillIds).to.be.empty;
        expect(campaignIds).to.be.empty;
      });
    });

    context('when assessment method is `flash`', function () {
      it('should not save any skills', async function () {
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });

        await databaseBuilder.commit();

        const campaignToSave = {
          name: 'Evaluation niveau 1 recherche internet',
          code: 'BCTERD153',
          customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
          creatorId,
          ownerId,
          organizationId,
          multipleSendings: true,
          type: CampaignTypes.ASSESSMENT,
          assessmentMethod: 'FLASH',
          targetProfileId: null,
          title: 'Parcours recherche internet',
        };

        const savedCampaign = await campaignRepository.save(campaignToSave);

        const skillIds = await knex('campaign_skills').pluck('skillId').where('campaignId', savedCampaign.id);
        expect(skillIds).to.deepEqualArray([]);
      });
    });

    it('should save the given campaign with type PROFILES_COLLECTION', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const creatorId = user.id;
      const ownerId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
      await databaseBuilder.commit();

      const campaignAttributes = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId,
        ownerId,
        organizationId,
        multipleSendings: true,
      };

      const campaignToSave = { ...campaignAttributes, type: CampaignTypes.PROFILES_COLLECTION };

      // when
      const savedCampaign = await campaignRepository.save(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(
        _.pick(campaignToSave, [
          'name',
          'code',
          'title',
          'type',
          'customLandingPageText',
          'creator',
          'organization',
          'multipleSendings',
          'ownerId',
        ]),
      );
      const skillIds = await knex('campaign_skills').pluck('skillId').where('campaignId', savedCampaign.id);
      expect(skillIds).to.be.empty;
    });

    context('when there are several campaigns', function () {
      it('should save the given campaigns', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        await databaseBuilder.commit();

        const campaignsToSave = [
          {
            name: 'Evaluation niveau 1 recherche internet',
            code: 'ACTERD153',
            customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
            creatorId,
            ownerId,
            organizationId,
            multipleSendings: true,
            type: CampaignTypes.ASSESSMENT,
            targetProfileId,
            title: 'Parcours recherche internet',
            customResultPageText: null,
            customResultPageButtonText: null,
            customResultPageButtonUrl: null,
          },
          {
            name: 'Evaluation niveau 1 recherche internet #2',
            code: 'BCTERD153',
            customLandingPageText: 'Parcours évaluatif concernant la recherche internet #2',
            creatorId,
            ownerId,
            organizationId,
            multipleSendings: true,
            type: CampaignTypes.ASSESSMENT,
            targetProfileId,
            title: 'Parcours recherche internet #2',
            customResultPageText: 'Bravo !',
            customResultPageButtonText: 'Cliquez ici',
            customResultPageButtonUrl: 'https://hmpg.net/',
          },
        ];

        // when
        await campaignRepository.save(campaignsToSave);

        // then
        const savedCampaigns = await knex('campaigns')
          .select(
            'name',
            'code',
            'title',
            'type',
            'customLandingPageText',
            'creatorId',
            'organizationId',
            'targetProfileId',
            'multipleSendings',
            'ownerId',
            'customResultPageText',
            'customResultPageButtonText',
            'customResultPageButtonUrl',
          )
          .orderBy('code');

        expect(savedCampaigns[0]).to.deep.include(
          _.pick(campaignsToSave[0], [
            'name',
            'code',
            'title',
            'type',
            'customLandingPageText',
            'creator',
            'organization',
            'targetProfile',
            'multipleSendings',
            'ownerId',
            'customResultPageText',
            'customResultPageButtonText',
            'customResultPageButtonUrl',
          ]),
        );

        expect(savedCampaigns[1]).to.deep.include(
          _.pick(campaignsToSave[1], [
            'name',
            'code',
            'title',
            'type',
            'customLandingPageText',
            'creator',
            'organization',
            'targetProfile',
            'multipleSendings',
            'ownerId',
            'customResultPageText',
            'customResultPageButtonText',
            'customResultPageButtonUrl',
          ]),
        );
      });
    });
  });

  describe('#get', function () {
    let campaign;

    beforeEach(function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({ id: 1, name: 'My campaign', targetProfile });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);

      return databaseBuilder.commit();
    });

    it('should return a Campaign by her id', async function () {
      // when
      const result = await campaignRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
    });

    it('should throw a NotFoundError if campaign can not be found', function () {
      // given
      const nonExistentId = 666;
      // when
      const promise = campaignRepository.get(nonExistentId);
      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });

  describe('#update', function () {
    let campaign;

    beforeEach(function () {
      campaign = databaseBuilder.factory.buildCampaign();

      return databaseBuilder.commit();
    });

    it('should return a Campaign domain object', async function () {
      // when
      const campaignSaved = await campaignRepository.update({ id: campaign.id, title: 'Title' });

      // then
      expect(campaignSaved).to.be.an.instanceof(Campaign);
    });

    it('should update the correct campaign', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'MASH' }).id;
      await databaseBuilder.commit();

      // when
      await campaignRepository.update({ id: campaign.id, title: 'Title' });
      const row = await knex.from('campaigns').where({ id: campaignId }).first();

      // then
      expect(row.title).to.equal('MASH');
    });

    it('should not add row in table "campaigns"', async function () {
      // given
      const rowsCountBeforeUpdate = await knex.select('id').from('campaigns');
      // when
      await campaignRepository.update({ id: campaign.id, title: 'Title' });

      // then
      const rowCountAfterUpdate = await knex.select('id').from('campaigns');
      expect(rowCountAfterUpdate.length).to.equal(rowsCountBeforeUpdate.length);
    });

    it('should update model in database', async function () {
      // given
      const archivedBy = databaseBuilder.factory.buildUser().id;
      const ownerId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const campaignSaved = await campaignRepository.update({
        id: campaign.id,
        title: 'New title',
        name: 'New name',
        customLandingPageText: 'New text',
        archivedAt: new Date('2020-12-12T06:07:08Z'),
        archivedBy,
        ownerId,
      });

      // then
      expect(campaignSaved.id).to.equal(campaign.id);
      expect(campaignSaved.name).to.equal('New name');
      expect(campaignSaved.title).to.equal('New title');
      expect(campaignSaved.customLandingPageText).to.equal('New text');
      expect(campaignSaved.archivedAt).to.deep.equal(new Date('2020-12-12T06:07:08Z'));
      expect(campaignSaved.archivedBy).to.equal(archivedBy);
      expect(campaignSaved.ownerId).to.equal(ownerId);
    });
  });

  describe('#checkIfUserOrganizationHasAccessToCampaign', function () {
    let userId,
      ownerId,
      organizationId,
      userWithDisabledMembershipId,
      forbiddenUserId,
      forbiddenOrganizationId,
      campaignId;
    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      ownerId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ userId: ownerId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      forbiddenOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: forbiddenUserId, organizationId: forbiddenOrganizationId });

      userWithDisabledMembershipId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        userId: userWithDisabledMembershipId,
        organizationId,
        disabledAt: new Date('2020-01-01'),
      });

      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();
    });

    it('should return true when the user is a member of an organization that owns the campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

      //then
      expect(access).to.be.true;
    });

    it('should return false when the user is not a member of an organization that owns campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, forbiddenUserId);

      //then
      expect(access).to.be.false;
    });

    it('should return false when the user is a disabled membership of the organization that owns campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
        campaignId,
        userWithDisabledMembershipId,
      );

      //then
      expect(access).to.be.false;
    });
  });

  describe('#getCampaignTitleByCampaignParticipationId', function () {
    it('should return campaign title when campaign has one', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'Parcours trop bien' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(campaignParticipationId);

      // then
      expect(title).to.equal('Parcours trop bien');
    });

    it('should return null when campaign has no title', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: null }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(campaignParticipationId);

      // then
      expect(title).to.be.null;
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(123);

      // then
      expect(title).to.be.null;
    });

    it('should return the title from the given campaignParticipationId', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'Parcours trop bien' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      const otherCampaignId = databaseBuilder.factory.buildCampaign({ title: 'Autre' }).id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(otherCampaignParticipationId);

      // then
      expect(title).to.equal('Autre');
    });
  });

  describe('#getCampaignCodeByCampaignParticipationId', function () {
    it('should return campaign code when campaign has one', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN1' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(campaignParticipationId);

      // then
      expect(code).to.equal('CAMPAIGN1');
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(123);

      // then
      expect(code).to.be.null;
    });

    it('should return the code from the given campaignParticipationId', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN1' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      const otherCampaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN2' }).id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      }).id;
      await databaseBuilder.commit();

      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(otherCampaignParticipationId);

      // then
      expect(code).to.equal('CAMPAIGN2');
    });
  });

  describe('#getCampaignIdByCampaignParticipationId', function () {
    it('should return campaign id', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

      // then
      expect(campaignId).to.equal(campaign.id);
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(123);

      // then
      expect(campaignId).to.be.null;
    });

    it('should return the campaign id from the given campaignParticipationId', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;

      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      });
      await databaseBuilder.commit();

      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

      // then
      expect(campaignId).to.equal(campaign.id);
    });
  });
});
