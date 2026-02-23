# rails_yoyaku_app

施設予約アプリ。Rails API + Next.js のモノレポ構成。

## 必要なもの

- [Docker](https://www.docker.com/) / Docker Compose

## 起動手順

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd rails_yoyaku_app
```

### 2. 起動

```bash
docker compose up --build
```

初回はイメージのビルドと gem / npm パッケージのインストールが行われます。
起動後、DBのマイグレーションは自動的に実行されます。

### 3. 初期データを投入（任意）

```bash
docker compose exec api bin/rails db:seed
```

### 4. アクセス

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:3001 |
| API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |
| Mailpit (メール確認) | http://localhost:8025 |

### テストアカウント（シードデータ投入後）

| メール | パスワード | 権限 |
|---|---|---|
| tanaka@example.com | password123 | 管理者 |
| sato@example.com | password123 | 一般 |
| suzuki@example.com | password123 | 一般 |

## メール通知

開発環境では [Mailpit](https://github.com/axllent/mailpit) を使用してメールを受信します。実際には送信されません。

以下のタイミングでメールが送信されます。

| タイミング | 送信先 |
|---|---|
| ユーザー登録 | 登録者本人 |
| 予約申請（イベント作成） | 申請者本人 |
| 予約承認 | 申請者本人 |
| 予約却下 | 申請者本人 |

送受信したメールは http://localhost:8025 で確認できます。

## 停止

```bash
docker compose down
```

DBのデータも含めて完全にリセットする場合:

```bash
docker compose down -v
```

## 2回目以降の起動

```bash
docker compose up
```

## よく使うコマンド

```bash
# Railsコンソール
docker compose exec api bin/rails console

# DBリセット＆シード再投入
docker compose exec api bin/rails db:reset
docker compose exec api bin/rails db:seed

# テスト実行
docker compose exec api bundle exec rspec

# gem を追加した後
docker compose exec api bundle install

# npm パッケージを追加した後
docker compose exec frontend npm install
```
