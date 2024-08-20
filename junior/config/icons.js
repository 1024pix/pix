const getCommonIcons = require('@1024pix/pix-ui/config/icons.js');
const commonIcons = getCommonIcons();

module.exports = function () {
  return {
    'free-solid-svg-icons': [...commonIcons['free-solid-svg-icons'], 'image', 'video'],
  };
};
