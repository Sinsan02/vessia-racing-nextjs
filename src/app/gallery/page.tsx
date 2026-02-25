"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("General");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    fetchImages();
    fetchCategories();
    checkAdmin();

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      setError("Could not fetch images.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/gallery/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Could not fetch categories:", err);
    }
  };

  const checkAdmin = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setIsAdmin(data?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError("");
    setSuccess("");
    
    try {
      let uploadedCount = 0;
      
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", "");
        formData.append("description", "");
        formData.append("category", category);
        
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Upload failed");
        uploadedCount++;
      }
      
      setSelectedFiles([]);
      setCategory("General");
      setSuccess(`${uploadedCount} ${uploadedCount === 1 ? 'image' : 'images'} uploaded!`);
      fetchImages();
      
      // Clear file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || "Error uploading images.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Delete failed");
      
      setSuccess("Image deleted!");
      fetchImages();
    } catch (err) {
      setError("Error deleting image.");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch('/api/gallery/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDesc
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create category");

      setSuccess("Category created!");
      setNewCategoryName("");
      setNewCategoryDesc("");
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Error creating category.");
    }
  };

  const handleReorderCategory = async (categoryId: number, direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/gallery/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ categoryId, direction })
      });

      if (!res.ok) throw new Error('Failed to reorder');

      fetchCategories();
      // Also refresh images to see the new order
      fetchImages();
    } catch (err) {
      setError('Error reordering category.');
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `linear-gradient(rgba(10,10,10,${isMobile ? '0.75' : '0.85'}), rgba(10,10,10,${isMobile ? '0.75' : '0.85'})), url('/images/decorative/Screenshot_2025-10-11_170713.png')`,
      backgroundColor: '#0a0a0a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      backgroundRepeat: 'no-repeat',
      color: "#fff",
      paddingTop: isMobile ? "80px" : "120px",
      paddingBottom: "60px"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px" }}>
        <h1 style={{ 
          fontSize: isMobile ? "2rem" : "3rem", 
          marginBottom: isMobile ? "16px" : "32px",
          textAlign: "center",
          color: "#3EA822",
          fontWeight: "bold"
        }}>
          Photo Gallery
        </h1>

        {isAdmin && (
          <div style={{ textAlign: "center", marginBottom: isMobile ? "16px" : "24px" }}>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              style={{
                padding: isMobile ? "10px 24px" : "12px 32px",
                backgroundColor: isEditMode ? "#c00" : "#3EA822",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: isMobile ? "0.9rem" : "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.backgroundColor = isEditMode ? "#f44" : "#4db82e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = isEditMode ? "#c00" : "#3EA822";
              }}
            >
              {isEditMode ? "✕ Close Edit" : "✏️ Edit Gallery"}
            </button>
          </div>
        )}

        {isAdmin && isEditMode && (
          <div style={{ 
            marginBottom: isMobile ? "24px" : "48px",
            backgroundColor: "rgba(26, 26, 26, 0.95)",
            padding: isMobile ? "16px" : "24px",
            borderRadius: "12px",
            border: "2px solid #3EA822"
          }}>
            <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", marginBottom: "16px", color: "#3EA822" }}>
              Upload Images
            </h2>
            
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Select Images</label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer"
                }}
              />
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "#888" }}>
                  Selected: {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'}
                  {selectedFiles.length === 1 && ` (${(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB)`}
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              style={{
                padding: isMobile ? "10px 20px" : "12px 24px",
                backgroundColor: selectedFiles.length > 0 && !uploading ? "#3EA822" : "#555",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: selectedFiles.length > 0 && !uploading ? "pointer" : "not-allowed",
                transition: "all 0.3s ease"
              }}
            >
              {uploading ? "Uploading..." : selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Images` : "Upload Image"}
            </button>

            {error && (
              <div style={{ 
                marginTop: "12px", 
                padding: "12px", 
                backgroundColor: "rgba(255, 68, 68, 0.1)",
                border: "1px solid #f44",
                borderRadius: "6px",
                color: "#f44" 
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ 
                marginTop: "12px", 
                padding: "12px", 
                backgroundColor: "rgba(62, 168, 34, 0.1)",
                border: "1px solid #3EA822",
                borderRadius: "6px",
                color: "#3EA822" 
              }}>
                {success}
              </div>
            )}
          </div>
        )}

        {/* Category Creation Form */}
        {isAdmin && isEditMode && (
          <div style={{
            marginTop: "40px",
            padding: isMobile ? "20px" : "30px",
            backgroundColor: "rgba(26, 26, 26, 0.9)",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "600px"
          }}>
            <h3 style={{
              margin: "0 0 10px 0",
              fontSize: "1.3rem",
              color: "#3EA822",
              fontWeight: "bold"
            }}>
              Create New Category
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.95rem", color: "#ccc" }}>
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. 12 Hour Spa Race"
                style={{
                  padding: "10px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.95rem", color: "#ccc" }}>
                Description (optional)
              </label>
              <textarea
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Brief category description..."
                rows={3}
                style={{
                  padding: "10px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "1rem",
                  resize: "vertical"
                }}
              />
            </div>

            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              style={{
                padding: isMobile ? "10px 20px" : "12px 24px",
                backgroundColor: newCategoryName.trim() ? "#3EA822" : "#555",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: newCategoryName.trim() ? "pointer" : "not-allowed",
                transition: "all 0.3s ease"
              }}
            >
              Create Category
            </button>
          </div>
        )}

        {images.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "rgba(26, 26, 26, 0.8)",
            borderRadius: "12px",
            fontSize: "1.2rem",
            color: "#888"
          }}>
            No images yet.
          </div>
        ) : (
          <>
            {categories.map((cat) => {
              const categoryImages = images.filter(img => img.category === cat.name);
              if (categoryImages.length === 0) return null;
              
              return (
                <div key={cat.id} style={{ marginBottom: isMobile ? "32px" : "48px" }}>
                  <h2 style={{
                    fontSize: isMobile ? "1.5rem" : "2rem",
                    color: "#3EA822",
                    marginBottom: isMobile ? "16px" : "24px",
                    fontWeight: "bold",
                    borderBottom: "2px solid #3EA822",
                    paddingBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      {cat.name}
                    </div>
                    {isAdmin && isEditMode && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleReorderCategory(cat.id, 'up')}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#3EA822",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4db82e"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3EA822"}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleReorderCategory(cat.id, 'down')}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#3EA822",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4db82e"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3EA822"}
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </h2>
                  {cat.description && (
                    <p style={{ color: "#888", marginBottom: "16px", fontSize: "0.95rem" }}>
                      {cat.description}
                    </p>
                  )}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: isMobile ? "16px" : "24px"
                  }}>
                    {categoryImages.map((img) => (
                      <div
                        key={img.id}
                        style={{
                          position: "relative",
                          backgroundColor: "rgba(26, 26, 26, 0.95)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "2px solid #333",
                          transition: "transform 0.3s ease, border-color 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.02)";
                          e.currentTarget.style.borderColor = "#3EA822";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.borderColor = "#333";
                        }}
                      >
                        <div style={{ position: "relative", width: "100%", height: isMobile ? "200px" : "250px" }}>
                          <Image
                            src={img.image_url}
                            alt={img.title || "Gallery image"}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        
                        {(img.title || img.description || (isAdmin && isEditMode)) && (
                          <div style={{ padding: "16px" }}>
                            {img.title && (
                              <h3 style={{ 
                                fontSize: "1.1rem", 
                                marginBottom: "8px", 
                                color: "#3EA822",
                                fontWeight: "bold"
                              }}>
                                {img.title}
                              </h3>
                            )}
                            {img.description && (
                              <p style={{ 
                                fontSize: "0.9rem", 
                                color: "#aaa", 
                                marginBottom: "8px",
                                lineHeight: "1.4"
                              }}>
                                {img.description}
                              </p>
                            )}

                            {isAdmin && isEditMode && (
                              <button
                                onClick={() => handleDelete(img.id)}
                                style={{
                                  marginTop: img.title || img.description ? "12px" : "0",
                                  padding: "8px 16px",
                                  backgroundColor: "#c00",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "0.9rem",
                                  cursor: "pointer",
                                  transition: "background-color 0.3s ease"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f44"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#c00"}
                              >
                                Delete Image
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
