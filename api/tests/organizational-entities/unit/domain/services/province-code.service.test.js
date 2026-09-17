import { expect } from 'chai';

import { padProvinceCode } from '../../../../../src/organizational-entities/domain/services/province-code.service.js';

describe('Unit | Organizational Entities | Domain | Service | province-code', function () {
  it('pads a short province code with leading zeros', function () {
    expect(padProvinceCode('6')).to.equal('006');
  });

  it('does not pad a province code already at target length', function () {
    expect(padProvinceCode('44')).to.equal('044');
  });

  it('returns null when province code is falsy', function () {
    expect(padProvinceCode(null)).to.be.null;
    expect(padProvinceCode('')).to.be.null;
  });
});
