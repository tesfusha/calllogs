package expo.modules.calllog

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CallLog
import android.provider.ContactsContract
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class CallLogModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CallLog")

    // Whether READ_CALL_LOG (and READ_CONTACTS for names) is already granted.
    AsyncFunction("hasPermissions") {
      hasCallLogPermission()
    }

    // Query the device call log. Returns entries sorted newest-first.
    // Callers must request READ_CALL_LOG permission first (see requestPermissions).
    AsyncFunction("load") { limit: Int ->
      readCallLog(limit)
    }

    // Resolve a contact's display name for a phone number, or null if unknown.
    // Uses the contacts provider; no call-log permission needed, just READ_CONTACTS.
    AsyncFunction("lookupName") { phoneNumber: String ->
      lookupContactName(phoneNumber)
    }
  }

  private fun hasCallLogPermission(): Boolean {
    val context = appContext.reactContext ?: return false
    return context.checkSelfPermission(Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED
  }

  private fun readCallLog(limit: Int): List<Map<String, Any?>> {
    val context = appContext.reactContext ?: return emptyList()
    if (!hasCallLogPermission()) return emptyList()

    val projection = arrayOf(
      CallLog.Calls.NUMBER,
      CallLog.Calls.CACHED_NAME,
      CallLog.Calls.TYPE,
      CallLog.Calls.DATE,
      CallLog.Calls.DURATION,
      CallLog.Calls.PHONE_ACCOUNT_ID
    )

    val results = mutableListOf<Map<String, Any?>>()

    try {
      context.contentResolver.query(
        CallLog.Calls.CONTENT_URI,
        projection,
        null,
        null,
        "${CallLog.Calls.DATE} DESC"
      )?.use { cursor ->
        val numberIdx = cursor.getColumnIndex(CallLog.Calls.NUMBER)
        val nameIdx = cursor.getColumnIndex(CallLog.Calls.CACHED_NAME)
        val typeIdx = cursor.getColumnIndex(CallLog.Calls.TYPE)
        val dateIdx = cursor.getColumnIndex(CallLog.Calls.DATE)
        val durIdx = cursor.getColumnIndex(CallLog.Calls.DURATION)
        val simIdx = cursor.getColumnIndex(CallLog.Calls.PHONE_ACCOUNT_ID)

        var count = 0
        while (cursor.moveToNext() && count < limit) {
          val number = if (numberIdx >= 0) cursor.getString(numberIdx) else null
          val cachedName = if (nameIdx >= 0) cursor.getString(nameIdx) else null
          val type = if (typeIdx >= 0) cursor.getInt(typeIdx) else CallLog.Calls.MISSED_TYPE
          val date = if (dateIdx >= 0) cursor.getLong(dateIdx) else 0L
          val duration = if (durIdx >= 0) cursor.getLong(durIdx) else 0L
          val simId = if (simIdx >= 0) cursor.getString(simIdx) else null

          val direction = when (type) {
            CallLog.Calls.INCOMING_TYPE -> "INCOMING"
            CallLog.Calls.OUTGOING_TYPE -> "OUTGOING"
            else -> "MISSED"
          }

          // Prefer the cached contact name; fall back to a live contacts lookup.
          val name = cachedName?.takeIf { it.isNotBlank() } ?: number?.let { lookupContactName(context, it) }

          results.add(
            mapOf(
              "phoneNumber" to (number ?: ""),
              "name" to name,
              "type" to direction,
              "timestamp" to date,
              "duration" to duration,
              "sim" to simId
            )
          )
          count++
        }
      }
    } catch (_: SecurityException) {
      // Permission revoked mid-query — return what we have.
    } catch (_: Exception) {
      // Content provider errors — return what we have.
    }

    return results
  }

  private fun lookupContactName(context: Context, phoneNumber: String): String? {
    return try {
      val uri = ContactsContract.PhoneLookup.CONTENT_FILTER_URI.buildUpon()
        .appendPath(phoneNumber)
        .build()
      context.contentResolver.query(
        uri,
        arrayOf(ContactsContract.PhoneLookup.DISPLAY_NAME),
        null,
        null,
        null
      )?.use { cursor ->
        if (cursor.moveToFirst()) cursor.getString(0) else null
      }
    } catch (_: Exception) {
      null
    }
  }

  private fun lookupContactName(phoneNumber: String): String? {
    val context = appContext.reactContext ?: return null
    // Contacts lookup needs READ_CONTACTS; if missing, just return null.
    if (context.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
      return null
    }
    return lookupContactName(context, phoneNumber)
  }
}
