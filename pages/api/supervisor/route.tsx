import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {id,formData}=req.body;
      // const { address,projectName, stageNumber, amountRequested, proofOfCompletion,NFT,prroofOfVerification,description,SupervisorNFT, verified } = req.body; 

      // console.log('Received ID:', id);
      // address: '',
      // projectName:'',
      // stageNumber: '',
      // amountRequested: '',
      // proofOfCompletion:[] as string[],
      // NFT:'',
      // prroofOfVerification:[] as string[],
      // description:'',
      // SupervisorNFT:'',
      // verified:false,
      const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});

      await client.connect();
      const database = client.db('MajorProjectDatabase');
      const collection = database.collection('BuilderData');
      const SupervisorCollection=database.collection('SupervisorData');

      const result = await collection.findOne({ _id: new ObjectId(id) });
      await SupervisorCollection.insertOne(formData);

      const Supervisorresult = {
        message: "SupervisorData saved successfully",
      };
      res.status(201).json(Supervisorresult);

      if (result) {
        console.log('Object ID exists in the collection');
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { verified: true } }
        );
        if (updateResult.modifiedCount > 0) {
          console.log('Document updated successfully');
        } else {
          console.log('Document not updated');
        }
      } else {
        console.log('Object ID does not exist in the collection');
      }

      await client.close();

      res.status(200).json({ message: 'Data verified successfully' });

    } catch (error) {
      console.error('Error verifying data:', error);
      res.status(500).json({ message: 'Something went wrong!' });
    }
  }else if (req.method === 'GET') {
    const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});
    try {
      const mongoURI = process.env.MONGODB_URI ?? '';
      const client = new MongoClient(mongoURI, {});

      await client.connect();
      const database = client.db('MajorProjectDatabase');
      const collection = database.collection('BuilderData');

      const data = await collection.find().toArray();
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
 
