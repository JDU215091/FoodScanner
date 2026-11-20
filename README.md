# FoodScanner

## プロジェクトの目的 / Loyiha maqsadi

このアプリは、日常の健康管理をサポートするために作られました：

- バーコードスキャンで食品情報を素早く取得
- 食事と水分摂取の記録を簡単に
- トレーニング記録と達成システムで健康的な習慣を促進
- アレルギー情報の自動チェックで安全な食生活をサポート

Ushbu ilova kundalik sog'liqni boshqarishni qo'llab-quvvatlash uchun yaratilgan:

- Barcode skanerlash orqali oziq-ovqat ma'lumotini tez olish
- Ovqat va suv iste'molini oson yozib borish
- Trening yozuvlari va yutuqlar tizimi orqali sog'lom odatlarni rivojlantirish
- Allergiya ma'lumotini avtomatik tekshirish orqali xavfsiz ovqatlanishni qo'llab-quvvatlash

---

## プロジェクト構造 / Loyiha tuzilmasi

```
FoodScanner/
├── App.js                          メインアプリファイル / Asosiy ilova fayli
├── index.js                        エントリーポイント / Kirish nuqtasi
├── polyfills.js                    互換性のためのポリフィル / Muvofiqlik uchun polyfill
├── metro.config.js                 Metro設定 / Metro konfiguratsiyasi
├── auth/
│   └── AuthProvider.js             認証管理 / Autentifikatsiya boshqaruvi
├── screens/
│   ├── AllergySettingsScreen.js    アレルギー設定画面 / Allergiya sozlamalari
│   ├── ProductScanInfo.js          製品詳細とアレルギー警告 / Mahsulot tafsilotlari va allergiya ogohlantirishlari
│   ├── InfoScanner.js              スキャナー画面 / Skaner ekrani
│   ├── ProfileScreen.js            プロフィール画面 / Profil ekrani
│   ├── HomeScreen.js               ホーム画面 / Asosiy ekran
│   ├── CalendarScreen.js           カレンダー画面 / Kalendar ekrani
│   ├── LoginScreen.js              ログイン画面 / Kirish ekrani
│   ├── SignUpScreen.js             登録画面 / Ro'yxatdan o'tish ekrani
│   ├── MealHistoryScreen.js        食事履歴画面 / Ovqat tarixi ekrani
│   ├── WaterScreen.js              水分記録画面 / Suv yozuvlari ekrani
│   ├── TrainingScreen.js           トレーニング画面 / Trening ekrani
│   └── AchievementsScreen.js       達成画面 / Yutuqlar ekrani
├── utils/
│   ├── allergenUtils.js            アレルゲン検出ロジック / Allergen aniqlash logikasi
│   ├── achievementsUtils.js        達成システム / Yutuqlar tizimi
│   └── notificationsUtils.js       通知管理 / Xabarnomalar boshqaruvi
├── components/
│   └── AchievementToast.js         達成通知コンポーネント / Yutuq xabarnomasi komponenti
└── data/
    └── products.js                  ローカル製品データ / Lokal mahsulot ma'lumotlari
```

---

## 主な機能 / Asosiy funksiyalar

### 1. 認証システム / Autentifikatsiya tizimi

**何をする？ / Nima qiladi?**

ユーザー登録とログイン機能。各ユーザーのデータを個別に管理します。

Foydalanuvchi ro'yxatdan o'tish va kirish funksiyasi. Har bir foydalanuvchining ma'lumotlarini alohida boshqaradi.

**どこで使う？ / Qayerda ishlatiladi?**

- `auth/AuthProvider.js` - 認証ロジック / Autentifikatsiya logikasi
- `screens/LoginScreen.js` - ログイン画面 / Kirish ekrani
- `screens/SignUpScreen.js` - 登録画面 / Ro'yxatdan o'tish ekrani

---

### 2. 食品スキャン機能 / Oziq-ovqat skanerlash

**何をする？ / Nima qiladi?**

バーコードをスキャンして製品の詳細情報（名前、カロリー、栄養成分、アレルゲン情報）を取得します。Open Food Facts APIとローカルデータベースを使用します。

Barcode skanerlab mahsulot haqida batafsil ma'lumot (nomi, kaloriya, oziqlik tarkibi, allergen ma'lumoti) oladi. Open Food Facts API va lokal ma'lumotlar bazasidan foydalanadi.

**どこで使う？ / Qayerda ishlatiladi?**

- `screens/InfoScanner.js` - スキャナー画面とAPI呼び出し / Skaner ekrani va API chaqiruvlari
- `screens/ProductScanInfo.js` - 製品詳細表示 / Mahsulot tafsilotlarini ko'rsatish
- `data/products.js` - ローカル製品データ / Lokal mahsulot ma'lumotlari

---

### 3. アレルギー情報の通知機能（2026年10月追加）/ Allergiya haqida xabardorlik (2026 yil oktyabr qo'shildi)

**何をする？ / Nima qiladi?**

ユーザーが設定した9種類のアレルゲンを自動的にチェックし、製品をスキャンした際に警告を表示します。

Foydalanuvchi sozlagan 9 xil allergenni avtomatik tekshirib, mahsulotni skanerlaganda ogohlantirish ko'rsatadi.

**対応アレルゲン / Qo'llab-quvvatlanadigan allergenlar:**

