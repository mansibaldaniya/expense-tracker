import bcrypt from "bcryptjs";
import { UserModel } from "@/models/User";
import { ADMIN_BOOTSTRAP } from "@/lib/constants";

type BootstrapState = {
  promise: Promise<void> | null;
};

const globalForBootstrap = globalThis as typeof globalThis & {
  expenseTrackerBootstrap: BootstrapState | undefined;
};

const bootstrapState = globalForBootstrap.expenseTrackerBootstrap ?? { promise: null };

if (!globalForBootstrap.expenseTrackerBootstrap) {
  globalForBootstrap.expenseTrackerBootstrap = bootstrapState;
}

export async function ensureAdminBootstrap(): Promise<void> {
  if (!bootstrapState.promise) {
    bootstrapState.promise = (async () => {
      if (!ADMIN_BOOTSTRAP.email || !ADMIN_BOOTSTRAP.password) {
        return;
      }

      const existing = await UserModel.findOne({ email: ADMIN_BOOTSTRAP.email }).lean();

      if (existing && existing.role === "admin") {
        return;
      }

      const hashedPassword = await bcrypt.hash(ADMIN_BOOTSTRAP.password, 12);
      await UserModel.findOneAndUpdate(
        { email: ADMIN_BOOTSTRAP.email },
        {
          name: ADMIN_BOOTSTRAP.name,
          email: ADMIN_BOOTSTRAP.email,
          password: hashedPassword,
          role: "admin",
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    })().catch((error) => {
      console.error("Admin bootstrap failed:", error);
    });
  }

  await bootstrapState.promise;
}

let cleanupPromise: Promise<void> | null = null;

export async function cleanupUserProfilePhotos(): Promise<void> {
  if (!cleanupPromise) {
    cleanupPromise = UserModel.updateMany(
      { profilePhotoUrl: { $exists: true } },
      { $unset: { profilePhotoUrl: "" } }
    ).then(() => undefined);
  }

  await cleanupPromise;
}
