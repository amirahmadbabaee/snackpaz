# راهنمای ساده‌ی دیپلوی بازی «دختر اسنک‌پز»

توسعه‌دهنده: امیراحمد بابائی (amirahmadbabee) | دامنه: snackpaz.ir

این بازی یک **بک‌اند Node.js** دارد (اکانت کاربری + ذخیره‌ی امتیاز + جدول آنلاین).
به همین دلیل به یک سرور Node.js نیاز است، نه فقط هاست استاتیک.

---

## مسیر پیشنهادی: Vercel + GitHub (ساده‌ترین و رایگان)

### чек ۱: کد را به GitHub ببر
در پوشه‌ی پروژه (روی کامپیوترت یا با git) این دستورات را بزن:

```bash
cd /home/z/my-project
git init            # اگه قبلاً init نکرده‌ای
git add .
git commit -m "بازی دختر اسنک‌پز"
git branch -M main
git remote add origin https://github.com/USERNAME/snackpaz.git
git push -u origin main
```
(به‌جای USERNAME نام کاربری گیت‌هابت و به‌جای snackpaz نام ریپو را بگذار.
ابتدا در github.com یک ریپوی خالی به‌نام snackpaz بساز.)

⚠️ فایل‌های حساس (keystore، .env، دیتابیس) در .gitignore هست و push نمی‌شوند.

### مرحله ۲: در Vercel ایمپورت کن
1. به https://vercel.com برو و با **همین اکانت GitHub** وارد شو.
2. «Add New…» → «Project» → ریپوی snackpaz را انتخاب کن.
3. قبل از Deploy، در بخش «Environment Variables» این سه‌تا را اضافه کن:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `file:./db/prod.db` |
   | `NEXTAUTH_SECRET` | (یک رشته‌ی تصادفی — در ترمینال بزن: `openssl rand -base64 32` و خروجی را اینجا بگذار) |
   | `NEXTAUTH_URL` | `https://snackpaz.ir` |

4. «Deploy» را بزن. حدود ۱-۲ دقیقه طول می‌کشد.
5. پس از پایان، یک نشانی موقت (مثلاً `snackpaz-xxx.vercel.app`) می‌گیری — بازی آنجا کار می‌کند. ✅

### مرحله ۳: دامنه‌ی snackpaz.ir را به Vercel وصل کن
1. در Vercel → پروژه → «Settings» → «Domains» → «Add» → `snackpaz.ir` را وارد کن.
2. Vercal دو رکورد DNS نشان می‌دهد (معمولاً):
   - رکورد **A** برای `@` به `76.76.21.21`
   - رکورد **CNAME** برای `www` به `cname.vercel-dns.com`
3. در پنل مدیریت DNS دامنه‌ات (همان‌جا که هاست/دامنه را خریدی) این رکوردها را اضافه کن.
4. چند دقیقه صبر کن تا SSL فعال شود. بازی روی https://snackpaz.ir بالا می‌آید. 🎉

### مرحله ۴: AAB نهایی را به Play Store ببر
AAB از پیش با نشانی `https://snackpaz.ir` بیلد شده است:
`download/snackpaz-game-release.aab`

→ Google Play Console → Create app (نوع: Game) → آپلود این AAB.

تمام! 🌽

---

## مسیر جایگزین: سرور لینوکس VPS (اگه دسترسی root داری)

اگه هاست لینوکست **VPS** است (نه اشتراکی cPanel)، می‌توانی خودت دیپلوی کنی.
اگه این مسیر را می‌خواهی، به من بگو تا:
- یک اسکریپت دیپلوی (`deploy.sh`) بنویسم که Node + بیلد + اجرا با PM2 را خودش انجام دهد.
- تنظیمات Caddy/nginx برای HTTPS روی snackpaz.ir را آماده کنم.

اما **اگه هاستت اشتراکی (cPanel) است**، Node.js روی آن اجرا نمی‌شود و مسیر Vercel (بالا) را پیشنهاد می‌کنم.

---

## خلاصه‌ی کارهای تو
1. کد را به GitHub پوش کن (دستورات بالا).
2. در Vercel ایمپورت کن + ۳ متغیر محیطی + Deploy.
3. دامنه‌ی snackpaz.ir را در Vercel اضافه کن و DNS را تنظیم کن.
4. AAB (`download/snackpaz-game-release.aab`) را به Play Console آپلود کن.

هر جا گیر کردی، بگو تا کمک کنم.
