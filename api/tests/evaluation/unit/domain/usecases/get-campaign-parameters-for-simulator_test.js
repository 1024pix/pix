import { getCampaignParametersForSimulator } from '../../../../../src/evaluation/domain/usecases/get-campaign-parameters-for-simulator.js';
import { expect, sinon } from '../../../../test-helper.js';
import { buildChallenge } from '../../../../tooling/domain-builder/factory/index.js';

describe('Unit | UseCase | get-campaign-parameters-for-simulator', function () {
  describe('#getCampaignParametersForSimulator', function () {
    let campaignRepository;
    let challengeRepository;

    beforeEach(function () {
      campaignRepository = {
        findSkills: sinon.stub(),
      };

      challengeRepository = {
        findOperativeBySkills: sinon.stub(),
      };
    });

    it('should return skills and sanitized challenges', function () {
      const campaignSKills = Symbol('campaignSkills');
      const challenges = [
        buildChallenge({ id: 'rec1' }),
        buildChallenge({
          id: 'rec2',
          instruction:
            'Des instructions qui devraient être tronquées à partir de 130 caractères pour éviter le spoil, des instructions qui devraient être tronquées à partir de 130 caractères pour éviter le spoil',
        }),
      ];

      // given
      campaignRepository.findSkills
        .withArgs({
          campaignId: 12,
        })
        .resolves(campaignSKills);

      challengeRepository.findOperativeBySkills.withArgs(campaignSKills, 'fr').resolves(challenges);

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
            timer: undefined,
            type: 'QCM',
            locales: ['fr'],
            skill: challenges[0].skill,
            focused: false,
            difficulty: 0,
            responsive: 'Smartphone/Tablette',
          },
          {
            id: 'rec2',
            format: 'petit',
            instruction:
              'Des instructions qui devraient être tronquées à partir de 130 caractères pour éviter le spoil, des instructions qui devraient être',
            status: 'validé',
            timer: undefined,
            type: 'QCM',
            locales: ['fr'],
            skill: challenges[1].skill,
            focused: false,
            difficulty: 0,
            responsive: 'Smartphone/Tablette',
          },
        ],
      });
    });
  });
});
