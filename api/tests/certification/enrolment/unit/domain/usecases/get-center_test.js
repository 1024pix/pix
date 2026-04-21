import sinon from 'sinon';

import { Center } from '../../../../../../src/certification/enrolment/domain/models/Center.js';
import { getCenter } from '../../../../../../src/certification/enrolment/domain/usecases/get-center.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | get-center', function () {
  let center;
  let centerRepository;

  beforeEach(function () {
    center = domainBuilder.certification.enrolment.buildCenter({ id: 1234 });
    centerRepository = {
      getById: sinon.stub(),
    };
  });

  it('should get the center', async function () {
    // given
    centerRepository.getById.withArgs({ id: 1234 }).resolves(center);

    // when
    const actualCenter = await getCenter({
      id: 1234,
      centerRepository,
    });

    // then
    expect(actualCenter.id).to.equal(1234);
    expect(actualCenter).to.be.instanceOf(Center);
  });
});
