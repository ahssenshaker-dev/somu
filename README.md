# 🚀 دليل الرفع والتشغيل

## الخطوات بالترتيب

---

### 1️⃣ إعداد Supabase (قاعدة البيانات السحابية)

1. روح [supabase.com](https://supabase.com) وسجّل مجاناً
2. اضغط **New Project** واختر اسم للمشروع
3. بعد ما يتأسس المشروع، روح **SQL Editor**
4. انسخ محتوى `supabase_setup.sql` والصقه واضغط **Run**
5. روح **Project Settings → API**
6. انسخ:
   - **Project URL** (مثل: `https://abcdef.supabase.co`)
   - **anon public** key (مفتاح طويل)

---

### 2️⃣ إضافة بياناتك في الكود

افتح `index.html` وعدّل هذين السطرين في أول الكود JS:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';   // ← ضع Project URL هنا
const SUPABASE_KEY = 'YOUR_ANON_KEY';                       // ← ضع anon key هنا
```

---

### 3️⃣ رفع السجلات الحالية لـ Supabase (مرة واحدة)

بعد ما تفتح الموقع وتشوف "✅ متصل"، روح Supabase → Table Editor → records وستشوف السجلات تُزامن تلقائياً عند أول استخدام.

---

### 4️⃣ رفع على Vercel

**الطريقة السهلة (Drag & Drop):**
1. روح [vercel.com/new](https://vercel.com/new)
2. سجّل بحساب GitHub أو Google
3. اضغط **"Upload your files"** أو **"Import Third-Party Git"**
4. اسحب مجلد المشروع كله وافلته
5. اضغط **Deploy** — خلاص! 🎉

**الطريقة عبر GitHub (موصى بها):**
1. ارفع المجلد على GitHub repo جديد
2. روح [vercel.com](https://vercel.com) → New Project → Import Git Repository
3. اختر الـ repo واضغط Deploy

---

### 5️⃣ تنصيب التطبيق كـ PWA (أوفلاين)

**على الجوال (iOS/Android):**
- افتح الرابط في Safari/Chrome
- اضغط Share → "Add to Home Screen"

**على الكمبيوتر (Chrome/Edge):**
- ستظهر أيقونة تنصيب في شريط العنوان (⊕)
- اضغط عليها → Install

---

## 🔄 كيف تشتغل المزامنة؟

| الحالة | ما يحصل |
|--------|---------|
| **أون لاين** | كل إضافة/تعديل/حذف يذهب لـ Supabase مباشرة + يُحفظ محلياً |
| **أوف لاين** | السجلات تُحفظ في IndexedDB + تُضاف لقائمة الانتظار |
| **عودة الإنترنت** | المتصفح يرسل كل السجلات المعلّقة لـ Supabase تلقائياً |
| **متصفحات متعددة** | Supabase Realtime يُحدّث كل المتصفحات فورياً |

---

## 📁 هيكل الملفات

```
crm-app/
├── index.html          ← التطبيق الرئيسي
├── sw.js               ← Service Worker (الأوفلاين)
├── manifest.json       ← PWA Manifest
├── vercel.json         ← إعدادات Vercel
├── supabase_setup.sql  ← SQL لإنشاء الجداول
└── README.md           ← هذا الملف
```

---

## 🛡️ الأمان

السياسة الحالية في SQL تسمح لأي شخص بالقراءة والكتابة.
إذا أردت تقييد الوصول، استخدم **Supabase Auth** وعدّل الـ RLS policies.

---

جميع الحقوق محفوظة لـ سمو © تطوير A. Shaker
