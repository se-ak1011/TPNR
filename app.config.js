// Dynamic Expo config — extends app.json with runtime values.
// app.json holds all static config; this file layers on anything that needs
// environment variables (e.g. build numbers injected by Codemagic).

/** @type {import('expo/config').ExpoConfig} */
const { expo: staticConfig } = require('./app.json');

const buildNumber = process.env.TENANTPASSPORT_BUILD_NUMBER
  ? String(process.env.TENANTPASSPORT_BUILD_NUMBER)
  : undefined;

/** @type {import('expo/config').ConfigContext} */
module.exports = ({ config }) => ({
  ...config,
  ...staticConfig,
  ios: {
    ...staticConfig.ios,
    // Injected by the "Set unique build number" Codemagic step (Unix timestamp).
    // Falls back to undefined locally so Expo uses the default value from app.json.
    ...(buildNumber ? { buildNumber } : {}),
  },
  android: {
    ...staticConfig.android,
    // versionCode must be an integer; parse from the same timestamp string.
    ...(buildNumber ? { versionCode: parseInt(buildNumber, 10) } : {}),
  },
});
