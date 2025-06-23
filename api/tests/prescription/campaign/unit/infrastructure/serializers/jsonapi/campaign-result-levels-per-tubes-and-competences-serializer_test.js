import { expect } from 'chai';

import * as serializer from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/campaign-result-levels-per-tubes-and-competences-serializer.js';
import { domainBuilder } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | campaign-result-levels-per-tubes-and-competences-serializer', function () {
  describe('#serialize', function () {
    it('should convert CampaignResultLevelPerTubesAndCompetences acquisitions statistics into JSON API data', function () {
      const campaignId = 1;
      const model = domainBuilder.prescription.campaign.buildCampaignResultLevelsPerTubesAndCompetences();
      const json = serializer.serialize(model);

      expect(json).to.deep.equal({
        data: {
          type: 'campaign-result-levels-per-tubes-and-competences',
          id: `${campaignId}`,
          attributes: {
            'max-reachable-level': 3.0,
            'mean-reached-level': 0.3,
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
          },
        },
        included: [
          {
            attributes: {
              'competence-id': 'competence1',
              'competence-name': 'compétence 1',
              'max-level': 3.0,
              'mean-level': 0.3,
              description: 'tube 1 description',
              title: 'tube 1',
            },
            id: 'tube1',
            type: 'levelsPerTubes',
          },
          {
            attributes: {
              description: 'description compétence 1',
              index: '1.1',
              'max-level': 3.0,
              'mean-level': 0.3,
              name: 'compétence 1',
            },
            relationships: {
              'levels-per-tube': {
                data: [
                  {
                    id: 'tube1',
                    type: 'levelsPerTubes',
                  },
                ],
              },
            },
            id: 'competence1',
            type: 'levelsPerCompetences',
          },
        ],
      });
    });
  });
});
