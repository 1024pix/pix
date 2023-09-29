import { expect, hFake, sinon } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { schoolController } from '../../../../lib/application/school/school-controller.js';
import { School } from '../../../../lib/domain/models/School.js';

describe('Unit | Controller | school-controller', function () {
  describe('#getSchool', function () {
    context('if school exists', function () {
      it('should return the serialized progression', async function () {
        // given
        const code = 'COOLCLASS';

        sinon.stub(usecases, 'getSchoolByCode');
        usecases.getSchoolByCode.resolves(new School({ id: '1', code, name: 'Ecole des fans' }));
        // when

        const request = {
          params: { code },
        };
        const response = await schoolController.getSchool(request, hFake);
        // Then
        const serializedSchool = {
          data: {
            id: '1',
            attributes: {
              code,
              name: 'Ecole des fans',
            },
            type: 'schools',
          },
        };

        expect(usecases.getSchoolByCode).to.have.been.calledWith({ code });
        expect(response).to.deep.equal(serializedSchool);
      });
    });
  });
});
