# FoodScanner

## プロジェクト概要 / Loyihaning umumiy tavsifi

**FoodScanner** は、React Native と Expo を使って作られたモバイルアプリです。食品のバーコードをスキャンして栄養情報を確認し、食事、飲水、トレーニングを記録できます。

**FoodScanner** — bu React Native va Expo asosida yaratilgan mobil ilova. Foydalanuvchi oziq-ovqat barcode'ini skanerlab, oziqlanish ma'lumotini tekshirishi, ovqat, suv va mashqlarini yozib borishi mumkin.

---

## プロジェクトの目的 / Loyiha maqsadi

このアプリは、日常の健康管理をサポートするために作られました：

- バーコードスキャンで食品情報を素早く取得
- 食事と水分摂取の記録を簡単に
- トレーニング記録と達成システムで健康的な習慣を促進

Ushbu ilova kundalik sog'liqni boshqarishni qo'llab-quvvatlash uchun yaratilgan:

- Barcode skanerlash orqali oziq-ovqat ma'lumotini tez olish
- Ovqat va suv iste'molini oson yozib borish
- Trening yozuvlari va yutuqlar tizimi orqali sog'lom odatlarni rivojlantirish

---

## 主な機能 / Asosiy funksiyalar

### 食品スキャン機能 / Oziq-ovqat skanerlash

バーコードをスキャンすることで、製品の詳細情報を取得できます。Open Food Facts API とローカルデータベースを組み合わせて、より多くの製品情報を提供します。

Barcode skanerlab mahsulot haqida batafsil ma'lumot olish mumkin. Open Food Facts API va lokal ma'lumotlar bazasidan foydalanib, ko'proq mahsulotlar haqida ma'lumot taqdim etamiz.

### アレルギー情報の通知機能（新機能）/ Allergiya haqida xabardorlik (yangi)

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

### その他の機能 / Boshqa funksiyalar

- ユーザー登録とログイン（ローカル認証）
- 食事記録とカロリー管理
- 水分摂取の記録
- トレーニング記録
- 達成システム（連続記録日数、目標達成など）
- リマインダー通知
- プロフィール編集とBMI計算

- Foydalanuvchi ro'yxatdan o'tish va kirish (lokal autentifikatsiya)
- Ovqat yozuvlari va kaloriya boshqaruvi
- Suv iste'moli yozuvlari
- Mashq yozuvlari
- Yutuqlar tizimi (ketma-ket kunlar, maqsadga erishish va boshqalar)
- Eslatma xabarnomalar
- Profil tahrirlash va BMI hisoblash

---

## 技術スタック / Texnologiya staki

このプロジェクトは以下の技術で構築されています：

Ushbu loyiha quyidagi texnologiyalar asosida qurilgan:

- **React Native** - モバイルアプリ開発フレームワーク / Mobil ilova ishlab chiqish freymvorki
- **Expo SDK 58** - React Native開発ツール / React Native ishlab chiqish vositasi
- **React Navigation** - 画面ナビゲーション / Ekranlar navigatsiyasi
- **AsyncStorage** - ローカルデータ保存 / Lokal ma'lumotlar saqlash
- **Axios** - HTTP通信 / HTTP aloqa
- **Expo Camera** - カメラとバーコードスキャン / Kamera va barcode skanerlash
- **Expo Notifications** - プッシュ通知 / Push xabarnomalar
- **Lucide React Native** - アイコンライブラリ / Ikonlar kutubxonasi

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
│   ├── AllergySettingsScreen.js    アレルギー設定画面（新規）/ Allergiya sozlamalari (yangi)
│   ├── ProductScanInfo.js          製品詳細とアレルギー警告 / Mahsulot tafsilotlari va allergiya ogohlantirishlari
│   ├── InfoScanner.js              スキャナー画面 / Skaner ekrani
│   ├── ProfileScreen.js            プロフィール画面 / Profil ekrani
│   ├── HomeScreen.js               ホーム画面 / Asosiy ekran
│   ├── CalendarScreen.js           カレンダー画面 / Kalendar ekrani
│   └── ...                         その他の画面 / Boshqa ekranlar
├── utils/
│   ├── allergenUtils.js            アレルゲン検出ロジック（新規）/ Allergen aniqlash logikasi (yangi)
│   ├── achievementsUtils.js        達成システム / Yutuqlar tizimi
│   └── notificationsUtils.js       通知管理 / Xabarnomalar boshqaruvi
├── components/
│   └── AchievementToast.js         達成通知コンポーネント / Yutuq xabarnomasi komponenti
└── data/
    └── products.js                  ローカル製品データ / Lokal mahsulot ma'lumotlari
