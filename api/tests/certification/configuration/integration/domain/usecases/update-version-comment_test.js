import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import * as versionRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Configuration | Integration | Domain | UseCase | update-version', function () {
  describe('updateComments', function () {
    it('updates only the comment in the version', async function () {
      // given
      databaseBuilder.factory.buildCertificationVersion({
        id: 123,
        status: VERSION_STATUSES.ACTIVE,
        comments: 'Super Comment',
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'coucou',
        versionId: 123,
      });
      await databaseBuilder.commit();

      // when
      await usecases.updateVersionComment({
        id: 123,
        comments: 'Super Comment Updated',
      });

      // then
      const updatedVersion = await versionRepository.getById({ id: 123 });
      expect(updatedVersion.comments).to.equal('Super Comment Updated');
    });
  });
});
