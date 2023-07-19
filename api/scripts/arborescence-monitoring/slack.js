export function formatMessageForSlack(chartUrls) {
  const blocks = chartUrls.map((image_url) => ({ type: 'image', image_url, alt_text: 'inspiration ❤️❤️❤️' }));
  const slackBlocks = {
    blocks,
  };
  return JSON.stringify(slackBlocks);
}
