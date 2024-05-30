const bodyStyle = document.querySelector('body').style;
export const styleToolkit = {
  backgroundBlob: {
    apply: (imageBlobUrl) => {
      bodyStyle.backgroundColor = 'rgb(var(--pix-primary-50) 0.2)';
      bodyStyle.backgroundImage = `url('${imageBlobUrl}')`;
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
