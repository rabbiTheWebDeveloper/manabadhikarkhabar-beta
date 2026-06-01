"use server";

import {
  getCategoriesQuery,
  createCategoryQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
} from "@/queries/category";
import { revalidatePath } from "next/cache";

/**
 * Fetch all categories Server Action
 */
export async function getCategoriesAction() {
  try {
    return await getCategoriesQuery();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create a new category Server Action
 */
export async function createCategoryAction(data) {
  try {
    const response = await createCategoryQuery(data);
    
    // Revalidate paths where categories are used
    revalidatePath("/");
    revalidatePath("/submit-news");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/news");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Update an existing category Server Action
 */
export async function updateCategoryAction(id, data) {
  try {
    const response = await updateCategoryQuery(id, data);
    
    // Revalidate paths where categories are used
    revalidatePath("/");
    revalidatePath("/submit-news");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/news");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete a category Server Action
 */
export async function deleteCategoryAction(id) {
  try {
    const response = await deleteCategoryQuery(id);
    
    // Revalidate paths where categories are used
    revalidatePath("/");
    revalidatePath("/submit-news");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/news");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
