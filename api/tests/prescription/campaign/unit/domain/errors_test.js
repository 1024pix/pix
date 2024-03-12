import * as errors from '../../../../../src/prescription/campaign/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Errors', function () {
  it('should export a ArchivedCampaignError', function () {
    expect(errors.ArchivedCampaignError).to.exist;
  });
});
