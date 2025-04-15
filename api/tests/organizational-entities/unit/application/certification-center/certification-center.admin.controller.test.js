import { certificationCenterAdminController } from '../../../../../src/organizational-entities/application/certification-center/certification-center.admin.controller.js';
import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | certification center', function () {
  describe('#create', function () {
    let request;

    context('when payload contains all certification center fields', function () {
      beforeEach(function () {
        request = {
          payload: {
            data: {
              attributes: {
                name: 'name',
                type: 'PRO',
                'data-protection-officer-email': 'email@example.net',
                'data-protection-officer-first-name': 'Firstname',
                'data-protection-officer-last-name': 'Lastname',
                'external-id': '12345',
                'is-complementary-alone-pilot': true,
              },
              id: '1',
              relationships: {
                habilitations: {
                  data: [
                    {
                      id: '2',
                      type: 'complementary-certifications',
                    },
                    {
                      id: '3',
                      type: 'complementary-certifications',
                    },
                  ],
                },
              },
            },
          },
        };
      });

      it('calls "createCertificationCenter" use case with the right parameters', async function () {
        // given
        const createCertificationCenterStub = sinon.stub(usecases, 'createCertificationCenter');

        // when
        await certificationCenterAdminController.create(request);

        // then
        const center = {
          id: '1',
          createdAt: null,
          externalId: '12345',
          habilitations: [],
          isComplementaryAlonePilot: true,
          name: 'name',
          type: 'PRO',
        };
        const dataProtectionOfficer = {
          firstName: 'Firstname',
          lastName: 'Lastname',
          email: 'email@example.net',
        };
        const expectedCenterForAdmin = new CenterForAdmin({
          center,
          dataProtectionOfficer,
        });
        const expectedComplementaryCertificationIds = ['2', '3'];

        expect(createCertificationCenterStub).to.have.been.calledOnceWith({
          certificationCenter: expectedCenterForAdmin,
          complementaryCertificationIds: expectedComplementaryCertificationIds,
        });
      });
    });
    context('when payload contains only required fields', function () {
      beforeEach(function () {
        request = {
          payload: {
            data: {
              attributes: {
                name: 'name',
                type: 'PRO',
                'external-id': null,
              },
            },
          },
        };
      });

      it('calls "createCertificationCenter" use case with the right parameters', async function () {
        // given
        const createCertificationCenterStub = sinon.stub(usecases, 'createCertificationCenter');

        // when
        await certificationCenterAdminController.create(request);

        // then
        const center = {
          createdAt: null,
          externalId: null,
          name: 'name',
          type: 'PRO',
        };
        const dataProtectionOfficer = {};
        const expectedCenterForAdmin = new CenterForAdmin({
          center,
          dataProtectionOfficer,
        });

        expect(createCertificationCenterStub).to.have.been.calledOnceWith({
          certificationCenter: expectedCenterForAdmin,
          complementaryCertificationIds: [],
        });
      });
    });
  });

  describe('#findPaginatedFilteredCertificationCenters', function () {
    it('returns the serialized certification centers', async function () {
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
      const response = await certificationCenterAdminController.findPaginatedFilteredCertificationCenters(
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
