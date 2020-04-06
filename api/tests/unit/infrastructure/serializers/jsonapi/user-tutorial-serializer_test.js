const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');

describe('Unit | Serializer | JSONAPI | user-tutorial-serializer', () => {

  describe('#serialize', () => {

    context('when there is only user tutorial', () => {
      it('should serialize', () => {
        // given
        const userTutorial = {
          id: 'userTutorialId',
          userId: 'userId',
          tutorialId: 'tutorialId',
        };
        const expectedJsonUserTutorial = {
          data: {
            type: 'user-tutorials',
            id: 'userTutorialId',
            attributes: {
              'user-id': 'userId',
              'tutorial-id': 'tutorialId',
            }
          }
        };
        // when
        const json = serializer.serialize(userTutorial);

        // then
        expect(json).to.be.deep.equal(expectedJsonUserTutorial);
      });
    });
  });

  context('when there is user tutorial and tutorial', () => {
    it('should serialize', () => {
      // given
      const userTutorial = {
        id: 'userTutorialId',
        userId: 'userId',
        tutorial: domainBuilder.buildTutorial({ id: 'tutorialId' }),
      };

      const expectedJsonUserTutorial = {
        data: {
          type: 'user-tutorials',
          id: 'userTutorialId',
          attributes: {
            'user-id': 'userId',
          },
          relationships: {
            tutorial: {
              data: {
                id: 'tutorialId',
                type: 'tutorials',
              }
            },
          },
        },
        included: [{
          attributes: {
            duration: '00:01:30',
            format: 'video',
            id: 'tutorialId',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
          },
          'id': 'tutorialId',
          'type': 'tutorials',
        }],
      };
      // when
      const json = serializer.serialize(userTutorial);

      // then
      expect(json).to.be.deep.equal(expectedJsonUserTutorial);
    });
  });
});
