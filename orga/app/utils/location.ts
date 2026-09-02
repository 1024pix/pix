function getHref(): string {
  return window.location.href;
}

function assign(url: string): void {
  window.location.assign(url);
}

const Location = {
  getHref,
  assign,
};

export default Location;
