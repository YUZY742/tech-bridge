#!/bin/bash

# 評価システムテストスクリプト

API_URL="https://tech-bridge-uybw.vercel.app"

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  評価システムテスト"
echo "=========================================="
echo ""

# 1. 高評価学生でログイン
echo -e "${BLUE}=== 1. 高評価学生の評価スコア確認 ===${NC}"
echo -n "ログイン中... "
HIGH_LOGIN=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"highscore@example.com","password":"password123"}' \
  "$API_URL/api/auth/login" 2>&1)

if echo "$HIGH_LOGIN" | grep -q "token"; then
  echo -e "${GREEN}✅ 成功${NC}"
  HIGH_TOKEN=$(echo "$HIGH_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  echo -n "評価スコア取得中... "
  HIGH_EVAL=$(curl -k -s \
    -H "Authorization: Bearer $HIGH_TOKEN" \
    "$API_URL/api/students/evaluation" 2>&1)
  
  if echo "$HIGH_EVAL" | grep -q "overallScore"; then
    echo -e "${GREEN}✅ 成功${NC}"
    HIGH_SCORE=$(echo "$HIGH_EVAL" | grep -o '"overallScore":[0-9]*' | cut -d':' -f2)
    echo "   総合スコア: $HIGH_SCORE点"
    
    if [ "$HIGH_SCORE" -ge 80 ]; then
      echo -e "   ${GREEN}✅ 期待通り（80点以上）${NC}"
    else
      echo -e "   ${YELLOW}⚠️  期待値より低い（80点以上が期待）${NC}"
    fi
  else
    echo -e "${RED}❌ 失敗${NC}"
  fi
else
  echo -e "${RED}❌ ログイン失敗${NC}"
fi

echo ""

# 2. 中評価学生でログイン
echo -e "${BLUE}=== 2. 中評価学生の評価スコア確認 ===${NC}"
echo -n "ログイン中... "
MEDIUM_LOGIN=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"mediumscore@example.com","password":"password123"}' \
  "$API_URL/api/auth/login" 2>&1)

if echo "$MEDIUM_LOGIN" | grep -q "token"; then
  echo -e "${GREEN}✅ 成功${NC}"
  MEDIUM_TOKEN=$(echo "$MEDIUM_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  echo -n "評価スコア取得中... "
  MEDIUM_EVAL=$(curl -k -s \
    -H "Authorization: Bearer $MEDIUM_TOKEN" \
    "$API_URL/api/students/evaluation" 2>&1)
  
  if echo "$MEDIUM_EVAL" | grep -q "overallScore"; then
    echo -e "${GREEN}✅ 成功${NC}"
    MEDIUM_SCORE=$(echo "$MEDIUM_EVAL" | grep -o '"overallScore":[0-9]*' | cut -d':' -f2)
    echo "   総合スコア: $MEDIUM_SCORE点"
    
    if [ "$MEDIUM_SCORE" -ge 40 ] && [ "$MEDIUM_SCORE" -lt 80 ]; then
      echo -e "   ${GREEN}✅ 期待通り（40-79点）${NC}"
    else
      echo -e "   ${YELLOW}⚠️  期待値と異なる（40-79点が期待）${NC}"
    fi
  else
    echo -e "${RED}❌ 失敗${NC}"
  fi
else
  echo -e "${RED}❌ ログイン失敗${NC}"
fi

echo ""

# 3. 低評価学生でログイン
echo -e "${BLUE}=== 3. 低評価学生の評価スコア確認 ===${NC}"
echo -n "ログイン中... "
LOW_LOGIN=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"lowscore@example.com","password":"password123"}' \
  "$API_URL/api/auth/login" 2>&1)

if echo "$LOW_LOGIN" | grep -q "token"; then
  echo -e "${GREEN}✅ 成功${NC}"
  LOW_TOKEN=$(echo "$LOW_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  echo -n "評価スコア取得中... "
  LOW_EVAL=$(curl -k -s \
    -H "Authorization: Bearer $LOW_TOKEN" \
    "$API_URL/api/students/evaluation" 2>&1)
  
  if echo "$LOW_EVAL" | grep -q "overallScore"; then
    echo -e "${GREEN}✅ 成功${NC}"
    LOW_SCORE=$(echo "$LOW_EVAL" | grep -o '"overallScore":[0-9]*' | cut -d':' -f2)
    echo "   総合スコア: $LOW_SCORE点"
    
    if [ "$LOW_SCORE" -lt 40 ]; then
      echo -e "   ${GREEN}✅ 期待通り（40点未満）${NC}"
    else
      echo -e "   ${YELLOW}⚠️  期待値より高い（40点未満が期待）${NC}"
    fi
  else
    echo -e "${RED}❌ 失敗${NC}"
  fi
else
  echo -e "${RED}❌ ログイン失敗${NC}"
fi

echo ""

# 4. スコア比較
echo -e "${BLUE}=== 4. スコア比較 ===${NC}"
if [ -n "$HIGH_SCORE" ] && [ -n "$MEDIUM_SCORE" ] && [ -n "$LOW_SCORE" ]; then
  echo "   高評価学生: $HIGH_SCORE点"
  echo "   中評価学生: $MEDIUM_SCORE点"
  echo "   低評価学生: $LOW_SCORE点"
  
  if [ "$HIGH_SCORE" -gt "$MEDIUM_SCORE" ] && [ "$MEDIUM_SCORE" -gt "$LOW_SCORE" ]; then
    echo -e "   ${GREEN}✅ スコアの順序が正しい（高 > 中 > 低）${NC}"
  else
    echo -e "   ${YELLOW}⚠️  スコアの順序が期待と異なる${NC}"
  fi
else
  echo -e "   ${YELLOW}⚠️  スコアが取得できなかったため比較できません${NC}"
fi

echo ""
echo "=========================================="
echo "  テスト完了"
echo "=========================================="
