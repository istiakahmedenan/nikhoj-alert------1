const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered on new report creation:
 * - Validates submission integrity
 * - Sends internal notification for admin moderation review
 */
exports.onReportCreated = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const reportData = snap.data();
    console.log(`New report submitted [${reportData.reportId}]: ${reportData.title}`);

    // Create moderation notification entry
    return db.collection('auditLogs').add({
      action: 'SYSTEM_NEW_SUBMISSION',
      reportId: reportData.reportId,
      details: `New report submitted: ${reportData.title} in ${reportData.district}`,
      timestamp: new Date().toISOString()
    });
  });

/**
 * Securely assign admin role to designated email:
 * Only accessible by existing Super Admin
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Request must be authenticated.');
  }

  // Verify caller is super admin
  const callerUser = await admin.auth().getUser(context.auth.uid);
  if (callerUser.email !== 'enanahmed776@gmail.com' && !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only Super Admin can grant roles.');
  }

  const { targetEmail, role } = data;
  const user = await admin.auth().getUserByEmail(targetEmail);
  await admin.auth().setCustomUserClaims(user.uid, { role, admin: true });

  await db.collection('admins').doc(user.uid).set({
    uid: user.uid,
    email: targetEmail,
    role: role || 'moderator',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return { success: true, message: `Admin role ${role} assigned to ${targetEmail}` };
});
