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
          new Tutorial({
            id: 'recTuto1',
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Comment dresser un panda'
          }),
          new Tutorial({
            id: 'recTuto2',
            duration: '00:01:30',
            format: 'document',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Comment dresser un chat'
          }),
          new Tutorial({
            id: 'recTuto3',
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Comment dresser un chien'
          }),
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
            }
          },
          'type': 'corrections',
        },
        'included': [
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
          },
          {
            'attributes':
              {
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
        ],
      });
    });
  });
});
