import { useEffect, useState } from 'react';
import { Plus, Search, Upload, Trash2, Edit2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useProductStore } from '../store/productStore';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

export function ProductsPage() {
  const { 
    products, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    uploadImage 
  } = useProductStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    item_number: '',
    description: '',
    price: '',
    quantity_on_hand: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(p => 
    p.item_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        item_number: product.item_number,
        description: product.description,
        price: product.price.toString(),
        quantity_on_hand: product.quantity_on_hand.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        item_number: '',
        description: '',
        price: '',
        quantity_on_hand: '',
      });
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        item_number: formData.item_number,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity_on_hand: parseInt(formData.quantity_on_hand),
      };

      let productId: string;

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        productId = editingProduct.id;
        toast.success('Product updated successfully');
      } else {
        const result = await createProduct(productData);
        productId = result?.id || '';
        toast.success('Product created successfully');
      }

      // Upload image if selected
      if (selectedImage && productId) {
        const imageUrl = await uploadImage(selectedImage, productId);
        if (imageUrl) {
          await updateProduct(productId, { image_url: imageUrl });
        }
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      toast.success('Product deleted');
      await fetchProducts();
    }
  };

  return (
    <div>
      <Header title="Products" subtitle="Manage your product catalog" />

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex-1" />
          <Button 
            variant="primary" 
            className="gap-2"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.description}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.item_number}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.description}
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${product.quantity_on_hand > 10 ? 'bg-green-100 text-green-800' : ''}
                      ${product.quantity_on_hand <= 10 && product.quantity_on_hand > 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${product.quantity_on_hand === 0 ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {product.quantity_on_hand} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenModal(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Item Number *"
              value={formData.item_number}
              onChange={(e) => setFormData({ ...formData, item_number: e.target.value })}
              required
            />
            <Input
              label="Price *"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <Input
            label="Description *"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Input
            label="Quantity on Hand *"
            type="number"
            value={formData.quantity_on_hand}
            onChange={(e) => setFormData({ ...formData, quantity_on_hand: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                <span className="text-sm">{selectedImage ? selectedImage.name : 'Choose file'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
