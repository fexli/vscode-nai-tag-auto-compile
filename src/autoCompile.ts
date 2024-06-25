import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

class TagCompile {
  name: string;
  name_zh: string;
  wiki: vscode.MarkdownString;

  constructor(name_: string, title_zh: string, body_zh: vscode.MarkdownString) {
    this.name = name_;
    this.name_zh = title_zh;
    this.wiki = body_zh;
  }
}

let tags: TagCompile[] = [];

// TODO: 自动标签联想
let tagCategories: Record<string, string[]> = {
  'clothes': ['dress', 'shirt', 'pants'],
  // 添加更多的分类和标签...
};

export const loadTags = () => {
  // TODO: 缓存读取
  const config = vscode.workspace.getConfiguration('tags');
  const tagsFile = config.get<string>('tagsFile');
  if (tagsFile) {
    tags = JSON.parse(fs.readFileSync(path.resolve(vscode.workspace.rootPath || '', tagsFile)).toString()).map((tag: Record<string, any>, index: number) => {
      const wikiValue = `别名：${tag.other_names.join(", ")}\n\n` + tag.body_zh;
      const wiki = new vscode.MarkdownString(
        wikiValue
      );
      return new TagCompile(
        tag.title,
        tag.title_zh,
        wiki,
      );
    });
  }
};

export const unloadTags = () => {
  tags = [];
  tagCategories = {};
};

export const autoCompileProvider = vscode.languages.registerCompletionItemProvider('tags', {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
    const wordRange = document.getWordRangeAtPosition(position);
    const word = document.getText(wordRange);
    let result: vscode.CompletionItem[] = [];

    // 自动分类联想
    if (tagCategories[word]) {
      result.push(...tagCategories[word].map(tag => {
        const item = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Keyword);
        item.detail = `This is a ${word} tag`; // 设置右侧的文本
        item.filterText = word;
        return item;
      }));
    }

    // 检查tags是否为空
    if (!tags || tags.length === 0) {
      return result;
    }
    let rr: vscode.CompletionItem[] = [];
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].name.toLowerCase().includes(word.toLowerCase())) {
        const compItem = new vscode.CompletionItem(tags[i].name, vscode.CompletionItemKind.Keyword);
        compItem.detail = tags[i].name_zh;
        compItem.documentation = tags[i].wiki;
        compItem.insertText = tags[i].name + ", ";
        compItem.kind = vscode.CompletionItemKind.Value;
        rr.push(compItem);
      }
    }
    // 检查tags （之后这个放在外面做缓存！）
    rr.push(...result);
    return rr;
  },
});