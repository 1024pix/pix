import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-pole-emploi', function () {
  setupTest();

  context('when pole-emploi user disallow PIX to use data', function () {
    it('should throw an error if there is an error in query parameters', function () {
      // given
      const route = this.owner.lookup('route:login-pole-emploi');

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
