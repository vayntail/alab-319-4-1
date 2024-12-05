import { MongoClient } from "mongodb";

// allows to access the .env file
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.ATLAS_URI);

let conn;
let db;
try {
  conn = await client.connect();
  console.log("connected");

  db = conn.db("sample_training");

  await db.collection("grades").drop(); // drop existing grades collection, error fix

  // validation rules on grades collection
  await db.createCollection("grades", {
    validator: {
      $and: [
        {
          class_id: {
            $gte: 0, // class_id must be greater than or equal to 0
            $lte: 300, // class_id must be less than or equal to 300
            $type: "int", // class_id must be an integer
          },
        },
        {
          learner_id: {
            $gte: 0, // learner_id must be greater than or equal to 0
            $type: "int", // learner_id must be an integer
          },
        },
      ],
    },
    validationAction: "warn", // validation action
  });
  console.log("validation rules applied to grades collection!");

  const collection = db.collection("grades");

  // create single-field index on class_id
  await collection.createIndex({ class_id: 1 });
  console.log("index created on class_id");

  // create single-field index on learner_id
  await collection.createIndex({ learner_id: 1 });
  console.log("index created on learner_id");

  // create compound index on learner_id
  await collection.createIndex({ student_id: 1, class_id: 1 });
  console.log("compound index created on class_id and student_id");
} catch (e) {
  console.error(e);
} finally {
  await client.close(); // close client
}

export default db;
