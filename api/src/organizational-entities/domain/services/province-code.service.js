const PAD_TARGET_LENGTH = 3;
const PAD_STRING = '0';

function padProvinceCode(provinceCode) {
  return provinceCode ? provinceCode.padStart(PAD_TARGET_LENGTH, PAD_STRING) : null;
}

export { padProvinceCode };
