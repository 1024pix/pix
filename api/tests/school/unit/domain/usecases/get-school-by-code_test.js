import { catchErr, expect, sinon } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { usecases } from '../../../../../src/school/shared/usecases/index.js';

describe('Unit | UseCase | get-school-by-code', function () {
  let schoolRepository;

  beforeEach(function () {
    schoolRepository = {
      getByCode: sinon.stub(),
    };
  });

  context('when the school exists', function () {
    it('should return the school corresponding to the code', async function () {
      // given
      const code = 'QUOICOUBE';
      const school = Symbol('school');
      schoolRepository.getByCode.withArgs(code).resolves(school);

      // when
      const result = await usecases.getSchoolByCode({ code, schoolRepository });

      // then
      expect(result).to.equal(school);
    });
  });

  context('when the school does not exist', function () {
    it('should throw an error', async function () {
      // given
      const code = 'QUOICOUBE';
      schoolRepository.getByCode.withArgs(code).rejects(new NotFoundError());

      // when
      const err = await catchErr(usecases.getSchoolByCode)({ code, schoolRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
