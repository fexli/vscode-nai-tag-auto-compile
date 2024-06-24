import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


let tags: string[] = [];

// TODO: 自动标签联想
let tagCategories: Record<string, string[]> = {
    'clothes': ['dress', 'shirt', 'pants'],
    // 添加更多的分类和标签...
};

export const loadTags = ()=>{
    // TODO: 缓存读取
    const config = vscode.workspace.getConfiguration('tags');
    const tagsFile = config.get<string>('tagsFile');
    if (tagsFile) {
        tags = fs.readFileSync(path.resolve(vscode.workspace.rootPath || '', tagsFile)).toString().split('\n');
    }
}

export const unloadTags = ()=>{
    tags = [];
    tagCategories = {};
}

export const autoCompileProvider = vscode.languages.registerCompletionItemProvider('tags', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
            const wordRange = document.getWordRangeAtPosition(position);
            const word = document.getText(wordRange);
            let result: vscode.CompletionItem[] = []
            
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
            if (!tags || tags.length == 0) {
                return result
            }
            
            // 检查tags （之后这个放在外面做缓存！）
            result.push(...tags.map((tag,index) => {
                let tagSorces = tag.split(",")
                let result = new vscode.CompletionItem(tagSorces[0], vscode.CompletionItemKind.Keyword)
                result.sortText = String(index).padStart(6, '0');
                result.detail = "NaiTags"
                result.documentation = "This IS Docs"
                result.kind = vscode.CompletionItemKind.Value
                return result
            }));
            return result
        },
    })