/* Vercel serverless function — GET loads, POST saves to a GitHub Gist */
const GIST_ID  = process.env.GIST_ID;
const GH_TOKEN = process.env.GH_TOKEN;
const FILENAME = "lv_store.json";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const headers = {
    "Authorization": `token ${GH_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  if (req.method === "GET") {
    try {
      const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
      const data = await r.json();
      const raw = data.files?.[FILENAME]?.content || '{"collections":[],"websites":[]}';
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(raw);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "POST") {
    try {
      let body = "";
      await new Promise(resolve => { req.on("data", c => body += c); req.on("end", resolve); });
      await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ files: { [FILENAME]: { content: body } } }),
      });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
