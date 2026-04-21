import sinon from 'sinon';

import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { exportScoWhitelist } from '../../../../../../src/certification/configuration/domain/usecases/export-sco-whitelist.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | UseCase | export-sco-whitelist', function () {
  let centerRepository;

  beforeEach(function () {
    centerRepository = {
      getWhitelist: sinon.stub().throws(new Error('bad arguments')),
    };
  });

  it('should whitelist a center', async function () {
    // given
    const whitelistedCenter = domainBuilder.certification.configuration.buildCenter({
      type: CenterTypes.SCO,
      externalId: 'IN_WHITELIST',
    });
    centerRepository.getWhitelist.resolves([whitelistedCenter]);

    // when
    const results = await exportScoWhitelist({ centerRepository });

    // then
    expect(centerRepository.getWhitelist).to.have.been.calledOnce;
    expect(results).to.deep.equal([whitelistedCenter]);
  });
});
