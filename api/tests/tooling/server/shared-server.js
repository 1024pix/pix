import { createServer } from '../../../server.js';
import { createMaddoServer } from '../../../server.maddo.js';

const ALLOWED_PROPERTIES = ['inject'];

// As server is shared across tests, we use a proxy to trap access to properties that are not allowed.
function asSharedServer(server) {
  return new Proxy(server, {
    get(target, property) {
      if (ALLOWED_PROPERTIES.includes(property)) return target[property].bind(target);
      if (typeof property === 'string' && Reflect.has(target, property)) {
        throw new Error(
          `"${property}" is unavailable on the shared test server, which is reused by every acceptance test. ` +
            `Only ${ALLOWED_PROPERTIES.join(', ')} may be used. ` +
            `Call createServer() directly if your test needs to mutate the server.`,
        );
      }
      return Reflect.get(target, property);
    },
    set(_target, property) {
      throw new Error(
        `Cannot set "${String(property)}" on the shared test server, which is reused by every acceptance test. ` +
          `Call createServer() directly if your test needs to mutate the server.`,
      );
    },
  });
}

function memoize(build) {
  let pending;
  return () => (pending ??= build().then(asSharedServer));
}

// Servers are memoized to reuse the same instance across tests.
export const getServer = memoize(createServer);
export const getMaddoServer = memoize(createMaddoServer);
