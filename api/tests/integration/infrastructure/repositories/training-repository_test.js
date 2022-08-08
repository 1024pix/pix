const { mockLearningContent, expect } = require('../../../test-helper');
const trainingRepository = require('../../../../lib/infrastructure/repositories/training-repository');
const Training = require('../../../../lib/domain/models/Training');

describe('Integration | Repository | training-repository', function () {
  describe('#findByTargetProfileId', function () {
    it('should find trainings by targetProfileId and locale', async function () {
      // given
      const trainingsList = [
        {
          title: 'training 0',
          id: 'recTraining0',
          targetProfileIds: [12343],
          locale: 'fr-fr',
        },
        {
          title: 'training 1',
          id: 'recTraining1',
          targetProfileIds: [12343],
          locale: 'fr-fr',
        },
        {
          title: 'training 3',
          id: 'recTraining3',
          targetProfileIds: [12343],
          locale: 'en-gb',
        },
        {
          title: 'training 4',
          id: 'recTraining4',
          targetProfileIds: [43],
          locale: 'fr-fr',
        },
      ];

      const learningContent = { trainings: trainingsList };
      mockLearningContent(learningContent);

      // when
      const trainings = await trainingRepository.findByTargetProfileIdAndLocale({ targetProfileId: 12343 });

      // then
      expect(trainings).to.have.lengthOf(2);
      expect(trainings[0]).to.be.instanceOf(Training);
    });
  });
});
