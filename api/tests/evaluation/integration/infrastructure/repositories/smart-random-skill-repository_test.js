import * as smartRandomSkillRepository from '../../../../../src/evaluation/infrastructure/repositories/smart-random-skill-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Integration | Infrastructure| Repository | smart-random-skill-repository', function () {
  describe('#findActiveByCompetenceId', function () {
    context('when no skills match the constraints', function () {
      it('returns an empty array', async function () {
        const someSkillData = {
          id: 'skillA',
          competenceId: 'competenceA',
        };
        databaseBuilder.factory.learningContent.build(
          {
            skills: [someSkillData],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomSkills = await smartRandomSkillRepository.findActiveByCompetenceId('competenceB');

        expect(smartRandomSkills).to.deep.equal([]);
      });
    });

    context('when some skills match the constraints', function () {
      it('returns the smart random skills ordered by id', async function () {
        const notMatchingSkillData = {
          id: 'skillNotMatching',
          competenceId: 'competenceA',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        const rightCompetenceWrongStatusData = {
          id: 'rightCompetenceWrongStatusData',
          competenceId: 'competenceOK',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        const rightStatusWrongCompetenceData = {
          id: 'rightStatusWrongCompetenceData',
          competenceId: 'competenceNONO',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        const matchingSkill1 = {
          id: 'skillZ',
          name: '@coucou1',
          level: 1,
          competenceId: 'competenceOK',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        const matchingSkill2 = {
          id: 'skillA',
          name: '@fruits5',
          level: 5,
          competenceId: 'competenceOK',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        databaseBuilder.factory.learningContent.build(
          {
            skills: [
              notMatchingSkillData,
              rightCompetenceWrongStatusData,
              rightStatusWrongCompetenceData,
              matchingSkill1,
              matchingSkill2,
            ],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomSkills = await smartRandomSkillRepository.findActiveByCompetenceId('competenceOK');

        expect(smartRandomSkills).to.deepEqualArray([
          domainBuilder.evaluation.buildSmartRandomSkill({
            ...matchingSkill2,
            difficulty: matchingSkill2.level,
          }),
          domainBuilder.evaluation.buildSmartRandomSkill({
            ...matchingSkill1,
            difficulty: matchingSkill1.level,
          }),
        ]);
      });
    });
  });

  describe('#findOperativeByCampaignParticipationId', function () {
    let campaignId, campaignParticipationId;
    const skillIdInCampaign1 = 'skill1FromCampaign';
    const skillIdInCampaign2 = 'skill2FromCampaign';
    const skillIdInCampaign3 = 'skill3FromCampaign';
    beforeEach(function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillIdInCampaign1 });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillIdInCampaign2 });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skillIdInCampaign3 });
      return databaseBuilder.commit();
    });

    context('when no skills match the constraints', function () {
      it('returns an empty array', async function () {
        const someSkillData = {
          id: 'skillNotInCampaign',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        databaseBuilder.factory.learningContent.build(
          {
            skills: [someSkillData],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomSkills =
          await smartRandomSkillRepository.findOperativeByCampaignParticipationId(campaignParticipationId);

        expect(smartRandomSkills).to.deep.equal([]);
      });
    });

    context('when some skills match the constraints', function () {
      it('returns the smart random skills ordered by id', async function () {
        const notMatchingSkillData = {
          id: 'skillNotInCampaign',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        const rightCampaignWrongStatusData = {
          id: skillIdInCampaign3,
          status: domainBuilder.learningContent.buildSkill.STATUSES.OBSOLETE,
        };
        const rightStatusWrongCampaignData = {
          id: 'rightStatusWrongCampaignData',
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        const matchingSkill1 = {
          id: skillIdInCampaign2,
          name: '@coucou1',
          level: 1,
          status: domainBuilder.learningContent.buildSkill.STATUSES.ACTIVE,
        };
        const matchingSkill2 = {
          id: skillIdInCampaign1,
          name: '@fruits5',
          level: 5,
          status: domainBuilder.learningContent.buildSkill.STATUSES.ARCHIVED,
        };
        databaseBuilder.factory.learningContent.build(
          {
            skills: [
              notMatchingSkillData,
              rightCampaignWrongStatusData,
              rightStatusWrongCampaignData,
              matchingSkill1,
              matchingSkill2,
            ],
          },
          { noDefaultValues: true },
        );
        await databaseBuilder.commit();

        const smartRandomSkills =
          await smartRandomSkillRepository.findOperativeByCampaignParticipationId(campaignParticipationId);

        expect(smartRandomSkills).to.deepEqualArray([
          domainBuilder.evaluation.buildSmartRandomSkill({
            ...matchingSkill2,
            difficulty: matchingSkill2.level,
          }),
          domainBuilder.evaluation.buildSmartRandomSkill({
            ...matchingSkill1,
            difficulty: matchingSkill1.level,
          }),
        ]);
      });
    });
  });
});
