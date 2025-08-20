import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  Grid,
  List,
  ShoppingBag,
  Eye,
  Layout,
  Tag,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { furnitureAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const FurnitureShowcase = () => {
  const [furniture, setFurniture] = useState([]);
  const [filteredFurniture, setFilteredFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const { isAuthenticated } = useAuthStore();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'chair', label: 'Chairs' },
    { value: 'table', label: 'Tables' },
    { value: 'sofa', label: 'Sofas' },
    { value: 'bed', label: 'Beds' },
    { value: 'storage', label: 'Storage' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadFurniture();
  }, []);

  useEffect(() => {
    filterAndSortFurniture();
  }, [furniture, searchTerm, selectedCategory, sortBy]);

  const loadFurniture = async () => {
    try {
      const response = await furnitureAPI.getAll();
      setFurniture(response.data.data || []);
    } catch (error) {
      console.error('Failed to load furniture:', error);
      setFurniture([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFurniture = () => {
    if (!furniture || !Array.isArray(furniture)) {
      setFilteredFurniture([]);
      return;
    }

    let filtered = [...furniture];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredFurniture(filtered);
  };

  const handleAddToRoom = (furnitureItem) => {
    if (!isAuthenticated) {
      alert('Please log in to add furniture to your rooms.');
      return;
    }
    // This would typically navigate to room editor with the furniture selected
    alert(`Added ${furnitureItem.name} to your selection! Go to My Designs to add it to a room.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RoomCraft
                </span>
              </div>
            </div>
            
            {isAuthenticated && (
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link to="/my-designs">
                  My Designs
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Furniture
              </span>
              <br />
              <span className="text-gray-900">Collection</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our extensive library of high-quality 3D furniture models. 
              Find the perfect pieces for your room designs.
            </p>
          </motion.div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search furniture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="category">Sort by Category</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredFurniture.length} of {furniture.length} items
            </p>
          </div>

          {/* Furniture Grid/List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading furniture...</p>
            </div>
          ) : filteredFurniture.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredFurniture.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                >
                  <Card className={`h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      {/* Placeholder for 3D model preview */}
                      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${
                        viewMode === 'list' ? 'h-full rounded-l-lg' : 'h-48 rounded-t-lg'
                      }`}>
                        <Layout className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                        <CardTitle className="text-lg flex items-center justify-between">
                          {item.name}
                          <div className="flex items-center text-green-600 font-bold">
                            <DollarSign className="w-4 h-4" />
                            {item.price || '0'}
                          </div>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {categories.find(cat => cat.value === item.category)?.label || item.category}
                          </span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className={viewMode === 'list' ? 'pt-0' : ''}>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              // This would open a 3D preview modal
                              alert(`3D preview of ${item.name} would open here`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                            onClick={() => handleAddToRoom(item)}
                          >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            Add to Room
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">
                No furniture found
              </p>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">RoomCraft</span>
            </div>
            <p className="text-gray-400">
              &copy; 2025 RoomCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FurnitureShowcase;
