import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const categoryService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('categories_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match UI expectations
      return response.data?.map(category => ({
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || '#6b7280',
        icon: category.icon_c || 'Tag',
        isCustom: category.is_custom_c || false
      })) || [];
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('categories_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const category = response.data;
      if (!category) return null;

      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || '#6b7280',
        icon: category.icon_c || 'Tag',
        isCustom: category.is_custom_c || false
      };
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByName(name) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('categories_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        where: [
          {"FieldName": "name_c", "Operator": "EqualTo", "Values": [name]}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const category = response.data?.[0];
      if (!category) return null;

      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || '#6b7280',
        icon: category.icon_c || 'Tag',
        isCustom: category.is_custom_c || false
      };
    } catch (error) {
      console.error("Error fetching category by name:", error?.response?.data?.message || error);
      return null;
    }
  },

  async create(categoryData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('categories_c', {
        records: [{
          Name: categoryData.name,
          name_c: categoryData.name,
          color_c: categoryData.color || '#6b7280',
          icon_c: categoryData.icon || 'Tag',
          is_custom_c: true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} categories: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdCategory = successful[0].data;
          return {
            Id: createdCategory.Id,
            name: createdCategory.name_c || createdCategory.Name,
            color: createdCategory.color_c || '#6b7280',
            icon: createdCategory.icon_c || 'Tag',
            isCustom: createdCategory.is_custom_c || false
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, categoryData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      if (categoryData.name) {
        updateData.Name = categoryData.name;
        updateData.name_c = categoryData.name;
      }
      if (categoryData.color) updateData.color_c = categoryData.color;
      if (categoryData.icon) updateData.icon_c = categoryData.icon;
      if (categoryData.isCustom !== undefined) updateData.is_custom_c = categoryData.isCustom;

      const response = await apperClient.updateRecord('categories_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} categories: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedCategory = successful[0].data;
          return {
            Id: updatedCategory.Id,
            name: updatedCategory.name_c || updatedCategory.Name,
            color: updatedCategory.color_c || '#6b7280',
            icon: updatedCategory.icon_c || 'Tag',
            isCustom: updatedCategory.is_custom_c || false
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('categories_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} categories: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      return false;
    }
  }
};
import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const categoryService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('categories_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match UI expectations
      return response.data?.map(category => ({
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || '#6b7280',
        icon: category.icon_c || 'Tag',
        isCustom: category.is_custom_c || false
      })) || [];
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('categories_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const category = response.data;
      if (!category) return null;

      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || '#6b7280',
        icon: category.icon_c || 'Tag',
        isCustom: category.is_custom_c || false
      };
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByName(name) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('categories_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        where: [
          {"FieldName": "name_c", "Operator": "EqualTo", "Values": [name]}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const category = response.data?.[0];
      if (!category) return null;

      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || '#6b7280',
        icon: category.icon_c || 'Tag',
        isCustom: category.is_custom_c || false
      };
    } catch (error) {
      console.error("Error fetching category by name:", error?.response?.data?.message || error);
      return null;
    }
  },

  async create(categoryData) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.createRecord('categories_c', {
        records: [{
          Name: categoryData.name,
          name_c: categoryData.name,
          color_c: categoryData.color || '#6b7280',
          icon_c: categoryData.icon || 'Tag',
          is_custom_c: true
        }]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} categories: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdCategory = successful[0].data;
          return {
            Id: createdCategory.Id,
            name: createdCategory.name_c || createdCategory.Name,
            color: createdCategory.color_c || '#6b7280',
            icon: createdCategory.icon_c || 'Tag',
            isCustom: createdCategory.is_custom_c || false
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, categoryData) {
    try {
      const apperClient = getApperClient();
      const updateData = {
        Id: parseInt(id)
      };

      if (categoryData.name) {
        updateData.Name = categoryData.name;
        updateData.name_c = categoryData.name;
      }
      if (categoryData.color) updateData.color_c = categoryData.color;
      if (categoryData.icon) updateData.icon_c = categoryData.icon;
      if (categoryData.isCustom !== undefined) updateData.is_custom_c = categoryData.isCustom;

      const response = await apperClient.updateRecord('categories_c', {
        records: [updateData]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} categories: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedCategory = successful[0].data;
          return {
            Id: updatedCategory.Id,
            name: updatedCategory.name_c || updatedCategory.Name,
            color: updatedCategory.color_c || '#6b7280',
            icon: updatedCategory.icon_c || 'Tag',
            isCustom: updatedCategory.is_custom_c || false
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('categories_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} categories: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      return false;
    }
  }
};