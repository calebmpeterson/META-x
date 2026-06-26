import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var textView: NSTextView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Ensure it's treated as a full foreground app (shows in Dock)
        NSApp.setActivationPolicy(.regular)

        setupUI()
        runTerminalCommand("ping", args: ["-c", "5", "google.com"])

        // Bring window to front
        NSApp.activate(ignoringOtherApps: true)
    }

    func setupUI() {
        let screenSize = NSScreen.main?.frame.size ?? CGSize(width: 800, height: 600)
        let windowSize = CGSize(width: 600, height: 400)

        window = NSWindow(
            contentRect: NSRect(x: (screenSize.width - windowSize.width) / 2,
                                y: (screenSize.height - windowSize.height) / 2,
                                width: windowSize.width,
                                height: windowSize.height),
            styleMask: [.titled, .closable, .resizable],
            backing: .buffered,
            defer: false)

        window.title = "Terminal Output"
        window.makeKeyAndOrderFront(nil)

        let scrollView = NSScrollView(frame: window.contentView!.bounds)
        scrollView.hasVerticalScroller = true
        scrollView.autoresizingMask = [.width, .height]

        textView = NSTextView(frame: scrollView.bounds)
        textView.isEditable = false
        textView.font = NSFont.monospacedSystemFont(ofSize: 12, weight: .regular)
        scrollView.documentView = textView

        window.contentView?.addSubview(scrollView)
    }

    func runTerminalCommand(_ command: String, args: [String] = []) {
        let process = Process()
        process.launchPath = "/usr/bin/env"
        process.arguments = [command] + args

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe

        let fileHandle = pipe.fileHandleForReading
        fileHandle.readabilityHandler = { [weak self] handle in
            guard let self = self else { return }
            let data = handle.availableData
            if data.isEmpty { return }
            if let output = String(data: data, encoding: .utf8) {
                DispatchQueue.main.async {
                    self.appendToTextView(output)
                }
            }
        }

        process.terminationHandler = { _ in
            DispatchQueue.main.async {
                self.textView.textStorage?.append(NSAttributedString(string: "\n[Process Finished]\n"))
            }
        }

        do {
            try process.run()
        } catch {
            appendToTextView("Failed to run command: \(error.localizedDescription)")
        }
    }

    func appendToTextView(_ text: String) {
        textView.textStorage?.append(NSAttributedString(string: text))
        textView.scrollRangeToVisible(NSRange(location: textView.string.count, length: 0))
    }
}

// MARK: - Entry Point
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
