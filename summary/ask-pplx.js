// REFERENCE: https://docs.perplexity.ai/reference/post_chat_completions
export async function gptSummarize(userContent) {
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
          content: "Summarize the following content the best you can",
        },
        {
          role: "user",
          content: JSON.stringify(userContent),
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
