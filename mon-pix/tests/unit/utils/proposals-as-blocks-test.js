import { expect } from 'chai';
import { describe, it } from 'mocha';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

describe('Unit | Utility | proposals as blocks', function() {

  const testData = [
    { data: '', expected: [] },
    { data: 'Text', expected: [{ text: 'Text', input: undefined, placeholder: undefined, ariaLabel: '' }] },
    { data: 'Text test plop', expected: [{ text: 'Text test plop', input: undefined, placeholder: undefined, ariaLabel: '' }] },
    { data: '${qroc}', expected: [{ input: 'qroc', text: undefined, placeholder: undefined, ariaLabel: 'Réponse 1' }] },
    { data: 'Test: ${test}', expected: [
      { text: 'Test:', input: 'test', placeholder: undefined, ariaLabel: '' }] },
    { data: 'Test: ${test} (kilometres)', expected: [
      { text: 'Test:', input: 'test', placeholder: undefined, ariaLabel: '' },
      { text: '(kilometres)', input: undefined, placeholder: undefined, ariaLabel: '' }] },
    {
      data: '${plop}, ${plop} ${plop}',
      expected: [
        { input: 'plop', text: undefined, placeholder: undefined, ariaLabel: 'Réponse 1' },
        { input: undefined, text: ',' , placeholder: undefined, ariaLabel: '' },
        { input: 'plop', text: undefined, placeholder: undefined, ariaLabel: 'Réponse 2' },
        { input: 'plop', text: undefined, placeholder: undefined, ariaLabel: 'Réponse 3' }]
    },
    { data: '${plop#var}', expected: [{ input: 'plop', placeholder: 'var', text: undefined, ariaLabel: 'Réponse 1' }] },
    { data: 'line1\nline2', expected: [
      { text: 'line1', input: undefined, placeholder: undefined, ariaLabel: '' },
      { breakline: true },
      { text: 'line2', input: undefined, placeholder: undefined, ariaLabel: '' }] },
    { data: 'line1\r\nline2', expected: [
      { text: 'line1', input: undefined, placeholder: undefined, ariaLabel: '' },
      { breakline: true },
      { text: 'line2', input: undefined, placeholder: undefined, ariaLabel: '' }] },
    { data: 'line1\n\rline2', expected: [
      { text: 'line1', input: undefined, placeholder: undefined, ariaLabel: '' },
      { breakline: true },
      { text: 'line2', input: undefined, placeholder: undefined, ariaLabel: '' }] },
    { data: 'line1\n\nline2', expected: [
      { text: 'line1', input: undefined, placeholder: undefined, ariaLabel: '' },
      { breakline: true },
      { text: 'line2', input: undefined, placeholder: undefined, ariaLabel: '' }] }
  ];

  testData.forEach(({ data, expected }) => {

    it(`"${data}" retourne ${JSON.stringify(expected)}`, () => {
      expect(proposalsAsBlocks(data)).to.deep.equal(expected);
    });
  });

});
