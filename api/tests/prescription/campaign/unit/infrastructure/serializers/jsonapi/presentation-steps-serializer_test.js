import * as serializer from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/presentation-steps-serializer.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | Campaign Presentation Steps Serializer', function () {
  describe('#serialize()', function () {
    it('should convert a presentation steps object into JSON API data', function () {
      // given
      const campaignPresentationStepsId = '1_presentation-steps';
      const customLandingPageText = 'lorem ipsum';

      const competences = [
        domainBuilder.buildCompetence({
          id: 'competence1',
        }),
        domainBuilder.buildCompetence({
          id: 'competence2',
        }),
      ];

      const badges = [
        domainBuilder.buildBadge({
          id: 1,
        }),
        domainBuilder.buildBadge({
          id: 2,
        }),
      ];

      const presentationSteps = { id: campaignPresentationStepsId, customLandingPageText, competences, badges };

      // when
      const json = serializer.serialize(presentationSteps);

      // then
      expect(json).to.deep.equal({
        data: {
          id: campaignPresentationStepsId,
          type: 'campaign-presentation-steps',
          attributes: {
            'custom-landing-page-text': customLandingPageText,
          },
          relationships: {
            badges: {
              data: [
                { id: '1', type: 'badges' },
                { id: '2', type: 'badges' },
              ],
            },
            competences: {
              data: [
                { id: 'competence1', type: 'competences' },
                { id: 'competence2', type: 'competences' },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              'alt-message': 'altMessage',
              'image-url': '/img/banana',
              'is-always-visible': false,
              'is-certifiable': false,
              key: 'key',
              message: 'message',
              title: 'title',
            },
            id: '1',
            type: 'badges',
          },
          {
            attributes: {
              'alt-message': 'altMessage',
              'image-url': '/img/banana',
              'is-always-visible': false,
              'is-certifiable': false,
              key: 'key',
              message: 'message',
              title: 'title',
            },
            id: '2',
            type: 'badges',
          },
          {
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'competence1',
            type: 'competences',
          },
          {
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'competence2',
            type: 'competences',
          },
        ],
      });
    });
  });
});
