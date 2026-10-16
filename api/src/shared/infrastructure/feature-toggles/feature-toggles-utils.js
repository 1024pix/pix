import { config } from '../../../../config/config.js';

export function isEnabledByContainerRatio(featureToggleValue) {
  const containerIndex = parseInt(config.infra.containerName?.split('-').at(-1) ?? '1') - 1;
  const [dividend, divisor] = featureToggleValue.split('/').map((s) => parseInt(s));
  return containerIndex % divisor < dividend;
}
