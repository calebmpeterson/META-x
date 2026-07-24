import Cocoa

class DraggableView: NSView {
    override var mouseDownCanMoveWindow: Bool { true }
}

// Borderless windows cannot become key by default, which prevents the text
// view from receiving focus / keystrokes (e.g. copy, select all).
class KeyableWindow: NSWindow {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }

    override func performKeyEquivalent(with event: NSEvent) -> Bool {
        if event.modifierFlags.contains(.command) {
            switch event.charactersIgnoringModifiers {
            case "c": return NSApp.sendAction(#selector(NSText.copy(_:)), to: nil, from: nil)
            case "a": return NSApp.sendAction(#selector(NSText.selectAll(_:)), to: nil, from: nil)
            default: break
            }
        }
        return super.performKeyEquivalent(with: event)
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var escMonitor: Any?
    var button1Label = "OK"
    var button2Label = "Cancel"

    func applicationDidFinishLaunching(_ notification: Notification) {
        let (title, text, button1Label, button2Label) = parseArgs()
        self.button1Label = button1Label
        self.button2Label = button2Label

        let width: CGFloat = 600
        let horizontalPadding: CGFloat = 20
        let verticalPadding: CGFloat = 20
        let titleHeight: CGFloat = 20
        let textHeight: CGFloat = 200
        let buttonHeight: CGFloat = 28
        let spacing: CGFloat = 12

        let height = verticalPadding * 2 + titleHeight + spacing + textHeight + spacing + buttonHeight

        window = KeyableWindow(
            contentRect: NSMakeRect(0, 0, width, height),
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        window.isOpaque = false
        window.backgroundColor = .clear
        window.hasShadow = true
        window.level = .floating
        window.isMovableByWindowBackground = true
        window.center()

        let container = DraggableView(frame: NSMakeRect(0, 0, width, height))
        container.wantsLayer = true
        container.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        container.layer?.cornerRadius = 10
        container.layer?.borderWidth = 0
        container.layer?.borderColor = NSColor.gray.cgColor
        container.translatesAutoresizingMaskIntoConstraints = false

        container.shadow = NSShadow()
        container.shadow?.shadowColor = NSColor.black.withAlphaComponent(0.3)
        container.shadow?.shadowOffset = NSMakeSize(0, -1)
        container.shadow?.shadowBlurRadius = 6
        container.layer?.masksToBounds = false

        window.contentView = container

        if #available(macOS 10.14, *) {
            let visualEffect = NSVisualEffectView(frame: container.bounds)
            visualEffect.autoresizingMask = [.width, .height]
            visualEffect.material = .windowBackground
            visualEffect.state = .active
            visualEffect.wantsLayer = true
            visualEffect.layer?.cornerRadius = 10
            visualEffect.layer?.masksToBounds = true

            container.addSubview(visualEffect, positioned: .below, relativeTo: container)
        }

        let titleView = NSTextField(labelWithString: title)
        titleView.font = .systemFont(ofSize: 14, weight: .semibold)
        titleView.lineBreakMode = .byTruncatingTail
        titleView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(titleView)

        let textView = NSTextView()
        textView.string = text
        textView.isEditable = false
        textView.isSelectable = true
        textView.font = .monospacedSystemFont(ofSize: 12, weight: .regular)
        textView.textContainerInset = NSSize(width: 6, height: 6)

        let scrollView = NSScrollView()
        scrollView.documentView = textView
        scrollView.hasVerticalScroller = true
        scrollView.borderType = .bezelBorder
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(scrollView)

        let button1 = NSButton(title: button1Label, target: self, action: #selector(button1Pressed))
        button1.bezelStyle = .rounded
        button1.translatesAutoresizingMaskIntoConstraints = false

        let button2 = NSButton(title: button2Label, target: self, action: #selector(button2Pressed))
        button2.bezelStyle = .rounded
        button2.keyEquivalent = "\u{1B}"
        button2.translatesAutoresizingMaskIntoConstraints = false

        let buttonRow = NSStackView(views: [button2, button1])
        buttonRow.orientation = .horizontal
        buttonRow.spacing = 8
        buttonRow.alignment = .centerY
        buttonRow.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(buttonRow)

        NSLayoutConstraint.activate([
            titleView.topAnchor.constraint(equalTo: container.topAnchor, constant: verticalPadding),
            titleView.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: horizontalPadding),
            titleView.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -horizontalPadding),

            scrollView.topAnchor.constraint(equalTo: titleView.bottomAnchor, constant: spacing),
            scrollView.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: horizontalPadding),
            scrollView.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -horizontalPadding),
            scrollView.heightAnchor.constraint(equalToConstant: textHeight),

            buttonRow.topAnchor.constraint(equalTo: scrollView.bottomAnchor, constant: spacing),
            buttonRow.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -horizontalPadding),
            buttonRow.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -verticalPadding),

            button1.heightAnchor.constraint(equalToConstant: buttonHeight),
            button2.heightAnchor.constraint(equalToConstant: buttonHeight),
        ])

        if let screen = NSScreen.main {
            let screenFrame = screen.visibleFrame
            let x = screenFrame.origin.x + (screenFrame.width - width) * 0.5
            let y = screenFrame.origin.y + (screenFrame.height - height) * 0.66
            window.setFrameOrigin(NSPoint(x: x, y: y))
        }

        NSApp.activate(ignoringOtherApps: true)
        window.makeKeyAndOrderFront(nil)

        // ESC dismisses just like the secondary button (no stdout, exit 1).
        escMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            if event.keyCode == 53 {
                self?.cancel()
                return nil
            }
            return event
        }
    }

    func parseArgs() -> (title: String, text: String, button1: String, button2: String) {
        var title = ""
        var text = ""
        var button1 = "OK"
        var button2 = "Cancel"

        let args = CommandLine.arguments
        var index = 1
        while index < args.count {
            let arg = args[index]
            if index + 1 < args.count {
                switch arg {
                case "--title": title = args[index + 1]; index += 2; continue
                case "--text": text = args[index + 1]; index += 2; continue
                case "--button1": button1 = args[index + 1]; index += 2; continue
                case "--button2": button2 = args[index + 1]; index += 2; continue
                default: break
                }
            }
            index += 1
        }
        return (title, text, button1, button2)
    }

    // The primary button reports which label was pressed on stdout.
    @objc func button1Pressed() {
        print(button1Label)
        NSApp.terminate(nil)
    }

    // The secondary button behaves as a dismiss/cancel, matching ESC.
    @objc func button2Pressed() {
        cancel()
    }

    func cancel() {
        window.close()
        exit(1)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
