// Local-only release signing. `expo prebuild` regenerates android/ from
// scratch every time, wiping any hand-edited build.gradle — this config
// plugin re-applies the release signingConfig on every prebuild instead.
// Credentials live in a local, gitignored keystore.properties file, never
// in this file and never sent to Expo/EAS servers.
const { withAppBuildGradle } = require('@expo/config-plugins');

const SIGNING_CONFIGS_BLOCK = `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            def keystorePropertiesFile = rootProject.file('../keystore.properties')
            def keystoreProperties = new Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                storeFile rootProject.file('../' + keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!/rootProject\.file\('\.\.\/keystore\.properties'\)/.test(contents)) {
      contents = contents.replace(
        /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*\}/,
        SIGNING_CONFIGS_BLOCK
      );
    }

    contents = contents.replace(
      /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

    config.modResults.contents = contents;
    return config;
  });
};
