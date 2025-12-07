import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
    // Upload file to specific path
    uploadFile: async (file, path) => {
        if (!file) return null;

        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Upload profile picture
    uploadProfileImage: async (file, userId) => {
        const path = `users/${userId}/profile/${file.name}`;
        return await storageService.uploadFile(file, path);
    },

    // Upload medical record
    uploadMedicalRecord: async (file, userId) => {
        const path = `users/${userId}/medical-records/${Date.now()}_${file.name}`;
        return await storageService.uploadFile(file, path);
    },

    // Upload prescription
    uploadPrescription: async (file, userId) => {
        const path = `users/${userId}/prescriptions/${Date.now()}_${file.name}`;
        return await storageService.uploadFile(file, path);
    }
};
