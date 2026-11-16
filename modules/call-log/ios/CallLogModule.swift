import ExpoModulesCore

public class CallLogModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CallLog")

    AsyncFunction("load") { (limit: Int) -> [[String: Any]] in
      // iOS does not expose call log. Return empty.
      return []
    }
  }
}