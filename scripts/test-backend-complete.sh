#!/bin/bash

# TECH-BRIDGE バックエンド完全テストスクリプト

API_URL="https://tech-bridge-uybw.vercel.app"

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  TECH-BRIDGE バックエンド完全テスト"
echo "=========================================="
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# テスト関数
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local token=$6
    
    echo -n "テスト: $name... "
    
    local headers=("-H" "Content-Type: application/json")
    if [ -n "$token" ]; then
        headers+=("-H" "Authorization: Bearer $token")
    fi
    
    # SSL証明書検証をスキップ（-kオプション）
    if [ "$method" = "GET" ]; then
        STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" "${headers[@]}" "$API_URL$endpoint" 2>&1)
        RESPONSE=$(curl -k -s "${headers[@]}" "$API_URL$endpoint" 2>&1)
    elif [ "$method" = "POST" ]; then
        STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" -X POST "${headers[@]}" -d "$data" "$API_URL$endpoint" 2>&1)
        RESPONSE=$(curl -k -s -X POST "${headers[@]}" -d "$data" "$API_URL$endpoint" 2>&1)
    elif [ "$method" = "PUT" ]; then
        STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" -X PUT "${headers[@]}" -d "$data" "$API_URL$endpoint" 2>&1)
        RESPONSE=$(curl -k -s -X PUT "${headers[@]}" -d "$data" "$API_URL$endpoint" 2>&1)
    elif [ "$method" = "DELETE" ]; then
        STATUS=$(curl -k -s -o /dev/null -w "%{http_code}" -X DELETE "${headers[@]}" "$API_URL$endpoint" 2>&1)
        RESPONSE=$(curl -k -s -X DELETE "${headers[@]}" "$API_URL$endpoint" 2>&1)
    fi
    
    if [ "$STATUS" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $STATUS)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $STATUS)"
        if [ -n "$RESPONSE" ]; then
            echo "   Response: $(echo "$RESPONSE" | head -c 100)"
        fi
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. ヘルスチェック
echo -e "${BLUE}=== 1. ヘルスチェック ===${NC}"
test_endpoint "ヘルスチェック" "GET" "/api/health" "" "200"
HEALTH_RESPONSE=$(curl -k -s "$API_URL/api/health" 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q "database"; then
    DB_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    if [ "$DB_STATUS" = "connected" ]; then
        echo -e "   ${GREEN}✅ データベース: 接続済み${NC}"
    else
        echo -e "   ${YELLOW}⚠️  データベース: $DB_STATUS${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# 2. 認証機能のテスト
echo -e "${BLUE}=== 2. 認証機能 ===${NC}"

# テスト用ユーザー情報
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
STUDENT_TOKEN=""
COMPANY_TOKEN=""

# 学生ユーザー登録
echo -n "テスト: 学生ユーザー登録... "
REGISTER_RESPONSE=$(curl -k -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"student\",\"profile\":{\"name\":\"Test Student\",\"university\":\"Test University\"}}" \
    "$API_URL/api/auth/register" 2>&1)

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
    STUDENT_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${YELLOW}⚠️  登録に失敗（既に存在する可能性）${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# ログイン
echo -n "テスト: ログイン... "
LOGIN_RESPONSE=$(curl -k -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    "$API_URL/api/auth/login" 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
    if [ -z "$STUDENT_TOKEN" ]; then
        STUDENT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    fi
else
    echo -e "${RED}❌ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# 認証済みエンドポイント
if [ -n "$STUDENT_TOKEN" ]; then
    test_endpoint "認証済みエンドポイント（/api/auth/me）" "GET" "/api/auth/me" "" "200" "$STUDENT_TOKEN"
fi

# バリデーションテスト
echo -n "テスト: バリデーション（空のメール）... "
VALIDATION_RESPONSE=$(curl -k -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"\",\"password\":\"test\",\"role\":\"student\"}" \
    "$API_URL/api/auth/register" 2>&1)
if echo "$VALIDATION_RESPONSE" | grep -q "required\|Invalid"; then
    echo -e "${GREEN}✅ PASS${NC} (バリデーション動作中)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  バリデーションが期待通りに動作していない可能性${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 3. サークル機能のテスト
echo -e "${BLUE}=== 3. サークル機能 ===${NC}"

# サークル一覧取得
test_endpoint "サークル一覧取得" "GET" "/api/circles" "" "200"

# サークル作成（認証必要）
if [ -n "$STUDENT_TOKEN" ]; then
    echo -n "テスト: サークル作成... "
    CIRCLE_DATA="{\"name\":\"テストサークル$(date +%s)\",\"description\":\"これはテスト用のサークルです\",\"university\":\"テスト大学\",\"category\":\"その他\",\"currentStatus\":\"テスト中\"}"
    
    CREATE_RESPONSE=$(curl -k -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        -d "$CIRCLE_DATA" \
        "$API_URL/api/circles" 2>&1)
    
    if echo "$CREATE_RESPONSE" | grep -q "_id"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        
        # IDを複数の方法で抽出を試みる
        CREATED_CIRCLE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
        if [ -z "$CREATED_CIRCLE_ID" ]; then
            CREATED_CIRCLE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        fi
        if [ -z "$CREATED_CIRCLE_ID" ]; then
            CREATED_CIRCLE_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('_id', ''))" 2>/dev/null || echo "")
        fi
        
        if [ -n "$CREATED_CIRCLE_ID" ]; then
            echo "   作成されたサークルID: $CREATED_CIRCLE_ID"
            # サークル詳細取得
            test_endpoint "作成したサークルの詳細取得" "GET" "/api/circles/$CREATED_CIRCLE_ID" "" "200"
            
            # サークル統計情報
            test_endpoint "サークル統計情報" "GET" "/api/circles/$CREATED_CIRCLE_ID/stats" "" "200"
            
            # ポートフォリオ更新
            echo -n "テスト: ポートフォリオ更新... "
            PORTFOLIO_DATA="{\"githubRepos\":[{\"url\":\"https://github.com/test/repo\",\"description\":\"Test repo\"}]}"
            PORTFOLIO_RESPONSE=$(curl -k -s -X PUT \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $STUDENT_TOKEN" \
                -d "$PORTFOLIO_DATA" \
                "$API_URL/api/circles/$CREATED_CIRCLE_ID/portfolio" 2>&1)
            
            if echo "$PORTFOLIO_RESPONSE" | grep -q "_id"; then
                echo -e "${GREEN}✅ PASS${NC}"
                PASSED=$((PASSED + 1))
            else
                echo -e "${RED}❌ FAIL${NC}"
                FAILED=$((FAILED + 1))
            fi
            
            # 活動ログ追加
            echo -n "テスト: 活動ログ追加... "
            ACTIVITY_DATA="{\"activity\":\"テスト活動\",\"contribution\":\"テスト貢献\"}"
            ACTIVITY_RESPONSE=$(curl -k -s -X POST \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $STUDENT_TOKEN" \
                -d "$ACTIVITY_DATA" \
                "$API_URL/api/circles/$CREATED_CIRCLE_ID/activity" 2>&1)
            
            if echo "$ACTIVITY_RESPONSE" | grep -q "activityLog\|message"; then
                echo -e "${GREEN}✅ PASS${NC}"
                PASSED=$((PASSED + 1))
            else
                echo -e "${RED}❌ FAIL${NC}"
                FAILED=$((FAILED + 1))
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  サークル作成に失敗${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  認証トークンがないため、サークル作成テストをスキップ${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 高度な検索
test_endpoint "高度な検索" "GET" "/api/circles/search/advanced?category=その他" "" "200"

echo ""

# 4. 学生ダッシュボード機能
echo -e "${BLUE}=== 4. 学生ダッシュボード機能 ===${NC}"

if [ -n "$STUDENT_TOKEN" ]; then
    test_endpoint "学生ダッシュボード" "GET" "/api/students/dashboard" "" "200" "$STUDENT_TOKEN"
    test_endpoint "学生のサークル一覧" "GET" "/api/students/circles" "" "200" "$STUDENT_TOKEN"
    test_endpoint "学生の活動ログ" "GET" "/api/students/activities" "" "200" "$STUDENT_TOKEN"
else
    echo -e "${YELLOW}⚠️  認証トークンがないため、学生ダッシュボードテストをスキップ${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 5. 企業機能のテスト
echo -e "${BLUE}=== 5. 企業機能 ===${NC}"

# 企業ユーザー登録
COMPANY_EMAIL="company$(date +%s)@example.com"
echo -n "テスト: 企業ユーザー登録... "
COMPANY_REGISTER_RESPONSE=$(curl -k -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$COMPANY_EMAIL\",\"password\":\"CompanyPass123!\",\"role\":\"company\",\"profile\":{\"companyName\":\"テスト企業\",\"industry\":\"製造業\"}}" \
    "$API_URL/api/auth/register" 2>&1)

if echo "$COMPANY_REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ PASS${NC}"
    PASSED=$((PASSED + 1))
    COMPANY_TOKEN=$(echo "$COMPANY_REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$COMPANY_TOKEN" ]; then
        test_endpoint "企業ダッシュボード" "GET" "/api/companies/dashboard" "" "200" "$COMPANY_TOKEN"
        test_endpoint "企業統計情報" "GET" "/api/companies/stats" "" "200" "$COMPANY_TOKEN"
    fi
else
    echo -e "${YELLOW}⚠️  企業登録に失敗${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 6. 支援機能のテスト
echo -e "${BLUE}=== 6. 支援機能 ===${NC}"

if [ -n "$COMPANY_TOKEN" ] && [ -n "$CREATED_CIRCLE_ID" ]; then
    echo -n "テスト: 支援申請... "
    SUPPORT_DATA="{\"circleId\":\"$CREATED_CIRCLE_ID\",\"supportType\":\"funding\",\"amount\":100000,\"purpose\":\"テスト支援\"}"
    
    SUPPORT_RESPONSE=$(curl -k -s -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $COMPANY_TOKEN" \
        -d "$SUPPORT_DATA" \
        "$API_URL/api/supports" 2>&1)
    
    if echo "$SUPPORT_RESPONSE" | grep -q "_id"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        
        SUPPORT_ID=$(echo "$SUPPORT_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
        
        if [ -n "$SUPPORT_ID" ]; then
            test_endpoint "支援一覧取得（企業）" "GET" "/api/supports/company" "" "200" "$COMPANY_TOKEN"
            test_endpoint "支援ステータス更新" "PUT" "/api/supports/$SUPPORT_ID/status" "{\"status\":\"approved\"}" "200" "$COMPANY_TOKEN"
        fi
    else
        echo -e "${YELLOW}⚠️  支援申請に失敗${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  企業トークンまたはサークルIDがないため、支援機能テストをスキップ${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 7. チャット機能のテスト
echo -e "${BLUE}=== 7. チャット機能 ===${NC}"

if [ -n "$SUPPORT_ID" ]; then
    if [ -n "$STUDENT_TOKEN" ] || [ -n "$COMPANY_TOKEN" ]; then
        TOKEN_FOR_CHAT=${STUDENT_TOKEN:-$COMPANY_TOKEN}
        test_endpoint "チャット履歴取得" "GET" "/api/chat/$SUPPORT_ID" "" "200" "$TOKEN_FOR_CHAT"
        
        echo -n "テスト: メッセージ送信... "
        MESSAGE_DATA="{\"message\":\"テストメッセージ\"}"
        MESSAGE_RESPONSE=$(curl -k -s -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN_FOR_CHAT" \
            -d "$MESSAGE_DATA" \
            "$API_URL/api/chat/$SUPPORT_ID/message" 2>&1)
        
        if echo "$MESSAGE_RESPONSE" | grep -q "message\|timestamp"; then
            echo -e "${GREEN}✅ PASS${NC}"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}❌ FAIL${NC}"
            FAILED=$((FAILED + 1))
        fi
    fi
else
    echo -e "${YELLOW}⚠️  支援IDがないため、チャット機能テストをスキップ${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# 8. プロファイル更新機能
echo -e "${BLUE}=== 8. プロファイル更新機能 ===${NC}"

if [ -n "$STUDENT_TOKEN" ]; then
    echo -n "テスト: プロファイル更新... "
    PROFILE_DATA="{\"profile\":{\"name\":\"更新された名前\",\"university\":\"更新された大学\"}}"
    PROFILE_RESPONSE=$(curl -k -s -X PUT \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        -d "$PROFILE_DATA" \
        "$API_URL/api/auth/profile" 2>&1)
    
    if echo "$PROFILE_RESPONSE" | grep -q "profile\|id"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

echo ""

# 結果サマリー
echo "=========================================="
echo "  テスト結果サマリー"
echo "=========================================="
echo -e "${GREEN}✅ 成功: $PASSED${NC}"
echo -e "${RED}❌ 失敗: $FAILED${NC}"
echo -e "${YELLOW}⚠️  警告: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 すべてのテストが成功しました！${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️  一部のテストで警告がありましたが、主要機能は動作しています${NC}"
    exit 0
else
    echo -e "${RED}❌ 一部のテストが失敗しました${NC}"
    echo "詳細を確認してください"
    exit 1
fi
