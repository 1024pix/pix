const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');

describe('Unit | Serializer | JSONAPI | user-tutorial-serializer', () => {

  describe('#serialize', () => {

    context('when there is only user tutorial', () => {
      it('should serialize', () => {
        // given
        const userId = 'userId';
        const tutorialId = 'createdTutorialId';
        const expectedJsonUserTutorial = {
          data: {
            type: 'user-tutorials',
            id: 'userId_createdTutorialId',
            attributes: {},
            relationships: {
              tutorial: {
                data: null
              },
            },
          }
        };
        // when
        const json = serializer.serialize({ userId, tutorialId });

        // then
        expect(json).to.be.deep.equal(expectedJsonUserTutorial);
      });
    });
  });

  context('when there is user tutorial and tutorial', () => {
    it('should serialize', () => {
      // given
      const userId = 'userId';
      const tutorialId = 'createdTutorialId';
      const tutorial = domainBuilder.buildTutorial({ id: tutorialId });

      const expectedJsonUserTutorial = {
        data: {
          type: 'user-tutorials',
          id: 'userId_createdTutorialId',
          attributes: {},
          relationships: {
            tutorial: {
              data: {
                id: 'createdTutorialId',
                type: 'tutorials',
              }
            },
          },
        },
        included: [{
          attributes: {
            duration: '00:01:30',
            format: 'video',
            id: 'createdTutorialId',
            'is-saved': true,
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
          },
          'id': 'createdTutorialId',
          'type': 'tutorials',
        }],
      };
      // when
      const json = serializer.serialize({ userId, tutorial });

      // then
      expect(json).to.be.deep.equal(expectedJsonUserTutorial);
    });
  });
});
