import mongoose from "mongoose";
import { UserModel } from "./models/user";
import { ColumnModel } from "./models/column";
import { BoardModel } from "./models/board";
import config from "./config";
import columnRepository from "./repositories/column.repository";
import taskRepository from "./repositories/task.repository";
import { TaskModel } from "./models";

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  // Cleanup existing data
  await Promise.all([
    UserModel.deleteMany({}),
    ColumnModel.deleteMany({}),
    ColumnModel.collection.dropIndexes(),
    BoardModel.deleteMany({}),
    TaskModel.deleteMany({}),
    TaskModel.collection.dropIndexes(),

  ]);
  console.log("Cleared existing collections");

  // // 1) Create default users
  const users = await UserModel.create([
    { username: "hkrhasan", email: "hkrhasan@example.com", password: "password123" },
    { username: "testuser", email: "testuser@example.com", password: "password123" },
  ]);
  console.log("Seeded users:", users.map((u) => u._id));

  // 2) Create default columns with initial tasks
  const [todoCol, inProgCol, doneCol] = await ColumnModel.create([
    {
      title: "Todo",
      color: "#64748b",
      tasks: [
        {
          title: "Design new landing page",
          description: "Create wireframes and mockups for the new landing page",
          assignedTo: users[0]?._id,
          createdBy: users[0]?._id,
          priority: "high",
          position: 0
        },
        {
          title: "Fix login bug",
          description: "Users are unable to login with social media accounts",
          assignedTo: users[1]?._id,
          createdBy: users[0]?._id,
          priority: "medium",
          position: 1
        },
        {
          title: "Update documentation",
          description: "Update API documentation with new endpoints",
          assignedTo: null,
          createdBy: users[1]?._id,
          priority: "low",
          position: 2
        },
      ],
    },
    {
      title: "In Progress",
      color: "#f59e0b",
      tasks: [
        {
          title: "Implement user dashboard",
          description: "Build the main user dashboard with analytics",
          assignedTo: users[0]?._id,
          createdBy: users[0]?._id,
          priority: "high",
          position: 0
        },
      ],
    },
    {
      title: "Done",
      color: "#10b981",
      tasks: [
        {
          title: "Setup CI/CD pipeline",
          description: "Configure automated testing and deployment",
          assignedTo: users[1]?._id,
          createdBy: users[1]?._id,
          priority: "medium",
          position: 0
        },
      ],
    },
  ]);
  console.log("Seeded columns:", [todoCol?._id, inProgCol?._id, doneCol?._id]);

  // 3) Create default board
  let board: any = await BoardModel.create({
    id: "default-board",
    title: "Default Board",
    columns: [todoCol?._id, inProgCol?._id, doneCol?._id],
  });
  console.log("Seeded board:", board._id);

  console.log("Seeding complete!");


  // // console.log("Fetching Board with columns");

  // // board = await BoardModel.findById(board._id).populate({
  // //   path: 'columns',
  // //   populate: {
  // //     path: 'tasks'
  // //   }
  // // }).lean();

  // // console.log(JSON.stringify(board))

  // const column = await columnRepository.findById('68784019950f5847fa519f67');

  // console.log(column)

  // const task = await taskRepository.delete('68784019950f5847fa519f6a');
  // console.log({ task })
  // const task = await taskRepository.findById('68784019950f5847fa519f6a');
  // console.log({ task })

  // const columns = await columnRepository.find();
  // console.log({ columns })
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
