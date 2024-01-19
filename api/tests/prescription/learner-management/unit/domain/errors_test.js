import * as errors from '../../../../../src/prescription/learner-management/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Prescription | Learner Management | Domain | Errors', function () {
  it('should export a SiecleXmlImportError', function () {
    expect(errors.SiecleXmlImportError).to.exist;
  });
});
