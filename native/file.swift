import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        let (mode, title, directory) = parseArgs()

        let panel: NSSavePanel
        if mode == "open" {
            let openPanel = NSOpenPanel()
            openPanel.canChooseFiles = true
            openPanel.canChooseDirectories = false
            openPanel.allowsMultipleSelection = false
            panel = openPanel
        } else {
            panel = NSSavePanel()
        }

        if let title = title {
            panel.title = title
        }
        if let directory = directory {
            panel.directoryURL = URL(fileURLWithPath: directory, isDirectory: true)
        }

        NSApp.activate(ignoringOtherApps: true)

        panel.begin { response in
            if response == .OK, let url = panel.url {
                print(url.path)
                NSApp.terminate(nil)
            } else {
                exit(1)
            }
        }
    }

    func parseArgs() -> (mode: String, title: String?, directory: String?) {
        var mode = "open"
        var title: String? = nil
        var directory: String? = nil

        let args = CommandLine.arguments
        var index = 1
        while index < args.count {
            let arg = args[index]
            if index + 1 < args.count {
                switch arg {
                case "--mode": mode = args[index + 1]; index += 2; continue
                case "--title": title = args[index + 1]; index += 2; continue
                case "--directory": directory = args[index + 1]; index += 2; continue
                default: break
                }
            }
            index += 1
        }
        return (mode, title, directory)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
