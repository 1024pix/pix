import { getVersionNumber } from '../../../../../../src/certification/configuration/domain/services/get-version-number.js';

describe('Unit | Domain | Services | get-version-number', function () {
  it('should return string from given date', async function () {
    const fakeCurrentDate = new Date('2025-06-23T12:56:43Z');
    const versionNumber = await getVersionNumber(fakeCurrentDate);
    expect(versionNumber).to.deep.equal('20250623125643');
  });
});
