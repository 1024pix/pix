import { config } from '../../../../src/shared/config.js';
import { server, serverMaddo } from '../../../tooling/servers.js';

describe('Acceptance | Controller | Open Api', function () {
  context('Internal API definitons', function () {
    context('Pix API', function () {
      describe('GET /api/swagger.json', function () {
        it('should respond with a 200', async function () {
          // given
          const options = {
            method: 'GET',
            url: '/api/swagger.json',
            headers: {},
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.info.title).to.deep.equal('Welcome to the Pix api catalog');
        });
      });

      context('Documentation pages', function () {
        describe('GET /api/documentation', function () {
          it('should respond with a 200', async function () {
            // given
            const options = {
              method: 'GET',
              url: '/api/documentation/',
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.contain('Welcome to the Pix api catalog');
          });
        });
      });
    });

    context('Livret scolaire LSU/LSL', function () {
      describe('GET /livret-scolaire/swagger.json', function () {
        it('should respond with a 200', async function () {
          // given
          const options = {
            method: 'GET',
            url: '/livret-scolaire/swagger.json',
            headers: {},
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.info.title).to.deep.equal('Welcome to the Pix LSU/LSL Open Api');
        });
      });

      context('Documentation pages', function () {
        describe('GET /livret-scolaire/documentation', function () {
          it('should respond with a 200', async function () {
            // given
            const options = {
              method: 'GET',
              url: '/livret-scolaire/documentation/',
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.contain('Welcome to the Pix LSU/LSL Open Api');
          });
        });
      });
    });

    context('Pole Emploi', function () {
      describe('GET /pole-emploi/swagger.json', function () {
        it('should respond with a 200', async function () {
          // given
          const options = {
            method: 'GET',
            url: '/pole-emploi/swagger.json',
            headers: {},
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.info.title).to.deep.equal('Pix Pôle emploi Open Api');
        });
      });

      context('Documentation page', function () {
        describe('GET /pole-emploi/documentation', function () {
          it('should respond with a 200', async function () {
            // given
            const options = {
              method: 'GET',
              url: '/pole-emploi/documentation/',
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.contain('Pix Pôle emploi Open Api');
          });
        });
      });
    });

    context('Authorization-server', function () {
      describe('GET /authorization-server/swagger.json', function () {
        it('should respond with a 200', async function () {
          // given
          const options = {
            method: 'GET',
            url: '/authorization-server/swagger.json',
            headers: {},
          };
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.info.title).to.deep.equal('Welcome to the Pix Authorization server');
        });
      });

      context('Documentation page', function () {
        describe('GET /authorization-server/documentation', function () {
          it('should respond with a 200', async function () {
            // given
            const options = {
              method: 'GET',
              url: '/authorization-server/documentation/',
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.contain('Welcome to the Pix Authorization server');
          });
        });
      });
    });
  });

  context('API Manager definitions', function () {
    context('Parcoursup', function () {
      describe('GET /documentation/parcoursup/openapi.json', function () {
        it('should respond with a 200', async function () {
          // given
          const options = {
            method: 'GET',
            url: '/documentation/parcoursup/openapi.json',
            headers: {},
          };
          // when
          const response = await serverMaddo.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.info.title).to.deep.equal('Pix Parcoursup Open Api');
          expect(response.result.servers[0].url).to.equal(config.apiManager.url);
        });
      });

      context('Documentation page', function () {
        describe('GET /documentation/parcoursup', function () {
          it('should respond with a 200', async function () {
            // given
            const options = {
              method: 'GET',
              url: '/documentation/parcoursup',
            };

            // when
            const response = await serverMaddo.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.contain('Pix Parcoursup Open Api');
          });
        });
      });
    });

    context('Maddo', function () {
      describe('GET /documentation/maddo/openapi.json', function () {
        it('should respond with a 200', async function () {
          // given
          const options = {
            method: 'GET',
            url: '/documentation/maddo/openapi.json',
            headers: {},
          };
          // when
          const response = await serverMaddo.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.info.title).to.deep.equal('Api de mise à disposition de données Pix');
          expect(response.result.servers[0].url).to.equal(config.apiManager.url);
        });
      });

      context('Documentation page', function () {
        describe('GET /documentation/maddo', function () {
          it('should respond with a 200', async function () {
            // given
            const options = {
              method: 'GET',
              url: '/documentation/maddo',
            };

            // when
            const response = await serverMaddo.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.contain('Api de mise à disposition de données Pix');
          });
        });
      });
    });
  });
});
