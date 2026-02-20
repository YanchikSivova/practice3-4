import { api } from "./apiClient";

/**
 * TODO (Практика 4):
 * Реализуйте функции работы с API.
 * Подсказка: используйте api.get/post/patch/delete и возвращайте data.
 */

export async function getProducts() {
    const response = await api.get("/products");
    return response.data;
}

export async function createProduct(payload) {
    const response = await api.post("/products", payload);
    return response.data;
}

export async function updateProduct(id, patch) {
  const response = await api.patch(`/products/${id}`, patch);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}