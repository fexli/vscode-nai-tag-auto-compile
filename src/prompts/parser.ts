function nextChar(strs: string, curIdx: number): string {
  let nextIdx = curIdx + 1;
  if (nextIdx < strs.length) {
    return strs[nextIdx];
  }
  return "";
}

function fetchIdxs(prompt: string, idx: number, length: number): string {
  let cur = "";
  for (let i = idx; i < length + idx; i++) {
    if (prompt.length > i) {
      cur += prompt[i];
    }
  }
  return cur;
}

export function parseString(inputString: string, splitChar: string = ","): string[] {
  let results: string[] = [];
  let temp = '';
  let temp_exist = false;
  let counter: Record<string, number> = {'[': 0, '{': 0, '(': 0};
  let signature: Record<string, boolean> = {'$': false, "&": false};
  let skipIdx: number[] = [];
  let splLen = splitChar.length;
  for (let idx = 0; idx < inputString.length; idx++) {
    if (skipIdx.includes(idx)) {
      continue;
    }
    let char = inputString[idx];
    if (['[', '{', '('].includes(char)) {
      counter[char] += 1;
    } else if ([']', '}', ')'].includes(char)) {
      counter[{']': '[', '}': '{', ')': '('}[char]!] -= 1;
    } else if (Object.keys(signature).includes(char) && Object.values(counter).every(value => value === 0)) {
      let sc = false;
      if (temp.trim() === "") {
        signature[char] = true;
        sc = true;
      }
      if ([' ', ',', ''].includes(nextChar(inputString, idx))) {
        signature[char] = false;
        sc = true;
      }
      if (sc) {
        temp += char;
        temp_exist = false;
        continue;
      }
    } else if (Object.values(signature).some(value => value)) {
      temp += char;
      temp_exist = false;
      continue;
    }
    let fids = fetchIdxs(inputString, idx, splLen);
    if (fids === splitChar
      && Object.values(counter).every(value => value === 0)
      && Object.values(signature).every(value => !value)) {
      results.push(temp);
      if (splLen > 1) {
        skipIdx.push(...Array.from({length: splLen - 1}, (_, i) => i + idx + 1));
      }
      temp = '';
      temp_exist = true;
    } else {
      temp += char;
      temp_exist = false;
    }
  }
  if (temp_exist || temp !== "") {
    results.push(temp);
  }
  console.log("parseString",inputString,splitChar,'->',results);
  return results;
}
