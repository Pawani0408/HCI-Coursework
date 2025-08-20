import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { Upload, File, X, Image, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { furnitureAPI } from '@/lib/api';
import { useFurnitureStore } from '@/store/furnitureStore';

const FurnitureUpload = ({ onSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { addFurniture } = useFurnitureStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'other',
      price: 0,
      tags: '',
      width: 1,
      depth: 1,
      height: 1
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'text/plain': ['.obj']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          alert('File is too large. Please upload a file smaller than 10MB.');
        } else {
          alert('Invalid file type. Please upload .glb, .gltf, or .obj files only.');
        }
      }
    }
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageFile(acceptedFiles[0]);
      }
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          alert('Image file is too large. Please upload an image smaller than 5MB.');
        } else {
          alert('Invalid image file type. Please upload JPG, PNG, WebP files only.');
        }
      }
    }
  });

  const onSubmit = async (data) => {
    if (!file) {
      alert('Please select a .glb, .gltf, or .obj file');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('furnitureFile', file);
      if (imageFile) {
        formData.append('thumbnailFile', imageFile);
      }
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('tags', data.tags);
      formData.append('width', data.width);
      formData.append('depth', data.depth);
      formData.append('height', data.height);

      const response = await furnitureAPI.upload(formData);
      
      addFurniture(response.data.data);
      
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
      // Reset form
      reset();
      setFile(null);
      setImageFile(null);
      
      alert('Furniture uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const removeImageFile = () => {
    setImageFile(null);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Upload className="w-5 h-5 mr-2 text-blue-500" />
          Upload Furniture Model
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        {/* 3D Model Upload */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">3D Model File *</Label>
          
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Drag & drop a .glb, .gltf, or .obj file here'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                or click to select a file
              </p>
              <p className="text-xs text-orange-600 mt-2 font-medium">
                ⚠️ Maximum file size: 10MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.size > 5 * 1024 * 1024 && (
                    <p className="text-xs text-orange-600 font-medium">
                      ⚠️ Large file - upload may take time
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">Product Image (Optional)</Label>
          
          {!imageFile ? (
            <div
              {...getImageRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isImageDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getImageInputProps()} />
              <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">
                {isImageDragActive
                  ? 'Drop the image here...'
                  : 'Drag & drop an image file here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP (optional)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <Image className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium">{imageFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeImageFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Furniture Details Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Modern Chair"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the furniture item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="chair">Chair</option>
                <option value="table">Table</option>
                <option value="sofa">Sofa</option>
                <option value="bed">Bed</option>
                <option value="storage">Storage</option>
                <option value="lighting">Lighting</option>
                <option value="decoration">Decoration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { 
                    min: { value: 0, message: 'Price must be 0 or greater' }
                  })}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., chair, modern, office (comma-separated)"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0.1"
                {...register('width', { 
                  required: 'Width is required',
                  min: { value: 0.1, message: 'Must be at least 0.1' }
                })}
              />
              {errors.width && (
                <p className="text-sm text-red-500 mt-1">{errors.width.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="depth">Depth</Label>
              <Input
                id="depth"
                type="number"
                step="0.1"
                min="0.1"
                {...register('depth', { 
                  required: 'Depth is required',
                  min: { value: 0.1, message: 'Must be at least 0.1' }
                })}
              />
              {errors.depth && (
                <p className="text-sm text-red-500 mt-1">{errors.depth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0.1"
                {...register('height', { 
                  required: 'Height is required',
                  min: { value: 0.1, message: 'Must be at least 0.1' }
                })}
              />
              {errors.height && (
                <p className="text-sm text-red-500 mt-1">{errors.height.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Furniture
                </>
              )}
            </Button>
            
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FurnitureUpload;
