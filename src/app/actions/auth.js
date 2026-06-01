"use server";

import { cookies } from "next/headers";
import { hashPassword, createToken, verifyToken } from "@/lib/auth-store";
import { findUserQuery, createUserQuery, getUsersQuery } from "@/queries/auth";
import { revalidatePath } from "next/cache";

/**
 * Login Server Action
 */
export async function loginAction(credentials) {
  try {
    const { identifier, password } = credentials;

    if (!identifier || !password) {
      throw new Error("রজিষ্ট্রেশন মেল বা ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন");
    }

    const user = await findUserQuery(identifier);
    if (!user) {
      throw new Error("এই ব্যবহারকারীর অ্যাকাউন্টের কোনো অস্তিত্ব পাওয়া যায়নি");
    }

    const hashedInput = hashPassword(password);
    if (user.password !== hashedInput) {
      throw new Error("ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন");
    }

    // Generate token
    const token = createToken({
      userId: user._id,
      username: user.username,
      email: user.email,
      name: user.name
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("kachua_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 // 1 day
    });

    return {
      success: true,
      message: "সফলভাবে লগইন হয়েছে",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Signup Server Action
 */
export async function signupAction(data) {
  try {
    const { username, email, password, name } = data;

    if (!username || !email || !password) {
      throw new Error("রজিষ্ট্রেশনের জন্য ব্যবহারকারীর নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক");
    }

    if (password.length < 6) {
      throw new Error("পাসওয়ার্ড অত্যন্ত ছোট! কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন");
    }

    const newUser = await createUserQuery({
      username,
      email,
      password,
      name: name || "সহকারী সম্পাদক"
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "রেজিস্ট্রেশন সফল হয়েছে!",
      user: {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      }
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Logout Server Action
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("kachua_session");
    return {
      success: true,
      message: "লগ-আউট সফল হয়েছে"
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Get Profile Profile (Me) Server Action
 */
export async function getMeAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kachua_session")?.value;

    if (!token) {
      return { authenticated: false, user: null };
    }

    const payload = verifyToken(token);
    if (!payload) {
      cookieStore.delete("kachua_session");
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user: {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
        name: payload.name
      }
    };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}

/**
 * Get Users List Server Action
 */
export async function getUsersAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kachua_session")?.value || cookieStore.get("auth_token")?.value;
    if (!token) {
      throw new Error("Unauthorized");
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new Error("Invalid session");
    }

    return await getUsersQuery();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
