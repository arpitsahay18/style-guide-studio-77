
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const uploadLogoToStorage = async (file: File, userId: string): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`;
  const logoRef = ref(storage, `logos/${userId}/${fileName}`);
  
  const snapshot = await uploadBytes(logoRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

export const uploadBase64ToStorage = async (base64Data: string, userId: string, fileName: string = 'logo'): Promise<string> => {
  // Convert base64 to blob
  const response = await fetch(base64Data);
  const blob = await response.blob();
  
  const uniqueFileName = `${Date.now()}_${fileName}`;
  const logoRef = ref(storage, `logos/${userId}/${uniqueFileName}`);
  
  const snapshot = await uploadBytes(logoRef, blob);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

export const deleteLogoFromStorage = async (logoUrl: string): Promise<void> => {
  try {
    const logoRef = ref(storage, logoUrl);
    await deleteObject(logoRef);
  } catch (error) {
    console.log('Logo deletion failed (might not exist):', error);
  }
};
