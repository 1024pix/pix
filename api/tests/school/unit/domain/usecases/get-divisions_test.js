import { Division } from '../../../../../src/school/domain/models/Division.js';
import { getDivisions } from '../../../../../src/school/domain/usecases/get-divisions.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | get-divisions', function () {
  it('should call the school repository ', async function () {
    const organizationId = 'someOrgaId';
    const schoolRepository = { getDivisions: sinon.stub() };
    const schoolDivision = new Division('CM2');
    schoolRepository.getDivisions.resolves([schoolDivision]);

    const divisions = await getDivisions({ organizationId, schoolRepository });

    expect(schoolRepository.getDivisions).to.have.been.calledWithExactly({ organizationId });
    expect(divisions).to.contain(schoolDivision);
  });
});
