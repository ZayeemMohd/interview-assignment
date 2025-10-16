"use client";

import React from "react";
import { useState } from "react";
import { Upload, ImageIcon, CheckCircle } from "lucide-react";

export default function ImageUploadDemo() {
  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [images, setImages] = useState<
    Array<{ title: string; preview: string }>
  >([]);
  const [view, setView] = useState<string>("upload");

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!title || !image) {
      alert("Please provide both title and image");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", image);

      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err?.error || "Upload failed");
      }

      const data = await res.json();
      const saved = data.image;

      // saved.imagePath is the public path (e.g. /savedImages/123-name.jpg)
      setImages((prev) => [
        ...prev,
        { title: saved.title, preview: saved.imagePath },
      ]);

      setSuccess(true);

      // clear inputs immediately (preview will show gallery image)
      setTitle("");
      setImage(null);
      setPreview("");

      // keep success indicator briefly
      setTimeout(() => setSuccess(false), 2000);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload image: " + (error?.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setView("upload")}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                view === "upload"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Upload Image
            </button>
            <button
              onClick={() => {
                // navigate to the pages/gallery route
                window.location.href = "/pages/gallery";
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                view === "gallery"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              View Gallery
            </button>
          </div>

          {view === "upload" ? (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Upload className="w-8 h-8 text-indigo-600" />
                Upload Image
              </h1>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter image title"
                    className="w-full px-4 py-2 border bg-indigo-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-gray-600">
                        Click to upload image
                      </span>
                    </label>
                  </div>
                </div>

                {preview && (
                  <div className="mt-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-64 object-cover rounded-lg mx-auto"
                    />
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading || !title || !image}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {uploading
                    ? "Uploading..."
                    : success
                    ? "✓ Uploaded!"
                    : "Upload"}
                </button>

                {success && (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Image uploaded successfully!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ImageIcon className="w-8 h-8 text-indigo-600" />
                Image Gallery
              </h1>

              {images.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No images uploaded yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={img.preview}
                        alt={img.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800">
                          {img.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
