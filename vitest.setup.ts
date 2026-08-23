process.env.ADMIN_TOKEN = 'test-token';
// Tests exercise proxy-header behavior; individual tests can delete this
// to simulate direct-to-origin deployments.
process.env.TRUST_PROXY = 'true';
