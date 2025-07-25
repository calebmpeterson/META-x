import Cocoa

class DraggableView: NSView {
    override var mouseDownCanMoveWindow: Bool { true }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var escMonitor: Any?

    func applicationDidFinishLaunching(_ notification: Notification) {
        var timeout: Double? = nil
        var messageArgs: [String] = []

        var index = 1
        while index < CommandLine.arguments.count {
            let arg = CommandLine.arguments[index]
            if arg == "--timeout" || arg == "-t", index + 1 < CommandLine.arguments.count {
                timeout = Double(CommandLine.arguments[index + 1])
                index += 2
            } else {
                messageArgs.append(arg)
                index += 1
            }
        }
        let message = messageArgs.joined(separator: " ")


        let width: CGFloat = 400
        let height: CGFloat = 60

        window = NSWindow(
            contentRect: NSMakeRect(0, 0, width, height),
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        window.isOpaque = false
        window.backgroundColor = .clear
        window.hasShadow = true
        window.level = .floating
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        let container = DraggableView(frame: NSMakeRect(0, 0, width, height))
        container.wantsLayer = true
        container.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        container.layer?.cornerRadius = 10
        container.layer?.borderWidth = 0
        container.layer?.borderColor = NSColor.gray.cgColor
        container.translatesAutoresizingMaskIntoConstraints = false

        // Add shadow for 3D effect
        container.shadow = NSShadow()
        container.shadow?.shadowColor = NSColor.black.withAlphaComponent(0.3)
        container.shadow?.shadowOffset = NSMakeSize(0, -1)
        container.shadow?.shadowBlurRadius = 6
        container.layer?.masksToBounds = false

        window.contentView = container

        let label = NSTextField(labelWithString: message.isEmpty ? "No message provided." : message)
        label.alignment = .center
        label.font = .systemFont(ofSize: 18)
        label.maximumNumberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false

        container.addSubview(label)

        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            label.leadingAnchor.constraint(greaterThanOrEqualTo: container.leadingAnchor, constant: 20),
            label.trailingAnchor.constraint(lessThanOrEqualTo: container.trailingAnchor, constant: -20),
        ])
        
        if #available(macOS 10.14, *) {
            let visualEffect = NSVisualEffectView(frame: container.bounds)
            visualEffect.autoresizingMask = [.width, .height]
            visualEffect.material = .windowBackground
            visualEffect.state = .active
            visualEffect.wantsLayer = true
            visualEffect.layer?.cornerRadius = 20
            visualEffect.layer?.masksToBounds = true

            container.addSubview(visualEffect, positioned: .below, relativeTo: container)
        }

        // Close window on ESC
        escMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            if event.keyCode == 53 { // ESC key
                // Fade out and close the window
                NSAnimationContext.runAnimationGroup({ context in
                    context.duration = 0.4
                    self?.window.animator().alphaValue = 0
                }) {
                    self?.window.close()
                    NSApp.terminate(nil)
                }

                return nil
            }
            return event
        }

        // Position the window on the main screen
        if let screen = NSScreen.main {
            let screenFrame = screen.visibleFrame
            let x = screenFrame.origin.x + (screenFrame.width - width) * 0.5
            let y = screenFrame.origin.y + (screenFrame.height - height) * 0.66
            window.setFrameOrigin(NSPoint(x: x, y: y))
        }

        // Close the window after the timeout (if provided)
        if let timeout = timeout {
            let progressBar = NSProgressIndicator()
            progressBar.isIndeterminate = false
            progressBar.minValue = 0
            progressBar.maxValue = 100
            progressBar.doubleValue = 100
            progressBar.controlSize = .small
            progressBar.style = .bar
            progressBar.translatesAutoresizingMaskIntoConstraints = false
            container.addSubview(progressBar)

            NSLayoutConstraint.activate([
                progressBar.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 10),
                progressBar.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -10),
                progressBar.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: 0),
                progressBar.heightAnchor.constraint(equalToConstant: 10)
            ])

            let interval: TimeInterval = 0.01
            var elapsed: TimeInterval = 0

            Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { timer in
                elapsed += interval
                let progress = max(0, 100 - (elapsed / timeout * 100))
                progressBar.doubleValue = progress

                if elapsed >= timeout {
                    timer.invalidate()

                    // Fade out and close the window
                    NSAnimationContext.runAnimationGroup({ context in
                        context.duration = 0.4
                        self.window.animator().alphaValue = 0
                    }) {
                        self.window.close()
                        NSApp.terminate(nil)
                    }
                }
            }
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
