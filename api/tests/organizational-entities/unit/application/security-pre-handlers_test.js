import sinon from 'sinon';

import { organizationalEntitiesSecurityPreHandlers } from '../../../../src/organizational-entities/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | security-pre-handlers', function () {
  describe('#checkCertificationCenterIsNotScoManagingStudents', function () {
    let checkCertificationCenterIsScoManagingStudentsUsecase;

    let dependencies;

    beforeEach(function () {
      checkCertificationCenterIsScoManagingStudentsUsecase = { execute: sinon.stub() };
      dependencies = { checkCertificationCenterIsScoManagingStudentsUsecase };
    });

    context('Successful cases', function () {
      context('when certification center does not belong to an active sco organization', function () {
        it('should authorize access to resource when the user is authenticated', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            params: {
              certificationCenterId: 5678,
            },
          };
          dependencies.checkCertificationCenterIsScoManagingStudentsUsecase.execute.resolves(false);

          // when
          const response =
            await organizationalEntitiesSecurityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
              request,
              hFake,
              dependencies,
            );

          // then
          expect(response.source).to.be.true;
        });
      });

      context('when certification center id is in request params', function () {
        it('should authorize access to resource when the user is authenticated, member of certification center and the organization associated is not SCO managing students', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            params: {
              certificationCenterId: 5678,
            },
          };
          dependencies.checkCertificationCenterIsScoManagingStudentsUsecase.execute.resolves(false);

          // when
          const response =
            await organizationalEntitiesSecurityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
              request,
              hFake,
              dependencies,
            );

          // then
          expect(response.source).to.be.true;
        });
      });

      context('when certification center id is in request payload', function () {
        it('should authorize access to resource when the user is authenticated, member of certification center and the organization associated is not SCO managing students', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            payload: {
              data: {
                attributes: {
                  certificationCenterId: 5678,
                },
              },
            },
          };
          dependencies.checkCertificationCenterIsScoManagingStudentsUsecase.execute.resolves(false);

          // when
          const response =
            await organizationalEntitiesSecurityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
              request,
              hFake,
              dependencies,
            );

          // then
          expect(response.source).to.be.true;
        });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const request = {
          payload: {
            data: {
              attributes: {
                certificationCenterId: 5678,
              },
            },
          },
        };

        // when
        const response =
          await organizationalEntitiesSecurityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
            request,
            hFake,
            dependencies,
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when the certification center does belong to SCO Organization and manage students', async function () {
        // given
        const request = {
          auth: {
            credentials: {
              accessToken: 'valid.access.token',
              userId: 1234,
            },
          },
          payload: {
            data: {
              attributes: {
                certificationCenterId: 5678,
              },
            },
          },
        };
        dependencies.checkCertificationCenterIsScoManagingStudentsUsecase.execute.resolves(true);

        // when
        const response =
          await organizationalEntitiesSecurityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
            request,
            hFake,
            dependencies,
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
