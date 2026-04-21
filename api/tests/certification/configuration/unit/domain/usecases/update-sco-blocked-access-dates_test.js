import sinon from 'sinon';

import { updateScoBlockedAccessDate } from '../../../../../../src/certification/configuration/domain/usecases/update-sco-blocked-access-date.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | UseCase | update-sco-blocked-access-date', function () {
  let ScoBlockedAccessDatesRepositoryStub;
  const scoBlockedAccessDate = domainBuilder.certification.configuration.buildScoBlockedAccessDateLycee();

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    ScoBlockedAccessDatesRepositoryStub = {
      getScoBlockedAccessDateByKey: sinon.stub().resolves(scoBlockedAccessDate),
      updateScoBlockedAccessDate: sinon.stub().resolves(),
    };
  });

  it('should update a sco blocked access date', async function () {
    // given
    const scoOrganizationTagName = 'LYCEE';
    const reopeningDate = new Date('2025-12-15');

    // when
    await updateScoBlockedAccessDate({
      scoOrganizationTagName,
      reopeningDate,
      ScoBlockedAccessDatesRepository: ScoBlockedAccessDatesRepositoryStub,
    });

    // then
    expect(ScoBlockedAccessDatesRepositoryStub.getScoBlockedAccessDateByKey).to.have.been.calledOnceWithExactly(
      scoOrganizationTagName,
    );
    expect(ScoBlockedAccessDatesRepositoryStub.updateScoBlockedAccessDate).to.have.been.calledOnceWithExactly(
      scoBlockedAccessDate,
    );
  });
});
