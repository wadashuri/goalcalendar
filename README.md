# 目標カレンダー (goalcalendar)

iOS向けの目標管理カレンダーアプリ。設計は[Notion](https://app.notion.com/p/3eea9af0615b80b3b2d9fba731c4167f)を参照してください。

## 開発

```sh
nvm use
npm ci
npm run ios
```

Expo SDK 57 / React Native / Expo Router。
画面は `src/app/`、機能ロジックは `src/features/`、SQLite処理は `src/services/` に置きます（機能実装が進み次第追加）。

```sh
npm run check # 整形・lint・型・テスト＋カバレッジ
```

開発規約・カバレッジ基準・GitHubの必須チェック設定は [開発ガイド](docs/DEVELOPMENT.md) を参照してください。

## 紹介ページ

`web/index.html` に、アプリ紹介・お問い合わせ・v1.0のプライバシーポリシーをまとめています。bodylogのページ構成を基に、目標カレンダーの実装に合わせています。

```sh
python3 -m http.server 8090 --bind 127.0.0.1
# http://127.0.0.1:8090/web/
```

公開予定URLは https://wadashuri.github.io/goalcalendar/ です。共有画像に添えるリンクにもこのURLを使用します（`EXPO_PUBLIC_APP_LP_URL` で上書き可能）。App Storeリンクはリリース時に設定します。

GitHub Pagesの公開元を「GitHub Actions」に設定すると、mainへのマージ後に `.github/workflows/pages.yml` がLPを公開します。公開が完了するまでは共有リンクの遷移先は利用できません。
