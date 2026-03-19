const mongoose = require("mongoose");
const { execSync } = require("child_process");
const { ensureDefaultAdmin } = require("./adminGuard");

const sanitizeBranchName = (value = "") => String(value)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .slice(0, 40);

const getGitBranchName = () => {
  try {
    return String(execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }))
      .trim();
  } catch (_error) {
    return "";
  }
};

const resolveDbName = () => {
  const explicitName = String(process.env.DB_NAME || "").trim();
  if (explicitName) return explicitName;

  const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  const isolationEnabled = String(process.env.BRANCH_DB_ISOLATION || "true").toLowerCase() !== "false";
  if (isProduction || !isolationEnabled) return "";

  const branch = sanitizeBranchName(getGitBranchName());
  if (!branch || branch === "head") return "";

  const baseDbName = String(process.env.BASE_DB_NAME || "sales_crm").trim();
  return `${baseDbName}_${branch}`;
};

const connectDB = async () => {
  try {
    const dbName = resolveDbName();
    const connectOptions = dbName ? { dbName } : {};
    const conn = await mongoose.connect(process.env.MONGO_URI, connectOptions);

    await ensureDefaultAdmin();

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`, mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
