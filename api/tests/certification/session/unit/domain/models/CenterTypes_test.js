import { expect } from '../../../../../test-helper.js';
import { CenterTypes } from '../../../../../../src/certification/session/domain/models/CenterTypes.js';

describe('Unit | Certification | Center | Domain | Models | CenterTypes', function () {
  it('should return the center types', function () {
    // given / when / then
    expect(CenterTypes).to.deep.equal({
      SUP: 'SUP',
      SCO: 'SCO',
      PRO: 'PRO',
    });
  });
});
