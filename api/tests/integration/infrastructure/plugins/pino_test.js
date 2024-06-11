import { Writable } from 'node:stream';

import pino from 'pino';

import { config } from '../../../../lib/config.js';
import { monitoringTools } from '../../../../lib/infrastructure/monitoring-tools.js';
import * as pinoPlugin from '../../../../src/shared/infrastructure/plugins/pino.js';
import { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Infrastructure | plugins | pino', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register({
      register: (server) => {
        server.route([
          {
            method: 'GET',
            path: '/',
            config: {
              handler: () => {
                monitoringTools.incrementInContext('metrics.knexQueryCount');
                return { cou: 'cou' };
              },
            },
          },
          {
            method: 'POST',
            path: '/api/token',
            config: {
              handler: () => {
                return {};
              },
            },
          },
          {
            method: 'GET',
            path: '/error',
            config: {
              handler: () => {
                throw new Error('Manual throwed error');
              },
            },
          },
        ]);
      },
      name: 'test-api',
    });
  });

  async function registerWithPlugin(cb) {
    const stream = new Writable({
      write(chunk, encoding, ack) {
        cb(JSON.parse(chunk.toString()));
        ack();
        return true;
      },
    });
    const pinoPluginWithLogger = {
      ...pinoPlugin,
      options: {
        ...pinoPlugin.options,
        instance: pino(stream),
      },
    };
    await httpTestServer.register([pinoPluginWithLogger]);
  }

  describe('Ensure that datadog configured log format is what we send', function () {
    it('should log the error and the request result when there is an unexpected error', async function () {
      // given
      const messages = [];
      await registerWithPlugin((data) => {
        messages.push(data);
      });
      const method = 'GET';
      const url = '/error';

      // when
      await httpTestServer.request(method, url);

      expect(messages).to.have.lengthOf(2);
      expect(messages[0].level).to.equal(50);
      expect(messages[0].tags).to.deep.equal(['internal', 'error']);
      expect(messages[0].err.message).to.equal('Manual throwed error');
      expect(messages[0].msg).to.equal('request error');
      expect(messages[1].msg).to.equal('request completed');
    });

    context('with request monitoring disabled', function () {
      beforeEach(function () {
        sinon.stub(config.hapi, 'enableRequestMonitoring').value(false);
        monitoringTools.installHapiHook();
      });

      it('should log the message and version', async function () {
        // given
        const messages = [];
        await registerWithPlugin((data) => {
          messages.push(data);
        });

        const method = 'GET';
        const url = '/';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(200);
        expect(messages).to.have.lengthOf(1);
        expect(messages[0].level).to.equal(30);
        expect(messages[0].msg).to.equal('request completed');
        expect(messages[0].req.version).to.equal('development');
        expect(messages[0].req.user_id).to.be.undefined;
        expect(messages[0].req.route).to.be.undefined;
        expect(messages[0].req.metrics).to.be.undefined;
      });
    });

    context('with request monitoring enabled', function () {
      beforeEach(function () {
        sinon.stub(config.hapi, 'enableRequestMonitoring').value(true);
        monitoringTools.installHapiHook();
      });

      it('should log the message, version, user id, route and metrics', async function () {
        // given
        const messages = [];
        await registerWithPlugin((data) => {
          messages.push(data);
        });

        const method = 'GET';
        const url = '/';
        const headers = {
          authorization: generateValidRequestAuthorizationHeader(),
        };

        // when
        const response = await httpTestServer.request(method, url, null, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
        expect(messages).to.have.lengthOf(1);
        expect(messages[0].msg).to.equal('request completed');
        expect(messages[0].req.version).to.equal('development');
        expect(messages[0].req.user_id).to.equal(1234);
        expect(messages[0].req.route).to.equal('/');
        expect(messages[0].req.metrics).to.deep.equal({ knexQueryCount: 1 });
      });

      context('when calling /api/token', function () {
        it('should log the message, version, user id, route, metrics and hashed username', async function () {
          // given
          const messages = [];
          await registerWithPlugin((data) => {
            messages.push(data);
          });

          const method = 'POST';
          const url = '/api/token';
          const payload = {
            username: 'toto',
          };

          // when
          const response = await httpTestServer.request(method, url, payload);
          // then
          expect(response.statusCode).to.equal(200);
          expect(messages).to.have.lengthOf(1);
          expect(messages[0].msg).to.equal('request completed');
          expect(messages[0].req.version).to.equal('development');
          expect(messages[0].req.user_id).to.equal('-');
          expect(messages[0].req.route).to.equal('/api/token');
          expect(messages[0].req.usernameHash).to.equal(
            '31f7a65e315586ac198bd798b6629ce4903d0899476d5741a9f32e2e521b6a66', // echo -n 'toto'| shasum -a 256
          );
        });

        it('should log the message, version, user id, route, metrics and default value for username when not specified', async function () {
          // given
          const messages = [];
          await registerWithPlugin((data) => {
            messages.push(data);
          });
          const method = 'POST';
          const url = '/api/token';

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(200);
          expect(messages).to.have.lengthOf(1);
          expect(messages[0].msg).to.equal('request completed');
          expect(messages[0].req.version).to.equal('development');
          expect(messages[0].req.user_id).to.equal('-');
          expect(messages[0].req.route).to.equal('/api/token');
          expect(messages[0].req.usernameHash).to.equal('-');
        });
      });
    });
  });
});
