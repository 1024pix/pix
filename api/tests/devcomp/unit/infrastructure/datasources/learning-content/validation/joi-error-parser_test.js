import { joiErrorParser } from './joi-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | joi error parser', function () {
  it('should parse schema errors', async function () {
    const error = {
      details: [
        {
          message: '"id" must be a valid GUID',
          path: ['id'],
          type: 'string.guid',
          context: { label: 'id', value: 'f7b3a2-1a3d8f7e9f5d', key: 'id' },
        },
        {
          message: '"grains[0].components[0].element" does not match any of the allowed types',
          path: ['grains', 0, 'components', 0, 'element'],
          type: 'alternatives.any',
          context: {
            label: 'grains[0].components[0].element',
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

Error: "grains[0].components[0].element" does not match any of the allowed types.
Valeur concernée à rechercher : {"id":"3a9f2269-99ba-4631-b6fd-6802c88d5c26","type":"videox","title":"Le format des adresses mail","url":"https://videos.pix.fr/modulix/chat_animation_2.mp4","subtitles":"https://videos.pix.fr/modulix/chat_animation_2.vtt","transcription":"<p>Coucou</p>"}

────────────────────────────────────────────────────────────

Error: "grains[5].id" must be a valid GUID.
Valeur concernée à rechercher : "b7ea7630-824"

============================================================
`;

    expect(joiErrorParser.format(error)).to.equal(expectedLog);
  });

  it('should parse html errors', async function () {
    const error = {
      details: [
        {
          message: 'htmlvalidationerror',
          path: ['grains', 2, 'components', 0, 'element', 'feedbacks', 'invalid'],
          type: 'external',
          context: {
            value: {
              valid: false,
              results: [
                {
                  filePath: 'inline',
                  messages: [
                    {
                      ruleId: 'attr-quotes',
                      severity: 2,
                      message: 'Attribute "aria-hidden" used \' instead of expected "',
                      offset: 58,
                      line: 1,
                      column: 59,
                      size: 18,
                      selector: 'p > span',
                      ruleUrl: 'https://html-validate.org/rules/attr-quotes.html',
                      context: {
                        error: 'style',
                        attr: 'aria-hidden',
                        actual: "'",
                        expected: '"',
                      },
                    },
                  ],
                  errorCount: 1,
                  warningCount: 0,
                  source: "<p>Incorrect. Remonter la page pour relire la leçon <span aria-hidden='true'>⬆</span></p>",
                },
              ],
              errorCount: 1,
              warningCount: 0,
            },
            label: 'grains[2].components[0].element.feedbacks.invalid',
            key: 'invalid',
          },
        },
      ],
    };

    const expectedLog = `
============================================================


Chemin : grains[2].components[0].element.feedbacks.invalid

Error(attr-quotes): Attribute "aria-hidden" used ' instead of expected "
https://html-validate.org/rules/attr-quotes.html

Valeur concernée à rechercher :
<p>Incorrect. Remonter la page pour relire la leçon <span aria-hidden='true'>⬆</span></p>

============================================================
`;

    expect(joiErrorParser.format(error)).to.equal(expectedLog);
  });
});
