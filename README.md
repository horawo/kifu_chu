# Kifu Chu

中将棋の棋譜記録・閲覧と初期配置管理を行うための Web アプリです。

> [!WARNING]
> このリポジトリはドラフト版です。動作確認や仕様整理の途中段階のため、API・DB スキーマ・画面構成は今後変更される可能性があります。公開運用や本番利用はまだ想定していません。

## 構成

- `frontend/`: React + TypeScript + Vite のフロントエンド
- `backend/`: PHP の API サーバー
- `docker/`: PHP / MySQL 用の Docker 設定
- `docker-compose.yml`: 開発環境一式の起動設定
- `*_test.ps1`: API 動作確認用の PowerShell スクリプト

## 主な機能

- ユーザー登録・ログイン
- 中将棋の棋譜作成・保存・一覧表示
- 初期配置の作成・保存・一覧表示
- CSA 形式の読み込み・書き出しに関するユーティリティ

## 必要なもの

- Docker / Docker Compose
- Git
- PowerShell

フロントエンドを Docker なしで直接動かす場合は Node.js も必要です。

## 起動方法

リポジトリのルートで以下を実行します。

```powershell
docker compose up --build
```

起動後、以下にアクセスします。

- フロントエンド: http://localhost:5173
- バックエンド API: http://localhost:8080/api
- MySQL: `localhost:3306`

停止する場合:

```powershell
docker compose down
```

DB の永続ボリュームも含めて初期化したい場合:

```powershell
docker compose down -v
```

## DB マイグレーション

MySQL コンテナ起動時に `docker/mysql/init.sql` が実行されます。

追加マイグレーションやテストユーザー作成を行う場合は、コンテナ起動後に以下を実行します。

```powershell
docker compose exec web php db/migrate.php
```

マイグレーション実行後、以下のテストユーザーが作成されます。

- ユーザー名: `testuser`
- パスワード: `password123`

## 動作確認

API の簡易確認用スクリプトがあります。バックエンド起動後に実行してください。

```powershell
.\auth_test.ps1
.\kifu_test.ps1
.\initial_test.ps1
```

## フロントエンドを単体で動かす場合

```powershell
cd frontend
npm install
npm run dev
```

ビルド:

```powershell
npm run build
```

Lint:

```powershell
npm run lint
```

## GitHub へ push する流れ

初回 push の一例です。

```powershell
git status
git add .
git commit -m "Initial draft"
git branch -M main
git remote add origin <GitHub repository URL>
git push -u origin main
```

すでに `origin` を設定済みの場合は、`git remote add origin ...` は不要です。

## 注意事項

- 現状は開発・検証用の設定です。
- DB パスワードなどは `docker-compose.yml` に開発用の値として直接記載されています。
- CORS はローカル開発用に `http://localhost:5173` を許可しています。
- テーブル定義やマイグレーション内に文字化けしているコメント・デフォルト値が残っています。
- 本番公開前には認証、入力検証、エラーハンドリング、秘密情報管理、DB マイグレーション運用の見直しが必要です。

## ライセンス

このリポジトリのライセンスは [LICENSE](./LICENSE) を参照してください。
