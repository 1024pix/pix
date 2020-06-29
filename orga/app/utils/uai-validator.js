export default function isUAIValid(uai) {

  if (!uai) {
    return false;
  }
  const pattern = /^([0-9]{7}[A-W])/s;
  return pattern.test(uai.trim());
}
