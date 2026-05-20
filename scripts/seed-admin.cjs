const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const rootDir = path.resolve(__dirname, "..");
  loadEnvFile(path.join(rootDir, ".env"));

  const mongoUri = getRequiredEnv("MONGODB_URI");
  const adminEmail = getRequiredEnv("ADMIN_EMAIL");
  const adminName = process.env.ADMIN_NAME || "Administrator";
  const adminPassword = getRequiredEnv("ADMIN_PASSWORD");

  await mongoose.connect(mongoUri);

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true, select: false },
      role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
  );

  const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const user = await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log(`Admin user saved: ${user.email} (${user.role})`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
