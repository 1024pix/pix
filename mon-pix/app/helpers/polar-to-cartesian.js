import { helper } from '@ember/component/helper';

export function polarToCartesian([centerX, centerY, radius, angleInDegree]) {
  const angleInRadian = (angleInDegree - 90) * Math.PI / 180
  const x = centerX + radius * Math.cos(angleInRadian);
  const y = centerY + radius * Math.sin(angleInRadian);

  return `${x} ${y}`;
}

export default helper(polarToCartesian);
