import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-cnav', function () {
  setupTest();

  context('when cnav user disallow pix to use data', function () {
    it('should throw an error if there is an error in query parameters', function () {
      // given
      const route = this.owner.lookup('route:login-cnav');

      // when & then
      expect(() => {
        route.beforeModel({
          to: {
            queryParams: {
              error: 'access_denied',
              error_description: 'Access was denied.',
            },
          },
        });
      }).to.throw(Error, 'access_denied: Access was denied.');
    });
  });
});
