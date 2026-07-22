import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import * as versionRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Domain | UseCase | update-version-comment', function () {
  describe('updateComments', function () {
    it('updates only the comment in the version', async function () {
      // given
      domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({
          id: 123,
          comments: 'Super Comment',
        })
        .insertToDB({ databaseBuilder });
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
