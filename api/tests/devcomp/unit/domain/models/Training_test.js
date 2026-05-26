import sinon from 'sinon';

import { Training } from '../../../../../src/devcomp/domain/models/Training.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Devcomp | Domain | Models | Training', function () {
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
        locales: ['fr-fr'],
        targetProfileIds: [1],
        editorName: 'Example',
        editorLogoUrl: 'https://example.net/logo.svg',
        trainingTriggers,
        description: 'Voici la description de mon contenu formatif',
      });

      // then
      expect(training).to.deep.equal({
        deliveryMode: 'remote',
        duration: {
          hours: 5,
        },
        editorLogoUrl: 'https://example.net/logo.svg',
        editorName: 'Example',
        id: 1,
        internalTitle: 'Training 1 internal title',
        link: 'https://example.net',
        locales: ['fr-fr'],
        objectives: ['objective 1', 'objective 2'],
        program: 'training program',
        registrationRequired: false,
        targetProfileIds: [1],
        title: 'Training 1',
        trainingTriggers,
        type: 'webinar',
        description: 'Voici la description de mon contenu formatif',
      });
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
