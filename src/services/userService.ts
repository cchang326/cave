import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export const userService = {
  async syncUserProfile(user: User): Promise<void> {
    const path = `users/${user.uid}`;
    try {
      // We use setDoc with merge: true to avoid overwriting existing fields like 'role'
      await setDoc(doc(db, path), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
