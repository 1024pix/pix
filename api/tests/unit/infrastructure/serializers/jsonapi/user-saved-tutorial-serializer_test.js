import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/user-saved-tutorial-serializer';
import UserSavedTutorial from '../../../../../lib/domain/models/UserSavedTutorial';

describe('Unit | Serializer | JSONAPI | user-saved-tutorial-serializer', function () {
  describe('#serialize', function () {
    context('when there is only user saved tutorial', function () {
      it('should serialize', function () {
        // given
        const userSavedTutorial = {
          id: 'userSavedTutorialId',
          userId: 'userId',
          tutorialId: 'tutorialId',
          skillId: 'skillId',
        };
        const expectedJsonUserSavedTutorial = {
          data: {
            type: 'user-saved-tutorials',
            id: 'userSavedTutorialId',
            attributes: {
              'user-id': 'userId',
              'tutorial-id': 'tutorialId',
              'skill-id': 'skillId',
            },
          },
        };
        // when
        const json = serializer.serialize(userSavedTutorial);

        // then
        expect(json).to.be.deep.equal(expectedJsonUserSavedTutorial);
      });
    });

    context('when there is user saved tutorial and tutorial', function () {
      it('should serialize', function () {
        // given
        const tutorial = domainBuilder.buildTutorial({ id: 'tutorialId' });
        const userSavedTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial({
          id: 123,
          userId: 456,
          tutorial,
          skillId: 'skillId',
        });
        const expectedJsonUserSavedTutorial = {
          data: {
            type: 'user-saved-tutorials',
            id: '123',
            attributes: {
              'user-id': 456,
              'skill-id': 'skillId',
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
        const json = serializer.serialize(userSavedTutorialWithTutorial);

        // then
        expect(json).to.be.deep.equal(expectedJsonUserSavedTutorial);
      });
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data into an User model object', function () {
      // given
      const jsonUserSavedTutorial = {
        data: {
          id: 123,
          type: 'user-saved-tutorials',
          attributes: {
            'skill-id': 'skillId',
          },
          relationships: {},
        },
      };

      // when
      const userSavedTutorial = serializer.deserialize(jsonUserSavedTutorial);

      // then
      expect(userSavedTutorial).to.be.instanceOf(UserSavedTutorial);
      expect(userSavedTutorial.id).to.be.equal(123);
      expect(userSavedTutorial.skillId).to.be.equal('skillId');
    });
  });
});
