import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { Feature } from '../../../../../src/shared/domain/models/Feature.js';
import * as featureRepository from '../../../../../src/shared/infrastructure/repositories/feature-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Infrastructure | Repositories | feature-repository', function () {
  describe('#getFeatureByKey', function () {
    context('when the feature exists', function () {
      it('should return the feature', async function () {
        //given
        const existingDbFeature = databaseBuilder.factory.buildFeature({
          key: 'ORALIZATION',
          description: 'Ma description de feature',
        });

        await databaseBuilder.commit();

        // when
        const feature = await featureRepository.getFeatureByKey('ORALIZATION');

        // then
        expect(feature).to.deep.equal(new Feature(existingDbFeature));
      });
    });

    context('when the feature does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // when
        const error = await catchErr(featureRepository.getFeatureByKey)('ORALIZATION');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findAll', function () {
    it('list all features from database', async function () {
      //given
      const firstFeature = databaseBuilder.factory.buildFeature({
        key: 'ORALIZATION',
        description: 'Ma description de feature',
      });
      const secondFeature = databaseBuilder.factory.buildFeature({
        key: 'ATTESTATIONS_MANAGEMENT',
        description: 'Ma description de feature',
      });

      await databaseBuilder.commit();
      // when
      const results = await featureRepository.findAll();

      // then
      expect(results).lengthOf(2);
      expect(results).deep.members([new Feature(firstFeature), new Feature(secondFeature)]);
    });
  });
});
