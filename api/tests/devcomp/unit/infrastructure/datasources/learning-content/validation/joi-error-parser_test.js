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

  it('should parse html error', async function () {
    const error = {
      details: [
        {
          message: 'htmlvalidationerror',
          path: ['transitionTexts', 0, 'content'],
          type: 'external',
          context: {
            value: {
              valid: false,
              results: [
                {
                  filePath: 'inline',
                  messages: [
                    {
                      ruleId: 'no-raw-characters',
                      severity: 2,
                      message: 'Raw "&" must be encoded as "&amp;"',
                      offset: 13,
                      line: 2,
                      column: 13,
                      size: 1,
                      selector: 'h1',
                      ruleUrl: 'https://html-validate.org/rules/no-raw-characters.html',
                    },
                    {
                      ruleId: 'void-content',
                      severity: 2,
                      message: 'End tag for <input> must be omitted',
                      offset: 51,
                      line: 3,
                      column: 23,
                      size: 6,
                      selector: null,
                      ruleUrl: 'https://html-validate.org/rules/void-content.html',
                      context: 'input',
                    },
                  ],
                  errorCount: 2,
                  warningCount: 0,
                  source: '<h1>Hello & goodbye!</h1><input type="text"></input>',
                },
              ],
              errorCount: 2,
              warningCount: 0,
            },
            label: 'transitionTexts[0].content',
            key: 'content',
          },
        },
      ],
    };

    const expectedLog = `
============================================================


Error(no-raw-characters): Raw "&" must be encoded as "&amp;"
https://html-validate.org/rules/no-raw-characters.html

Valeur concernée à rechercher :
<h1>Hello & goodbye!</h1><input type="text"></input>

────────────────────────────────────────────────────────────


Error(void-content): End tag for <input> must be omitted
https://html-validate.org/rules/void-content.html

Valeur concernée à rechercher :
<h1>Hello & goodbye!</h1><input type="text"></input>

============================================================
`;

    expect(joiErrorParser.format(error)).to.equal(expectedLog);
  });
});
