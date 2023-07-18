export function formatMessageForSlack(image_url) {
  const slackBlocks = {
    blocks: [
      {
        type: 'image',
        image_url,
        alt_text: 'inspiration',
      },
    ],
  };
  return JSON.stringify(slackBlocks);
}
