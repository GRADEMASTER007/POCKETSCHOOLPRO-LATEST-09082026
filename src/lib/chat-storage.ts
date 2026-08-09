import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any; // Using serverTimestamp() on write, will be Timestamp on read
}

export const saveChatMessage = async (message: Omit<ChatMessage, 'timestamp' | 'userId'>) => {
  if (!auth.currentUser) throw new Error('User must be signed in to save messages');

  const userId = auth.currentUser.uid;
  const path = `users/${userId}/chatHistory`;
  
  try {
    const messageRef = doc(collection(db, path), message.id);
    await setDoc(messageRef, {
      ...message,
      userId,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${message.id}`);
  }
};

export const subscribeToChatHistory = (
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (error: any) => void
) => {
  if (!auth.currentUser) {
    if (onError) onError(new Error('User must be signed in'));
    return () => {};
  }

  const userId = auth.currentUser.uid;
  const path = `users/${userId}/chatHistory`;
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as ChatMessage));
    onUpdate(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
    if (onError) onError(error);
  });
};

export const clearChatHistory = async () => {
  if (!auth.currentUser) throw new Error('User must be signed in');

  const userId = auth.currentUser.uid;
  const path = `users/${userId}/chatHistory`;
  
  try {
    const { getDocs, writeBatch } = await import('firebase/firestore');
    const q = query(collection(db, path), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    // Firestore batches allow up to 500 operations
    let batch = writeBatch(db);
    let count = 0;
    
    for (const document of querySnapshot.docs) {
      batch.delete(document.ref);
      count++;
      
      if (count === 499) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    
    if (count > 0) {
      await batch.commit();
    }
    
    console.log('Chat history cleared for user:', userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
