"use server";

import {
  getArticlesQuery,
  createArticleQuery,
  getArticleByIdQuery,
  updateArticleQuery,
  deleteArticleQuery,
} from "@/queries/article";
import { revalidatePath } from "next/cache";

/**
 * Fetch all articles Server Action
 */
export async function getArticlesAction(onlyPublished = false) {
  try {
    return await getArticlesQuery(onlyPublished);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Fetch a single article by ID Server Action
 */
export async function getArticleByIdAction(id) {
  try {
    return await getArticleByIdQuery(id);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create a new article Server Action
 */
export async function createArticleAction(data) {
  try {
    const response = await createArticleQuery(data);
    
    // Revalidate relevant pages to update the client caches
    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/admin/news");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Update an article by ID Server Action
 */
export async function updateArticleAction(id, data) {
  try {
    const response = await updateArticleQuery(id, data);
    
    // Revalidate paths to reflect the update
    revalidatePath("/");
    revalidatePath(`/news/${id}`);
    revalidatePath("/archive");
    revalidatePath("/admin/news");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Delete an article by ID Server Action
 */
export async function deleteArticleAction(id) {
  try {
    const response = await deleteArticleQuery(id);
    
    // Revalidate paths to remove the deleted article
    revalidatePath("/");
    revalidatePath(`/news/${id}`);
    revalidatePath("/archive");
    revalidatePath("/admin/news");
    
    return response;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
