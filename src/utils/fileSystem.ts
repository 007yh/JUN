import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const APP_FOLDER = 'CJYH_Data';
export const PHOTOS_FOLDER = `${APP_FOLDER}/Photos`;

// Initialize folders on app start
export const initFileSystem = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Try to create main folder
    await Filesystem.mkdir({
      path: APP_FOLDER,
      directory: Directory.Documents,
      recursive: true,
    });

    // Try to create photos folder
    await Filesystem.mkdir({
      path: PHOTOS_FOLDER,
      directory: Directory.Documents,
      recursive: true,
    });

    console.log('FileSystem initialized: Folders created');
  } catch (e) {
    // If folders exist, mkdir might throw an error (depending on OS), or just succeed.
    // We catch just in case, but usually recursive: true handles existing dirs gracefully.
    console.log('FileSystem init message (folder might exist):', e);
  }
};

// Save a photo base64 string to file
export const savePhotoToFile = async (base64Data: string, fileName: string) => {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    // Ensure base64 string is clean (remove data:image/xxx;base64, prefix if present)
    const data = base64Data.split(',')[1] || base64Data;

    const savedFile = await Filesystem.writeFile({
      path: `${PHOTOS_FOLDER}/${fileName}`,
      data: data,
      directory: Directory.Documents,
      // encoding: Encoding.UTF8 // Binary data shouldn't strictly enforce encoding if passed as base64 string in Capacitor? 
      // Capacitor writeFile 'data' argument: "The data to write. If a string, it will be written as utf-8. If a base64 string..."
      // Actually for images we usually pass base64 string.
    });

    console.log('Photo saved:', savedFile.uri);
    return savedFile.uri;
  } catch (e) {
    console.error('Error saving photo:', e);
    return null;
  }
};

// Save generic data (JSON)
export const saveDataToFile = async (data: any, fileName: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Filesystem.writeFile({
      path: `${APP_FOLDER}/${fileName}`,
      data: JSON.stringify(data, null, 2),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    console.log('Data saved:', fileName);
  } catch (e) {
    console.error('Error saving data:', e);
  }
};

// Read generic data (JSON)
export const readDataFromFile = async (fileName: string) => {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const result = await Filesystem.readFile({
      path: `${APP_FOLDER}/${fileName}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return JSON.parse(result.data as string);
  } catch (e) {
    // File not found or read error
    console.log('File not found or empty:', fileName);
    return null;
  }
};

export const AUTH_FILE = 'auth_config.json';
export const BACKUP_FILE = 'data_backup.json';
