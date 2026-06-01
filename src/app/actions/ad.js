"use server";

import {
  getAdsQuery,
  createAdQuery,
  getAdByIdQuery,
  updateAdQuery,
  deleteAdQuery,
} from "@/queries/ad";
import { revalidatePath } from "next/cache";

/**
 * Fetch all ads Server Action
 */
export async function getAdsAction() {
  try {
    return await getAdsQuery();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Fetch a single ad by ID Server Action
 */
export async function getAdByIdAction(id) {
  try {
    return await getAdByIdQuery(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create a new ad Server Action
 */
export async function createAdAction(data) {
  try {
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
 * Update an ad by ID Server Action
 */
export async function updateAdAction(id, data) {
  try {
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
 * Delete an ad by ID Server Action
 */
export async function deleteAdAction(id) {
  try {
    const response = await deleteAdQuery(id);
    
    // Revalidate paths where ads are shown
    revalidatePath("/");
    revalidatePath("/admin/ads");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
