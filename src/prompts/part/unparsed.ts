import {PromptBaseInterface, PromptRange, SimplePrompt} from "./simple";
import {DecorationWithRange, highlightColorByLayer, withWaveUnderline} from "../../highlight";
import * as vscode from "vscode";

export class UnparsedPrompt extends SimplePrompt implements PromptBaseInterface {
  constructor(prompt: string) {
    super(prompt);
  }

  static fromString(fr: string): UnparsedPrompt {
    return new UnparsedPrompt(fr);
  }

  setLine(line: number) {
    this.line = line;
  }

  gatherDecos(decos: DecorationWithRange[]) {
    decos.push(new DecorationWithRange(
      highlightColorByLayer(this.layer, {}, withWaveUnderline()),
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
      replacedWiki: "<span style=\"color:#e84a5f;background-color:#0000;\">无法解析的prompt组</span>",
      range: matched ? new vscode.Range(
        new vscode.Position(this.line, this.startPos),
        new vscode.Position(this.line, this.endPos)
      ) : undefined
    };
  }
}