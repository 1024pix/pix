const FETCH_TIMEOUT_MS = 10_000;

const makeCountryRepository = ({ apiBaseUrl, headers }) => ({
  findAll: async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${apiBaseUrl}/api/countries`, { headers, signal: controller.signal });
      const data = await res.json();
      return (data.data ?? []).map((c) => ({ code: parseInt(c.attributes.code), name: c.attributes.name }));
    } finally {
      clearTimeout(timer);
    }
  },
});

export { makeCountryRepository };
