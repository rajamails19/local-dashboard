/* Vercel serverless function — GET loads, POST saves to a GitHub Gist */
const GIST_ID  = process.env.GIST_ID;
const GH_TOKEN = process.env.GH_TOKEN;
const FILENAME = "lv_store.json";
const GH_URL   = `https://api.github.com/gists/${GIST_ID}`;
const HEADERS  = () => ({
  "Authorization": `token ${GH_TOKEN}`,
  "Accept": "application/vnd.github+json",
  "Content-Type": "application/json",
});

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const r    = await fetch(GH_URL, { headers: HEADERS() });
    const data = await r.json();
    const raw  = data.files?.[FILENAME]?.content || '{"collections":[],"websites":[]}';
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(raw);
  }

  if (req.method === "POST") {
    let body = "";
    await new Promise(resolve => { req.on("data", c => body += c); req.on("end", resolve); });
    await fetch(GH_URL, {
      method: "PATCH",
      headers: HEADERS(),
      body: JSON.stringify({ files: { [FILENAME]: { content: body } } }),
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
