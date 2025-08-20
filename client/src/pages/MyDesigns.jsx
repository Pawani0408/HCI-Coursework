import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Grid,
  List,
  Layout,
  User,
  ArrowLeft,
  Filter,
  Share,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { roomAPI } from '@/lib/api';

const MyDesigns = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [myDesigns, setMyDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadMyDesigns();
  }, []);

  useEffect(() => {
    filterDesigns();
  }, [myDesigns, searchTerm, filterBy]);

  const loadMyDesigns = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll();
      // Ensure response.data.data is an array
      const designs = Array.isArray(response.data.data) ? response.data.data : [];
      // Filter designs created by current user
      const userDesigns = designs.filter(design => 
        design.createdBy._id === user.id
      );
      setMyDesigns(userDesigns);
    } catch (error) {
      console.error('Failed to load designs:', error);
      setMyDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDesigns = () => {
    if (!myDesigns || !Array.isArray(myDesigns)) {
      setFilteredDesigns([]);
      return;
    }
    
    let filtered = [...myDesigns];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(design =>
        design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterBy === 'public') {
      filtered = filtered.filter(design => design.isPublic);
    } else if (filterBy === 'private') {
      filtered = filtered.filter(design => !design.isPublic);
    }

    setFilteredDesigns(filtered);
  };

  const handleDeleteDesign = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await roomAPI.delete(id);
      setMyDesigns(myDesigns.filter(d => d._id !== id));
    } catch (error) {
      console.error('Failed to delete design:', error);
      alert('Failed to delete design');
    }
  };

  const handleShareDesign = (design) => {
    const url = `${window.location.origin}/viewer/${design._id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const stats = {
    total: myDesigns.length,
    public: myDesigns.filter(d => d.isPublic).length,
    private: myDesigns.filter(d => !d.isPublic).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
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
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">
                Welcome, {user?.username}
              </span>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                My Designs
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Create, edit, and manage your room designs. Share your creations with the world!
            </p>
            
            <Button 
              onClick={() => navigate('/create-room')}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Room
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-gray-600">Total Designs</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.public}</div>
                <div className="text-gray-600">Public Designs</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-gray-600 mb-2">{stats.private}</div>
                <div className="text-gray-600">Private Designs</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Designs</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
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

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredDesigns.length} of {myDesigns.length} designs
            </p>
          </div>

          {/* Designs Grid */}
          {filteredDesigns.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredDesigns.map((design, index) => (
                <motion.div
                  key={design._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className={`h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      {/* Room preview placeholder */}
                      <div className={`bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ${
                        viewMode === 'list' ? 'h-full rounded-l-lg' : 'h-48 rounded-t-lg'
                      }`}>
                        <Layout className="w-12 h-12 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                        <CardTitle className="text-xl flex items-center justify-between">
                          {design.name}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            design.isPublic 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {design.isPublic ? 'Public' : 'Private'}
                          </span>
                        </CardTitle>
                        {design.description && (
                          <p className="text-gray-600 text-sm">{design.description}</p>
                        )}
                      </CardHeader>
                      
                      <CardContent className={viewMode === 'list' ? 'pt-0' : ''}>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Layout className="w-4 h-4 mr-2" />
                            {design.room.width}×{design.room.depth}×{design.room.height} units
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            {design.furniture.length} furniture items
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/viewer/${design._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/edit-room/${design._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareDesign(design)}
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDesign(design._id, design.name)}
                          >
                            <Trash2 className="w-4 h-4" />
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
                <Layout className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm || filterBy !== 'all' ? 'No designs found' : 'No designs created yet'}
              </p>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first room design to get started!'
                }
              </p>
              {!searchTerm && filterBy === 'all' && (
                <Button
                  onClick={() => navigate('/create-room')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Room
                </Button>
              )}
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

export default MyDesigns;
