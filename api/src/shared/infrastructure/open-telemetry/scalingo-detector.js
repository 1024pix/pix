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
  detect() {
    if (!process.env.SCALINGO_APPLICATION_ID) {
      return { attributes: {} };
    }
    const attributes = {
      'scalingo.port': process.env.PORT || undefined,
      'scalingo.container': process.env.CONTAINER || undefined,
      'scalingo.container_version': process.env.CONTAINER_VERSION || undefined,
      'scalingo.container_size': process.env.CONTAINER_SIZE || undefined,
      'scalingo.container_memory': process.env.CONTAINER_MEMORY || undefined,
      'scalingo.app': process.env.APP || undefined,
      'scalingo.application_id': process.env.SCALINGO_APPLICATION_ID || undefined,
      'scalingo.hostname': process.env.HOSTNAME || undefined,
      'scalingo.stack': process.env.STACK || undefined,
      'scalingo.region_name': process.env.REGION_NAME || undefined,
      'scalingo.private_network_id': process.env.SCALINGO_PRIVATE_NETWORK_ID || undefined,
      'scalingo.private_hostname': process.env.SCALINGO_PRIVATE_HOSTNAME || undefined,
      'scalingo.one_off_user_id': process.env.SCALINGO_USER_ID || undefined,
    };

    return { attributes };
  }
}

export const scalingoDetector = new ScalingoDetector();
