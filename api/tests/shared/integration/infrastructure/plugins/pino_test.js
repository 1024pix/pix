import { Writable } from 'node:stream';

import pino from 'pino';

import {
  incrementInContext,
  installHapiHook,
} from '../../../../../src/shared/infrastructure/execution-context-manager.js';
import * as pinoPlugin from '../../../../../src/shared/infrastructure/plugins/pino.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

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
                incrementInContext('metrics.knexQueryCount');
                return { cou: 'cou' };
              },
            },
          },
          {
            method: 'POST',
            path: '/api/token',
            config: {
              handler: () => {
                return { user_id: '1234' };
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
    installHapiHook();
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

    it('should log the message, version, user id, route and metrics', async function () {
      // given
      const messages = [];
      await registerWithPlugin((data) => {
        messages.push(data);
      });

      const method = 'GET';
      const url = '/';
      const headers = generateAuthenticatedUserRequestHeaders();

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
      context('when there is a username', function () {
        it('logs the message, version, user id, route, metrics and hashed username', async function () {
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
          const headers = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'app.pix.org' };

          // when
          const response = await httpTestServer.request(method, url, payload, null, headers);

          // then
          expect(response.statusCode).to.equal(200);
          expect(messages).to.have.lengthOf(1);
          expect(messages[0].msg).to.equal('request completed');
          expect(messages[0].req.version).to.equal('development');
          expect(messages[0].req.user_id).to.equal('1234');
          expect(messages[0].req.route).to.equal('/api/token');
          expect(messages[0].req.usernameHash).to.equal(
            '31f7a65e315586ac198bd798b6629ce4903d0899476d5741a9f32e2e521b6a66', // echo -n 'toto'| shasum -a 256
          );
        });
      });

      context('when there is no username', function () {
        it('logs the message, version, user id, route, metrics and default value for username', async function () {
          // given
          const messages = [];
          await registerWithPlugin((data) => {
            messages.push(data);
          });
          const method = 'POST';
          const url = '/api/token';
          const headers = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'app.pix.org' };

          // when
          const response = await httpTestServer.request(method, url, null, null, headers);

          // then
          expect(response.statusCode).to.equal(200);
          expect(messages).to.have.lengthOf(1);
          expect(messages[0].msg).to.equal('request completed');
          expect(messages[0].req.version).to.equal('development');
          expect(messages[0].req.user_id).to.equal('1234');
          expect(messages[0].req.route).to.equal('/api/token');
          expect(messages[0].req.usernameHash).to.equal('-');
        });
      });

      context('when there is no forwarded origin (no x-forwarded headers)', function () {
        it('handles the ForwardedOriginError error', async function () {
          // given
          const messages = [];
          await registerWithPlugin((data) => {
            messages.push(data);
          });
          const method = 'POST';
          const url = '/api/token';
          const noForwardedHeaders = {};

          // when
          const response = await httpTestServer.request(method, url, null, null, noForwardedHeaders);

          // then
          expect(response.statusCode).to.equal(200);
          expect(messages).to.have.lengthOf(1);
          expect(messages[0].msg).to.equal('request completed');
        });
      });
    });
  });
});
