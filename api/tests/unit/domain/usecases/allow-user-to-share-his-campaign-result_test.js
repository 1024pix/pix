const { expect } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | allow-user-to-share-his-campaign-result', () => {

  beforeEach(() => {

  });

  afterEach(() => {

  });

  it('should succeed', () => {
    // given

    // when
    const promise = usecases.allowUserToShareHisCampaignResult({});

    // then
    return expect(promise).to.be.fulfilled;
  });
});
