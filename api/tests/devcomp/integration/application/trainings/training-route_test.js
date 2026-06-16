import sinon from 'sinon';

import { trainingController } from '../../../../../src/devcomp/application/trainings/training-controller.js';
import * as moduleUnderTest from '../../../../../src/devcomp/application/trainings/training-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { PIX_ADMIN } from '../../../../../src/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { getAdminRoleStub } from '../../../../tooling/mocks/security-pre-handlers.mock.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Devcomp | Application | Trainings | Router | training-router', function () {
  describe('GET /api/admin/trainings/${trainingId}', function () {
    describe('Security Prehandlers', function () {
      it('should allow user if its role is SUPER_ADMIN', async function () {
        // given
        sinon.stub(trainingController, 'getById').returns('ok');
        const preHandlerStub = getAdminRoleStub(PIX_ADMIN.ROLES.SUPER_ADMIN);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/admin/trainings/1');

        // then
        expect(preHandlerStub).to.have.been.calledOnce;
        expect(trainingController.getById).to.have.been.calledOnce;
      });

      it('should allow user if the role is METIER', async function () {
        // given
        sinon.stub(trainingController, 'getById').returns('ok');
        const preHandlerStub = getAdminRoleStub(PIX_ADMIN.ROLES.METIER);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/admin/trainings/1');

        // then
        expect(preHandlerStub).to.have.been.calledOnce;
        expect(trainingController.getById).to.have.been.calledOnce;
      });

      it('should allow user if the role is SUPPORT', async function () {
        // given
        sinon.stub(trainingController, 'getById').returns('ok');
        const preHandlerStub = getAdminRoleStub(PIX_ADMIN.ROLES.SUPPORT);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/admin/trainings/1');

        // then
        expect(preHandlerStub).to.have.been.calledOnce;
        expect(trainingController.getById).to.have.been.calledOnce;
      });

      it('should return 403 it if the role is not allowed', async function () {
        // given
        sinon.stub(trainingController, 'getById').returns('not ok');
        const preHandlerStub = getAdminRoleStub(PIX_ADMIN.ROLES.CERTIF);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/trainings/1');

        // then
        expect(response.statusCode).to.equal(403);
        expect(preHandlerStub).not.to.have.been.calledOnce;
        expect(trainingController.getById).not.to.have.been.calledOnce;
      });
    });

    describe('Param validation', function () {
      let httpTestServer;

      beforeEach(function () {
        sinon.stub(trainingController, 'getById').callsFake((request, h) => h.response('ok'));

        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(false));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(false));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));

        httpTestServer = new HttpTestServer();
      });

      it('should return 200 if the trainingId param is a number', async function () {
        // given
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/trainings/1');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return 400 if the trainingId param is not a number', async function () {
        // given
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/trainings/toto');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/admin/trainings', function () {
    let validPayload;

    beforeEach(function () {
      validPayload = {
        data: {
          attributes: {
            link: 'http://www.example.net',
            title: 'ma formation',
            'internal-title': 'Ma formation',
            duration: { days: 2, hours: 2, minutes: 2 },
            type: 'webinaire',
            locales: ['fr-fr'],
            'editor-name': 'ministère',
            'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
          },
        },
      };
    });

    describe('Security Prehandlers', function () {
      it('should allow user if its role is SUPER_ADMIN', async function () {
        // given
        sinon.stub(trainingController, 'create').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('POST', '/api/admin/trainings', validPayload);

        // then
        sinon.assert.calledOnce(trainingController.create);
      });

      it('should allow user if the role is METIER', async function () {
        // given
        sinon.stub(trainingController, 'create').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('POST', '/api/admin/trainings', validPayload);

        // then
        sinon.assert.calledOnce(trainingController.create);
      });

      it('should return 403 it if the role is not allowed', async function () {
        // given
        sinon.stub(trainingController, 'create').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', validPayload);

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(trainingController.create);
      });
    });

    describe('Data validation', function () {
      it('should return 201 if the payload is valid', async function () {
        // given
        sinon.stub(trainingController, 'create').callsFake((request, h) => h.response().created());

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', validPayload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      context('when training type is modulix', function () {
        it('should return 201 when the payload is valid', async function () {
          // given
          validPayload.type = 'modulix';
          validPayload.link = '/modules/azazazaz/bac-a-sable';

          sinon.stub(trainingController, 'create').callsFake((request, h) => h.response().created());

          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/trainings', validPayload);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      it('should return 400 if the editorLogoUrl is not a valid url', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              link: 'http://www.example.net',
              title: 'ma formation',
              'internal-title': 'Ma formation',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              locales: ['fr-fr'],
              'editor-name': 'ministère',
              'editor-logo-url': 'image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').callsFake((request, h) => h.response().created());

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(JSON.parse(response.payload).errors[0].detail).to.equal(
          '"data.attributes.editor-logo-url" with value "image.svg" fails to match the required pattern: /^https:\\/\\/assets.pix.org\\/contenu-formatif\\/editeur\\/.*\\.svg$/',
        );
        expect(response.statusCode).to.equal(400);
      });

      context("when payload type is 'modulix'", function () {
        it('should return 400 if link attribute is empty', async function () {
          // given
          const invalidPayload = {
            data: {
              attributes: {
                link: '',
                title: 'ma formation',
                'internal-title': 'Ma formation',
                duration: { days: 2, hours: 2, minutes: 2 },
                type: 'modulix',
                locales: ['fr-fr'],
                'editor-name': 'ministère',
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
              },
            },
          };
          sinon.stub(trainingController, 'create').callsFake((request, h) => h.response().created());

          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

          // then

          expect(JSON.parse(response.payload).errors[0].detail).to.equal(
            '"data.attributes.link" is not allowed to be empty',
          );
          expect(response.statusCode).to.equal(400);
        });
      });

      context("when payload type is not 'modulix'", function () {
        it('should return 400 if link attribute is not an uri', async function () {
          // given
          const invalidPayload = {
            data: {
              attributes: {
                link: '/modules/azazazaz/not-an-uri',
                title: 'ma formation',
                'internal-title': 'Ma formation',
                duration: { days: 2, hours: 2, minutes: 2 },
                type: 'webinaire',
                locales: ['fr-fr'],
                'editor-name': 'ministère',
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
              },
            },
          };
          sinon.stub(trainingController, 'create').callsFake((request, h) => h.response().created());

          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

          // then

          expect(JSON.parse(response.payload).errors[0].detail).to.equal('"data.attributes.link" must be a valid uri');
          expect(response.statusCode).to.equal(400);
        });
      });

      it('should return 400 if in the payload there is no link', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'ma formation',
              'internal-title': 'Ma formation',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              locales: ['fr-fr'],
              'editor-name': 'ministère',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if in the payload there is no title', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              'internal-title': 'Ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              locales: ['fr-fr'],
              'editor-name': 'ministère',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if in the payload there is no internal title', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'Ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              locales: ['fr-fr'],
              'editor-name': 'ministère',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      describe('duration', function () {
        it('should return 400 if in the payload there is no duration', async function () {
          // given
          const invalidPayload = {
            data: {
              attributes: {
                title: 'ma formation',
                link: 'http://www.example.net',
                type: 'webinaire',
                locales: ['fr-fr'],
                'editor-name': 'ministère',
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
              },
            },
          };
          sinon.stub(trainingController, 'create').returns('ok');

          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        [{ days: -1 }, { hours: -1 }, { hours: 24 }, { minutes: -1 }, { minutes: 60 }].forEach((duration) => {
          it(`should return 400 if the payload.duration is ${JSON.stringify(duration)}`, async function () {
            // given
            const invalidPayload = {
              data: {
                attributes: { ...validPayload.data.attributes, duration },
              },
            };

            sinon.stub(trainingController, 'create').returns('ok');

            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
              .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
              .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
              .callsFake((request, h) => h.response(true));

            const httpTestServer = new HttpTestServer();
            await httpTestServer.register(moduleUnderTest);

            // when
            const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

            // then
            expect(response.statusCode).to.equal(400);
          });
        });
      });

      it('should return 400 if in the payload there is no type', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              locales: ['fr-fr'],
              'editor-name': 'ministère',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if in the payload there is no locale', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              'editor-name': 'ministère',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if in the payload, locales is not an array of supported locales', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              'editor-name': 'ministère',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
              'internal-title': 'ma formation interne',
              locales: ['not-supported-locale-1', 'not-supported-locale-2'],
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if in the payload there is no editor-name', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              locales: ['fr-fr'],
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if in the payload there is no editor-logo-url', async function () {
        // given
        const invalidPayload = {
          data: {
            attributes: {
              title: 'ma formation',
              link: 'http://www.example.net',
              duration: { days: 2, hours: 2, minutes: 2 },
              type: 'webinaire',
              locales: ['fr-fr'],
              'editor-name': 'ministère',
            },
          },
        };
        sinon.stub(trainingController, 'create').returns('ok');

        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });

      describe('locale', function () {
        it('should return 400 if the locale is not in lowercase', async function () {
          // given
          const invalidPayload = {
            data: {
              attributes: {
                link: 'http://www.example.net',
                title: 'ma formation',
                duration: { days: 2, hours: 2, minutes: 2 },
                type: 'webinaire',
                locales: ['fr-BE'],
                'editor-name': 'ministère',
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
              },
            },
          };
          sinon.stub(trainingController, 'create').returns('ok');

          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return 400 if the locale is not supported', async function () {
          // given
          const invalidPayload = {
            data: {
              attributes: {
                link: 'http://www.example.net',
                title: 'ma formation',
                duration: { days: 2, hours: 2, minutes: 2 },
                type: 'webinaire',
                locales: ['ja-Jpan-JP-u-ca-japanese-hc-h12'],
                'editor-name': 'ministère',
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
              },
            },
          };
          sinon.stub(trainingController, 'create').returns('ok');

          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/trainings', invalidPayload);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('POST /api/admin/trainings/{trainingId}/duplicate', function () {
    describe('Security Prehandlers', function () {
      it('should allow user if its role is SUPER_ADMIN', async function () {
        // given
        sinon.stub(trainingController, 'duplicate').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('POST', '/api/admin/trainings/11111/duplicate');

        // then
        sinon.assert.calledOnce(trainingController.duplicate);
      });

      it('should allow user if the role is METIER', async function () {
        // given
        sinon.stub(trainingController, 'duplicate').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('POST', '/api/admin/trainings/11111/duplicate');

        // then
        sinon.assert.calledOnce(trainingController.duplicate);
      });

      it('should return 403 it if the role is not allowed', async function () {
        // given
        sinon.stub(trainingController, 'duplicate').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings/11111/duplicate');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(trainingController.duplicate);
      });
    });
  });

  describe('PATCH /api/admin/trainings', function () {
    describe('Security Prehandlers', function () {
      [
        {
          role: 'SUPER_ADMIN',
          securityPreHandlersResponses: {
            checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response(true),
            checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
          },
        },
        {
          role: 'METIER',
          securityPreHandlersResponses: {
            checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
            checkAdminMemberHasRoleMetier: (request, h) => h.response(true),
          },
        },
      ].forEach(({ role, securityPreHandlersResponses }) => {
        it(`should verify user identity and return success update when user role is "${role}"`, async function () {
          // given
          sinon.stub(trainingController, 'update').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSuperAdmin);
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
            .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleMetier);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payloadAttributes = {
            title: 'new title',
            'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
          };
          const payload = { data: { attributes: payloadAttributes } };

          // when
          const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

          // then
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
          sinon.assert.calledOnce(trainingController.update);
          expect(result.statusCode).to.equal(200);
        });
      });

      it(`should return 403 when user does not have access METIER`, async function () {
        // given
        sinon.stub(trainingController, 'update').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payloadAttributes = {
          title: 'new title',
          'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
        };
        const payload = { data: { attributes: payloadAttributes } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
        sinon.assert.notCalled(trainingController.update);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('Data validation', function () {
      it('should return bad request when param id is not numeric', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: { title: 'new title' } } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/trainings/not_number', payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when payload is not provided', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344');

        // then
        expect(result.statusCode).to.equal(400);
      });

      describe('duration', function () {
        describe('out of range', function () {
          [{ days: -1 }, { hours: -1 }, { hours: 24 }, { minutes: -1 }, { minutes: 60 }].forEach((duration) => {
            it(`should return 400 if the payload.duration is ${JSON.stringify(duration)}`, async function () {
              // given
              const securityPreHandlersResponses = {
                checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response(true),
                checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
              };

              sinon.stub(trainingController, 'update').returns('ok');
              sinon
                .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
                .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSuperAdmin);
              sinon
                .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
                .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleMetier);
              const invalidPayload = {
                data: {
                  attributes: { duration },
                },
              };
              const httpTestServer = new HttpTestServer();
              await httpTestServer.register(moduleUnderTest);

              // when
              const result = await httpTestServer.request('PATCH', '/api/admin/trainings/1', invalidPayload);

              // then
              expect(result.statusCode).to.equal(400);
            });
          });
        });

        describe('incomplete', function () {
          [
            { days: 2, hours: 2 },
            { days: 2, minutes: 2 },
            { hours: 2, minutes: 2 },
            { days: 2 },
            { hours: 2 },
            { minutes: 2 },
            {},
          ].forEach((duration) => {
            it(`should return 400 if the payload.duration is ${JSON.stringify(duration)}`, async function () {
              // given
              const securityPreHandlersResponses = {
                checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response(true),
                checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
              };

              sinon.stub(trainingController, 'update').returns('ok');
              sinon
                .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
                .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSuperAdmin);
              sinon
                .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
                .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleMetier);
              const invalidPayload = {
                data: {
                  attributes: { duration },
                },
              };
              const httpTestServer = new HttpTestServer();
              await httpTestServer.register(moduleUnderTest);

              // when
              const result = await httpTestServer.request('PATCH', '/api/admin/trainings/1', invalidPayload);

              // then
              expect(result.statusCode).to.equal(400);
            });
          });
        });

        describe('success', function () {
          [
            { days: 2, hours: 2, minutes: 2 },
            { days: 0, hours: 0, minutes: 0 },
          ].forEach((duration) => {
            it(`should return 200 if the payload.duration is ${JSON.stringify(duration)}`, async function () {
              // given
              const securityPreHandlersResponses = {
                checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response(true),
                checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
              };

              sinon.stub(trainingController, 'update').returns('ok');
              sinon
                .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
                .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSuperAdmin);
              sinon
                .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
                .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleMetier);
              const validPayload = {
                data: {
                  attributes: {
                    duration,
                    'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/image.svg',
                  },
                },
              };
              const httpTestServer = new HttpTestServer();
              await httpTestServer.register(moduleUnderTest);

              // when
              const result = await httpTestServer.request('PATCH', '/api/admin/trainings/1', validPayload);

              // then
              expect(result.statusCode).to.equal(200);
            });
          });
        });
      });

      describe('locale', function () {
        it('should return bad request when locale is not in lowercase', async function () {
          // given
          sinon.stub(trainingController, 'update').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response(true));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payload = { data: { attributes: { locales: ['fr-BE'] } } };

          // when
          const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

          // then
          expect(result.statusCode).to.equal(400);
        });

        it('should return bad request when locale is not supported', async function () {
          // given
          sinon.stub(trainingController, 'update').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response(true));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payload = { data: { attributes: { locales: ['ja-Jpan-JP-u-ca-japanese-hc-h12'] } } };

          // when
          const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

          // then
          expect(result.statusCode).to.equal(400);
        });
      });

      describe('locales', function () {
        it('should return bad request when locales is not an array of supported locales', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payload = {
            data: {
              attributes: {
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
                locales: ['not-supported-locales'],
              },
            },
          };

          // when
          const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

          // then
          expect(result.statusCode).to.equal(400);
        });
      });

      describe('when optional reco engine fields are null', function () {
        it('should return 200 and accept null values', async function () {
          // given
          sinon.stub(trainingController, 'update').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response(true));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payload = {
            data: {
              attributes: {
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
                description: null,
                objectives: null,
                program: null,
                'delivery-mode': null,
                'registration-required': null,
              },
            },
          };

          // when
          const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

          // then
          expect(result.statusCode).to.equal(200);
          sinon.assert.calledOnce(trainingController.update);
        });
      });

      describe('when optional reco engine fields are empty strings', function () {
        it('should return 200 and accept empty string values', async function () {
          // given
          sinon.stub(trainingController, 'update').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response(true));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payload = {
            data: {
              attributes: {
                'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
                description: '',
                objectives: '',
                program: '',
              },
            },
          };

          // when
          const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

          // then
          expect(result.statusCode).to.equal(200);
          sinon.assert.calledOnce(trainingController.update);
        });
      });

      describe('when editorLogoUrl is not a valid url', function () {
        it('should return 400', async function () {
          // given
          const invalidPayload = {
            data: {
              attributes: {
                link: 'http://www.example.net',
                title: 'ma formation',
                'internal-title': 'Ma formation',
                duration: { days: 2, hours: 2, minutes: 2 },
                type: 'webinaire',
                locales: ['fr-fr'],
                'editor-name': 'ministère',
                'editor-logo-url': 'image.svg',
              },
            },
          };
          sinon.stub(trainingController, 'create').callsFake((request, h) => h.response().created());
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('PATCH', '/api/admin/trainings/1', invalidPayload);

          // then
          expect(JSON.parse(response.payload).errors[0].detail).to.equal(
            '"data.attributes.editor-logo-url" with value "image.svg" fails to match the required pattern: /^https:\\/\\/assets.pix.org\\/contenu-formatif\\/editeur\\/.*\\.svg$/',
          );
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('GET /api/admin/training-summaries', function () {
    const method = 'GET';
    const url = '/api/admin/training-summaries';

    context("when user has role 'SUPER_ADMIN', 'SUPPORT', 'METIER'", function () {
      [
        {
          role: 'SUPER_ADMIN',
          securityPreHandlersResponses: {
            checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response(true),
            checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
            checkAdminMemberHasRoleSupport: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
          },
        },
        {
          role: 'METIER',
          securityPreHandlersResponses: {
            checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
            checkAdminMemberHasRoleMetier: (request, h) => h.response(true),
            checkAdminMemberHasRoleSupport: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
          },
        },
        {
          role: 'SUPPORT',
          securityPreHandlersResponses: {
            checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
            checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
            checkAdminMemberHasRoleSupport: (request, h) => h.response(true),
          },
        },
      ].forEach(({ role, securityPreHandlersResponses }) => {
        it(`should verify user identity and return success update when user role is "${role}"`, async function () {
          // given
          sinon.stub(trainingController, 'findPaginatedTrainingSummaries').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSuperAdmin);
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
            .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleMetier);
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSupport);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const result = await httpTestServer.request(method, url);

          // then
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
          sinon.assert.calledOnce(trainingController.findPaginatedTrainingSummaries);
          expect(result.statusCode).to.equal(200);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(403);
      });
    });

    context('when there is no pagination', function () {
      it('should resolve with HTTP code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(trainingController, 'findPaginatedTrainingSummaries')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });

    context('when there are pagination', function () {
      it('should resolve with HTTP code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(trainingController, 'findPaginatedTrainingSummaries')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, `${url}?page[size]=10&page[number]=1`);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when page size is not an integer', function () {
      it('should reject request with HTTP code 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, `${url}?page[size]=azerty`);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when page number is not an integer', function () {
      it('should reject request with HTTP code 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, `${url}?page[number]=azerty`);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('PUT /api/admin/trainings/:id/triggers', function () {
    let validPayload;

    beforeEach(function () {
      validPayload = {
        data: {
          type: 'training-triggers',
          attributes: {
            trainingId: 123,
            type: 'prerequisite',
            threshold: 30,
            tubes: [{ tubeId: 'recTube123', level: 2 }],
          },
        },
      };
    });

    describe('Security Prehandlers', function () {
      it(`should verify user identity and return success update when user role is "SUPER_ADMIN"`, async function () {
        // given
        sinon.stub(trainingController, 'createOrUpdateTrigger').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/12344/triggers', validPayload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
        sinon.assert.calledOnce(trainingController.createOrUpdateTrigger);
        expect(result.statusCode).to.equal(200);
      });

      it(`should verify user identity and return success update when user role is "METIER"`, async function () {
        // given
        sinon.stub(trainingController, 'createOrUpdateTrigger').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/12344/triggers', validPayload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
        sinon.assert.calledOnce(trainingController.createOrUpdateTrigger);
        expect(result.statusCode).to.equal(200);
      });

      it(`should return 403 when user does not have access METIER`, async function () {
        // given
        sinon.stub(trainingController, 'createOrUpdateTrigger').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = validPayload;

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/12344/triggers', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
        sinon.assert.notCalled(trainingController.createOrUpdateTrigger);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('Data validation', function () {
      it('should return bad request when param id is not numeric', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = validPayload;

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/not_number/triggers', payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when payload is not provided', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/12344/triggers');

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when tubes array is empty', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const invalidPayload = {
          data: {
            attributes: {
              type: 'prerequisite',
              threshold: 50,
              tubes: [],
            },
            type: 'training-triggers',
          },
        };

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/12344/triggers', invalidPayload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return 200 OK when payload is valid', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').resolves(true);
        sinon.stub(trainingController, 'createOrUpdateTrigger').callsFake((request, h) => h.response().created());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const validPayload = {
          data: {
            attributes: {
              type: 'prerequisite',
              threshold: 50,
              tubes: [{ tubeId: 'recTube123', level: 2 }],
            },
            type: 'training-triggers',
          },
        };

        // when
        const result = await httpTestServer.request('PUT', '/api/admin/trainings/12344/triggers', validPayload);

        // then
        expect(result.statusCode).to.equal(201);
      });
    });
  });

  describe('GET /api/admin/trainings/{id}/target-profile-summaries', function () {
    describe('Security Prehandlers', function () {
      it('should verify user identity and return success update when user role is SUPER_ADMIN', async function () {
        // given
        sinon.stub(trainingController, 'findTargetProfileSummaries').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('GET', '/api/admin/trainings/12344/target-profile-summaries');

        // then
        sinon.assert.calledOnce(trainingController.findTargetProfileSummaries);
        expect(result.statusCode).to.equal(200);
      });

      it('should verify user identity and return success update when user role is METIER', async function () {
        // given
        sinon.stub(trainingController, 'findTargetProfileSummaries').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('GET', '/api/admin/trainings/12344/target-profile-summaries');

        // then
        sinon.assert.calledOnce(trainingController.findTargetProfileSummaries);
        expect(result.statusCode).to.equal(200);
      });

      it('should allow user if the role is SUPPORT', async function () {
        // given
        sinon.stub(trainingController, 'findTargetProfileSummaries').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/admin/trainings/12344/target-profile-summaries');

        // then
        sinon.assert.calledOnce(trainingController.findTargetProfileSummaries);
      });

      it('should return 403 it if the role is not allowed', async function () {
        // given
        sinon.stub(trainingController, 'findTargetProfileSummaries').returns('not ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/trainings/12344/target-profile-summaries');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(trainingController.findTargetProfileSummaries);
      });
    });

    describe('Param validation', function () {
      let httpTestServer;

      beforeEach(function () {
        sinon.stub(trainingController, 'findTargetProfileSummaries').callsFake((request, h) => h.response('ok'));

        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(false));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(false));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));

        httpTestServer = new HttpTestServer();
      });

      it('should return 200 if the trainingId param is a number', async function () {
        // given
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/trainings/1/target-profile-summaries');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return 400 if the trainingId param is not a number', async function () {
        // given
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/trainings/toto/target-profile-summaries');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/admin/trainings/{id}/attach-target-profiles', function () {
    describe('Security PreHandlers', function () {
      it('should verify user identity and reach controller if user has role SUPER_ADMIN', async function () {
        // given
        sinon.stub(trainingController, 'attachTargetProfiles').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        await httpTestServer.request('POST', '/api/admin/trainings/1/attach-target-profiles', payload);

        // then
        sinon.assert.calledOnce(trainingController.attachTargetProfiles);
      });

      it('should verify user identity and reach controller if user has role METIER', async function () {
        // given
        sinon.stub(trainingController, 'attachTargetProfiles').returns('ok');
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        await httpTestServer.request('POST', '/api/admin/trainings/1/attach-target-profiles', payload);

        // then
        sinon.assert.calledOnce(trainingController.attachTargetProfiles);
      });

      it('should return 403 without reaching controller if user has not an allowed role', async function () {
        // given
        sinon.stub(trainingController, 'attachTargetProfiles').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings/1/attach-target-profiles', payload);

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(trainingController.attachTargetProfiles);
      });
    });

    describe('Param validation', function () {
      it('should return a 404 HTTP response when target-profile-ids do not contain only numbers', async function () {
        // given
        sinon.stub(trainingController, 'attachTargetProfiles').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': ['a', 2],
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/trainings/1/attach-target-profiles', payload);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.payload).to.have.string("L'id d'un des profils cible ou du contenu formatif n'est pas valide");
      });

      it('should return a 404 HTTP response when training id is not valid', async function () {
        // given
        sinon.stub(trainingController, 'attachTargetProfiles').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/trainings/chaton/attach-target-profiles',
          payload,
        );

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.payload).to.have.string("L'id d'un des profils cible ou du contenu formatif n'est pas valide");
      });
    });
  });

  describe('DELETE /api/admin/trainings/{trainingId}/target-profiles/{targetProfileId}', function () {
    describe('Security Prehandlers', function () {
      let checkAdminMemberHasRoleMetierStub;
      let checkAdminMemberHasRoleSuperAdminStub;
      let httpTestServer;

      beforeEach(async function () {
        checkAdminMemberHasRoleMetierStub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier');
        checkAdminMemberHasRoleSuperAdminStub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');

        httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
      });

      it('should verify user identity and return success update when user role is SUPER_ADMIN', async function () {
        // given
        sinon.stub(trainingController, 'detachTargetProfile').returns('ok');
        checkAdminMemberHasRoleSuperAdminStub.callsFake((request, h) => h.response(true));

        // when
        await httpTestServer.request('DELETE', '/api/admin/trainings/1/target-profiles/2');

        // then
        sinon.assert.calledOnce(trainingController.detachTargetProfile);
      });

      it('should verify user identity and return success update when user role is METIER', async function () {
        // given
        sinon.stub(trainingController, 'detachTargetProfile').returns('ok');
        checkAdminMemberHasRoleSuperAdminStub.callsFake((request, h) =>
          h.response({ errors: new Error('forbidden') }).code(403),
        );
        checkAdminMemberHasRoleMetierStub.callsFake((request, h) => h.response(true));

        // when
        await httpTestServer.request('DELETE', '/api/admin/trainings/1/target-profiles/2');

        // then
        sinon.assert.calledOnce(trainingController.detachTargetProfile);
      });

      it('should return 403 without reaching controller if user has not an allowed role', async function () {
        // given
        sinon.stub(trainingController, 'detachTargetProfile').returns('ok');
        checkAdminMemberHasRoleSuperAdminStub.callsFake((request, h) =>
          h.response({ errors: new Error('forbidden') }).code(403),
        );
        checkAdminMemberHasRoleMetierStub.callsFake((request, h) =>
          h.response({ errors: new Error('forbidden') }).code(403),
        );

        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/trainings/1/target-profiles/2');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(trainingController.detachTargetProfile);
      });
    });

    describe('Param validation', function () {
      let httpTestServer;

      beforeEach(async function () {
        sinon.stub(trainingController, 'findTargetProfileSummaries').callsFake((request, h) => h.response('ok'));

        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(false));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(false));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));

        httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
      });

      it('should return 400 if the trainingId param is not a number', async function () {
        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/trainings/blabla/target-profiles/3');

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 if the targetProfileId param is not a number', async function () {
        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/trainings/3/target-profiles/azerty');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/training-summaries', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/training-summaries';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(trainingController, 'findPaginatedTrainingsSummariesByTargetProfileId')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when id is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/training-summaries',
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
