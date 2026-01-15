#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日本語の長文から要件定義を生成するツール
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path


class RequirementsGenerator:
    """要件定義生成クラス"""
    
    def __init__(self):
        self.requirements_template = {
            "project_name": "",
            "version": "1.0.0",
            "created_at": "",
            "overview": "",
            "objectives": [],
            "functional_requirements": [],
            "non_functional_requirements": [],
            "user_stories": [],
            "use_cases": [],
            "constraints": [],
            "assumptions": [],
            "glossary": []
        }
    
    def parse_text(self, text: str) -> Dict:
        """日本語の長文を解析して要件定義を生成"""
        requirements = self.requirements_template.copy()
        requirements["created_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # プロジェクト名を抽出（最初の段落やタイトルから）
        project_name = self._extract_project_name(text)
        requirements["project_name"] = project_name
        
        # 概要を抽出
        overview = self._extract_overview(text)
        requirements["overview"] = overview
        
        # 目的を抽出
        objectives = self._extract_objectives(text)
        requirements["objectives"] = objectives
        
        # 機能要件を抽出
        functional_reqs = self._extract_functional_requirements(text)
        requirements["functional_requirements"] = functional_reqs
        
        # 非機能要件を抽出
        non_functional_reqs = self._extract_non_functional_requirements(text)
        requirements["non_functional_requirements"] = non_functional_reqs
        
        # ユーザーストーリーを抽出
        user_stories = self._extract_user_stories(text)
        requirements["user_stories"] = user_stories
        
        # 制約事項を抽出
        constraints = self._extract_constraints(text)
        requirements["constraints"] = constraints
        
        # 前提条件を抽出
        assumptions = self._extract_assumptions(text)
        requirements["assumptions"] = assumptions
        
        return requirements
    
    def _extract_project_name(self, text: str) -> str:
        """プロジェクト名を抽出"""
        # タイトルパターンを検索
        title_patterns = [
            r'^#+\s*(.+?)$',
            r'プロジェクト名[：:]\s*(.+?)$',
            r'システム名[：:]\s*(.+?)$',
            r'^(.+?)\s*システム',
        ]
        
        lines = text.split('\n')
        for line in lines[:10]:  # 最初の10行をチェック
            for pattern in title_patterns:
                match = re.search(pattern, line, re.MULTILINE)
                if match:
                    return match.group(1).strip()
        
        return "未定義のプロジェクト"
    
    def _extract_overview(self, text: str) -> str:
        """概要を抽出"""
        # 見出しパターン（## 概要 など）
        heading_patterns = [
            r'#{1,3}\s*概要\s*\n((?:.+\n?)+?)(?=\n#{1,3}|\Z)',
            r'#{1,3}\s*背景\s*\n((?:.+\n?)+?)(?=\n#{1,3}|\Z)',
        ]
        
        for pattern in heading_patterns:
            match = re.search(pattern, text, re.MULTILINE | re.DOTALL)
            if match:
                overview = match.group(1).strip()
                # Markdownの見出し記号を除去
                overview = re.sub(r'^#+\s*', '', overview, flags=re.MULTILINE)
                # 長すぎる場合は最初の500文字に制限
                if len(overview) > 500:
                    overview = overview[:500] + "..."
                return overview
        
        # 通常のパターン
        overview_patterns = [
            r'概要[：:]\s*(.+?)(?:\n\n|\n#|$)',
            r'背景[：:]\s*(.+?)(?:\n\n|\n#|$)',
        ]
        
        for pattern in overview_patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                overview = match.group(1).strip()
                # 長すぎる場合は最初の500文字に制限
                if len(overview) > 500:
                    overview = overview[:500] + "..."
                return overview
        
        # パターンが見つからない場合、最初の段落を使用（見出しを除く）
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip() and not p.strip().startswith('#')]
        if paragraphs:
            overview = paragraphs[0]
            # Markdownの見出し記号を除去
            overview = re.sub(r'^#+\s*', '', overview, flags=re.MULTILINE)
            if len(overview) > 500:
                overview = overview[:500] + "..."
            return overview
        
        return "概要が記載されていません"
    
    def _extract_objectives(self, text: str) -> List[str]:
        """目的を抽出"""
        objectives = []
        
        # 見出しパターン（## 目的 や # 目的など）
        heading_patterns = [
            r'#{1,3}\s*目的\s*\n((?:.+\n?)+?)(?=\n#{1,3}|\Z)',
            r'#{1,3}\s*目標\s*\n((?:.+\n?)+?)(?=\n#{1,3}|\Z)',
        ]
        
        for pattern in heading_patterns:
            match = re.search(pattern, text, re.MULTILINE | re.DOTALL)
            if match:
                section_text = match.group(1)
                # 箇条書きを抽出
                items = re.findall(r'[-•*]\s*(.+?)(?:\n|$)', section_text)
                objectives.extend([item.strip() for item in items if item.strip()])
                # 番号付きリストを抽出
                numbered_items = re.findall(r'\d+[\.）]\s*(.+?)(?:\n|$)', section_text)
                objectives.extend([item.strip() for item in numbered_items if item.strip()])
        
        # 箇条書きパターン（見出しなし）
        bullet_patterns = [
            r'目的[：:]\s*\n((?:[-•*]\s*.+?\n?)+)',
            r'目標[：:]\s*\n((?:[-•*]\s*.+?\n?)+)',
        ]
        
        for pattern in bullet_patterns:
            match = re.search(pattern, text, re.MULTILINE)
            if match:
                items = re.findall(r'[-•*]\s*(.+?)(?:\n|$)', match.group(1))
                objectives.extend([item.strip() for item in items if item.strip()])
        
        # 番号付きリスト
        numbered_pattern = r'目的[：:]\s*\n((?:\d+[\.）]\s*.+?\n?)+)'
        match = re.search(numbered_pattern, text, re.MULTILINE)
        if match:
            items = re.findall(r'\d+[\.）]\s*(.+?)(?:\n|$)', match.group(1))
            objectives.extend([item.strip() for item in items if item.strip()])
        
        # 重複を除去
        objectives = list(dict.fromkeys(objectives))
        
        return objectives if objectives else ["目的が明確に記載されていません"]
    
    def _extract_functional_requirements(self, text: str) -> List[Dict]:
        """機能要件を抽出"""
        requirements = []
        
        # 見出しパターン（## 機能要件 など）
        heading_patterns = [
            r'#{1,3}\s*機能要件\s*\n((?:.+\n?)+?)(?=\n#{1,3}|\Z)',
            r'#{1,3}\s*機能\s*\n((?:.+\n?)+?)(?=\n#{1,3}|\Z)',
        ]
        
        for pattern in heading_patterns:
            match = re.search(pattern, text, re.MULTILINE | re.DOTALL | re.IGNORECASE)
            if match:
                section_text = match.group(1)
                # 箇条書きから抽出
                items = re.findall(r'[-•*]\s*(.+?)(?:\n|$)', section_text)
                for i, item in enumerate(items, 1):
                    clean_item = item.strip()
                    if clean_item and len(clean_item) > 3:  # 短すぎる項目は除外
                        requirements.append({
                            "id": f"FR-{len(requirements)+1:03d}",
                            "description": clean_item,
                            "priority": "中"
                        })
        
        # 機能要件セクションを検索（見出しなし）
        section_patterns = [
            r'機能要件[：:]\s*\n((?:.+\n?)+?)(?=\n#|\n非機能要件|$)',
            r'機能[：:]\s*\n((?:.+\n?)+?)(?=\n#|\n非機能要件|$)',
        ]
        
        for pattern in section_patterns:
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                section_text = match.group(1)
                # 箇条書きから抽出
                items = re.findall(r'[-•*]\s*(.+?)(?:\n|$)', section_text)
                for i, item in enumerate(items, 1):
                    clean_item = item.strip()
                    if clean_item and len(clean_item) > 3:
                        requirements.append({
                            "id": f"FR-{len(requirements)+1:03d}",
                            "description": clean_item,
                            "priority": "中"
                        })
        
        # 個別の機能記述を検索
        if not requirements:
            func_keywords = ['できる', '可能', '実装', '機能', '処理', '実行']
            sentences = re.split(r'[。\n]', text)
            for sentence in sentences:
                if any(keyword in sentence for keyword in func_keywords):
                    if len(sentence.strip()) > 10:  # 短すぎる文は除外
                        requirements.append({
                            "id": f"FR-{len(requirements)+1:03d}",
                            "description": sentence.strip(),
                            "priority": "中"
                        })
                        if len(requirements) >= 20:  # 最大20件
                            break
        
        return requirements if requirements else [{"id": "FR-001", "description": "機能要件が明確に記載されていません", "priority": "中"}]
    
    def _extract_non_functional_requirements(self, text: str) -> List[Dict]:
        """非機能要件を抽出"""
        requirements = []
        
        # 非機能要件キーワード
        nfr_keywords = {
            '性能': ['性能', 'パフォーマンス', '速度', 'レスポンス', '処理時間'],
            'セキュリティ': ['セキュリティ', '安全', '認証', '暗号化', 'アクセス制御'],
            '可用性': ['可用性', '稼働率', 'ダウンタイム', '障害'],
            '拡張性': ['拡張性', 'スケーラビリティ', '拡張'],
            '保守性': ['保守性', 'メンテナンス', '保守'],
            'ユーザビリティ': ['ユーザビリティ', '使いやすさ', '操作性', 'UI', 'UX']
        }
        
        sentences = re.split(r'[。\n]', text)
        for sentence in sentences:
            for category, keywords in nfr_keywords.items():
                if any(keyword in sentence for keyword in keywords):
                    if len(sentence.strip()) > 10:
                        requirements.append({
                            "id": f"NFR-{len(requirements)+1:03d}",
                            "category": category,
                            "description": sentence.strip(),
                            "priority": "中"
                        })
                        break
        
        return requirements
    
    def _extract_user_stories(self, text: str) -> List[Dict]:
        """ユーザーストーリーを抽出"""
        stories = []
        
        # ユーザーストーリーパターン: "〜として、〜したい、〜ために"
        story_pattern = r'(.+?)(?:として|として、)\s*(.+?)(?:したい|したい、|できるようにしたい)\s*(?:ために|ため)'
        matches = re.finditer(story_pattern, text)
        
        for match in matches:
            stories.append({
                "id": f"US-{len(stories)+1:03d}",
                "user": match.group(1).strip(),
                "action": match.group(2).strip(),
                "value": ""
            })
        
        return stories
    
    def _extract_constraints(self, text: str) -> List[str]:
        """制約事項を抽出"""
        constraints = []
        
        constraint_keywords = ['制約', '制限', '必須', '必要', '前提条件']
        sentences = re.split(r'[。\n]', text)
        
        for sentence in sentences:
            if any(keyword in sentence for keyword in constraint_keywords):
                if len(sentence.strip()) > 10:
                    constraints.append(sentence.strip())
        
        return constraints
    
    def _extract_assumptions(self, text: str) -> List[str]:
        """前提条件を抽出"""
        assumptions = []
        
        assumption_keywords = ['前提', '想定', '仮定', '条件']
        sentences = re.split(r'[。\n]', text)
        
        for sentence in sentences:
            if any(keyword in sentence for keyword in assumption_keywords):
                if len(sentence.strip()) > 10:
                    assumptions.append(sentence.strip())
        
        return assumptions
    
    def generate_markdown(self, requirements: Dict) -> str:
        """要件定義をMarkdown形式で生成"""
        md = f"""# 要件定義書

## プロジェクト情報

- **プロジェクト名**: {requirements['project_name']}
- **バージョン**: {requirements['version']}
- **作成日時**: {requirements['created_at']}

## 1. 概要

{requirements['overview']}

## 2. 目的

"""
        for obj in requirements['objectives']:
            md += f"- {obj}\n"
        
        md += "\n## 3. 機能要件\n\n"
        for req in requirements['functional_requirements']:
            md += f"### {req['id']}: {req['description']}\n"
            md += f"- **優先度**: {req['priority']}\n\n"
        
        if requirements['non_functional_requirements']:
            md += "\n## 4. 非機能要件\n\n"
            for req in requirements['non_functional_requirements']:
                md += f"### {req['id']}: {req['description']}\n"
                md += f"- **カテゴリ**: {req['category']}\n"
                md += f"- **優先度**: {req['priority']}\n\n"
        
        if requirements['user_stories']:
            md += "\n## 5. ユーザーストーリー\n\n"
            for story in requirements['user_stories']:
                md += f"### {story['id']}\n"
                md += f"- **ユーザー**: {story['user']}\n"
                md += f"- **アクション**: {story['action']}\n\n"
        
        if requirements['constraints']:
            md += "\n## 6. 制約事項\n\n"
            for constraint in requirements['constraints']:
                md += f"- {constraint}\n"
        
        if requirements['assumptions']:
            md += "\n## 7. 前提条件\n\n"
            for assumption in requirements['assumptions']:
                md += f"- {assumption}\n"
        
        return md
    
    def save(self, requirements: Dict, output_path: str, format: str = "both"):
        """要件定義をファイルに保存"""
        output_path = Path(output_path)
        
        if format in ["json", "both"]:
            json_path = output_path.with_suffix('.json')
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(requirements, f, ensure_ascii=False, indent=2)
            print(f"JSON形式で保存しました: {json_path}")
        
        if format in ["markdown", "both"]:
            md_path = output_path.with_suffix('.md')
            md_content = self.generate_markdown(requirements)
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_content)
            print(f"Markdown形式で保存しました: {md_path}")


def main():
    """メイン関数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='日本語の長文から要件定義を生成')
    parser.add_argument('input', help='入力テキストファイルのパス')
    parser.add_argument('-o', '--output', default='requirements', help='出力ファイル名（拡張子なし）')
    parser.add_argument('-f', '--format', choices=['json', 'markdown', 'both'], default='both', help='出力形式')
    
    args = parser.parse_args()
    
    # 入力ファイルを読み込み
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            text = f.read()
    except FileNotFoundError:
        print(f"エラー: ファイル '{args.input}' が見つかりません")
        return
    except Exception as e:
        print(f"エラー: ファイルの読み込みに失敗しました: {e}")
        return
    
    # 要件定義を生成
    generator = RequirementsGenerator()
    requirements = generator.parse_text(text)
    
    # ファイルに保存
    generator.save(requirements, args.output, args.format)
    
    print("\n要件定義の生成が完了しました！")


if __name__ == '__main__':
    main()
