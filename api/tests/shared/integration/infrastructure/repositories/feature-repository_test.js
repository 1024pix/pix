import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { Feature } from '../../../../../src/shared/domain/models/Feature.js';
import * as featureRepository from '../../../../../src/shared/infrastructure/repositories/feature-repository.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

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
});
