const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-tutorial-serializer');

describe('Unit | Serializer | JSONAPI | user-tutorial-serializer', () => {

  describe('#serialize', () => {

    it('should serialize', () => {
      // given
      const userId = 'userId';
      const tutorialId = 'createdTutorialId';
      const expectedJsonUserTutorial = {
        data: {
          type: 'user-tutorials',
          id: 'userId_createdTutorialId',
        }
      };
      // when
      const json = serializer.serialize({ userId, tutorialId });

      // then
      expect(json).to.be.deep.equal(expectedJsonUserTutorial);
    });
  });

});

