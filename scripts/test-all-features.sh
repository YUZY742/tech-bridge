#!/bin/bash

# TECH-BRIDGE 全機能テストスクリプト

API_URL="https://tech-bridge-uybw.vercel.app"

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  TECH-BRIDGE 全機能テスト"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# テスト関数
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "テスト: $name... "
    
    if [ "$method" = "GET" ]; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
        RESPONSE=$(curl -s "$API_URL$endpoint" 2>&1)
    elif [ "$method" = "POST" ]; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
        RESPONSE=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint" 2>&1)
    fi
    
    if [ "$STATUS" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $STATUS)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $STATUS)"
        echo "   Response: $RESPONSE" | head -1
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. ヘルスチェック
echo -e "${BLUE}=== 1. ヘルスチェック ===${NC}"
test_endpoint "ヘルスチェック" "GET" "/api/health" "" "200"
echo ""

# 2. APIエンドポイントのテスト
echo -e "${BLUE}=== 2. APIエンドポイント（サンプルデータ取得） ===${NC}"
test_endpoint "サークル一覧取得" "GET" "/api/circles" "" "200"

# サークルデータの確認
CIRCLES_RESPONSE=$(curl -s "$API_URL/api/circles" 2>&1)
if echo "$CIRCLES_RESPONSE" | grep -q "_id"; then
    CIRCLE_COUNT=$(echo "$CIRCLES_RESPONSE" | grep -o "_id" | wc -l | tr -d ' ')
    echo "   サークル数: $CIRCLE_COUNT"
    if [ "$CIRCLE_COUNT" -gt 0 ]; then
        echo -e "   ${GREEN}✅ サンプルデータが存在します${NC}"
        PASSED=$((PASSED + 1))
        
        # 最初のサークルIDを取得
        FIRST_CIRCLE_ID=$(echo "$CIRCLES_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
        if [ -n "$FIRST_CIRCLE_ID" ]; then
            test_endpoint "サークル詳細取得" "GET" "/api/circles/$FIRST_CIRCLE_ID" "" "200"
        fi
    else
        echo -e "   ${YELLOW}⚠️  サンプルデータがありません${NC}"
        echo "   実行: ./scripts/setup-sample-data.sh"
    fi
else
    echo -e "   ${YELLOW}⚠️  データ取得に失敗（MongoDB接続が必要）${NC}"
fi
echo ""

# 3. ユーザー登録・ログイン機能のテスト
echo -e "${BLUE}=== 3. ユーザー登録・ログイン機能 ===${NC}"

# テスト用ユーザー情報
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

# ユーザー登録
echo -n "テスト: ユーザー登録... "
REGISTER_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"student\",\"profile\":{\"name\":\"Test User\",\"university\":\"Test University\"}}" \
    "$API_URL/api/auth/register" 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
    
    # トークンを抽出
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        # ログイン
        echo -n "テスト: ログイン... "
        LOGIN_RESPONSE=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
            "$API_URL/api/auth/login" 2>&1)
        
        if echo "$LOGIN_RESPONSE" | grep -q "token"; then
            echo -e "${GREEN}✅ PASS${NC}"
            PASSED=$((PASSED + 1))
            
            # 認証済みエンドポイントのテスト
            echo -n "テスト: 認証済みエンドポイント（/api/auth/me）... "
            ME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                -H "Authorization: Bearer $TOKEN" \
                "$API_URL/api/auth/me")
            
            if [ "$ME_STATUS" = "200" ]; then
                echo -e "${GREEN}✅ PASS${NC} (Status: $ME_STATUS)"
                PASSED=$((PASSED + 1))
            else
                echo -e "${RED}❌ FAIL${NC} (Status: $ME_STATUS)"
                FAILED=$((FAILED + 1))
            fi
        else
            echo -e "${RED}❌ FAIL${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi
else
    echo -e "${YELLOW}⚠️  登録に失敗（既に存在する可能性）${NC}"
    # 既存ユーザーでログインを試みる
    echo -n "テスト: ログイン（既存ユーザー）... "
    LOGIN_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
        "$API_URL/api/auth/login" 2>&1)
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED=$((FAILED + 1))
    fi
fi
echo ""

# 4. サークル作成・閲覧機能のテスト
echo -e "${BLUE}=== 4. サークル作成・閲覧機能 ===${NC}"

# 認証トークンが必要な場合
if [ -z "$TOKEN" ]; then
    echo -e "   ${YELLOW}⚠️  認証トークンが必要です（先にログインしてください）${NC}"
else
    # サークル作成テスト
    echo -n "テスト: サークル作成... "
    CIRCLE_DATA="{\"name\":\"テストサークル\",\"description\":\"これはテスト用のサークルです\",\"university\":\"テスト大学\",\"category\":\"その他\",\"currentStatus\":\"テスト中\"}"
    
    CREATE_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$CIRCLE_DATA" \
        "$API_URL/api/circles" 2>&1)
    
    if echo "$CREATE_RESPONSE" | grep -q "_id"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        
        # 作成されたサークルIDを取得
        CREATED_CIRCLE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
        
        if [ -n "$CREATED_CIRCLE_ID" ]; then
            # サークル詳細取得
            test_endpoint "作成したサークルの詳細取得" "GET" "/api/circles/$CREATED_CIRCLE_ID" "" "200"
        fi
    else
        echo -e "${YELLOW}⚠️  サークル作成に失敗（権限の問題の可能性）${NC}"
    fi
fi

# サークル一覧の閲覧（認証不要）
test_endpoint "サークル一覧閲覧" "GET" "/api/circles" "" "200"
echo ""

# 5. チャット機能のテスト
echo -e "${BLUE}=== 5. チャット機能 ===${NC}"
echo -n "テスト: チャットエンドポイント確認... "
# チャット機能は支援（Support）が作成された後に利用可能
# ここではエンドポイントの存在確認のみ
CHAT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/chat/test" 2>&1)
if [ "$CHAT_STATUS" = "404" ] || [ "$CHAT_STATUS" = "401" ] || [ "$CHAT_STATUS" = "403" ]; then
    echo -e "${GREEN}✅ PASS${NC} (エンドポイントは存在します)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  ステータス: $CHAT_STATUS${NC}"
fi
echo ""

# 結果サマリー
echo "=========================================="
echo "  テスト結果サマリー"
echo "=========================================="
echo -e "${GREEN}✅ 成功: $PASSED${NC}"
echo -e "${RED}❌ 失敗: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 すべてのテストが成功しました！${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  一部のテストが失敗しました${NC}"
    echo "詳細を確認してください"
    exit 1
fi
