"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-store";
import {
  getAdsQuery,
  createAdQuery,
  getAdByIdQuery,
  updateAdQuery,
  deleteAdQuery,
} from "@/queries/ad";
import { revalidatePath } from "next/cache";

// Helper to assert admin session authorization
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kachua_session")?.value;
  if (!token || !verifyToken(token)) {
    throw new Error("অননুমোদিত অ্যাক্সেস! এই অপারেশনটির জন্য এডমিন লগইন আবশ্যক।");
  }
}

/**
 * Fetch all ads Server Action (Public)
 */
export async function getAdsAction() {
  try {
    return await getAdsQuery();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Fetch a single ad by ID Server Action (Public)
 */
export async function getAdByIdAction(id) {
  try {
    return await getAdByIdQuery(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create a new ad Server Action (Admin Only)
 */
export async function createAdAction(data) {
  try {
    await verifyAdmin();
    const response = await createAdQuery(data);
    
    // Revalidate paths where ads are shown
    revalidatePath("/");
    revalidatePath("/admin/ads");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Update an ad by ID Server Action (Admin Only)
 */
export async function updateAdAction(id, data) {
  try {
    await verifyAdmin();
    const response = await updateAdQuery(id, data);
    
    // Revalidate paths where ads are shown
    revalidatePath("/");
    revalidatePath("/admin/ads");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete an ad by ID Server Action (Admin Only)
 */
export async function deleteAdAction(id) {
  try {
    await verifyAdmin();
    const response = await deleteAdQuery(id);
    
    // Revalidate paths where ads are shown
    revalidatePath("/");
    revalidatePath("/admin/ads");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
