import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';

describe('LLM | Unit | Domain | Models | Configuration', function () {
  describe('property getters', function () {
    context('#hasVictoryConditions', function () {
      it('should return false when dto has no victory conditions', function () {
        // given
        const configuration = new Configuration({
          challenge: {
            victoryConditions: {
              expectations: [],
            },
          },
        });

        // then
        expect(configuration.hasVictoryConditions).to.be.false;
      });
      it('should return true when dto has victory conditions', function () {
        // given
        const configuration = new Configuration({
          challenge: {
            victoryConditions: {
              expectations: ['condition_victoire'],
            },
          },
        });

        // then
        expect(configuration.hasVictoryConditions).to.be.true;
      });
    });
    context('when dto has attachment', function () {
      it('return property values', function () {
        // given
        const configuration = new Configuration({
          challenge: {
            inputMaxChars: 456,
            inputMaxPrompts: 789,
            context: 'modulix',
          },
          attachment: {
            name: 'some-attachment-name',
            context: 'some-attachment-context',
          },
        });

        // then
        expect(configuration).to.contain({
          inputMaxChars: 456,
          inputMaxPrompts: 788,
          hasAttachment: true,
          attachmentName: 'some-attachment-name',
          attachmentContext: 'some-attachment-context',
          context: 'modulix',
        });
      });
    });

    context('when dto has no attachment', function () {
      it('returns undefined for attachment properties', function () {
        // given
        const configuration = new Configuration({
          challenge: {
            inputMaxChars: 456,
            inputMaxPrompts: 789,
          },
        });

        // then
        expect(configuration).to.contain({
          inputMaxChars: 456,
          inputMaxPrompts: 789,
          hasAttachment: false,
          attachmentName: undefined,
          attachmentContext: undefined,
          context: undefined,
        });
      });
    });
  });

  describe('#toDTO', function () {
    it('returns the dto', function () {
      // given
      const dto = Symbol('dto');
      const configuration = new Configuration(dto);

      // when
      const actualDto = configuration.toDTO();

      // then
      expect(actualDto).to.equal(dto);
    });
  });

  describe('#fromDTO', function () {
    it('returns Configuration model', function () {
      // given
      const dto = {
        challenge: {
          inputMaxChars: 456,
          inputMaxPrompts: 789,
          context: 'evaluation',
        },
        attachment: {
          name: 'some-attachment-name',
          context: 'some-attachment-context',
        },
      };

      // when
      const configuration = Configuration.fromDTO(dto);

      // then
      expect(configuration).to.be.instanceOf(Configuration);
      expect(configuration).to.contain({
        inputMaxChars: 456,
        inputMaxPrompts: 788,
        hasAttachment: true,
        attachmentName: 'some-attachment-name',
        attachmentContext: 'some-attachment-context',
        context: 'evaluation',
      });
    });
  });
});
