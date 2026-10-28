import type { CapacitorConfig } from '@capacitor/cli';

/**
 * The native iOS and Android apps wrap the same web build (`dist`). The reverse-domain
 * appId must match the bundle id registered with Apple and the package name on Google Play.
 */
const config: CapacitorConfig = {
  appId: 'app.blessthem',
  appName: 'Bless Them',
  webDir: 'dist',
  backgroundColor: '#faf7f1',
  ios: { contentInset: 'never' },
  plugins: {
    LocalNotifications: {
      // A white silhouette of the mark for the Android status bar; the sage tint colours it.
      smallIcon: 'ic_stat_blessthem',
      iconColor: '#3E5B47',
    },
  },
};

export default config;
