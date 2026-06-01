import { dbConnect } from "@/service/mongo";
import { PortalUserModel } from "@/model/portal-user-model";
import { memoryUsers, hashPassword } from "@/lib/auth-store";

// Helper to determine if we can connect to the MongoDB instance
async function isDbConnected() {
  try {
    await dbConnect();
    return true;
  } catch (error) {
    console.warn("⚠️ Database connection failed. Operating in JSON fallback memory mode for Auth.", error.message);
    return false;
  }
}

/**
 * Find user by username or email, seeding a default admin if none exists
 */
export async function findUserQuery(identifier) {
  const hasDb = await isDbConnected();
  const ident = identifier.toLowerCase().trim();

  if (hasDb) {
    try {
      // Ensure the default admin user is seeded in MongoDB
      const adminUser = await PortalUserModel.findOne({ username: 'admin' }).lean();
      if (!adminUser) {
        try {
          const defaultAdmin = new PortalUserModel({
            username: 'admin',
            email: 'admin@kachuaprotidin.com',
            password: hashPassword('admin123'),
            name: 'কচুয়া প্রতিদিন এডমিন',
            createdAt: new Date().toISOString()
          });
          await defaultAdmin.save();
          console.log('Successfully seeded default admin user into live MongoDB collection');
        } catch (seedErr) {
          console.error('Error seeding default admin user to MongoDB:', seedErr);
        }
      }

      const user = await PortalUserModel.findOne({
        $or: [
          { username: ident },
          { email: ident }
        ]
      }).lean();

      if (user) {
        return {
          ...user,
          _id: user._id.toString()
        };
      }
      return null;
    } catch (err) {
      console.error('Error finding user in MongoDB', err);
    }
  }

  // Fallback check
  const found = memoryUsers.find(
    u => u.username.toLowerCase() === ident || u.email.toLowerCase() === ident
  );
  return found || null;
}

/**
 * Create a new user (Signup)
 */
export async function createUserQuery(fields) {
  const hasDb = await isDbConnected();
  const lowercaseUsername = fields.username.toLowerCase().trim();
  const lowercaseEmail = fields.email.toLowerCase().trim();

  const existingUser = await findUserQuery(lowercaseUsername) || await findUserQuery(lowercaseEmail);
  if (existingUser) {
    throw new Error('এই ব্যবহারকারীর নাম বা ইমেইল ইতিমধ্যে নিবন্ধিত করা হয়েছে');
  }

  const hashedPassword = hashPassword(fields.password);
  const now = new Date().toISOString();

  if (hasDb) {
    try {
      const doc = new PortalUserModel({
        username: lowercaseUsername,
        email: lowercaseEmail,
        password: hashedPassword,
        name: fields.name || 'সহকারী সম্পাদক',
        createdAt: now
      });
      const result = await doc.save();
      
      return {
        _id: result._id.toString(),
        username: lowercaseUsername,
        email: lowercaseEmail,
        password: hashedPassword,
        name: fields.name || 'সহকারী সম্পাদক',
        createdAt: now
      };
    } catch (err) {
      console.error('Error inserting user to MongoDB', err);
    }
  }

  // Fallback save in-memory
  const id = `user-${Date.now()}`;
  const newUser = {
    _id: id,
    username: lowercaseUsername,
    email: lowercaseEmail,
    password: hashedPassword,
    name: fields.name || 'সহকারী সম্পাদক',
    createdAt: now
  };
  memoryUsers.push(newUser);
  return newUser;
}

/**
 * Fetch all users (excluding passwords) sorted by createdAt
 */
export async function getUsersQuery() {
  const hasDb = await isDbConnected();

  if (hasDb) {
    try {
      const users = await PortalUserModel.find({}, { password: 0 })
        .sort({ createdAt: -1 })
        .lean();

      return {
        users: users.map(u => ({
          _id: u._id.toString(),
          username: u.username,
          email: u.email,
          name: u.name,
          createdAt: u.createdAt
        }))
      };
    } catch (err) {
      console.error('Error fetching users from MongoDB:', err);
    }
  }

  // Fallback
  return {
    users: memoryUsers.map(({ password, ...u }) => u)
  };
}
