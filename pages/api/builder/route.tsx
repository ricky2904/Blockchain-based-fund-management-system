import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});
    try {
      const { address,projectName, stageNumber, amountRequested, proofOfCompletion, verified } = req.body; 
      // console.log(address,projectName, stageNumber, amountRequested, proofOfCompletion, verified)
    
      const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});

      await client.connect();
      const database = client.db('MajorProjectDatabase');
      const collection = database.collection('BuilderData');

      await collection.insertOne({ address,projectName, stageNumber, amountRequested, proofOfCompletion, verified });

      const result = {
        message: "Data saved successfully",
      };
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong!' });
    } finally {
      await client.close();
    }
  } else if (req.method === 'GET') {
    const addr=req.query.addr;
    // console.log('red',addr)
    const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});
    try {
      const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});

      await client.connect();
      const database = client.db('MajorProjectDatabase');
      const collection = database.collection('BuilderData');

      const data = await collection.find({address:addr}).toArray();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong!' });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed!' });
  }
}
