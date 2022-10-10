const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const trainingRepository = require('../../../../lib/infrastructure/repositories/training-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
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

  describe('#get', function () {
    context('when training exist', function () {
      it('should return training', async function () {
        // given
        const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
        const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
        const expectedTraining = domainBuilder.buildTraining({
          id: 1,
          title: 'training 1',
          targetProfileIds: [targetProfile1.id, targetProfile2.id],
          locale: 'fr-fr',
        });
        databaseBuilder.factory.buildTraining({ ...expectedTraining, duration: '5h' });
        databaseBuilder.factory.buildTargetProfileTraining({
          trainingId: expectedTraining.id,
          targetProfileId: expectedTraining.targetProfileIds[0],
        });
        databaseBuilder.factory.buildTargetProfileTraining({
          trainingId: expectedTraining.id,
          targetProfileId: expectedTraining.targetProfileIds[1],
        });
        await databaseBuilder.commit();

        // when
        const training = await trainingRepository.get(expectedTraining.id);

        // then
        expect(training).to.deep.equal(expectedTraining);
      });
    });

    context('when training does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // when
        const error = await catchErr(trainingRepository.get)(134);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('Not found training for ID 134');
      });
    });
  });
});
