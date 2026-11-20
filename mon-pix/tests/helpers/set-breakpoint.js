import { getContext, settled } from '@ember/test-helpers';

export function setBreakpoint(breakpoint) {
  const media = getContext().owner.lookup('service:media');
  media.isMobile = breakpoint === 'mobile';
  media.isTablet = breakpoint === 'tablet';
  media.isDesktop = breakpoint === 'desktop';
  return settled();
}
