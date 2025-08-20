import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { roomAPI } from '@/lib/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [myDesigns, setMyDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyDesigns();
  }, []);

  const loadMyDesigns = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll();
      // Filter designs created by current user
      const userDesigns = response.data.filter(design => 
        design.createdBy._id === user.id
      );
      setMyDesigns(userDesigns);
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (id) => {
    if (!confirm('Are you sure you want to delete this room design?')) {
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              My Room Designs
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <Button onClick={() => navigate('/')} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Room Designs</h2>
          <Button onClick={() => navigate('/user/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Room
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDesigns.map((design) => (
            <Card key={design._id}>
              <CardHeader>
                <CardTitle className="text-lg">{design.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Room: {design.room.width}×{design.room.depth}×{design.room.height} units
                  </p>
                  <p className="text-sm text-gray-600">
                    Furniture: {design.furniture.length} items
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {design.isPublic ? 'Public' : 'Private'}
                  </p>
                  <div className="flex gap-2 pt-2">
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
                      onClick={() => navigate(`/user/edit/${design._id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteDesign(design._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myDesigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No room designs created yet.</p>
            <p className="text-gray-400 mt-2">
              Create your first room design to get started!
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate('/user/create')}
            >
              Create Your First Room
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
