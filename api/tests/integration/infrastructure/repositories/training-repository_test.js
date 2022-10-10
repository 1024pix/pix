const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const trainingRepository = require('../../../../lib/infrastructure/repositories/training-repository');
const Training = require('../../../../lib/domain/models/Training');

describe('Integration | Repository | training-repository', function () {
  describe('#findByTargetProfileId', function () {
    it('should find trainings by targetProfileId and locale', async function () {
      // given
      const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
      const training1 = domainBuilder.buildTraining({
        id: 1,
        title: 'training 1',
        targetProfileIds: [targetProfile1.id],
        locale: 'fr-fr',
      });
      const training2 = domainBuilder.buildTraining({
        id: 2,
        title: 'training 2',
        targetProfileIds: [targetProfile1.id],
        locale: 'fr-fr',
      });
      const training3 = domainBuilder.buildTraining({
        id: 3,
        title: 'training 3',
        targetProfileIds: [targetProfile1.id],
        locale: 'en-gb',
      });
      const training4 = domainBuilder.buildTraining({
        id: 4,
        title: 'training 4',
        targetProfileIds: [targetProfile2.id],
        locale: 'fr-fr',
      });

      databaseBuilder.factory.buildTraining({ ...training1, duration: '5h' });
      databaseBuilder.factory.buildTraining({ ...training2, duration: '5h' });
      databaseBuilder.factory.buildTraining({ ...training3, duration: '5h' });
      databaseBuilder.factory.buildTraining({ ...training4, duration: '5h' });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training1.id,
        targetProfileId: training1.targetProfileIds[0],
      });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training2.id,
        targetProfileId: training2.targetProfileIds[0],
      });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training3.id,
        targetProfileId: training3.targetProfileIds[0],
      });

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training4.id,
        targetProfileId: training4.targetProfileIds[0],
      });

      await databaseBuilder.commit();

      // when
      const trainings = await trainingRepository.findByTargetProfileIdAndLocale({
        targetProfileId: targetProfile1.id,
        locale: 'fr-fr',
      });

      // then
      expect(trainings).to.have.lengthOf(2);
      expect(trainings[0]).to.be.instanceOf(Training);
      expect(trainings[0]).to.deep.equal(training1);
    });
  });
});
