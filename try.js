const express = require("express");
const Web3 = require("web3");

const app = express();
app.use(express.json());

app.post("/chain", async (req, res) => {
    const chainId = 123;
    try {
      const {  jsonrpc,method,params,id } = req.body;
    
  
      if (jsonrpc !== "2.0") {
        return res.status(400).json({ error: "jsonrpc version mismatched" });
      }
      if (method == "eth_chainId") {
        res.json({ jsonrpc: "2.0",  result: `0x${chainId.toString(16)}`,id:1 });
      } else {
        res.status(400).json({ error: "Invalid Chain ID for the specified RPC URL." });
      }
    } catch (error) {
        console.error("Error handling the request:", error);
        res.status(500).json({ error: error.message });
      }
    
});

const port = 7000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
