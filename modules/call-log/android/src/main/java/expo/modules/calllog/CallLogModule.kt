package expo.modules.calllog

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class CallLogModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CallLog")

    AsyncFunction("load") { limit: Int ->
      // TODO: query CallLog.Calls content provider and return entries.
      // Requires READ_CALL_LOG permission. Implement in a native build.
      emptyList<Map<String, Any?>>()
    }
  }
}