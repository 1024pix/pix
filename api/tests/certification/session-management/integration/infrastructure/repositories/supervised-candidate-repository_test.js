import sinon from 'sinon';

import {
  authorizeToStart,
  unauthorizeToStart,
} from '../../../../../../src/certification/session-management/infrastructure/repositories/supervised-candidate-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Certification | SessionManagement | Integration | Repository | Supervised candidate', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2003-04-05T03:04:05Z');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#authorizeToStart', function () {
    it('authorizes a candidate to start by altering the right data in DB and returns the date', async function () {
      // given
      databaseBuilder.factory.buildCertificationCandidate({
        id: 1,
        authorizedToStart: false,
        authorizedToStartAt: null,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        id: 2,
        authorizedToStart: false,
        authorizedToStartAt: null,
      });
      await databaseBuilder.commit();
      const candidatesDataBefore = await knex.select('*').from('certification-candidates').orderBy('id');

      // when
      const date = await authorizeToStart(2);

      // then
      const candidatesDataAfter = await knex.select('*').from('certification-candidates').orderBy('id');
      expect(candidatesDataAfter).to.deep.include.members([
        candidatesDataBefore[0],
        {
          ...candidatesDataBefore[1],
          authorizedToStart: true,
          authorizedToStartAt: now,
        },
      ]);
      expect(date).to.be.instanceOf(Date);
    });
  });

  describe('#unauthorizeToStart', function () {
    it('unauthorizes a candidate to start by altering the right data in DB', async function () {
      // given
      databaseBuilder.factory.buildCertificationCandidate({
        id: 1,
        authorizedToStart: true,
        authorizedToStartAt: new Date('2021-01-01'),
      });
      databaseBuilder.factory.buildCertificationCandidate({
        id: 2,
        authorizedToStart: true,
        authorizedToStartAt: new Date('2022-02-02'),
      });
      await databaseBuilder.commit();
      const candidatesDataBefore = await knex.select('*').from('certification-candidates').orderBy('id');

      // when
      await unauthorizeToStart(2);

      // then
      const candidatesDataAfter = await knex.select('*').from('certification-candidates').orderBy('id');
      expect(candidatesDataAfter).to.deep.include.members([
        candidatesDataBefore[0],
        {
          ...candidatesDataBefore[1],
          authorizedToStart: false,
          authorizedToStartAt: null,
        },
      ]);
    });
  });
});
