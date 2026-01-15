
// NOTE: This is reference code for your Firebase Functions project.
// Path: functions/src/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

admin.initializeApp();
const db = admin.firestore();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getDailySummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

  const { sign, date } = data;
  const cacheKey = `${sign}_${date}`;
  
  // 1. Check Firestore Cache
  const cachedDoc = await db.collection('horoscope_summaries').doc(cacheKey).get();
  if (cachedDoc.exists) {
    return cachedDoc.data();
  }

  // 2. Call Gemini
  const prompt = `为${sign}生成${date}的运势总结。输出JSON格式。`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const summary = JSON.parse(response.text || '{}');
  
  // 3. Save to Cache
  await db.collection('horoscope_summaries').doc(cacheKey).set({
    ...summary,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return summary;
});

export const getDimensionDetail = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

  const { sign, date, dimension } = data;
  const uid = context.auth.uid;

  // 1. Verify Entitlement
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();
  const isPremium = userData?.isPremium || userData?.entitlements?.includes(dimension);

  if (!isPremium) {
    throw new functions.https.HttpsError('permission-denied', 'You need to purchase this dimension.');
  }

  // 2. Logic similar to getDailySummary but for depth...
  // ... (Gemini Call & Cache)
  return { /* detailed data */ };
});

export const verifyPurchase = functions.https.onCall(async (data, context) => {
    // Stub for Apple/Google receipt verification
    const { receipt, productId } = data;
    const uid = context.auth?.uid;
    
    // Validate receipt with platform APIs
    // ...
    
    // Update Firestore
    await db.collection('users').doc(uid!).update({
        entitlements: admin.firestore.FieldValue.arrayUnion(productId)
    });
    
    return { status: 'success' };
});
