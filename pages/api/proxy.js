export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter." });
  }

  try {
    const response = await fetch(url);

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType.includes("application/json")) {
      const text = await response.text(); // Get raw HTML/text
      console.error("Unexpected response:", text);
      return res.status(500).json({ error: "Invalid content received from IPFS." });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to fetch data from IPFS" });
  }
}
