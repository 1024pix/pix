const FETCH_TIMEOUT_MS = 10_000;

const makeOrganizationRepository = ({ apiBaseUrl, headers }) => ({
  create: async (payload) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/organizations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      return { status: res.status, body: await res.json() };
    } finally {
      clearTimeout(timer);
    }
  },
});

export { makeOrganizationRepository };
