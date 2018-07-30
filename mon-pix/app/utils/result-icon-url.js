export default function resultIconUrl(resultStatus) {
  if (!resultStatus) {
    return null;
  }
  return `/images/answer-validation/icon-${resultStatus}.svg`;
}
