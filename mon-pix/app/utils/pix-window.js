function getLocationHash() {
  return window.location.hash;
}

function getLocationHostname() {
  return window.location.hostname;
}

function getLocationHref() {
  return window.location.href;
}

const PixWindow = {
  getLocationHash,
  getLocationHostname,
  getLocationHref,
};

export default PixWindow;
