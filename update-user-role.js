// Quick script to update a user's role in Firestore
// Usage: node update-user-role.js <email> <role>
// Example: node update-user-role.js chiken@gmail.com admin

const admin = require('firebase-admin');

// Initialize Firebase Admin (requires service account key)
// For now, we'll use the Firebase CLI's credentials
const serviceAccount = require('./eshaan-createch-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateUserRole(email, newRole) {
  try {
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('❌ No user found with email:', email);
      return;
    }

    // Update the first matching user
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      role: newRole
    });

    console.log('✅ Successfully updated user role!');
    console.log('   Email:', email);
    console.log('   New Role:', newRole);
    console.log('   User ID:', userDoc.id);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  }
}

// Get command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Usage: node update-user-role.js <email> <role>');
  console.log('Example: node update-user-role.js chiken@gmail.com admin');
  process.exit(1);
}

updateUserRole(email, role).then(() => process.exit(0));

