import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-result-minimal-serializer';

describe('Unit | Serializer | JSONAPI | campaign-assessment-result-minimal-serializer', function () {
  describe('#serialize campaign-assessment-result-minimal list', function () {
    it('serialize ', function () {
      // given
      const participations = [
        {
          campaignParticipationId: '1',
          firstName: 'John',
          lastName: 'McClane',
          participantExternalId: 'Cop',
          masteryRate: 1,
        },
        {
          campaignParticipationId: '2',
          firstName: 'Hans',
          lastName: 'Gruber',
          participantExternalId: 'Thief',
          masteryRate: 0.99,
          badges: [domainBuilder.buildBadge({ id: 1, title: 'b1', imageUrl: 'http://toto.svg', altMessage: 'alt' })],
        },
      ];
      const pagination = {
        page: {
          number: 1,
          pageSize: 2,
        },
      };

      const resultsSerialized = serializer.serialize({ participations, pagination });

      expect(resultsSerialized).to.deep.equal({
        data: [
          {
            type: 'campaign-assessment-result-minimals',
            id: '1',
            attributes: {
              'first-name': 'John',
              'last-name': 'McClane',
              'participant-external-id': 'Cop',
              'mastery-rate': 1,
            },
          },
          {
            type: 'campaign-assessment-result-minimals',
            id: '2',
            attributes: {
              'first-name': 'Hans',
              'last-name': 'Gruber',
              'participant-external-id': 'Thief',
              'mastery-rate': 0.99,
            },
            relationships: {
              badges: {
                data: [
                  {
                    id: '1',
                    type: 'badges',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            attributes: {
              'image-url': 'http://toto.svg',
              title: 'b1',
              'alt-message': 'alt',
            },
            id: '1',
            type: 'badges',
          },
        ],
        meta: {
          page: {
            number: 1,
            pageSize: 2,
          },
        },
      });
    });
  });
});
