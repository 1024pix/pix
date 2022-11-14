function getLocationHref() {
  return window.location.href;
}

function getLocationHash() {
  return window.location.hash;
}

const PixWindow = {
  getLocationHref,
  getLocationHash,
};

export default PixWindow;
