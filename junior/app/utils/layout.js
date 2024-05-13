const bodyStyle = document.querySelector('body').style;
export const styleToolkit = {
  backgroundBlob: {
    apply: (imageBlobUrl) => {
      bodyStyle.backgroundImage = `url('${imageBlobUrl}'), linear-gradient(74.05deg, rgb(255 188 87 / 6%) 12.69%, rgb(61 104 255 / 6%) 75.92%), linear-gradient(0deg, #FFFFFF, #FFFFFF)`;
      bodyStyle.backgroundPositionX = 'right';
      bodyStyle.backgroundPositionY = 'bottom';
      bodyStyle.backgroundRepeat = 'no-repeat';
      bodyStyle.backgroundAttachment = 'fixed';
      bodyStyle.minHeight = '100dvh';
    },
    reset: () => {
      bodyStyle.backgroundImage = '';
      bodyStyle.backgroundPositionX = '';
      bodyStyle.backgroundPositionY = '';
      bodyStyle.backgroundRepeat = '';
      bodyStyle.minHeight = '';
      bodyStyle.backgroundAttachment = '';
    },
  },
};
