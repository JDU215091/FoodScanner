# FoodScanner

## 📱 プロジェクト概要 / Loyihaning umumiy tavsifi

**FoodScanner** は、React Native と Expo を使って作られたモバイルアプリです。食品のバーコードをスキャンして栄養情報を確認し、食事、飲水、トレーニングを記録できます。

**FoodScanner** — bu React Native va Expo asosida yaratilgan mobil ilova. Foydalanuvchi oziq-ovqat barcode’ini skanerlab, oziqlanish ma’lumotini tekshirishi, ovqat, suv va mashqlarini yozib borishi mumkin.

## 🎯 目的 / Maqsad

- バーコードを使った食品情報取得を簡単にする
- 食事と水分の記録をサポートする
- トレーニング記録と達成システムで習慣化を促す

- Barcod orqali oziq-ovqat ma’lumotini tez olishni osonlashtirish
- Ovqat va suv yozuvlarini qo‘llab-quvvatlash
- Trening yozuvlari va achievement tizimi orqali odat yaratishni kuchaytirish

## 🚀 主な機能 / Asosiy funktsiyalar

- バーコードスキャンによる食品検索
- Open Food Facts API と FoodRepo API の利用
- ローカルデータベースによるフォールバック検索
- ユーザー登録・ログイン（ローカル認証）
- 食事ログ、カレンダー、統計表示
- 達成システム（streak、水分、消費カロリー、トレーニング）
- 通知リマインダー（飲水、食事、トレーニング）
- プロフィール編集

- Barcode skanerlash orqali oziq-ovqat qidirish
- Open Food Facts API va FoodRepo API ishlatish
- Lokal ma’lumotlar bazasiga fallback qidiruv
- Foydalanuvchi ro‘yxatga olish va login (lokal auth)
- Ovqat logi, kalendar, statistika
- Achievement tizimi (streak, suv, yondirilgan kaloriyalar, trening)
- Eslatmalar (suv, ovqat, trening)
- Profil tahrirlash

## 🧩 技術スタック / Texnologiya staki

- React Native
- Expo
- React Navigation
- @react-native-async-storage/async-storage
- expo-camera
- expo-notifications
- axios
- lucide-react-native

- React Native
- Expo
- React Navigation
- @react-native-async-storage/async-storage
- expo-camera
- expo-notifications
- axios
- lucide-react-native

## 📁 主要ファイル / Asosiy fayllar

- `App.js` - アプリのナビゲーションと認証ラッパー
- `index.js` - Expo root コンポーネント登録
- `auth/AuthProvider.js` - ローカル認証とセッション管理
- `screens/` - 画面コンポーネント
- `utils/achievementsUtils.js` - 達成システムのロジック
- `utils/notificationsUtils.js` - 通知スケジュールと権限管理
- `data/products.js` - ローカル製品データのフォールバック

- `App.js` - ilovaning navigatsiyasi va auth wrapperi
- `index.js` - Expo root komponent ro‘yxatga olish
- `auth/AuthProvider.js` - lokal autentifikatsiya va sessiya boshqaruvi
- `screens/` - ekran komponentlari
- `utils/achievementsUtils.js` - achievement tizimi logikasi
- `utils/notificationsUtils.js` - bildirishnoma rejalashtirish va permission
- `data/products.js` - lokal mahsulot fallback ma’lumot

## ⚙️ インストールと実行 / O‘rnatish va ishga tushirish

```bash
npm install
npm start
```

- Android: `npm run android`
- iOS: `npm run ios`

- Android: `npm run android`
- iOS: `npm run ios`

## 🌐 API について / API haqida

- Open Food Facts：`https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- FoodRepo：`https://www.foodrepo.org/api/v3/products?barcodes_ean13={barcode}`

- Open Food Facts: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- FoodRepo: `https://www.foodrepo.org/api/v3/products?barcodes_ean13={barcode}`

## 🔒 注意 / E'tibor

このリポジトリにはバックエンドは含まれていません。認証はローカルの `AsyncStorage` 上で行われます。

Ushbu repo backendni o‘z ichiga olmaydi. Autentifikatsiya lokal `AsyncStorage` orqali amalga oshiriladi.

## 💡 追加情報 / Qo‘shimcha ma’lumot

- Git ヒストリーは `Initial commit` のみです
- 明確な個別コミット責任はこの履歴からは特定できません

- Git tarixida faqat `Initial commit` mavjud
- Aniq shaxsiy contribution history bu yerdan ajratib bo‘lmaydi


---

## 🆕 Новая функция: Уведомления об аллергенах / Yangi funksiya: Allergen ogohlantirishlari

### 🛡️ Возможности / Imkoniyatlar:

- Настройка личных аллергенов (9 категорий)
- Автоматическая проверка при сканировании продуктов
- Трехуровневая система предупреждений:
  - 🔴 **Красный** - Аллерген обнаружен
  - 🟡 **Желтый** - Недостаточно данных
  - 🟢 **Зеленый** - Аллергены не обнаружены

- Shaxsiy allergenlarni sozlash (9 kategoriya)
- Mahsulot skanerda avtomatik tekshirish
- Uch darajali ogohlantirish tizimi:
  - 🔴 **Qizil** - Allergen topildi
  - 🟡 **Sariq** - Ma'lumot yetarli emas
  - 🟢 **Yashil** - Allergenlar topilmadi

### 📱 Использование / Foydalanish:

1. **Profile** → **Настройки аллергии** / **Allergiya sozlamalari**
2. Выберите аллергены / Allergenlarni tanlang
3. Сканируйте продукт / Mahsulotni skanerlang
4. Получите предупреждение (если нужно) / Ogohlantirishni ko'ring

### ⚠️ Важно / Muhim:

Всегда проверяйте состав на упаковке продукта. Приложение не гарантирует 100% точность.

Har doim mahsulot qadoqidagi tarkibni tekshiring. Ilova 100% aniqlikni kafolatlamaydi.

---

## 🧩 Поддерживаемые аллергены / Qo'llab-quvvatlanadigan allergenlar:

1. 🥛 Молоко и молочные продукты / Sut va sut mahsulotlari
2. 🥚 Яйца / Tuxum
3. 🥜 Арахис / Yer yong'og'i
4. 🌰 Орехи (миндаль, грецкий и др.) / Yong'oqlar
5. 🫘 Соя / Soya
6. 🌾 Пшеница и глютен / Bug'doy va gluten
7. 🐟 Рыба / Baliq
8. 🦐 Ракообразные и моллюски / Qisqichbaqalar
9. 🌿 Кунжут / Kunjut
