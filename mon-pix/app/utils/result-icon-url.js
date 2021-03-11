export default function resultIconUrl(resultStatus) {
  if (!resultStatus) {
    return null;
  }
  return `/images/icons/answer-validation/icon-${resultStatus}.svg`;
}