- 牛乳・乳製品 / Sut va sut mahsulotlari
- 卵 / Tuxum
- ピーナッツ / Yer yong'og'i
- ナッツ類（アーモンド、クルミなど）/ Yong'oqlar
- 大豆 / Soya
- 小麦・グルテン / Bug'doy va gluten
- 魚 / Baliq
- 甲殻類・貝類 / Qisqichbaqalar va mollyuskalar
- ごま / Kunjut

**警告の種類 / Ogohlantirish turlari:**

🔴 **赤色警告：アレルゲン検出 / Qizil: Allergen topildi**
選択したアレルゲンが製品に含まれている場合

🟡 **黄色警告：データ不足 / Sariq: Ma'lumot yetarli emas**
製品の成分情報が不完全または欠落している場合

🟢 **緑色表示：安全 / Yashil: Xavfsiz**
選択したアレルゲンが検出されなかった場合

**どこで使う？ / Qayerda ishlatiladi?**

- `utils/allergenUtils.js` - アレルゲン検出ロジック（100以上の同義語辞書、検出アルゴリズム）/ Allergen aniqlash logikasi (100+ sinonim lug'ati, aniqlash algoritmi)
- `screens/AllergySettingsScreen.js` - アレルゲン選択画面 / Allergen tanlash ekrani
- `screens/ProfileScreen.js` - 設定へのナビゲーション / Sozlamalarga navigatsiya
- `screens/InfoScanner.js` - スキャン時のアレルゲンチェック / Skanerlashda allergen tekshiruvi
- `screens/ProductScanInfo.js` - 警告表示 / Ogohlantirish ko'rsatish

---

### 4. 食事記録機能 / Ovqat yozuvlari

**何をする？ / Nima qiladi?**

毎日の食事を記録し、合計カロリーと栄養素を追跡します。

Kunlik ovqatlarni yozib boradi va jami kaloriya hamda oziqlik moddalarini kuzatadi.

**どこで使う？ / Qayerda ishlatiladi?**

- `screens/HomeScreen.js` - 食事追加ボタン / Ovqat qo'shish tugmasi
- `screens/MealHistoryScreen.js` - 食事履歴表示 / Ovqat tarixini ko'rsatish
- `screens/CalendarScreen.js` - カレンダー形式の表示 / Kalendar formatida ko'rsatish

---

### 5. 水分記録機能 / Suv yozuvlari

**何をする？ / Nima qiladi?**

毎日の水分摂取量を記録し、目標達成を追跡します。

Kunlik suv iste'molini yozib boradi va maqsadga erishishni kuzatadi.

**どこで使う？ / Qayerda ishlatiladi?**

- `screens/WaterScreen.js` - 水分記録画面 / Suv yozuvlari ekrani

---

### 6. トレーニング記録機能 / Trening yozuvlari

**何をする？ / Nima qiladi?**

運動の種類、時間、カロリー消費を記録します。

Mashq turi, vaqti va kaloriya sarfini yozib boradi.

**どこで使う？ / Qayerda ishlatiladi?**

- `screens/TrainingScreen.js` - トレーニング記録画面 / Trening yozuvlari ekrani

---

### 7. 達成システム / Yutuqlar tizimi

**何をする？ / Nima qiladi?**

連続記録日数、目標達成などのマイルストーンを追跡し、ユーザーのモチベーションを高めます。

Ketma-ket kunlar, maqsadga erishish kabi yutuqlarni kuzatib, foydalanuvchi motivatsiyasini oshiradi.

**どこで使う？ / Qayerda ishlatiladi?**

- `utils/achievementsUtils.js` - 達成ロジック / Yutuqlar logikasi
- `screens/AchievementsScreen.js` - 達成一覧表示 / Yutuqlar ro'yxatini ko'rsatish
- `components/AchievementToast.js` - 達成通知 / Yutuq xabarnomasi

---

### 8. リマインダー通知 / Eslatma xabarnomalar

**何をする？ / Nima qiladi?**

食事、水分摂取、トレーニングのリマインダー通知を送信します。

Ovqat, suv iste'moli va trening uchun eslatma xabarnomalar yuboradi.

**どこで使う？ / Qayerda ishlatiladi?**

- `utils/notificationsUtils.js` - 通知ロジック / Xabarnomalar logikasi
- `screens/ProfileScreen.js` - 通知設定 / Xabarnomalar sozlamalari

---

### 9. プロフィール管理 / Profil boshqaruvi

**何をする？ / Nima qiladi?**

ユーザープロフィール（身長、体重、年齢、性別）を管理し、BMIを自動計算します。アレルギー設定へのアクセスも提供します。

Foydalanuvchi profili (bo'y, vazn, yosh, jins)ni boshqaradi va BMI ni avtomatik hisoblab beradi. Allergiya sozlamalariga kirish imkoniyatini ham beradi.

**どこで使う？ / Qayerda ishlatiladi?**

- `screens/ProfileScreen.js` - プロフィール画面 / Profil ekrani

---

## 追加ドキュメント / Qo'shimcha hujjatlar

詳細なアレルギー機能のガイドについては、`ALLERGY_GUIDE.md`をご覧ください。

Allergiya funksiyasi bo'yicha batafsil qo'llanma uchun `ALLERGY_GUIDE.md` faylini ko'ring.
