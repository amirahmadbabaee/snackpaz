import type { CapacitorConfig } from '@capacitor/cli';

// نشانی نسخه‌ی وبِ دیپلوی‌شده (Vercel و غیره).
// اپ موبایل این نشانی را در WebView بارگذاری می‌کند تا احراز هویت و API کار کنند.
// ⚠️ قبل از بیلد APK/iOS این نشانی را با نشانی دیپلوی واقعی خود جایگزین کن.
const WEB_URL = process.env.SNACKPAZ_WEB_URL || 'https://snackpaz.ir';

const config: CapacitorConfig = {
  appId: 'com.snackpaz.game',
  appName: 'اسنک پز',
  webDir: 'out',
  backgroundColor: '#fff7ed',
  server: {
    url: WEB_URL,
    cleartext: true, // اجازه‌ی http برای محیط توسعه؛ در تولید https استفاده کن
  },
  android: {
    backgroundColor: '#fff7ed',
  },
  ios: {
    backgroundColor: '#fff7ed',
  },
};

export default config;
