import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { modifier } from 'ember-modifier';

const VIEWPORT_PADDING = 8;
const DISTANCE_FROM_ANCHOR = 8;

export default modifier(function floatingPosition(floatingElement, [anchorElement], { placement = 'top' }) {
  if (!anchorElement) return;

  const updatePosition = async () => {
    const { x, y } = await computePosition(anchorElement, floatingElement, {
      placement,
      strategy: 'fixed',
      middleware: [offset(DISTANCE_FROM_ANCHOR), flip(), shift({ padding: VIEWPORT_PADDING })],
    });
    Object.assign(floatingElement.style, { left: `${x}px`, top: `${y}px` });
  };

  return autoUpdate(anchorElement, floatingElement, updatePosition);
});
