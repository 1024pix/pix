/**
 * @typedef {import('@opentelemetry/resources').ResourceDetector} ResourceDetector
 * @typedef {import('@opentelemetry/resources').DetectedResource} DetectedResource
 */

/**
 * The ScalingoDetector is used to detect Scalingo environment variables
 * https://doc.scalingo.com/platform/app/environment#runtime-environment-variables
 *
 * @implements {ResourceDetector}
 */
class ScalingoDetector {
  /** @returns {DetectedResource} */
  detect(_config) {
    if (!process.env.SCALINGO_APPLICATION_ID) {
      return { attributes: {} };
    }
    return {
      attributes: {
        'scalingo.port': process.env.PORT,
        'scalingo.container': process.env.CONTAINER,
        'scalingo.container_version': process.env.CONTAINER_VERSION,
        'scalingo.container_size': process.env.CONTAINER_SIZE,
        'scalingo.container_memory': process.env.CONTAINER_MEMORY,
        'scalingo.app': process.env.APP,
        'scalingo.application_id': process.env.SCALINGO_APPLICATION_ID,
        'scalingo.hostname': process.env.HOSTNAME,
        'scalingo.stack': process.env.STACK,
        'scalingo.region_name': process.env.REGION_NAME,
        'scalingo.private_network_id': process.env.SCALINGO_PRIVATE_NETWORK_ID,
        'scalingo.private_hostname': process.env.SCALINGO_PRIVATE_HOSTNAME,
        'scalingo.one_off_user_id': process.env.SCALINGO_USER_ID,
      },
    };
  }
}

export const scalingoDetector = new ScalingoDetector();
