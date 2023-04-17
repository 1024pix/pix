const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | TrainingForAdmin', function () {
  describe('#constructor', function () {
    it('should have all properties', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTriggerForAdmin({});
      const training = domainBuilder.buildTrainingForAdmin({
        id: 1,
        title: 'Training 1',
        link: 'https://example.net',
        type: 'webinar',
        duration: { hours: 5 },
        locale: 'fr-fr',
        targetProfileIds: [1, 2, 3],
        editorName: 'Editor name',
        editorLogoUrl: 'https://editor.logo.url',
        trainingTriggers: [trainingTrigger],
      });

      // then
      expect(training.id).to.equal(1);
      expect(training.title).to.equal('Training 1');
      expect(training.link).to.equal('https://example.net');
      expect(training.type).to.equal('webinar');
      expect(training.duration).to.deep.equal({ hours: 5 });
      expect(training.locale).to.equal('fr-fr');
      expect(training.targetProfileIds).to.deep.equal([1, 2, 3]);
      expect(training.editorName).to.equal('Editor name');
      expect(training.editorLogoUrl).to.equal('https://editor.logo.url');
      expect(training.trainingTriggers).to.deep.equal([trainingTrigger]);
    });
  });

  describe('#isRecommendable', function () {
    it('return true when training has at least one trigger', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTriggerForAdmin({});
      const training = domainBuilder.buildTrainingForAdmin({
        trainingTriggers: [trainingTrigger],
      });

      // then
      expect(training.isRecommendable).to.be.true;
    });

    it('return false when training has no trigger', function () {
      // given
      const training = domainBuilder.buildTrainingForAdmin({
        trainingTriggers: [],
      });

      // then
      expect(training.isRecommendable).to.be.false;
    });

    it('return false when training trigger is undefined', function () {
      // given
      const training = domainBuilder.buildTrainingForAdmin({
        trainingTriggers: undefined,
      });

      // then
      expect(training.isRecommendable).to.equal(false);
    });
  });
});
