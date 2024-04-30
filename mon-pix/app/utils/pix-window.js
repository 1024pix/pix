function getLocationHash() {
  return window.location.hash;
}

function getLocationHref() {
  return window.location.href;
}

const PixWindow = {
  getLocationHash,
  getLocationHref,
};

export default PixWindow;
