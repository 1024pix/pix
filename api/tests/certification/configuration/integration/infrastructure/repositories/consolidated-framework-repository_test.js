import * as consolidatedFrameworkRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/consolidated-framework-repository.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | consolidated-framework', function () {
  describe('#create', function () {
    it('should create a consolidated framework for a given certification key', async function () {
      // given
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const challenge1 = databaseBuilder.factory.learningContent.buildChallenge({
        id: 'challenge1',
        alpha: 1.33,
        delta: 2.2,
      });
      const challenge2 = databaseBuilder.factory.learningContent.buildChallenge({
        id: 'challenge2',
        alpha: 4.2,
        delta: -2,
      });

      await databaseBuilder.commit();

      const fakeUuid = 'xxx-yyy-zzz';
      const uuidService = { randomUUID: sinon.stub() };
      uuidService.randomUUID.returns(fakeUuid);

      const complementaryCertificationRepository = { getByKey: sinon.stub() };
      complementaryCertificationRepository.getByKey.resolves(complementaryCertification);

      // when
      await consolidatedFrameworkRepository.create({
        complementaryCertificationKey: complementaryCertification.key,
        challenges: [challenge1, challenge2],
        uuidService,
        complementaryCertificationRepository,
      });

      // then
      const consolidatedFrameworkInDB = await knex('certification-frameworks-challenges').select(
        'complementaryCertificationId',
        'challengeId',
        'alpha',
        'delta',
        'version',
      );
      expect(consolidatedFrameworkInDB).to.deep.equal([
        {
          complementaryCertificationId: complementaryCertification.id,
          challengeId: challenge1.id,
          alpha: null,
          delta: null,
          version: fakeUuid,
        },
        {
          complementaryCertificationId: complementaryCertification.id,
          challengeId: challenge2.id,
          alpha: null,
          delta: null,
          version: fakeUuid,
        },
      ]);
    });
  });
});
