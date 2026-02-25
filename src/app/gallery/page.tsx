"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    fetchImages();
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
      setError("Kunne ikke hente bilder.");
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
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError("");
    setSuccess("");
    
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("title", title);
    formData.append("description", description);
    
    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Feil ved opplasting");
      
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setSuccess("Bilde lastet opp!");
      fetchImages();
      
      // Clear file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || "Feil ved opplasting av bilde.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Er du sikker på at du vil slette dette bildet?")) return;
    
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Feil ved sletting");
      
      setSuccess("Bilde slettet!");
      fetchImages();
    } catch (err) {
      setError("Feil ved sletting av bilde.");
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
              {isEditMode ? "✕ Lukk redigering" : "✏️ Rediger galleri"}
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
              Last opp nytt bilde
            </h2>
            
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Tittel (valgfritt)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bildetittel..."
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Beskrivelse (valgfritt)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bildebeskrivelse..."
                rows={3}
                style={{
                  width: "100%",
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

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>Velg bilde</label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
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
              {selectedFile && (
                <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "#888" }}>
                  Valgt: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              style={{
                padding: isMobile ? "10px 20px" : "12px 24px",
                backgroundColor: selectedFile && !uploading ? "#3EA822" : "#555",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: selectedFile && !uploading ? "pointer" : "not-allowed",
                transition: "all 0.3s ease"
              }}
            >
              {uploading ? "Laster opp..." : "Last opp bilde"}
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

        {images.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "rgba(26, 26, 26, 0.8)",
            borderRadius: "12px",
            fontSize: "1.2rem",
            color: "#888"
          }}>
            Ingen bilder enda.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
            gap: isMobile ? "16px" : "24px"
          }}>
            {images.map((img) => (
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
                        marginTop: "12px",
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
                      Slett bilde
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
