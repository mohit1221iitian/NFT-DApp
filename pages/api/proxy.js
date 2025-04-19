export default async function handler(req, res) {
    // Get the IPFS URL passed as a query parameter
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: "Missing 'url' query parameter." });
    }
  
    try {
      // Fetch the data from the provided IPFS URL
      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch from IPFS. Status: ${response.status}` });
      }
  
      // Get the JSON data from the IPFS response
      const data = await response.json();
  
      // Set the CORS headers to allow your frontend to access this API
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
  
      // Return the data as JSON
      res.status(200).json(data);
    } catch (error) {
      // Handle any errors that occur during fetching or processing the data
      console.error(error);
      res.status(500).json({ error: "Failed to fetch data from IPFS" });
    }
  }
  