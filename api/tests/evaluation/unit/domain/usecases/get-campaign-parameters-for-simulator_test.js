import sinon from 'sinon';

import { getCampaignParametersForSimulator } from '../../../../../src/evaluation/domain/usecases/get-campaign-parameters-for-simulator.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | get-campaign-parameters-for-simulator', function () {
  describe('#getCampaignParametersForSimulator', function () {
    let campaignRepository;
    let challengeRepository;

    beforeEach(function () {
      campaignRepository = {
        findSkills: sinon.stub(),
        get: sinon.stub(),
      };

      challengeRepository = {
        findOperativeChallengeDtosBySkillsAndLocales: sinon.stub(),
      };
    });

    it('should return skills and sanitized challenges', function () {
      const skill1 = domainBuilder.buildSkill({ id: 'skillId1', difficulty: 2 });
      const skill2 = domainBuilder.buildSkill({ id: 'skillId2', difficulty: 3 });
      const campaignSKills = [skill1, skill2];
      const challenges = [
        domainBuilder.learningContent.buildChallenge({
          id: 'rec1',
          format: 'petit',
          instruction: 'Des instructions',
          status: 'validé',
          timer: null,
          type: 'QCM',
          locales: ['fr'],
          skillId: 'skillId1',
          focusable: false,
          difficulty: 0,
          responsive: 'Smartphone/Tablette',
        }),
        domainBuilder.learningContent.buildChallenge({
          id: 'rec2',
          format: 'grand',
          instruction:
            'Des instructions qui devraient être tronquées à partir de 130 caractères pour éviter le spoil, des instructions qui devraient être tronquées à partir de 130 caractères pour éviter le spoil',
          status: 'archivé',
          timer: 190,
          type: 'QCU',
          locales: ['fr'],
          skillId: 'skillId2',
          focusable: true,
          difficulty: 3,
          responsive: 'Tablette',
        }),
      ];

      // given
      campaignRepository.get.withArgs(12).resolves({ id: 12 });

      campaignRepository.findSkills
        .withArgs({
          campaignId: 12,
        })
        .resolves(campaignSKills);

      challengeRepository.findOperativeChallengeDtosBySkillsAndLocales
        .withArgs(campaignSKills, ['fr'])
        .resolves(challenges);

      // when
      const result = getCampaignParametersForSimulator({
        campaignId: 12,
        locale: 'fr',
        campaignRepository,
        challengeRepository,
      });

      // then
      return expect(result).to.eventually.deep.equal({
        skills: campaignSKills,
        challenges: [
          {
            id: 'rec1',
            format: 'petit',
            instruction: 'Des instructions',
            status: 'validé',
            timer: null,
            type: 'QCM',
            locales: ['fr'],
            skill: skill1,
            focused: false,
            difficulty: 2,
            responsive: 'Smartphone/Tablette',
          },
          {
            id: 'rec2',
            format: 'grand',
            instruction:
              'Des instructions qui devraient être tronquées à partir de 130 caractères pour éviter le spoil, des instructions qui devraient être',
            status: 'archivé',
            timer: 190,
            type: 'QCU',
            locales: ['fr'],
            skill: skill2,
            focused: true,
            difficulty: 3,
            responsive: 'Tablette',
          },
        ],
      });
    });
  });
});
