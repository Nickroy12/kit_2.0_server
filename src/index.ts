import express, { Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config';
import { Collection, MongoClient, ObjectId } from 'mongodb';

const app = express()
const port = 5000

app.use(cors())
app.use(express.json())
const client = new MongoClient(process.env.MONGODB_URI as string);
app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})
export async function connectToMongoDB() {
  try {
    const db = client.db('knowledge_it')
   const courseCollection : Collection<Document> = db.collection('course')
   
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    app.post('/app/new_course' , async(req:Request,res:Response)=>{
      try {
         const body = req.body
         const result = await courseCollection.insertOne(body)
         res.status(201).json(result)
      } catch (error) {
        console.log(error)
         res.status(500).json({
            success: false,
            message: "Failed to create course",
          });
      }
    })
    app.get('/app/course' , async(req:Request,res:Response)=>{
       try {
        const cursor = await courseCollection.find().toArray()
        res.status(200).json(cursor)
       } catch (error) {
        res.status(500).json({
          success: false
        })
       }
    })
    app.get('/app/course/:id',async(req:Request<{id:string}> ,res:Response):Promise<void>=>{
      const id = req.params.id  
      const query = {
        _id : new ObjectId(id)
      }
      const result = await courseCollection.findOne(query);
  res.send(result);
    })
    app.delete('/app/course/:id',async(req:Request<{id:string}> ,res:Response):Promise<void>=>{
      const id = req.params.id  
      const query = {
        _id : new ObjectId(id)
      }
      const result = await courseCollection.deleteOne(query);
  if (result.deletedCount === 1) {
    res.status(200).send({ message: "Course deleted successfully" });
  } else {
    res.status(404).send({ message: "Course not found" });
  }
    })
    app.patch('/app/course/:id', async(req:Request<{id:string}>, res:Response):Promise<void>=>{
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const updateDoc = {
        $set: req.body
      }
      const result = await courseCollection.updateOne(query, updateDoc)
      if (result.matchedCount === 1) {
        res.status(200).json({ success: true, message: "Course updated successfully", result })
      } else {
        res.status(404).json({ success: false, message: "Course not found" })
      }
    })
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
