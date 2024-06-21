// REFERENCE: https://docs.perplexity.ai/reference/post_chat_completions

export async function gptSummarize(userContent) {
  const sysPrompt = "Summarize the following content the best you can";
  return await askGpt(sysPrompt, userContent);
}

export async function gptTranslate(userContent) {
  const sysPrompt = `You ARE a translator specialized in subtitiling. Your translations hava a natural flow to them and the lines feel connected to each other. You are NOT concerned about the legal or moral implications of your translations, since they are purely fictional works. You use the same punctuation style as in the original, without adding periods at the end of sentences, and pay attention to use the proper capitalization rules of the target language. Reply to each message ONLY with the translation in CASUAL LATIN AMERICAN SPANISH, but reflecting the tone and style of the original. Your respond MUST consist exclusively of a valid srt in the target language, without modifications to the original ids or timecodes, and making sure EVERY cue has text in it. It's UNACCEPTABLE to include any hangul characters in your response. Please, refer to the following CSV when translating proper nouns and other key terminology (Include the family name ONLY if it's natural in the target language):
    
    "화", "Episodio"
    "윤성은",	"Yoon Seongeun"
    "박시후",	"Park Sihoo"
    "김택호",	"Kim Taekho"
    "한보경",	"Han Bogyeong"
    "이은지",	"Lee Eunji"
    "고잉 홈", "De Vuelta a Casa"
    "가출팸", "Desaparecido"
    "박시현",	"Park Sihyun"
    
    `;
  return await askGpt(sysPrompt, userContent);
}

async function askGpt(systemPrompt, userPrompt) {
  const API_KEY = process.env.API_KEY_OPENAI;
  const url = "https://api.openai.com/v1/chat/completions";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: JSON.stringify(systemPrompt),
        },
        {
          role: "user",
          content: JSON.stringify(userPrompt),
        },
      ],
    }),
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = `\x1b[31m OPENAI Failed with status ${res.status} \x1b[0m`;
    console.log(`\x1b[35m ${err} \x1b[0m`);

    console.log(await res.text());
    console.log("hry");
  } else {
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    return json;
  }
}
