import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Unit | Component | certifications', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#downloadAttestation', function () {
    module('when domain is french', function () {
      test('should call the file-saver service for downloadAttestation with the right parameters', async function (assert) {
        // given
        const component = createGlimmerComponent('user-certifications-detail-header');
        const certificationId = 12;
        const token = 'a token';

        component.args = { certification: { id: certificationId } };

        component.fileSaver = {
          save: sinon.stub(),
        };

        component.currentDomain = {
          isFranceDomain: true,
        };

        component.intl = {
          primaryLocale: 'fr',
        };

        component.session = {
          data: { authenticated: { access_token: token } },
        };

        // when
        await component.downloadAttestation();

        // then
        assert.ok(
          component.fileSaver.save.calledWith({
            token,
            url: `/api/attestation/12?isFrenchDomainExtension=true&lang=fr`,
          }),
        );
      });
    });

    module('when domain is not french', function () {
      module('when user lang is en', function () {
        test('should call the file-saver service for downloadAttestation with the right parameters', async function (assert) {
          // given
          const component = createGlimmerComponent('user-certifications-detail-header');
          const certificationId = 12;
          const token = 'a token';

          component.args = { certification: { id: certificationId } };

          component.fileSaver = {
            save: sinon.stub(),
          };

          component.currentDomain = {
            isFranceDomain: false,
          };

          component.intl = {
            primaryLocale: 'en',
          };

          component.session = {
            data: { authenticated: { access_token: token } },
          };

          // when
          await component.downloadAttestation();

          // then
          assert.ok(
            component.fileSaver.save.calledWith({
              token,
              url: `/api/attestation/12?isFrenchDomainExtension=false&lang=en`,
            }),
          );
        });
      });
    });
  });
});
