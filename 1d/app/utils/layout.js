const bodyStyle = document.querySelector('body').style;
export const styleToolkit = {
  backgroundBlob: {
    apply: (imageBlobUrl) => {
      bodyStyle.backgroundImage = `url('${imageBlobUrl}')`;
      bodyStyle.backgroundPositionX = 'right';
      bodyStyle.backgroundPositionY = 'bottom';
      bodyStyle.backgroundRepeat = 'no-repeat';
      bodyStyle.minHeight = '100dvh';
    },
    reset: () => {
      bodyStyle.backgroundImage = '';
      bodyStyle.backgroundPositionX = '';
      bodyStyle.backgroundPositionY = '';
      bodyStyle.backgroundRepeat = '';
      bodyStyle.minHeight = '';
    },
  },
};
