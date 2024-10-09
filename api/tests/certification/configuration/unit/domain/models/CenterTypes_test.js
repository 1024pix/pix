import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | CenterTypes', function () {
  it('should return the center types', function () {
    // given / when / then
    expect(CenterTypes).to.contains({
      SUP: 'SUP',
      SCO: 'SCO',
      PRO: 'PRO',
    });
  });
});
