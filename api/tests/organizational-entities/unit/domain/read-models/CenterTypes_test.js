import { CenterTypes } from '../../../../../src/organizational-entities/domain/read-models/CenterTypes.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | Read Models | CenterTypes', function () {
  it('should return the center types', function () {
    // given / when / then
    expect(CenterTypes).to.contains({
      SUP: 'SUP',
      SCO: 'SCO',
      PRO: 'PRO',
    });
  });
});
