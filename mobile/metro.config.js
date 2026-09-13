const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Expo/Metro must transpile the symlinked design-system source that lives
// outside the mobile/ folder via the workspace symlink.
config.watchFolders = [path.resolve(__dirname, '../packages/ui-native')];

module.exports = config;
