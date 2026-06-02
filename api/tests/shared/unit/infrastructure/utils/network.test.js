import {
  ForwardedOriginError,
  getForwardedOrigin,
  RequestedApplication,
} from '../../../../../src/shared/infrastructure/utils/network.js';
import { expect } from '../../../../test-helper.js';

describe('Shared | Unit | Infrastructure | Utils | network', function () {
  describe('#getForwardedOrigin', function () {
    context('when port is HTTP standard port 80', function () {
      it('returns an HTTP URL', async function () {
        // given
        const headers = {
          'x-forwarded-proto': 'http',
          'x-forwarded-port': '80',
          'x-forwarded-host': 'localhost',
        };

        // when
        const origin = getForwardedOrigin(headers);

        // then
        expect(origin).to.equal('http://localhost');
      });
    });

    context('when port is HTTPS standard port 443', function () {
      it('returns an HTTPS URL', async function () {
        // given
        const headers = {
          'x-forwarded-proto': 'https',
          'x-forwarded-port': '443',
          'x-forwarded-host': 'app-pr10823.review.pix.fr',
        };

        // when
        const origin = getForwardedOrigin(headers);

        // then
        expect(origin).to.equal('https://app-pr10823.review.pix.fr');
      });
    });

    context('when port is neither HTTP nor HTTPS standard ports', function () {
      it('returns an URL with a specific port', async function () {
        // given
        const headers = {
          'x-forwarded-proto': 'http',
          'x-forwarded-port': '4200',
          'x-forwarded-host': 'localhost:4200',
        };

        // when
        const origin = getForwardedOrigin(headers);

        // then
        expect(origin).to.equal('http://localhost:4200');
      });
    });

    context('when x-forwarded-proto and x-forwarded-port have multiple values (ember serve --proxy)', function () {
      it('returns an URL corresponding to the first HTTP proxy facing the user', async function () {
        // given
        const headers = {
          'x-forwarded-proto': 'https,http',
          'x-forwarded-port': '80',
          'x-forwarded-host': 'app.dev.pix.org',
        };

        // when
        const origin = getForwardedOrigin(headers);

        // then
        expect(origin).to.equal('https://app.dev.pix.org');
      });
    });

    context('when x-forwarded-proto and x-forwarded-port are not defined', function () {
      it('throws a ForwardedOriginError', function () {
        // given
        const headers = {};

        // when & then
        expect(() => getForwardedOrigin(headers)).to.throw(ForwardedOriginError, 'Missing forwarded header(s)');
      });
    });
  });

  describe('RequestedApplication', function () {
    describe('constructor', function () {
      it('creates an instance with properties', function () {
        // given
        const applicationName = 'orga';
        const applicationTld = '.fr';

        // when
        const requestedApplication = new RequestedApplication({ applicationName, applicationTld });

        // then
        expect(requestedApplication.applicationName).to.equal('orga');
        expect(requestedApplication.applicationTld).to.equal('.fr');
      });
    });

    describe('#fromOrigin', function () {
      it('returns the application name as the first label in the hostname', function () {
        // given
        const origin = 'https://app.pix.org';

        // when
        const requestedApplication = RequestedApplication.fromOrigin(origin);

        // then
        expect(requestedApplication).to.be.instanceOf(RequestedApplication);
        expect(requestedApplication.applicationName).to.equal('app');
        expect(requestedApplication.applicationTld).to.equal('.org');
        expect(requestedApplication.isPixApp).to.be.true;
        expect(requestedApplication.isPixAdmin).to.be.false;
        expect(requestedApplication.isPixOrga).to.be.false;
        expect(requestedApplication.isPixCertif).to.be.false;
        expect(requestedApplication.isPixJunior).to.be.false;
      });

      context('when the application is a Review App', function () {
        it('returns the application name as a sub-part of the first label in the hostname', function () {
          // given
          const origin = 'https://app-pr11415.review.pix.org/';

          // when
          const requestedApplication = RequestedApplication.fromOrigin(origin);

          // then
          expect(requestedApplication).to.be.instanceOf(RequestedApplication);
          expect(requestedApplication.applicationName).to.equal('app');
          expect(requestedApplication.applicationTld).to.equal('.org');
          expect(requestedApplication.isPixApp).to.be.true;
          expect(requestedApplication.isPixAdmin).to.be.false;
          expect(requestedApplication.isPixOrga).to.be.false;
          expect(requestedApplication.isPixCertif).to.be.false;
          expect(requestedApplication.isPixJunior).to.be.false;
        });
      });

      context('when the application is accessed directly on localhost', function () {
        context('when port is 4200', function () {
          it('returns the application name based on port 4200', function () {
            // given
            const origin = 'http://localhost:4200/';

            // when
            const requestedApplication = RequestedApplication.fromOrigin(origin);

            // then
            expect(requestedApplication).to.be.instanceOf(RequestedApplication);
            expect(requestedApplication.applicationName).to.equal('app');
            expect(requestedApplication.applicationTld).to.equal('');
            expect(requestedApplication.isPixApp).to.be.true;
            expect(requestedApplication.isPixAdmin).to.be.false;
            expect(requestedApplication.isPixOrga).to.be.false;
            expect(requestedApplication.isPixCertif).to.be.false;
            expect(requestedApplication.isPixJunior).to.be.false;
          });
        });

        context('when port is 4201', function () {
          it('returns the application name based on port 4201', function () {
            // given
            const origin = 'http://localhost:4201/';

            // when
            const requestedApplication = RequestedApplication.fromOrigin(origin);

            // then
            expect(requestedApplication).to.be.instanceOf(RequestedApplication);
            expect(requestedApplication.applicationName).to.equal('orga');
            expect(requestedApplication.applicationTld).to.equal('');
            expect(requestedApplication.isPixApp).to.be.false;
            expect(requestedApplication.isPixAdmin).to.be.false;
            expect(requestedApplication.isPixOrga).to.be.true;
            expect(requestedApplication.isPixCertif).to.be.false;
            expect(requestedApplication.isPixJunior).to.be.false;
          });
        });

        context('when port is 4202', function () {
          it('returns the application name based on port 4202', function () {
            // given
            const origin = 'http://localhost:4202/';

            // when
            const requestedApplication = RequestedApplication.fromOrigin(origin);

            // then
            expect(requestedApplication).to.be.instanceOf(RequestedApplication);
            expect(requestedApplication.applicationName).to.equal('admin');
            expect(requestedApplication.applicationTld).to.equal('');
            expect(requestedApplication.isPixApp).to.be.false;
            expect(requestedApplication.isPixAdmin).to.be.true;
            expect(requestedApplication.isPixOrga).to.be.false;
            expect(requestedApplication.isPixCertif).to.be.false;
            expect(requestedApplication.isPixJunior).to.be.false;
          });
        });

        context('when port is 4203', function () {
          it('returns the application name based on port 4203', function () {
            // given
            const origin = 'http://localhost:4203/';

            // when
            const requestedApplication = RequestedApplication.fromOrigin(origin);

            // then
            expect(requestedApplication).to.be.instanceOf(RequestedApplication);
            expect(requestedApplication.applicationName).to.equal('certif');
            expect(requestedApplication.applicationTld).to.equal('');
            expect(requestedApplication.isPixApp).to.be.false;
            expect(requestedApplication.isPixAdmin).to.be.false;
            expect(requestedApplication.isPixOrga).to.be.false;
            expect(requestedApplication.isPixCertif).to.be.true;
            expect(requestedApplication.isPixJunior).to.be.false;
          });
        });

        context('when port is 4205', function () {
          it('returns the application name based on port 4205', function () {
            // given
            const origin = 'http://localhost:4205/';

            // when
            const requestedApplication = RequestedApplication.fromOrigin(origin);

            // then
            expect(requestedApplication).to.be.instanceOf(RequestedApplication);
            expect(requestedApplication.applicationName).to.equal('junior');
            expect(requestedApplication.applicationTld).to.equal('');
            expect(requestedApplication.isPixApp).to.be.false;
            expect(requestedApplication.isPixAdmin).to.be.false;
            expect(requestedApplication.isPixOrga).to.be.false;
            expect(requestedApplication.isPixCertif).to.be.false;
            expect(requestedApplication.isPixJunior).to.be.true;
          });
        });
      });

      context('when the origin is unsupported', function () {
        it('throws a ForwardedOriginError', function () {
          // given
          const origin = 'https://someUnsupportedName';

          // when & then
          expect(() => RequestedApplication.fromOrigin(origin)).to.throw(
            ForwardedOriginError,
            'Unsupported hostname: "someunsupportedname"',
          );
        });
      });
    });
  });
});
