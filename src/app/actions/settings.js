"use server";

import {
  getSettingsQuery,
  updateSettingsQuery,
  addBreakingNewsQuery,
  removeBreakingNewsQuery,
  toggleBreakingNewsQuery,
} from "@/queries/settings";
import { revalidatePath } from "next/cache";

/**
 * Fetch settings Server Action
 */
export async function getSettingsAction() {
  try {
    return await getSettingsQuery();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Update general portal settings Server Action
 */
export async function updateSettingsAction(updates) {
  try {
    const response = await updateSettingsQuery(updates);
    
    // Revalidate paths using settings
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Add a breaking news item Server Action
 */
export async function addBreakingNewsAction(text) {
  try {
    const response = await addBreakingNewsQuery(text);
    
    // Revalidate homepage
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Remove a breaking news item Server Action
 */
export async function removeBreakingNewsAction(id) {
  try {
    const response = await removeBreakingNewsQuery(id);
    
    // Revalidate homepage
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Toggle a breaking news item Server Action
 */
export async function toggleBreakingNewsAction(id) {
  try {
    const response = await toggleBreakingNewsQuery(id);
    
    // Revalidate homepage
    revalidatePath("/");
    revalidatePath("/admin/settings");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
