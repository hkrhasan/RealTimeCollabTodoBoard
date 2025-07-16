import mongoose from "mongoose";
import { UserModel } from "./models/user";
import { ColumnModel } from "./models/column";
import { BoardModel } from "./models/board";
import config from "./config";

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  // Cleanup existing data
  await Promise.all([
    UserModel.deleteMany({}),
    ColumnModel.deleteMany({}),
    BoardModel.deleteMany({}),
  ]);
  console.log("Cleared existing collections");

  // 1) Create default users
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
          priority: "high",
        },
        {
          title: "Fix login bug",
          description: "Users are unable to login with social media accounts",
          assignedTo: users[1]?._id,
          priority: "medium",
        },
        {
          title: "Update documentation",
          description: "Update API documentation with new endpoints",
          assignedTo: null,
          priority: "low",
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
          priority: "high",
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
          priority: "medium",
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


  // console.log("Fetching Board with columns");

  // board = await BoardModel.findById(board._id).populate({
  //   path: 'columns',
  //   populate: {
  //     path: 'tasks'
  //   }
  // }).lean();

  // console.log(JSON.stringify(board))

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
