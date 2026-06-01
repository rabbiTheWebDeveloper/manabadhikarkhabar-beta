"use server";

import {
  getEPapersQuery,
  saveOrUpdateEPaperQuery,
  deleteEPaperQuery,
} from "@/queries/epaper";
import { revalidatePath } from "next/cache";

/**
 * Fetch all epapers Server Action
 */
export async function getEPapersAction() {
  try {
    return await getEPapersQuery();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create or Update an E-Paper Server Action
 */
export async function saveOrUpdateEPaperAction(id, data) {
  try {
    const response = await saveOrUpdateEPaperQuery(id, data);
    
    // Revalidate paths where epapers are displayed
    revalidatePath("/epaper");
    revalidatePath("/admin/epaper");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete an E-Paper Server Action
 */
export async function deleteEPaperAction(id) {
  try {
    const response = await deleteEPaperQuery(id);
    
    // Revalidate paths where epapers are displayed
    revalidatePath("/epaper");
    revalidatePath("/admin/epaper");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
