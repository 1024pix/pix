const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');

describe('Unit | Serializer | JSONAPI | user-tutorial-serializer', function () {
  describe('#serialize', function () {
    context('when there is only user tutorial', function () {
      it('should serialize', function () {
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
            },
          },
        };
        // when
        const json = serializer.serialize(userTutorial);

        // then
        expect(json).to.be.deep.equal(expectedJsonUserTutorial);
      });
    });
  });

  context('when there is user tutorial and tutorial', function () {
    it('should serialize', function () {
      // given
      const tutorial = domainBuilder.buildTutorial({ id: 'tutorialId' });
      const userTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial({
        id: 123,
        userId: 456,
        tutorial,
      });
      const expectedJsonUserTutorial = {
        data: {
          type: 'user-tutorials',
          id: '123',
          attributes: {
            'user-id': 456,
          },
          relationships: {
            tutorial: {
              data: {
                id: 'tutorialId',
                type: 'tutorials',
              },
            },
          },
        },
        included: [
          {
            attributes: {
              duration: '00:01:30',
              format: 'video',
              id: 'tutorialId',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Savoir regarder des vidéos youtube.',
            },
            id: 'tutorialId',
            type: 'tutorials',
          },
        ],
      };
      // when
      const json = serializer.serialize(userTutorialWithTutorial);

      // then
      expect(json).to.be.deep.equal(expectedJsonUserTutorial);
    });
  });
});
