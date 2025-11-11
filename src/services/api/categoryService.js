import categoriesData from "@/services/mockData/categories.json";

let categories = [...categoriesData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const categoryService = {
  async getAll() {
    await delay();
    return [...categories];
  },

  async getById(id) {
    await delay();
    return categories.find(category => category.Id === parseInt(id));
  },

  async getByName(name) {
    await delay();
    return categories.find(category => category.name === name);
  },

  async create(categoryData) {
    await delay();
    const newCategory = {
      ...categoryData,
      Id: Math.max(...categories.map(c => c.Id)) + 1,
      isCustom: true
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, categoryData) {
    await delay();
    const index = categories.findIndex(category => category.Id === parseInt(id));
    if (index !== -1) {
      categories[index] = { ...categories[index], ...categoryData };
      return { ...categories[index] };
    }
    throw new Error("Category not found");
  },

  async delete(id) {
    await delay();
    const index = categories.findIndex(category => category.Id === parseInt(id));
    if (index !== -1 && categories[index].isCustom) {
      const deleted = categories.splice(index, 1);
      return deleted[0];
    }
    throw new Error("Category not found or cannot be deleted");
  }
};