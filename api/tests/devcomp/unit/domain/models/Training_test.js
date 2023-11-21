import { expect, domainBuilder, sinon } from '../../../../test-helper.js';
import { Training } from '../../../../../src/devcomp/domain/models/Training.js';

describe('Unit | Domain | Models | Training', function () {
  describe('#constructor', function () {
    it('should be a valid type', function () {
      // given
      const training = domainBuilder.buildTraining();

      // then
      expect(training).to.be.instanceOf(Training);
    });

    it('should have all properties', function () {
      // given
      const trainingTriggers = [Symbol('trainingTriggers')];
      const training = domainBuilder.buildTraining({
        id: 1,
        title: 'Training 1',
        link: 'https://example.net',
        type: 'webinar',
        duration: { hours: 5 },
        locale: 'fr-fr',
        targetProfileIds: [1],
        editorName: 'Example',
        editorLogoUrl: 'https://example.net/logo.svg',
        trainingTriggers,
      });

      // then
      expect(training.id).to.equal(1);
      expect(training.title).to.equal('Training 1');
      expect(training.link).to.equal('https://example.net');
      expect(training.type).to.equal('webinar');
      expect(training.duration).to.deep.equal({ hours: 5 });
      expect(training.locale).to.equal('fr-fr');
      expect(training.targetProfileIds).to.deep.equal([1]);
      expect(training.editorName).to.equal('Example');
      expect(training.editorLogoUrl).to.equal('https://example.net/logo.svg');
      expect(training.trainingTriggers).to.deep.equal(trainingTriggers);
    });
  });

  describe('#shouldBeObtained', function () {
    describe('when training has no trigger', function () {
      it('should return false ', function () {
        // given
        const training = domainBuilder.buildTraining({ trainingTriggers: [] });

        // when
        const shouldBeObtained = training.shouldBeObtained();

        // then
        expect(shouldBeObtained).to.be.false;
      });
    });

    describe('when training has a trigger', function () {
      describe('when all triggers are fulfilled', function () {
        it('should return true', function () {
          // given
          const knowledgeElements = Symbol('knowledgeElements');
          const skills = Symbol('skills');
          const trainingTriggers = [
            {
              isFulfilled: sinon.stub().withArgs({ knowledgeElements, skills }).returns(true),
            },
            {
              isFulfilled: sinon.stub().withArgs({ knowledgeElements, skills }).returns(true),
            },
          ];
          const training = domainBuilder.buildTraining({ trainingTriggers });

          // when
          const shouldBeObtained = training.shouldBeObtained(knowledgeElements, skills);

          // then
          expect(shouldBeObtained).to.be.true;
        });
      });

      describe('when some triggers are fulfilled', function () {
        it('should return false', function () {
          // given
          const knowledgeElements = Symbol('knowledgeElements');
          const skills = Symbol('skills');
          const trainingTriggers = [
            {
              isFulfilled: sinon.stub().withArgs({ knowledgeElements, skills }).returns(true),
            },
            {
              isFulfilled: sinon.stub().withArgs({ knowledgeElements, skills }).returns(false),
            },
          ];
          const training = domainBuilder.buildTraining({ trainingTriggers });

          // when
          const shouldBeObtained = training.shouldBeObtained(knowledgeElements, skills);

          // then
          expect(shouldBeObtained).to.be.false;
        });
      });
    });
  });
});
