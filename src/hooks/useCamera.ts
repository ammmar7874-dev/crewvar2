import { useState } from "react";
import { Capacitor } from "@capacitor/core";

// Conditional imports for mobile-only features
let Camera: any = null;
let Filesystem: any = null;
let Directory: any = null;
let Encoding: any = null;

if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
  try {
    const cameraModule = require("@capacitor/camera");
    const filesystemModule = require("@capacitor/filesystem");

    Camera = cameraModule.Camera;
    Filesystem = filesystemModule.Filesystem;
    Directory = filesystemModule.Directory;
    Encoding = filesystemModule.Encoding;
  } catch (error) {
    console.warn("Camera/Filesystem plugins not available in web environment");
  }
}

import { toast } from "react-toastify";

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: any;
  source?: any;
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async (options: CameraOptions = {}) => {
    if (!Capacitor.isNativePlatform() || !Camera) {
      toast.error("Camera is only available on mobile devices");
      return null;
    }

    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || Camera.CameraResultType.Uri,
        source: options.source || Camera.CameraSource.Camera,
      });

      return image;
    } catch (error) {
      console.error("Error taking picture:", error);
      toast.error("Failed to take picture");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (options: CameraOptions = {}) => {
    if (!Capacitor.isNativePlatform() || !Camera) {
      toast.error("Gallery is only available on mobile devices");
      return null;
    }

    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: options.quality || 90,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType || Camera.CameraResultType.Uri,
        source: Camera.CameraSource.Photos,
      });

      return image;
    } catch (error) {
      console.error("Error selecting from gallery:", error);
      toast.error("Failed to select image from gallery");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveToGallery = async (photo: any) => {
    if (!Capacitor.isNativePlatform() || !Filesystem || !Directory) {
      return false;
    }

    try {
      const fileName = `photo_${Date.now()}.jpeg`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: photo.base64String || "",
        directory: Directory.Data,
      });

      console.log("Photo saved to gallery:", savedFile);
      return true;
    } catch (error) {
      console.error("Error saving to gallery:", error);
      toast.error("Failed to save photo to gallery");
      return false;
    }
  };

  return {
    takePicture,
    selectFromGallery,
    saveToGallery,
    isLoading,
  };
};

export const useFileSystem = () => {
  const [isLoading, setIsLoading] = useState(false);

  const readFile = async (path: string, directory: any = Directory?.Data) => {
    if (!Filesystem || !Directory || !Encoding) {
      toast.error("File system not available");
      return null;
    }

    setIsLoading(true);
    try {
      const result = await Filesystem.readFile({
        path,
        directory,
        encoding: Encoding.UTF8,
      });
      return result.data;
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const writeFile = async (
    path: string,
    data: string,
    directory: any = Directory?.Data
  ) => {
    if (!Filesystem || !Directory || !Encoding) {
      toast.error("File system not available");
      return null;
    }

    setIsLoading(true);
    try {
      const result = await Filesystem.writeFile({
        path,
        data,
        directory,
        encoding: Encoding.UTF8,
      });
      return result;
    } catch (error) {
      console.error("Error writing file:", error);
      toast.error("Failed to write file");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (path: string, directory: any = Directory?.Data) => {
    if (!Filesystem || !Directory) {
      toast.error("File system not available");
      return false;
    }

    setIsLoading(true);
    try {
      await Filesystem.deleteFile({
        path,
        directory,
      });
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    readFile,
    writeFile,
    deleteFile,
    isLoading,
  };
};
