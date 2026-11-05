import { expect } from 'chai';
import sinon from 'sinon';

import { Info } from '../../../../../../src/certification/results/domain/read-models/parcoursup/Info.ts';
import * as parcoursupInfoRepository from '../../../../../../src/certification/results/infrastructure/repositories/parcoursup-info-repository.js';
import { datamartBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Results | Integration | Infrastructure | Repositories | parcoursup-info-repository', function () {
  describe('#get', function () {
    const fakeDate = new Date('2026-12-25');

    beforeEach(function () {
      sinon.useFakeTimers({ now: fakeDate, toFake: ['Date'] });
    });

    it('returns Info read-model', async function () {
      // given
      datamartBuilder.factory.buildReplicationMetadata({
        replicationName: 'sco_certification_results',
        lastUpdatedAt: new Date('2026-02-03'),
      });
      datamartBuilder.factory.buildReplicationMetadata({
        replicationName: 'certification_results',
        lastUpdatedAt: new Date('2026-05-06'),
      });
      await datamartBuilder.commit();

      // when
      const info = await parcoursupInfoRepository.get();

      // then
      expect(info).to.deepEqualInstance(
        new Info({
          sentAt: fakeDate,
          lastUpdatedAtCurrentSchoolYear: new Date('2026-02-03'),
          lastUpdatedAtVerificationCode: new Date('2026-05-06'),
        }),
      );
    });
  });
});
