const bodyStyle = document.querySelector('body').style;

export const styleToolkit = {
  backgroundBlob: {
    apply: (imageBlobUrl) => {
      const size = window.innerWidth;
      bodyStyle.backgroundColor = 'rgb(var(--pix-primary-50) 0.2)';
      bodyStyle.backgroundImage = `url('${imageBlobUrl}')`;
      bodyStyle.backgroundPositionX = 'right';
      bodyStyle.backgroundPositionY = 'bottom';
      bodyStyle.backgroundRepeat = 'no-repeat';
      bodyStyle.backgroundSize = '50%';
      bodyStyle.backgroundAttachment = 'fixed';
      if (size > 1920) {
        bodyStyle.backgroundSize = '40%';
      }
    },
    reset: () => {
      bodyStyle.backgroundImage = '';
      bodyStyle.backgroundPositionX = '';
      bodyStyle.backgroundPositionY = '';
      bodyStyle.backgroundRepeat = '';
      bodyStyle.backgroundSize = '';
      bodyStyle.backgroundAttachment = '';
    },
  },
};
