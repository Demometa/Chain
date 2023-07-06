const { Transaction } = require('ethereumjs-tx');
const express = require("express");
const faunadb = require('faunadb');
const { BigNumber } = require('bignumber.js');


const secret = 'fnAFIBOoaVACUZHCpqkG4xhwyecIgsMX8zLaUdX-';

const q = faunadb.query;
const client = new faunadb.Client({ secret });
const app = express();
app.use(express.json());
let result = [];
let responses = [];
function decodeRawTransaction(rawTransaction) {
  try {
    const tx = new Transaction(Buffer.from(rawTransaction.slice(2), 'hex'));
    const chainId = Math.floor((tx.v - 35) / 2);

    tx._chainId = chainId;
    tx._homestead = true;
    tx._homestead = tx._homestead || (tx._chainId > 0);
    tx._homestead = tx._homestead || (tx._chainId === 0);
    tx._homestead = tx._homestead || !!tx._homestead;
    tx._homestead = tx._homestead || false;

    const gasPriceHex = '0x' + tx.gasPrice.toString('hex');
    const gasLimitHex = '0x' + tx.gasLimit.toString('hex');
    const gasPrice = new BigNumber(gasPriceHex).toNumber();
    const gasLimit = new BigNumber(gasLimitHex).toNumber();

    const decodedTx = {
      to: '0x' + tx.to.toString('hex'),
      from: '0x' + tx.getSenderAddress().toString('hex'),
      value: parseInt(tx.value.toString('hex')),
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      data: '0x' + tx.data.toString('hex'),
      nonce: parseInt(tx.nonce.toString('hex')),
      v: '0x' + tx.v.toString('hex'),
      r: '0x' + tx.r.toString('hex'),
      s: '0x' + tx.s.toString('hex'),
    };

    console.log("Decoded Transaction:", decodedTx);
    return decodedTx;
    // console.log(decodedTx)
    responses = decodedTx;
    console.log
  } catch (error) {
    console.error("Error decoding transaction:", error);
    return null;
  }
}
//  fetch collection details

async function fetchCollectionData(collectionName) {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection(collectionName))),
        q.Lambda((x) => q.Get(x))
      )
    );
    return result.data;
    
  } catch (error) {
    console.error('Error fetching collection data:', error);
    throw error;
  }
}

const collectionName = 'rawtransactions';

fetchCollectionData(collectionName)
  .then((data) => {
   result = data;
  //  console.log(result);

})
.catch((error) => {
  console.error('Error:', error);
});


//  end


// match 
// const matchingTx = result.find((tx) => {
//   return (
//     tx.to === decodedTx.to &&
//     tx.from === decodedTx.from &&
//     tx.value === decodedTx.value &&
//     tx.gasPrice === decodedTx.gasPrice &&
//     tx.gasLimit === decodedTx.gasLimit &&
//     tx.data === decodedTx.data &&
//     tx.nonce === decodedTx.nonce &&
//     tx.v === decodedTx.v &&
//     tx.r === decodedTx.r &&
//     tx.s === decodedTx.s
//   );
// });


// end 




app.post('/decode', async (req, res) => {
  try {
    const rawTransaction = req.body.rawTransaction;
    if (!rawTransaction) {
      return res.status(400).json({ error: 'Raw transaction data is missing in the request body.' });
    }

    const decodedTx = decodeRawTransaction(rawTransaction);
    const matchingTx = result.find((tx) => {
      return (
        tx.to === decodedTx.to &&
        tx.from === decodedTx.from &&
        tx.value === decodedTx.value &&
        // tx.gasPrice === responses.gasPrice &&
        // tx.gasLimit === responses.gasLimit &&
        // tx.data === responses.data &&
        tx.nonce === decodedTx.nonce 
        // tx.v === responses.v &&
        // tx.r === responses.r &&
        // tx.s === responses.s
      );
     
    });
   
    if (!decodedTx) {
      return res.status(500).json({ error: 'Failed to decode the transaction.' });
    }
    if(!matchingTx){
      res.json({error: "You Cant Save same data in database"})
    }
    else if(matchingTx){
    client.query(
      q.Create(q.Collection('rawtransactions'), { data: decodedTx })
    ).then((response) => {
      console.log('Transaction saved to FaunaDB:', response);
      res.status(200).json({ message: 'Transaction decoded and saved successfully.' });
    }).catch((error) => {
      console.error('Error saving transaction to FaunaDB:', error);
      res.status(500).json({ error: 'Failed to save the transaction to FaunaDB.' });
    });
    }
    

// res.json({decodedTx});
  } catch (error) {
    console.error('Error checking transaction:', error);
    res.status(500).json({ error: 'Failed to check the transaction.' });
  }
});

// Start the server
const port = 9000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