```

---

## インストールと実行 / O'rnatish va ishga tushirish

### 必要な環境 / Zarur muhit

- Node.js（バージョン14以上）/ Node.js (14+ versiya)
- npm または yarn
- Expo Go アプリ（モバイルデバイス）/ Expo Go ilovasi (mobil qurilma)

### インストール手順 / O'rnatish bosqichlari

```bash
# リポジトリをクローン / Repositoriyani klonlash
git clone https://github.com/JDU215091/FoodScanner.git
cd FoodScanner

# 依存関係をインストール / Bog'liqliklarni o'rnatish
npm install

# アプリを起動 / Ilovani ishga tushirish
npm start
```

### プラットフォーム別の実行 / Platformaga qarab ishga tushirish

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web（開発用）:**
```bash
npm run web
```

---

## API統合 / API integratsiyasi

このアプリは外部APIを使用して製品情報を取得します：

Ushbu ilova mahsulot ma'lumotlarini olish uchun tashqi API'lardan foydalanadi:

### Open Food Facts API

世界中の食品データベース。バーコードで製品情報を検索できます。

Dunyo bo'ylab oziq-ovqat ma'lumotlar bazasi. Barcode orqali mahsulot ma'lumotlarini qidirish mumkin.

**エンドポイント / Endpoint:**
```
https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```

### FoodRepo API（予備）/ FoodRepo API (zaxira)

Open Food Factsで見つからない製品の予備APIとして使用します。

Open Food Facts'da topilmagan mahsulotlar uchun zaxira API sifatida ishlatiladi.

**エンドポイント / Endpoint:**
```
https://www.foodrepo.org/api/v3/products?barcodes_ean13={barcode}
```

---

## アレルギー機能の使い方 / Allergiya funksiyasidan foydalanish

### 設定方法 / Sozlash usuli

1. アプリを開いて、プロフィールタブに移動 / Ilovani oching va Profil tabiga o'ting
2. 「アレルギー設定」ボタンをタップ / "Allergiya sozlamalari" tugmasini bosing
3. 該当するアレルゲンを選択 / Tegishli allergenlarni tanlang
4. 「保存」をタップして設定を保存 / "Saqlash" tugmasini bosib sozlamalarni saqlang

### スキャン時の動作 / Skanerlashda ishlash

製品をスキャンすると、アプリは自動的にアレルゲンをチェックし、以下のいずれかを表示します：

Mahsulotni skanerlaganda, ilova avtomatik ravishda allergenlarni tekshiradi va quyidagilardan birini ko'rsatadi:

**赤色警告：アレルゲン検出 / Qizil ogohlantirish: Allergen topildi**

選択したアレルゲンが製品に含まれている場合に表示されます。検出されたアレルゲンの詳細と、該当する成分が示されます。

Tanlangan allergen mahsulotda topilganda ko'rsatiladi. Topilgan allergen va tegishli ingredient ko'rsatiladi.

**黄色警告：データ不足 / Sariq ogohlantirish: Ma'lumot yetarli emas**

製品の成分情報が不完全または欠落している場合に表示されます。この場合、製品パッケージを直接確認することをお勧めします。

Mahsulot tarkibi to'liq bo'lmagan yoki mavjud bo'lmasa ko'rsatiladi. Bu holda, mahsulot qadoqini bevosita tekshirish tavsiya etiladi.

**緑色表示：安全 / Yashil ko'rsatkich: Xavfsiz**

選択したアレルゲンが検出されなかった場合に表示されます。ただし、製品パッケージの最終確認は常に推奨されます。

Tanlangan allergenlar topilmasa ko'rsatiladi. Biroq, mahsulot qadoqini oxirgi marta tekshirish har doim tavsiya etiladi.

### 重要な注意事項 / Muhim eslatma

アレルゲン検出機能は、利用可能なAPIデータに基づいて動作します。以下の点にご注意ください：

Allergen aniqlash funksiyasi mavjud API ma'lumotlariga asoslanib ishlaydi. Quyidagilarga e'tibor bering:

- アプリは100%の精度を保証するものではありません / Ilova 100% aniqlikni kafolatlamaydi
- 「微量を含む可能性」などの表示は検出されません / "Izlarni o'z ichiga olishi mumkin" kabi ma'lumotlar aniqlanmaydi
- 製造工程での交差汚染は検出できません / Ishlab chiqarish jarayonidagi o'zaro ifloslanish aniqlanmaydi
- 常に製品パッケージの成分表示を確認してください / Har doim mahsulot qadoqidagi tarkibni tekshiring
- 重度のアレルギーをお持ちの方は、必ず医師に相談してください / Og'ir allergiyaga ega bo'lsangiz, albatta shifokor bilan maslahatlashing

---

## 認証システム / Autentifikatsiya tizimi

このアプリは、バックエンドサーバーを使用せず、ローカルストレージ（AsyncStorage）で認証を管理しています。

Ushbu ilova backend serverdan foydalanmasdan, lokal xotira (AsyncStorage) orqali autentifikatsiyani boshqaradi.

### 仕組み / Ishlash prinsipi

- ユーザーデータはデバイスにローカルで保存されます / Foydalanuvchi ma'lumotlari qurilmada lokal saqlanadi
- 各ユーザーの設定（アレルギー、プロフィール、記録など）は個別に管理されます / Har bir foydalanuvchining sozlamalari (allergiya, profil, yozuvlar va boshqalar) alohida boshqariladi
- インターネット接続なしでもアプリの大部分の機能が使用可能です / Internet aloqasi bo'lmasa ham ilovaning ko'p funksiyalari ishlatilishi mumkin

---

## 開発履歴 / Ishlab chiqish tarixi

### 最新のアップデート / Oxirgi yangilanish

**アレルギー通知機能の追加（2025年1月）**

Allergiya xabardorlik funksiyasi qo'shildi (2025 yil yanvar)

主な変更内容：

- 9種類のアレルゲン対応機能を実装
- 製品スキャン時の自動アレルゲンチェック
- 三段階の警告システム（危険・注意・安全）
- ユーザーごとのアレルゲン設定保存
- Expo SDK 58へのアップグレード
- React Native 0.88互換性対応

Asosiy o'zgarishlar:

- 9 xil allergen uchun funksiya qo'shildi
- Mahsulotni skanerlashda avtomatik allergen tekshiruvi
- Uch darajali ogohlantirish tizimi (xavfli - ehtiyot - xavfsiz)
- Har bir foydalanuvchi uchun allergen sozlamalarini saqlash
- Expo SDK 58 ga yangilash
- React Native 0.88 bilan muvofiqlik

---

## トラブルシューティング / Muammolarni hal qilish

### よくある問題 / Tez-tez uchraydigan muammolar

**製品が見つからない**

Mahsulot topilmadi

APIのデータベースに製品情報がない可能性があります。製品パッケージを直接確認してください。

API ma'lumotlar bazasida mahsulot ma'lumotlari bo'lmasligi mumkin. Mahsulot qadoqini bevosita tekshiring.

**アレルギー警告が表示されない**

Allergiya ogohlantirishي ko'rinmayapti

プロフィール画面でアレルゲンが正しく設定されているか確認してください。また、ログインしているかも確認してください。

Profil ekranida allergenlar to'g'ri sozlanganligini tekshiring. Shuningdek, tizimga kirganligingizni ham tekshiring.

**カメラが起動しない**

Kamera ishga tushmayapti

アプリにカメラの権限が付与されているか確認してください。デバイスの設定からアプリの権限を確認できます。

Ilovaga kamera ruxsati berilganligini tekshiring. Qurilma sozlamalaridan ilova ruxsatlarini tekshirish mumkin.

---

## 貢献について / Hissa qo'shish haqida

このプロジェクトへの貢献を歓迎します。バグ報告、機能提案、プルリクエストなど、どんな形でも歓迎します。

Ushbu loyihaga hissa qo'shishni mamnuniyat bilan qabul qilamiz. Xato haqida xabar berish, funksiya taklif qilish, pull request yuborish - har qanday shakldagi hissa qo'shish mamnuniyat bilan qabul qilinadi.

---

## ライセンス / Litsenziya

このプロジェクトのライセンスについては、リポジトリの所有者にお問い合わせください。

Ushbu loyihaning litsenziyasi haqida ma'lumot olish uchun repositoriya egasi bilan bog'laning.

---

## 連絡先 / Aloqa

プロジェクトに関する質問や提案がある場合は、GitHubのIssuesセクションでお知らせください。

Loyiha haqida savollaringiz yoki takliflaringiz bo'lsa, GitHub'dagi Issues bo'limidan xabar bering.

**GitHub:** https://github.com/JDU215091/FoodScanner

---

## 追加ドキュメント / Qo'shimcha hujjatlar

詳細なアレルギー機能のガイドについては、`ALLERGY_GUIDE.md`をご覧ください。

Allergiya funksiyasi bo'yicha batafsil qo'llanma uchun `ALLERGY_GUIDE.md` faylini ko'ring.
