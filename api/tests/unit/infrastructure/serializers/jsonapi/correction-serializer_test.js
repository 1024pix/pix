import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/correction-serializer';
import Correction from '../../../../../lib/domain/models/Correction';
import Hint from '../../../../../lib/domain/models/Hint';
import TutorialForUser from '../../../../../lib/domain/read-models/TutorialForUser';
import UserSavedTutorial from '../../../../../lib/domain/models/UserSavedTutorial';
import TutorialEvaluation from '../../../../../lib/domain/models/TutorialEvaluation';

describe('Unit | Serializer | JSONAPI | correction-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a Correction model object into JSON API data', function () {
      const userSavedTutorial1 = new UserSavedTutorial({
        id: 'userSavedTutorial1',
        userId: 'userId',
        tutorialId: 'recTuto1',
      });
      const userSavedTutorial2 = new UserSavedTutorial({
        id: 'userSavedTutorial2',
        userId: 'userId',
        tutorialId: 'recTuto2',
      });
      const userSavedTutorial5 = new UserSavedTutorial({
        id: 'userSavedTutorial5',
        userId: 'userId',
        tutorialId: 'recTuto5',
      });

      const tutorialEvaluation1 = new TutorialEvaluation({
        id: 10000,
        userId: 'userId',
        tutorialId: 'recTuto1',
        status: TutorialEvaluation.statuses.LIKED,
      });
      const correction = new Correction({
        id: 'correction_id',
        solution: 'Correction value',
        solutionToDisplay: 'Correction to be displayed',
        hint: new Hint({ skillName: '@test1', value: 'Indice Facile' }),
        tutorials: [
          new TutorialForUser({
            id: 'recTuto1',
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Comment dresser un panda',
            userSavedTutorial: userSavedTutorial1,
            tutorialEvaluation: tutorialEvaluation1,
            skillId: 'skill1',
          }),
          new TutorialForUser({
            id: 'recTuto2',
            duration: '00:01:30',
            format: 'document',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Comment dresser un chat',
            userSavedTutorial: userSavedTutorial2,
            skillId: 'skill1',
          }),
          new TutorialForUser({
            id: 'recTuto3',
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Comment dresser un chien',
            isSaved: false,
            skillId: 'skill1',
          }),
        ],
        learningMoreTutorials: [
          new TutorialForUser({
            id: 'recTuto4',
            duration: '00:30:19',
            format: 'page',
            link: 'http://www.cafe-craft.fr',
            source: 'Café Craft',
            title: 'Explorons les problèmes humains de la Technique',
            skillId: 'skill1',
          }),
          new TutorialForUser({
            id: 'recTuto5',
            duration: '00:12:40',
            format: 'video',
            link: 'https://www.youtube.com/watch?v=-4PayaEgEZc',
            source: 'Youtube',
            title: 'Why the Universe Needs Dark Energy | Space Time | PBS Digital Studios',
            userSavedTutorial: userSavedTutorial5,
            skillId: 'skill1',
          }),
        ],
      });

      // when
      const json = serializer.serialize(correction);

      // then
      expect(json).to.deep.equal({
        data: {
          attributes: {
            hint: 'Indice Facile',
            solution: 'Correction value',
            'solution-to-display': 'Correction to be displayed',
          },
          id: 'correction_id',
          relationships: {
            tutorials: {
              data: [
                {
                  id: 'recTuto1',
                  type: 'tutorials',
                },
                {
                  id: 'recTuto2',
                  type: 'tutorials',
                },
                {
                  id: 'recTuto3',
                  type: 'tutorials',
                },
              ],
            },
            'learning-more-tutorials': {
              data: [
                {
                  id: 'recTuto4',
                  type: 'tutorials',
                },
                {
                  id: 'recTuto5',
                  type: 'tutorials',
                },
              ],
            },
          },
          type: 'corrections',
        },
        included: [
          {
            attributes: {
              id: 10000,
              status: 'LIKED',
              'tutorial-id': 'recTuto1',
              'user-id': 'userId',
            },
            id: '10000',
            type: 'tutorial-evaluation',
          },
          {
            id: 'userSavedTutorial1',
            type: 'user-saved-tutorial',
            attributes: {
              id: 'userSavedTutorial1',
              'tutorial-id': 'recTuto1',
              'user-id': 'userId',
            },
          },
          {
            attributes: {
              duration: '00:01:30',
              format: 'video',
              id: 'recTuto1',
              link: 'https://youtube.fr',
              source: 'Youtube',
              'skill-id': 'skill1',
              title: 'Comment dresser un panda',
            },
            id: 'recTuto1',
            type: 'tutorials',
            relationships: {
              'tutorial-evaluation': {
                data: {
                  id: '10000',
                  type: 'tutorial-evaluation',
                },
              },
              'user-saved-tutorial': {
                data: {
                  id: 'userSavedTutorial1',
                  type: 'user-saved-tutorial',
                },
              },
            },
          },
          {
            attributes: {
              id: 'userSavedTutorial2',
              'tutorial-id': 'recTuto2',
              'user-id': 'userId',
            },
            id: 'userSavedTutorial2',
            type: 'user-saved-tutorial',
          },
          {
            attributes: {
              duration: '00:01:30',
              format: 'document',
              id: 'recTuto2',
              link: 'https://youtube.fr',
              'skill-id': 'skill1',
              source: 'Youtube',
              title: 'Comment dresser un chat',
            },
            id: 'recTuto2',
            type: 'tutorials',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: {
                  id: 'userSavedTutorial2',
                  type: 'user-saved-tutorial',
                },
              },
            },
          },
          {
            attributes: {
              duration: '00:01:30',
              format: 'video',
              id: 'recTuto3',
              link: 'https://youtube.fr',
              'skill-id': 'skill1',
              source: 'Youtube',
              title: 'Comment dresser un chien',
            },
            id: 'recTuto3',
            type: 'tutorials',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: null,
              },
            },
          },
          {
            attributes: {
              duration: '00:30:19',
              format: 'page',
              id: 'recTuto4',
              link: 'http://www.cafe-craft.fr',
              'skill-id': 'skill1',
              source: 'Café Craft',
              title: 'Explorons les problèmes humains de la Technique',
            },
            id: 'recTuto4',
            type: 'tutorials',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: null,
              },
            },
          },
          {
            attributes: {
              id: 'userSavedTutorial5',
              'tutorial-id': 'recTuto5',
              'user-id': 'userId',
            },
            id: 'userSavedTutorial5',
            type: 'user-saved-tutorial',
          },
          {
            attributes: {
              duration: '00:12:40',
              format: 'video',
              id: 'recTuto5',
              link: 'https://www.youtube.com/watch?v=-4PayaEgEZc',
              'skill-id': 'skill1',
              source: 'Youtube',
              title: 'Why the Universe Needs Dark Energy | Space Time | PBS Digital Studios',
            },
            id: 'recTuto5',
            type: 'tutorials',
            relationships: {
              'tutorial-evaluation': {
                data: null,
              },
              'user-saved-tutorial': {
                data: {
                  id: 'userSavedTutorial5',
                  type: 'user-saved-tutorial',
                },
              },
            },
          },
        ],
      });
    });
  });
});
