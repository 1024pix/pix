import { expect } from 'chai';

import * as serializer from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/campaign-result-levels-per-tubes-and-competences-serializer.js';
import { domainBuilder } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | campaign-result-levels-per-tubes-and-competences-serializer', function () {
  describe('#serialize', function () {
    it('should convert CampaignResultLevelPerTubesAndCompentences acquisitions statistics into JSON API data', function () {
      const campaignId = 1;
      const model = domainBuilder.prescription.campaign.buildCampaignResultLevelsPerTubesAndCompetences();
      const json = serializer.serialize(model);

      expect(json).to.deep.equal({
        data: {
          type: 'campaign-result-levels-per-tubes-and-competences',
          id: `${campaignId}`,
          attributes: {
            'max-reachable-level': 1,
            'mean-reached-level': 0.5,
          },
          relationships: {
            'levels-per-competence': {
              data: [
                {
                  id: 'competence1',
                  type: 'levelsPerCompetences',
                },
              ],
            },
            'levels-per-tube': {
              data: [
                {
                  id: 'tube1',
                  type: 'levelsPerTubes',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              'competence-id': 'competence1',
              'max-level': 1,
              'mean-level': 0.5,
              'practical-description': 'tube 1 description',
              'practical-title': 'tube 1',
            },
            id: 'tube1',
            type: 'levelsPerTubes',
          },
          {
            attributes: {
              description: 'description compétence 1',
              index: '1.1',
              'max-level': 1,
              'mean-level': 0.5,
              name: 'compétence 1',
            },
            id: 'competence1',
            type: 'levelsPerCompetences',
          },
        ],
      });
    });
  });
});
