const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/correction-serializer');
const Correction = require('../../../../../lib/domain/models/Correction');
const Hint = require('../../../../../lib/domain/models/Hint');
const Tutorial = require('../../../../../lib/domain/models/Tutorial');

describe('Unit | Serializer | JSONAPI | correction-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Correction model object into JSON API data', function() {

      const correction = new Correction({
        id: 'correction_id',
        solution: 'Correction value',
        hints: [
          new Hint({ skillName: '@test2', value: 'Indice moins Facile' }),
          new Hint({ skillName: '@test1', value: 'Indice Facile' })
        ],
        tutorials: [
          {
            ...new Tutorial({
              id: 'recTuto1',
              duration: '00:01:30',
              format: 'video',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Comment dresser un panda',
            }),
            userTutorial: { id: 'userTutorial1', userId: 'userId', tutorialId: 'recTuto1' },
          },
          {
            ...new Tutorial({
              id: 'recTuto2',
              duration: '00:01:30',
              format: 'document',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Comment dresser un chat',
            }),
            userTutorial: { id: 'userTutorial2', userId: 'userId', tutorialId: 'recTuto2' },
          },
          {
            ...new Tutorial({
              id: 'recTuto3',
              duration: '00:01:30',
              format: 'video',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Comment dresser un chien',
              isSaved: false,
            }),
          }
        ],
        learningMoreTutorials: [
          {
            ...new Tutorial({
              id: 'recTuto4',
              duration: '00:30:19',
              format: 'page',
              link: 'http://www.cafe-craft.fr',
              source: 'Café Craft',
              title: 'Explorons les problèmes humains de la Technique',
            }),
          },
          {
            ...new Tutorial({
              id: 'recTuto5',
              duration: '00:12:40',
              format: 'video',
              link: 'https://www.youtube.com/watch?v=-4PayaEgEZc',
              source: 'Youtube',
              title: 'Why the Universe Needs Dark Energy | Space Time | PBS Digital Studios',
            }),
            userTutorial: { id: 'userTutorial5', userId: 'userId', tutorialId: 'recTuto5' },
          }
        ]
      });

      // when
      const json = serializer.serialize(correction);

      // then
      expect(json).to.deep.equal({
        'data': {
          'attributes': {
            'hint': 'Indice Facile',
            'solution': 'Correction value',
          },
          'id': 'correction_id',
          'relationships': {
            'tutorials': {
              'data': [
                {
                  'id': 'recTuto1',
                  'type': 'tutorials',
                },
                {
                  'id': 'recTuto2',
                  'type': 'tutorials',
                },
                {
                  'id': 'recTuto3',
                  'type': 'tutorials',
                },
              ]
            },
            'learning-more-tutorials': {
              'data': [
                {
                  'id': 'recTuto4',
                  'type': 'tutorials',
                },
                {
                  'id': 'recTuto5',
                  'type': 'tutorials',
                },
              ]
            }
          },
          'type': 'corrections',
        },
        'included': [
          {
            'id': 'userTutorial1',
            'type': 'user-tutorial',
            'attributes': {
              'id': 'userTutorial1',
              'tutorial-id': 'recTuto1',
              'user-id': 'userId',
            },
          },
          {
            'attributes': {
              'duration': '00:01:30',
              'format': 'video',
              'id': 'recTuto1',
              'link': 'https://youtube.fr',
              'source': 'Youtube',
              'title': 'Comment dresser un panda',
            },
            'id': 'recTuto1',
            'type': 'tutorials',
            'relationships': {
              'user-tutorial': {
                'data': {
                  'id': 'userTutorial1',
                  'type': 'user-tutorial'
                }
              }
            }
          },
          {
            'attributes': {
              'id': 'userTutorial2',
              'tutorial-id': 'recTuto2',
              'user-id': 'userId',
            },
            'id': 'userTutorial2',
            'type': 'user-tutorial'
          },
          {
            'attributes': {
              'duration': '00:01:30',
              'format': 'document',
              'id': 'recTuto2',
              'link': 'https://youtube.fr',
              'source': 'Youtube',
              'title': 'Comment dresser un chat',
            },
            'id': 'recTuto2',
            'type': 'tutorials',
            'relationships': {
              'user-tutorial': {
                'data': {
                  'id': 'userTutorial2',
                  'type': 'user-tutorial'
                }
              }
            }
          },
          {
            'attributes': {
              'duration': '00:01:30',
              'format': 'video',
              'id': 'recTuto3',
              'link': 'https://youtube.fr',
              'source': 'Youtube',
              'title': 'Comment dresser un chien',
            },
            'id': 'recTuto3',
            'type': 'tutorials',
          },
          {
            'attributes': {
              'duration': '00:30:19',
              'format': 'page',
              'id': 'recTuto4',
              'link': 'http://www.cafe-craft.fr',
              'source': 'Café Craft',
              'title': 'Explorons les problèmes humains de la Technique',
            },
            'id': 'recTuto4',
            'type': 'tutorials',
          },
          {
            'attributes': {
              'id': 'userTutorial5',
              'tutorial-id': 'recTuto5',
              'user-id': 'userId',
            },
            'id': 'userTutorial5',
            'type': 'user-tutorial'
          },
          {
            'attributes': {
              'duration': '00:12:40',
              'format': 'video',
              'id': 'recTuto5',
              'link': 'https://www.youtube.com/watch?v=-4PayaEgEZc',
              'source': 'Youtube',
              'title': 'Why the Universe Needs Dark Energy | Space Time | PBS Digital Studios',
            },
            'id': 'recTuto5',
            'type': 'tutorials',
            'relationships': {
              'user-tutorial': {
                'data': {
                  'id': 'userTutorial5',
                  'type': 'user-tutorial'
                }
              }
            }
          }
        ],
      });
    });
  });
});
