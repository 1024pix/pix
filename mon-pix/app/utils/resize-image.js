export function resizeByHeight(imageInformation, MAX_HEIGHT) {
  const width = Math.round((MAX_HEIGHT * imageInformation.width) / imageInformation.height);
  const height = MAX_HEIGHT;
  return {
    width,
    height,
  };
}

export function resizeByWidth(imageInformation, MAX_WIDTH) {
  const height = Math.round((MAX_WIDTH * imageInformation.height) / imageInformation.width);
  const width = MAX_WIDTH;
  return {
    width,
    height,
  };
}

export function resizeImage(imageInformation, options) {
  if (!imageInformation || !hasDimensions(imageInformation)) {
    return null;
  }
  return resizeByHeight(imageInformation, options.MAX_HEIGHT);
}

export function hasDimensions(imageInformation) {
  return imageInformation.width > 0 && imageInformation.height > 0;
}
