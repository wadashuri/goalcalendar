# PB-105 リリース準備

## 用意済み

- [x] 1024×1024、透過なしの猫＋カレンダーのアイコンを作成
- [x] app.jsonに新アイコンを指定
- [x] EASプロジェクトに接続
- [x] 日本語の掲載説明文・サブタイトル・キーワードを用意
- [x] LP・サポート・プライバシーポリシーを公開

## 提出前に必要

- [x] production EAS Buildが成功
- [ ] 実際のアプリ画面からストア用スクリーンショットを用意
- [x] App Store Connectにアプリを登録（bundle ID: com.slaboratory.goalcalendar.app）
- [x] 実際のApp Store ConnectアプリIDをeas.jsonのsubmit.production.ios.ascAppIdへ設定
- [x] Appleの署名資格情報をEASに設定
- [ ] TestFlightで起動・保存・再起動・共有を確認
- [ ] プライバシー回答、年齢制限、価格・配信地域、著作権を設定
- [ ] ストア掲載情報・スクリーンショットを登録
- [ ] EAS Submitでバイナリをアップロード
- [ ] 審査提出とリリース

## コマンド

```sh
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production --latest
```

資格情報やAppleアカウントの秘密情報をリポジトリへ保存しない。

## 確認済みリンク

- App Store Connect: https://appstoreconnect.apple.com/apps/6818854340/distribution
- 署名付きビルド（1.0.0 / 2）: https://expo.dev/accounts/shuri0108/projects/goalcalendar/builds/a8ec66e1-5fd4-412b-9c6a-4a501df6964b
- スクリーンショット用シミュレータービルド: https://expo.dev/accounts/shuri0108/projects/goalcalendar/builds/e6fa0e66-6fc5-4e58-aba1-9eaca01aaf69

名前・スタンプを空欄にした保存と今日画面の色の丸表示をiPhone 17 Proシミュレーターで確認。確認後は元の目標設定へ復元。
