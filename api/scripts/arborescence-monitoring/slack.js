export function formatMessageForSlack(charts) {
  const blocks = charts.map(({ url: image_url, altText: alt_text }) => ({ type: 'image', image_url, alt_text }));
  const slackBlocks = {
    blocks,
  };
  return JSON.stringify(slackBlocks);
}
