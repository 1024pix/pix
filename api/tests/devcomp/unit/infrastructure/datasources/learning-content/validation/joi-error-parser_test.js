import { expect } from '../../../../../../test-helper.js';
import { joiErrorParser } from './joi-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | joi error parser', function () {
  it('should parse sync error', async function () {
    const error = {
      details: [
        {
          message: '"id" must be a valid GUID',
          path: ['id'],
          type: 'string.guid',
          context: { label: 'id', value: 'f7b3a2-1a3d8f7e9f5d', key: 'id' },
        },
        {
          message: '"transitionTexts[0].grainId" must be a valid GUID',
          path: ['transitionTexts', 0, 'grainId'],
          type: 'string.guid',
          context: {
            label: 'transitionTexts[0].grainId',
            value: '34d225e8-de8438cfc9',
            key: 'grainId',
          },
        },
        {
          message: '"grains[0].elements[0]" does not match any of the allowed types',
          path: ['grains', 0, 'elements', 0],
          type: 'alternatives.any',
          context: {
            label: 'grains[0].elements[0]',
            value: {
              id: '3a9f2269-99ba-4631-b6fd-6802c88d5c26',
              type: 'videox',
              title: 'Le format des adresses mail',
              url: 'https://videos.pix.fr/modulix/chat_animation_2.mp4',
              subtitles: 'https://videos.pix.fr/modulix/chat_animation_2.vtt',
              transcription: '<p>Coucou</p>',
            },
            key: 0,
          },
        },
        {
          message: '"grains[5].id" must be a valid GUID',
          path: ['grains', 5, 'id'],
          type: 'string.guid',
          context: { label: 'grains[5].id', value: 'b7ea7630-824', key: 'id' },
        },
      ],
    };

    const expectedLog = `
============================================================

Error: "id" must be a valid GUID.
Valeur concernée à rechercher : "f7b3a2-1a3d8f7e9f5d"

────────────────────────────────────────────────────────────

Error: "transitionTexts[0].grainId" must be a valid GUID.
Valeur concernée à rechercher : "34d225e8-de8438cfc9"

────────────────────────────────────────────────────────────

Error: "grains[0].elements[0]" does not match any of the allowed types.
Valeur concernée à rechercher : {"id":"3a9f2269-99ba-4631-b6fd-6802c88d5c26","type":"videox","title":"Le format des adresses mail","url":"https://videos.pix.fr/modulix/chat_animation_2.mp4","subtitles":"https://videos.pix.fr/modulix/chat_animation_2.vtt","transcription":"<p>Coucou</p>"}

────────────────────────────────────────────────────────────

Error: "grains[5].id" must be a valid GUID.
Valeur concernée à rechercher : "b7ea7630-824"

============================================================
`;

    expect(joiErrorParser.format(error)).to.equal(expectedLog);
  });
});
