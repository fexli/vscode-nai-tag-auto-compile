import {checkPs, Prompt} from "../prompt";
import {UnparsedPrompt} from "./unparsed";
import {PromptBaseInterface, PromptRange, SimplePrompt} from "./simple";
import {DecorationWithRange, highlightColorByLayer, withWaveUnderline} from "../../highlight";
import * as vscode from "vscode";

export class ImportPrompt extends SimplePrompt implements PromptBaseInterface {
  constructor(prompt: string) {
    super(prompt);
  }

  static fromString(fr: string): UnparsedPrompt {
    return new ImportPrompt(fr);
  }

  setLine(line: number) {
    this.line = line;
  }

  gatherDecos(decos: DecorationWithRange[]) {
    decos.push(new DecorationWithRange(
      vscode.window.createTextEditorDecorationType({
        color: "#a6e043",
      }),
      [new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      )]
    ));
  }

  getPromptAt(pos: number): PromptRange {
    const matched = this.startPos <= pos && pos <= this.endPos;
    return {
      matched: matched,
      prompt: matched ? this.prompt : '',
      replacedWiki: `<span style="color:#a6e043;background-color:#0000;">从${this.prompt.slice(1, -1)}导入</span>`,
      range: matched ? new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      ) : undefined
    };
  }
}