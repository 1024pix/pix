import sinon from 'sinon';

import * as campaignParticipationsStatsRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-participations-stats-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Repository | Campaign Participations Stats', function () {
  let queryBuilder;
  let knexConnStub;

  beforeEach(function () {
    queryBuilder = {
      select: sinon.stub().returnsThis(),
      countDistinct: sinon.stub().returnsThis(),
      join: sinon.stub().returnsThis(),
      where: sinon.stub().returnsThis(),
      first: sinon.stub().returnsThis(),
      groupBy: sinon.stub().returnsThis(),
      orderBy: sinon.stub().returnsThis(),
    };
    knexConnStub = sinon.stub().returns(queryBuilder);
    knexConnStub.raw = sinon.stub();
    sinon.stub(DomainTransaction, 'getConnection').returns(knexConnStub);
  });
  describe('#countParticipantsByOrganizationId', function () {
    it('returns null and logs when the query is in error', async function () {
      // given
      queryBuilder.timeout = sinon.stub().rejects(new Error('timeout'));
      sinon.stub(logger, 'error');

      // when
      const result = await campaignParticipationsStatsRepository.countParticipantsByOrganizationId(1);

      // then
      expect(result).to.be.null;
      expect(logger.error.calledOnce).to.be.true;
      expect(logger.error.firstCall.args[0]).to.include({ event: 'organization_participants_count_timeout' });
    });

    it('returns result when query does not timeout', async function () {
      // given
      queryBuilder.timeout = sinon.stub().resolves({ count: 42 });

      // when
      const result = await campaignParticipationsStatsRepository.countParticipantsByOrganizationId(1);

      // then
      expect(result).to.equal(42);
    });
  });

  describe('#countParticipantsByOrganizationIdGroupedByYear', function () {
    it('returns null and logs when the query is in error', async function () {
      // given
      queryBuilder.timeout = sinon.stub().rejects(new Error('timeout'));
      sinon.stub(logger, 'error');

      // when
      const result = await campaignParticipationsStatsRepository.countParticipantsByOrganizationIdGroupedByYear(1);

      // then
      expect(result).to.be.null;
      expect(logger.error.calledOnce).to.be.true;
      expect(logger.error.firstCall.args[0]).to.include({ event: 'organization_participants_count_timeout' });
    });

    it('returns result when query does not timeout', async function () {
      // given
      const expectedResult = [{ year: 2025, count: 42 }];
      queryBuilder.timeout = sinon.stub().resolves(expectedResult);

      // when
      const result = await campaignParticipationsStatsRepository.countParticipantsByOrganizationIdGroupedByYear(1);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
