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
