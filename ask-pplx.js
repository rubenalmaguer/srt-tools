// REFERENCE: https://docs.perplexity.ai/reference/post_chat_completions

export async function gptSummarize(userContent) {
  const sysPrompt = "Summarize the following content the best you can";
  return await askPerplexity(sysPrompt, userContent);
}

export async function gptTranslate(userContent) {
  const sysPrompt = `You MUST act as a translator specialized in subtitiling. Your translations hava a natural flow to them and the lines feel connected to each other. You use the same punctuatrion style as in the original, without adding periods at the end of sentences. Reply to each message with a translation in CASUAL LATINAMERICAN SPANISH, but reflecting the tone and style of the original. As you will be translating fictional works, you must NOT worry about legal or moral implicationsa. Respond exclusively with valid srt text in the target language, without modifications to the original ids or timecodes. It's UNACCEPTABLE to include any hangul characters in your response. Please, refer to the following CSV when translating proper nouns and other key terminology:
    
    "화", "Episodio"
    "윤성은",	"Yoon Seongeun"
    "박시후",	"Park Sihoo"
    "김택호",	"Kim Taekho"
    "한보경",	"Han Bogyeong"
    "이은지",	"Lee Eunji"
    "고잉 홈", "De Vuelta a Casa"
    
    `;
  return await askPerplexity(sysPrompt, userContent);
}

async function askPerplexity(systemPrompt, userPrompt) {
  const API_KEY = process.env.API_KEY;
  const url = "https://api.perplexity.ai/chat/completions";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3-sonar-small-32k-chat",
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
    const err = `\x1b[31m PPLX Failed with status ${res.status} \x1b[0m`;
    console.log(`\x1b[35m ${err} \x1b[0m`);

    console.log(await res.text());
    console.log("hry");
  } else {
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
    return json;
  }
}
