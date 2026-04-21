import sinon from 'sinon';

import { getScoBlockedAccessDates } from '../../../../../../src/certification/configuration/domain/usecases/get-sco-blocked-access-dates.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | UseCase | get-sco-blocked-access-dates', function () {
  let ScoBlockedAccessDatesRepository;

  beforeEach(function () {
    ScoBlockedAccessDatesRepository = {
      getScoBlockedAccessDates: sinon.stub(),
    };
  });

  it('should return sco blocked access dates', async function () {
    // given
    const scoBlockedAccessDates = [
      domainBuilder.certification.configuration.buildScoBlockedAccessDateCollege(),
      domainBuilder.certification.configuration.buildScoBlockedAccessDateLycee(),
    ];
    ScoBlockedAccessDatesRepository.getScoBlockedAccessDates.resolves(scoBlockedAccessDates);

    // when
    const results = await getScoBlockedAccessDates({ ScoBlockedAccessDatesRepository });

    // then
    expect(ScoBlockedAccessDatesRepository.getScoBlockedAccessDates).to.have.been.calledOnce;
    expect(results).to.deep.equal(scoBlockedAccessDates);
  });
});
