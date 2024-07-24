import { certificationCenterController } from '../../../../../src/organizational-entities/application/certification-center/certification-center.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | certification center', function () {
  describe('#findPaginatedFilteredCertificationCenters', function () {
    it('should return the serialized certification centers', async function () {
      // given
      const certificationCenter1 = domainBuilder.buildCertificationCenter();
      const serializedCertificationCenters = Symbol('serialized certification centers and pagination as meta');
      const pagination = { page: 1, pageSize: 2, itemsCount: 1, pagesCount: 1 };

      const request = {
        query: {
          filter: { id: certificationCenter1.id },
          page: { number: 1, size: 2 },
        },
      };

      const certificationCenterSerializerStub = {
        serialize: sinon.stub(),
      };

      certificationCenterSerializerStub.serialize
        .withArgs([certificationCenter1], pagination)
        .returns(serializedCertificationCenters);

      const dependencies = {
        certificationCenterSerializer: certificationCenterSerializerStub,
      };

      sinon
        .stub(usecases, 'findPaginatedFilteredCertificationCenters')
        .withArgs({
          filter: request.query.filter,
          page: request.query.page,
        })
        .resolves({
          models: [certificationCenter1],
          pagination,
        });

      // when
      const response = await certificationCenterController.findPaginatedFilteredCertificationCenters(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(usecases.findPaginatedFilteredCertificationCenters).to.have.been.calledOnce;
      expect(response).equal(serializedCertificationCenters);
    });
  });
});
