import {RandomPrompt} from "./part/random";
import {ReplacedPrompt} from "./part/replaced";

export const buildRandomPromptWiki = (rp: RandomPrompt): string => {
  return "在以下随机Prompt中选择任意一个：\n" + rp.prompts.map(
    p => `\n* \`${p.dump(false)}\``
  );
};

export const buildReplacedPromptWiki = (rp: ReplacedPrompt): string => {
  let r = `寻找Tag组：\`${rp.from_holder}\`进行替换`;
  if (rp.count > 1) {
    r += `，并重复\`${rp.count}\`次`;
  }
  return r;
};

export const buildPlaceholderPromptWiki = (): string => {
  return `占位符，使用时会当做\`空prompt\`处理（丢弃）`;
};