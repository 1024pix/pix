import { expect } from '../../../../../../test-helper.js';
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
          // ToDo PIX-12363 migrate to components
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

  it('should parse html errors', async function () {
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
                {
                  filePath: 'inline',
                  messages: [
                    {
                      ruleId: 'attr-quotes',
                      severity: 2,
                      message: 'Attribute "href" used \' instead of expected "',
                      offset: 60,
                      line: 1,
                      column: 61,
                      size: 52,
                      selector: 'h4 > a',
                      ruleUrl: 'https://html-validate.org/rules/attr-quotes.html',
                      context: {
                        error: 'style',
                        attr: 'href',
                        actual: "'",
                        expected: '"',
                      },
                    },
                    {
                      ruleId: 'attr-quotes',
                      severity: 2,
                      message: 'Attribute "target" used \' instead of expected "',
                      offset: 113,
                      line: 1,
                      column: 114,
                      size: 14,
                      selector: 'h4 > a',
                      ruleUrl: 'https://html-validate.org/rules/attr-quotes.html',
                      context: {
                        error: 'style',
                        attr: 'target',
                        actual: "'",
                        expected: '"',
                      },
                    },
                  ],
                  errorCount: 2,
                  warningCount: 0,
                  source:
                    "<h4>Répondez aux questions ci-dessous en naviguant dans  <a href='https://fr.wikipedia.org/wiki/Charlie_Chaplin' target='blank'>l'article Wikipédia de Charlie Chaplin.</a></h4>",
                },
              ],
              errorCount: 2,
              warningCount: 0,
            },
            label: 'transitionTexts[0].content',
            key: 'content',
          },
        },
        {
          message: 'htmlvalidationerror',
          path: ['grains', 2, 'elements', 0, 'feedbacks', 'invalid'],
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
                  source: "<p>Incorrect. Remonter la page pour relire la leçon <span aria-hidden='true'>⬆</span>️</p>",
                },
              ],
              errorCount: 1,
              warningCount: 0,
            },
            label: 'grains[2].elements[0].feedbacks.invalid',
            key: 'invalid',
          },
        },
      ],
    };

    const expectedLog = `
============================================================


Chemin : transitionTexts[0].content

Error(no-raw-characters): Raw "&" must be encoded as "&amp;"
https://html-validate.org/rules/no-raw-characters.html

Valeur concernée à rechercher :
<h1>Hello & goodbye!</h1><input type="text"></input>

────────────────────────────────────────────────────────────


Chemin : transitionTexts[0].content

Error(void-content): End tag for <input> must be omitted
https://html-validate.org/rules/void-content.html

Valeur concernée à rechercher :
<h1>Hello & goodbye!</h1><input type="text"></input>

────────────────────────────────────────────────────────────


Chemin : transitionTexts[0].content

Error(attr-quotes): Attribute "href" used ' instead of expected "
https://html-validate.org/rules/attr-quotes.html

Valeur concernée à rechercher :
<h4>Répondez aux questions ci-dessous en naviguant dans  <a href='https://fr.wikipedia.org/wiki/Charlie_Chaplin' target='blank'>l'article Wikipédia de Charlie Chaplin.</a></h4>

────────────────────────────────────────────────────────────


Chemin : transitionTexts[0].content

Error(attr-quotes): Attribute "target" used ' instead of expected "
https://html-validate.org/rules/attr-quotes.html

Valeur concernée à rechercher :
<h4>Répondez aux questions ci-dessous en naviguant dans  <a href='https://fr.wikipedia.org/wiki/Charlie_Chaplin' target='blank'>l'article Wikipédia de Charlie Chaplin.</a></h4>

────────────────────────────────────────────────────────────


Chemin : grains[2].elements[0].feedbacks.invalid

Error(attr-quotes): Attribute "aria-hidden" used ' instead of expected "
https://html-validate.org/rules/attr-quotes.html

Valeur concernée à rechercher :
<p>Incorrect. Remonter la page pour relire la leçon <span aria-hidden='true'>⬆</span>️</p>

============================================================
`;

    expect(joiErrorParser.format(error)).to.equal(expectedLog);
  });
});
