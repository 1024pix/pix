import { expect } from 'chai';
import { describe, it } from 'mocha';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

describe('Unit | Utility | proposals as blocks', function() {

  const testData = [
    {
      data: '',
      expected: [],
    },
    {
      data: 'Text',
      expected: [
        { text: 'Text', type: 'text' },
      ],
    },
    {
      data: '\nTexte avec des \n retours à la ligne \n',
      expected: [
        { text: '<br/>Texte avec des <br/> retours à la ligne <br/>', type: 'text' },
      ],
    },
    {
      data: '${qroc}',
      expected: [
        { input: 'qroc', text: null, placeholder: null, ariaLabel: '1', type: 'input', autoAriaLabel: true },
      ],
    },
    {
      data: '${annee#19XX}',
      expected: [
        { input: 'annee', text: null, placeholder: '19XX', ariaLabel: '1', type: 'input', autoAriaLabel: true },
      ],
    },
    {
      data: '${annee#19XX§Année de construction}',
      expected: [
        { input: 'annee', text: null, placeholder: '19XX', ariaLabel: 'Année de construction', type: 'input', autoAriaLabel: false },
      ],
    },
    {
      data: 'Et ta réponse est : ${annee#19XX§Année de construction}',
      expected: [
        { text: 'Et ta réponse est : ', type: 'text' },
        { input: 'annee', text: null, placeholder: '19XX', ariaLabel: 'Année de construction', type: 'input', autoAriaLabel: false },
      ],
    },
    {
      data: 'Réponse : ${test#1 ou 2}',
      expected: [
        { text: 'Réponse : ', input: 'test', placeholder: '1 ou 2', ariaLabel: null, type: 'input', autoAriaLabel: false },
      ],
    },
    {
      data: 'Réponse : ${test} (kilometres)',
      expected: [
        { text: 'Réponse : ', input: 'test', placeholder: null, ariaLabel: null, type: 'input', autoAriaLabel: false },
        { text: ' (kilometres)', type: 'text' },
      ],
    },
    {
      data: '${plop}, ${plop} ${plop}',
      expected: [
        { input: 'plop', text: null, placeholder: null, ariaLabel: '1', type: 'input', autoAriaLabel: true },
        { text: ', ', type: 'text' },
        { input: 'plop', text: null, placeholder: null, ariaLabel: '2', type: 'input', autoAriaLabel: true },
        { text: ' ', type: 'text' },
        { input: 'plop', text: null, placeholder: null, ariaLabel: '3', type: 'input', autoAriaLabel: true },
      ],
    },
    {
      data: 'line1\nline2',
      expected: [
        { text: 'line1<br/>line2', type: 'text' },
      ],
    },
    {
      data: 'line1\r<br/>line2',
      expected: [
        { text: 'line1\r<br/>line2', type: 'text' },
      ],
    },
    {
      data: '-${plop}',
      expected: [
        { text: '<br/>-', type: 'text' },
        { text: null, input: 'plop', placeholder: null, ariaLabel: '1', type: 'input', autoAriaLabel: true },
      ],
    },
    {
      data: '1.${plop}',
      expected: [
        { text: '<br/>1.', input: 'plop', placeholder: null, ariaLabel: null, type: 'input', autoAriaLabel: false },
      ],
    },

    {
      data: '- line ${plop}',
      expected: [
        { text: '<br/>- line ', input: 'plop', placeholder: null, ariaLabel: null, type: 'input', autoAriaLabel: false },
      ],
    },
  ];

  testData.forEach(({ data, expected }) => {

    it(`"${data}" retourne ${JSON.stringify(expected)}`, () => {
      expect(proposalsAsBlocks(data)).to.deep.equal(expected);
    });
  });

});
