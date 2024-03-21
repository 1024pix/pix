import * as errors from '../../../../../src/prescription/campaign-participation/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Errors', function () {
  it('should export a CampaignParticipationDeletedError', function () {
    expect(errors.CampaignParticipationDeletedError).to.exist;
  });
});
