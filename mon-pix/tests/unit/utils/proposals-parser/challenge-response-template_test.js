import { expect } from 'chai';
import { describe, it } from 'mocha';
import ChallengeResponseTemplate from 'mon-pix/utils/proposals-parser/challenge-response-template';
import InputBlock from 'mon-pix/utils/proposals-parser/input-block';
import TextBlock from 'mon-pix/utils/proposals-parser/text-block';

describe('Unit | Utils | Proposals Parser | Challenge Response Template', function () {
  describe('#updateBlockDetails', function () {
    [
      {
        inputBlocks: [
          new TextBlock({ text: '1.banana' }),
          new InputBlock({
            input: '${banana}',
            inputIndex: 123,
          }),
        ],
        expectedBlocks: [
          {
            text: '<br/>1.banana',
            type: null,
          },
          {
            input: 'banana',
            text: '<br/>1.banana',
            ariaLabel: null,
            autoAriaLabel: false,
            type: 'input',
            placeholder: null,
          },
        ],
      },
      {
        inputBlocks: [
          new InputBlock({
            input: '${banana}',
            inputIndex: 123,
          }),
          new TextBlock({ text: '1.banana' }),
        ],
        expectedBlocks: [
          {
            input: 'banana',
            text: null,
            ariaLabel: '123',
            autoAriaLabel: true,
            type: 'input',
            placeholder: null,
          },
          {
            text: '<br/>1.banana',
            type: 'text',
          },
        ],
      },
    ].forEach(function (data) {
      it('should return properly updated blocks according to blocks order', function () {
        const challengeResponseTemplate = new ChallengeResponseTemplate();

        data.inputBlocks.forEach((block) => {
          challengeResponseTemplate.addBlock(block);
        });

        challengeResponseTemplate.updateBlockDetails();

        expect(challengeResponseTemplate.blocks).to.deep.equal(data.expectedBlocks);
      });
    });
  });

  describe('#constructFinalTemplate', function () {
    it('should return properly composed template', function () {
      const challengeResponseTemplate = new ChallengeResponseTemplate();

      challengeResponseTemplate.addBlock(new TextBlock({ text: 'apple' }));
      challengeResponseTemplate.addBlock(new InputBlock({ input: '${banana}', inputIndex: 123 }));
      challengeResponseTemplate.addBlock(new TextBlock({ text: 'mango' }));

      challengeResponseTemplate.constructFinalTemplate();

      expect(challengeResponseTemplate.template).to.deep.equal([
        { text: 'apple', type: 'text' },
        { input: 'banana', text: null, placeholder: null, ariaLabel: '123', type: 'input', autoAriaLabel: true },
        { text: 'mango', type: 'text' },
      ]);
    });

    it('should return a template only composed of blocks with a type', function () {
      const challengeResponseTemplate = new ChallengeResponseTemplate();

      const textBlockWithoutType = new TextBlock({ text: 'apple' });
      textBlockWithoutType.removeType();

      challengeResponseTemplate.addBlock(textBlockWithoutType);
      challengeResponseTemplate.addBlock(new InputBlock({ input: '${banana}', inputIndex: 123 }));
      challengeResponseTemplate.addBlock(new TextBlock({ text: 'mango' }));

      challengeResponseTemplate.constructFinalTemplate();

      expect(challengeResponseTemplate.template).to.deep.equal([
        { input: 'banana', text: null, placeholder: null, ariaLabel: '123', type: 'input', autoAriaLabel: true },
        { text: 'mango', type: 'text' },
      ]);
    });
  });
});
