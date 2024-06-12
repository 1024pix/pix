import { ResetPasswordDemand } from '../../../../../src/identity-access-management/domain/models/ResetPasswordDemand.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Model | ResetPasswordDemand', function () {
  describe('constructor', function () {
    it('exists', function () {
      // when
      const resetPasswordDemand = new ResetPasswordDemand({
        id: 1,
        email: 'adam.troisjours@example.net',
        temporaryKey: 'secure-temporary-key',
        used: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // then
      expect(resetPasswordDemand).to.exist;
      expect(Object.keys(resetPasswordDemand)).to.deep.equal([
        'createdAt',
        'email',
        'id',
        'temporaryKey',
        'updatedAt',
        'used',
      ]);
    });
  });
});
